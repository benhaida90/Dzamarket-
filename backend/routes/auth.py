from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserCreate, UserLogin, UserResponse
from utils.auth import verify_password, get_password_hash, create_access_token
from utils.responses import success_response, error_response
from utils.dependencies import get_database
from datetime import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register")
async def register(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Register new user"""
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if phone already exists
    existing_phone = await db.users.find_one({"phone": user_data.phone})
    if existing_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number already registered"
        )
    
    # Validate referral code if provided
    referrer_id = None
    if user_data.referral_code:
        referrer = await db.users.find_one({"referral_code": user_data.referral_code})
        if not referrer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid referral code"
            )
        referrer_id = referrer["id"]
    
    # Create user
    user_id = str(uuid.uuid4())
    referral_code = str(uuid.uuid4())[:8].upper()
    
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "phone": user_data.phone,
        "password_hash": get_password_hash(user_data.password),
        "location": user_data.location,
        "avatar": f"https://ui-avatars.io/api/?name={user_data.name.replace(' ', '+')}&background=16a34a&color=fff",
        "verified": False,
        "is_premium": False,
        "rating": 0.0,
        "followers": 0,
        "following": 0,
        "total_sales": 0,
        "total_purchases": 0,
        "referral_code": referral_code,
        "referred_by": referrer_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    
    # If referred, create referral records
    if referrer_id:
        # Level 1 referral
        await db.referrals.insert_one({
            "id": str(uuid.uuid4()),
            "referrer_id": referrer_id,
            "referred_user_id": user_id,
            "level": 1,
            "total_earnings": 0.0,
            "transaction_count": 0,
            "status": "active",
            "created_at": datetime.utcnow()
        })
        
        # Check if referrer was also referred (Level 2)
        referrer_doc = await db.users.find_one({"id": referrer_id})
        if referrer_doc and referrer_doc.get("referred_by"):
            await db.referrals.insert_one({
                "id": str(uuid.uuid4()),
                "referrer_id": referrer_doc["referred_by"],
                "referred_user_id": user_id,
                "level": 2,
                "total_earnings": 0.0,
                "transaction_count": 0,
                "status": "active",
                "created_at": datetime.utcnow()
            })
    
    return success_response(
        data={"userId": user_id},
        message="Account created successfully"
    )

@router.post("/login")
async def login(credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Login user and return JWT token"""
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"]})
    
    # Prepare user response
    user_response = {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "location": user["location"],
        "avatar": user.get("avatar"),
        "verified": user.get("verified", False),
        "isPremium": user.get("is_premium", False),
        "rating": user.get("rating", 0.0),
        "followers": user.get("followers", 0),
        "following": user.get("following", 0),
        "totalSales": user.get("total_sales", 0),
        "totalPurchases": user.get("total_purchases", 0),
        "referralCode": user["referral_code"],
        "joinedDate": user["created_at"].isoformat()
    }
    
    return {
        "success": True,
        "token": access_token,
        "user": user_response
    }

@router.post("/validate-referral")
async def validate_referral(referral_code: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Validate referral code"""
    
    referrer = await db.users.find_one({"referral_code": referral_code})
    
    if not referrer:
        return {
            "success": True,
            "valid": False
        }
    
    return {
        "success": True,
        "valid": True,
        "referrerName": referrer["name"]
    }