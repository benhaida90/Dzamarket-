from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    comment: str
    likes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommentCreate(BaseModel):
    comment: str

class CommentResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str]
    comment: str
    likes: int
    created_at: datetime