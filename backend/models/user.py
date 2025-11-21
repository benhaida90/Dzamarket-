from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: str
    password_hash: str
    location: str
    avatar: Optional[str] = None
    verified: bool = False
    is_premium: bool = False
    rating: float = 0.0
    followers: int = 0
    following: int = 0
    total_sales: int = 0
    total_purchases: int = 0
    referral_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8].upper())
    referred_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Youcef Ben Mohamed",
                "email": "youcef@example.com",
                "phone": "+213555123456",
                "location": "Algiers, Algeria"
            }
        }

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    location: str
    referral_code: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    location: str
    avatar: Optional[str]
    verified: bool
    is_premium: bool
    rating: float
    followers: int
    following: int
    total_sales: int
    total_purchases: int
    referral_code: str
    created_at: datetime

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    avatar: Optional[str] = None