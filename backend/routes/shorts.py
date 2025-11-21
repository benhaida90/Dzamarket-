from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.responses import success_response
from utils.dependencies import get_database, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/shorts", tags=["Shorts"])

@router.get("/feed")
async def get_shorts_feed(
    category: str = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get personalized shorts feed based on user interactions"""
    
    # Build query - only products with videos
    query = {
        "status": "available",
        "videos": {"$exists": True, "$ne": []}
    }
    
    if category:
        query["category"] = category
    
    # Get user preferences for personalization
    user_prefs = await db.user_preferences.find_one({"user_id": user_id})
    
    # Get products with videos
    skip = (page - 1) * limit
    
    if user_prefs and not category:
        # Personalized feed based on user preferences
        # Sort categories by score
        sorted_categories = sorted(
            user_prefs.get("category_scores", {}).items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        # Get products from preferred categories
        products = []
        for cat, score in sorted_categories[:3]:  # Top 3 categories
            cat_query = query.copy()
            cat_query["category"] = cat
            cursor = db.products.find(cat_query).sort("video_views", -1).limit(limit // 3)
            cat_products = await cursor.to_list(length=limit // 3)
            products.extend(cat_products)
        
        # Fill remaining with random
        if len(products) < limit:
            remaining = limit - len(products)
            cursor = db.products.find(query).sort("created_at", -1).limit(remaining)
            more_products = await cursor.to_list(length=remaining)
            products.extend(more_products)
    else:
        # Default feed - most viewed or recent
        cursor = db.products.find(query).sort([
            ("video_views", -1),
            ("created_at", -1)
        ]).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
    
    # Enrich with seller info
    enriched_products = []
    for product in products:
        seller = await db.users.find_one({"id": product["seller_id"]})
        
        product_data = {
            "id": product["id"],
            "title": product["title"],
            "description": product["description"],
            "price": product["price"],
            "currency": product["currency"],
            "category": product["category"],
            "images": product["images"],
            "videos": product.get("videos", []),
            "location": product["location"],
            "likes": product.get("likes", 0),
            "views": product.get("views", 0),
            "videoViews": product.get("video_views", 0),
            "status": product["status"],
            "createdAt": product["created_at"].isoformat(),
            "seller": {
                "id": seller["id"],
                "name": seller["name"],
                "avatar": seller.get("avatar"),
                "verified": seller.get("verified", False),
                "isPremium": seller.get("is_premium", False)
            }
        }
        enriched_products.append(product_data)
    
    return success_response(data={
        "products": enriched_products,
        "hasMore": len(enriched_products) == limit
    })

@router.post("/track-view")
async def track_video_view(
    product_id: str,
    duration: int = 0,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Track video view and update user preferences"""
    
    # Get product
    product = await db.products.find_one({"id": product_id})
    if not product:
        return success_response(message="Product not found")
    
    # Increment video views
    await db.products.update_one(
        {"id": product_id},
        {"$inc": {"video_views": 1}}
    )
    
    # Track interaction
    interaction = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "product_id": product_id,
        "category": product["category"],
        "interaction_type": "watch_video",
        "duration": duration,
        "created_at": datetime.utcnow()
    }
    await db.user_interactions.insert_one(interaction)
    
    # Update user preferences
    await update_user_preferences(user_id, product["category"], db)
    
    return success_response(message="View tracked")

@router.get("/categories")
async def get_categories_with_videos(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get categories that have products with videos"""
    
    # Aggregate categories with video count
    pipeline = [
        {
            "$match": {
                "videos": {"$exists": True, "$ne": []},
                "status": "available"
            }
        },
        {
            "$group": {
                "_id": "$category",
                "count": {"$sum": 1},
                "totalViews": {"$sum": "$video_views"}
            }
        },
        {
            "$sort": {"count": -1}
        }
    ]
    
    categories = await db.products.aggregate(pipeline).to_list(length=100)
    
    category_data = [
        {
            "id": cat["_id"].lower().replace(" ", "-"),
            "name": cat["_id"],
            "videoCount": cat["count"],
            "totalViews": cat["totalViews"]
        }
        for cat in categories
    ]
    
    return success_response(data=category_data)

async def update_user_preferences(user_id: str, category: str, db: AsyncIOMotorDatabase):
    """Update user category preferences based on interactions"""
    
    # Get all user interactions in last 30 days
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    cursor = db.user_interactions.find({
        "user_id": user_id,
        "created_at": {"$gte": thirty_days_ago}
    })
    interactions = await cursor.to_list(length=1000)
    
    # Calculate category scores
    category_scores = {}
    for interaction in interactions:
        cat = interaction["category"]
        weight = 1.0
        
        # Different weights for different interactions
        if interaction["interaction_type"] == "purchase":
            weight = 5.0
        elif interaction["interaction_type"] == "like":
            weight = 2.0
        elif interaction["interaction_type"] == "watch_video":
            # More weight if watched longer
            duration = interaction.get("duration", 0)
            weight = min(3.0, 1.0 + (duration / 30))  # Max 3.0 for 60+ seconds
        
        category_scores[cat] = category_scores.get(cat, 0) + weight
    
    # Normalize scores
    if category_scores:
        max_score = max(category_scores.values())
        category_scores = {
            cat: score / max_score 
            for cat, score in category_scores.items()
        }
    
    # Update or insert preferences
    await db.user_preferences.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "category_scores": category_scores,
                "last_updated": datetime.utcnow()
            }
        },
        upsert=True
    )
