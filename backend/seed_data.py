"""
Script to seed database with test data for DzaMarket
Run this to add test users, products for testing the purchase flow
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid
import os
from pathlib import Path
from dotenv import load_dotenv
from utils.auth import get_password_hash

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_database():
    print("🌱 Starting database seeding...")
    
    # Clear existing data
    print("🗑️ Clearing existing test data...")
    await db.users.delete_many({"email": {"$regex": "@test.dz$"}})
    await db.products.delete_many({"seller_id": {"$regex": "^test-"}})
    
    # Create test users
    print("👥 Creating test users...")
    
    # User 1: Seller
    seller_id = "test-seller-" + str(uuid.uuid4())[:8]
    seller = {
        "id": seller_id,
        "name": "Ahmed Benali",
        "email": "ahmed@test.dz",
        "phone": "+213555111111",
        "password_hash": get_password_hash("password123"),
        "location": "Algiers, Algeria",
        "avatar": "https://ui-avatars.io/api/?name=Ahmed+Benali&background=16a34a&color=fff",
        "verified": True,
        "is_premium": False,
        "rating": 4.8,
        "followers": 234,
        "following": 50,
        "total_sales": 15,
        "total_purchases": 8,
        "referral_code": "AHMED2025",
        "referred_by": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(seller)
    print(f"  ✅ Created seller: {seller['name']} (email: {seller['email']})")
    
    # User 2: Buyer
    buyer_id = "test-buyer-" + str(uuid.uuid4())[:8]
    buyer = {
        "id": buyer_id,
        "name": "Fatima Zahra",
        "email": "fatima@test.dz",
        "phone": "+213555222222",
        "password_hash": get_password_hash("password123"),
        "location": "Oran, Algeria",
        "avatar": "https://ui-avatars.io/api/?name=Fatima+Zahra&background=16a34a&color=fff",
        "verified": True,
        "is_premium": False,
        "rating": 4.5,
        "followers": 120,
        "following": 180,
        "total_sales": 5,
        "total_purchases": 20,
        "referral_code": "FATIMA2025",
        "referred_by": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(buyer)
    print(f"  ✅ Created buyer: {buyer['name']} (email: {buyer['email']})")
    
    # User 3: Premium seller
    premium_seller_id = "test-premium-" + str(uuid.uuid4())[:8]
    premium_seller = {
        "id": premium_seller_id,
        "name": "Karim Dine",
        "email": "karim@test.dz",
        "phone": "+213555333333",
        "password_hash": get_password_hash("password123"),
        "location": "Constantine, Algeria",
        "avatar": "https://ui-avatars.io/api/?name=Karim+Dine&background=16a34a&color=fff",
        "verified": True,
        "is_premium": True,
        "rating": 4.9,
        "followers": 890,
        "following": 120,
        "total_sales": 45,
        "total_purchases": 12,
        "referral_code": "KARIM2025",
        "referred_by": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.users.insert_one(premium_seller)
    print(f"  ✅ Created premium seller: {premium_seller['name']} (email: {premium_seller['email']})")
    
    # Create test products
    print("\n📦 Creating test products...")
    
    products = [
        {
            "id": "test-prod-" + str(uuid.uuid4())[:8],
            "seller_id": seller_id,
            "title": "Samsung Galaxy S24 Ultra - جديد",
            "description": "هاتف Samsung Galaxy S24 Ultra جديد كلياً، بحالة ممتازة مع جميع الملحقات الأصلية. شاشة 6.8 بوصة، كاميرا 200MP، بطارية 5000mAh",
            "price": 180000.0,
            "currency": "DZD",
            "category": "Electronics",
            "images": [
                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
            ],
            "videos": [
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            ],
            "location": "Algiers, Algeria",
            "status": "available",
            "likes": 45,
            "views": 567,
            "video_views": 234,
            "comments_count": 12,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "test-prod-" + str(uuid.uuid4())[:8],
            "seller_id": premium_seller_id,
            "title": "Renault Clio 2020 - استعمال خفيف",
            "description": "سيارة رينو كليو 2020، استعمال خفيف جداً، الوثائق كاملة، حالة ممتازة، صيانة دورية منتظمة",
            "price": 2500000.0,
            "currency": "DZD",
            "category": "Vehicles",
            "images": [
                "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
                "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800"
            ],
            "videos": [
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
            ],
            "location": "Constantine, Algeria",
            "status": "available",
            "likes": 156,
            "views": 2890,
            "video_views": 890,
            "comments_count": 45,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "test-prod-" + str(uuid.uuid4())[:8],
            "seller_id": seller_id,
            "title": "شقة 3 غرف للإيجار - حي راقي",
            "description": "شقة جميلة للإيجار في حي راقي، 3 غرف نوم، صالة واسعة، مطبخ مجهز، قريبة من جميع المرافق",
            "price": 45000.0,
            "currency": "DZD",
            "category": "Real Estate",
            "images": [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1502672260066-6bc35f0a1f70?w=800"
            ],
            "location": "Oran, Algeria",
            "status": "available",
            "likes": 78,
            "views": 1234,
            "comments_count": 23,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "test-prod-" + str(uuid.uuid4())[:8],
            "seller_id": premium_seller_id,
            "title": "طاولة طعام خشبية فاخرة + 6 كراسي",
            "description": "طاولة طعام جديدة، خشب زان أصلي، مع 6 كراسي مريحة، تصميم عصري وأنيق",
            "price": 85000.0,
            "currency": "DZD",
            "category": "Furniture",
            "images": [
                "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800"
            ],
            "location": "Blida, Algeria",
            "status": "available",
            "likes": 23,
            "views": 234,
            "comments_count": 5,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": "test-prod-" + str(uuid.uuid4())[:8],
            "seller_id": seller_id,
            "title": "خروف العيد - حولي ممتاز",
            "description": "خروف بصحة ممتازة، وزن تقريبي 45 كلغ، تربية محلية، جاهز للعيد",
            "price": 75000.0,
            "currency": "DZD",
            "category": "Animals",
            "images": [
                "https://images.unsplash.com/photo-1583537031470-89019dd84df4?w=800"
            ],
            "videos": [
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            ],
            "location": "Tipaza, Algeria",
            "status": "available",
            "likes": 34,
            "views": 345,
            "video_views": 156,
            "comments_count": 8,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    for product in products:
        await db.products.insert_one(product)
        print(f"  ✅ Created product: {product['title']} (Price: {product['price']} DZD)")
    
    print(f"\n✅ Database seeding completed!")
    print(f"\n📋 Test Accounts Created:")
    print(f"  1. Seller: {seller['email']} / password123")
    print(f"  2. Buyer: {buyer['email']} / password123")
    print(f"  3. Premium: {premium_seller['email']} / password123")
    print(f"\n🛍️ Total Products: {len(products)}")
    print(f"\n🧪 You can now test the purchase flow:")
    print(f"  1. Login as buyer (fatima@test.dz)")
    print(f"  2. Browse products")
    print(f"  3. Click 'Buy Now' on any product")
    print(f"  4. Complete mock payment")
    print(f"  5. Confirm delivery in your dashboard")

if __name__ == "__main__":
    asyncio.run(seed_database())
