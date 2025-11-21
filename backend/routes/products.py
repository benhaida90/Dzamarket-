from fastapi import APIRouter, HTTPException, status, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.product import ProductCreate, ProductUpdate, ProductResponse
from utils.responses import success_response, paginated_response
from utils.dependencies import get_database, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
async def get_products(
    category: str = None,
    location: str = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all products with filters and pagination"""
    
    # Build query filter
    query = {"status": "available"}
    if category:
        query["category"] = category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Get total count
    total_items = await db.products.count_documents(query)
    total_pages = (total_items + limit - 1) // limit
    
    # Get products with pagination
    skip = (page - 1) * limit
    cursor = db.products.find(query).sort("created_at", -1).skip(skip).limit(limit)
    products = await cursor.to_list(length=limit)
    
    # Enrich with seller info
    enriched_products = []
    for product in products:
        seller = await db.users.find_one({"id": product["seller_id"]})
        product_data = {
            "id": product["id"],
            "title": product["title"],
            "price": product["price"],
            "currency": product["currency"],
            "category": product["category"],
            "description": product["description"],
            "images": product["images"],
            "location": product["location"],
            "likes": product.get("likes", 0),
            "views": product.get("views", 0),
            "comments": product.get("comments_count", 0),
            "status": product["status"],
            "createdAt": product["created_at"].isoformat(),
            "seller": {
                "id": seller["id"],
                "name": seller["name"],
                "avatar": seller.get("avatar"),
                "rating": seller.get("rating", 0.0),
                "verified": seller.get("verified", False),
                "followers": seller.get("followers", 0)
            }
        }
        enriched_products.append(product_data)
    
    return paginated_response(
        items=enriched_products,
        page=page,
        total_pages=total_pages,
        total_items=total_items
    )

@router.get("/{product_id}")
async def get_product(
    product_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get single product details"""
    
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Increment view count
    await db.products.update_one(
        {"id": product_id},
        {"$inc": {"views": 1}}
    )
    
    # Get seller info
    seller = await db.users.find_one({"id": product["seller_id"]})
    
    product_data = {
        "id": product["id"],
        "title": product["title"],
        "description": product["description"],
        "price": product["price"],
        "currency": product["currency"],
        "category": product["category"],
        "images": product["images"],
        "location": product["location"],
        "likes": product.get("likes", 0),
        "views": product.get("views", 0) + 1,
        "comments": product.get("comments_count", 0),
        "status": product["status"],
        "createdAt": product["created_at"].isoformat(),
        "seller": {
            "id": seller["id"],
            "name": seller["name"],
            "avatar": seller.get("avatar"),
            "rating": seller.get("rating", 0.0),
            "verified": seller.get("verified", False),
            "followers": seller.get("followers", 0)
        }
    }
    
    return success_response(data=product_data)

@router.post("")
async def create_product(
    product_data: ProductCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create new product (requires authentication)"""
    
    product_id = str(uuid.uuid4())
    
    product_doc = {
        "id": product_id,
        "seller_id": user_id,
        "title": product_data.title,
        "description": product_data.description,
        "price": product_data.price,
        "currency": "DZD",
        "category": product_data.category,
        "images": product_data.images,
        "location": product_data.location,
        "status": "available",
        "likes": 0,
        "views": 0,
        "comments_count": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.products.insert_one(product_doc)
    
    return success_response(
        data={"productId": product_id},
        message="Product created successfully"
    )

@router.put("/{product_id}")
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update product (requires authentication and ownership)"""
    
    product = await db.products.find_one({"id": product_id})
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product["seller_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this product"
        )
    
    # Build update document
    update_doc = {"updated_at": datetime.utcnow()}
    if product_data.title:
        update_doc["title"] = product_data.title
    if product_data.description:
        update_doc["description"] = product_data.description
    if product_data.price:
        update_doc["price"] = product_data.price
    if product_data.category:
        update_doc["category"] = product_data.category
    if product_data.images:
        update_doc["images"] = product_data.images
    if product_data.location:
        update_doc["location"] = product_data.location
    if product_data.status:
        update_doc["status"] = product_data.status
    
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_doc}
    )
    
    return success_response(message="Product updated successfully")

@router.post("/{product_id}/like")
async def like_product(
    product_id: str,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Like a product"""
    
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if already liked
    like = await db.likes.find_one({"user_id": user_id, "product_id": product_id})
    
    if like:
        # Unlike
        await db.likes.delete_one({"user_id": user_id, "product_id": product_id})
        await db.products.update_one({"id": product_id}, {"$inc": {"likes": -1}})
        return success_response(message="Product unliked")
    else:
        # Like
        await db.likes.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "product_id": product_id,
            "created_at": datetime.utcnow()
        })
        await db.products.update_one({"id": product_id}, {"$inc": {"likes": 1}})
        return success_response(message="Product liked")
