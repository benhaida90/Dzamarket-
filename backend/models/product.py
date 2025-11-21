from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    seller_id: str
    title: str
    description: str
    price: float
    currency: str = "DZD"
    category: str
    images: List[str] = []
    location: str
    status: str = "available"  # available, sold, pending
    likes: int = 0
    views: int = 0
    comments_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Samsung Galaxy S24 Ultra",
                "description": "جهاز سامسونج جديد، حالة ممتازة",
                "price": 180000,
                "category": "Electronics",
                "images": ["https://example.com/image1.jpg"],
                "location": "Algiers, Algeria"
            }
        }

class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    images: List[str]
    location: str

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    location: Optional[str] = None
    status: Optional[str] = None

class ProductResponse(BaseModel):
    id: str
    seller_id: str
    title: str
    description: str
    price: float
    currency: str
    category: str
    images: List[str]
    location: str
    status: str
    likes: int
    views: int
    comments_count: int
    created_at: datetime