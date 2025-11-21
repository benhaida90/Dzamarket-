from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    buyer_id: str
    seller_id: str
    amount: float
    currency: str = "DZD"
    payment_method: str  # CIB, EDAHABIA
    status: str = "pending"  # pending, in_escrow, completed, cancelled
    escrow_released: bool = False
    commission_rate: float = 0.02  # 1% buyer + 1% seller = 2% total
    referral_l1_id: Optional[str] = None  # Level 1 referrer
    referral_l2_id: Optional[str] = None  # Level 2 referrer
    referral_l1_amount: float = 0.0  # 0.25% commission
    referral_l2_amount: float = 0.0  # 0.25% commission
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class TransactionCreate(BaseModel):
    product_id: str
    payment_method: str

class EscrowConfirm(BaseModel):
    transaction_id: str
    confirmed: bool = True

class TransactionResponse(BaseModel):
    id: str
    product_id: str
    amount: float
    currency: str
    payment_method: str
    status: str
    created_at: datetime