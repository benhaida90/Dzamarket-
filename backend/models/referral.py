from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Referral(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    referrer_id: str  # The person who referred
    referred_user_id: str  # The person who was referred
    level: int = 1  # 1 or 2
    total_earnings: float = 0.0
    transaction_count: int = 0
    status: str = "active"  # active, inactive
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ReferralStats(BaseModel):
    referral_code: str
    total_earnings: float
    level1_count: int
    level2_count: int
    level1_earnings: float
    level2_earnings: float

class ReferralValidation(BaseModel):
    referral_code: str

class ReferralResponse(BaseModel):
    valid: bool
    referrer_name: Optional[str] = None