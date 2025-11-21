from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class UserInteraction(BaseModel):
    """Track user interactions for personalized recommendations"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    category: str
    interaction_type: str  # view, like, comment, watch_video, purchase
    duration: Optional[int] = 0  # Video watch duration in seconds
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserPreferences(BaseModel):
    """User category preferences calculated from interactions"""
    user_id: str
    category_scores: dict  # {"electronics": 0.8, "vehicles": 0.5, ...}
    last_updated: datetime = Field(default_factory=datetime.utcnow)
