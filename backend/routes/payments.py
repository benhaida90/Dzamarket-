from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.transaction import TransactionCreate, EscrowConfirm, TransactionResponse
from utils.responses import success_response
from utils.dependencies import get_database, get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/payments", tags=["Payments"])

# Commission rates
PLATFORM_COMMISSION = 0.02  # 2% total (1% buyer + 1% seller)
REFERRAL_L1_RATE = 0.0025  # 0.25%
REFERRAL_L2_RATE = 0.0025  # 0.25%

@router.post("/create-escrow")
async def create_escrow_payment(
    transaction_data: TransactionCreate,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create escrow payment for product purchase
    
    This creates a transaction in 'in_escrow' status.
    Money is held until buyer confirms delivery.
    """
    
    # Get product
    product = await db.products.find_one({"id": transaction_data.product_id})
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product["status"] != "available":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    # Cannot buy your own product
    if product["seller_id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot purchase your own product"
        )
    
    # Get buyer and seller info
    buyer = await db.users.find_one({"id": user_id})
    seller = await db.users.find_one({"id": product["seller_id"]})
    
    # Calculate amounts
    amount = product["price"]
    commission_amount = amount * PLATFORM_COMMISSION
    
    # Calculate referral commissions
    referral_l1_id = None
    referral_l2_id = None
    referral_l1_amount = 0.0
    referral_l2_amount = 0.0
    
    # Check buyer's referrer (Level 1)
    if buyer.get("referred_by"):
        referral_l1_id = buyer["referred_by"]
        referral_l1_amount = amount * REFERRAL_L1_RATE
        
        # Check Level 2 referrer
        l1_referrer = await db.users.find_one({"id": referral_l1_id})
        if l1_referrer and l1_referrer.get("referred_by"):
            referral_l2_id = l1_referrer["referred_by"]
            referral_l2_amount = amount * REFERRAL_L2_RATE
    
    # Create transaction
    transaction_id = str(uuid.uuid4())
    
    transaction_doc = {
        "id": transaction_id,
        "product_id": product["id"],
        "buyer_id": user_id,
        "seller_id": product["seller_id"],
        "amount": amount,
        "currency": "DZD",
        "payment_method": transaction_data.payment_method,
        "status": "in_escrow",  # Money held in escrow
        "escrow_released": False,
        "commission_rate": PLATFORM_COMMISSION,
        "commission_amount": commission_amount,
        "referral_l1_id": referral_l1_id,
        "referral_l2_id": referral_l2_id,
        "referral_l1_amount": referral_l1_amount,
        "referral_l2_amount": referral_l2_amount,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "completed_at": None
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    # Update product status to pending
    await db.products.update_one(
        {"id": product["id"]},
        {"$set": {"status": "pending"}}
    )
    
    # Generate payment URL (Mock - will be replaced with real gateway)
    # For CIB/EDAHABIA integration, you'll need:
    # 1. Merchant credentials from payment gateway
    # 2. API endpoints for payment initialization
    # 3. Callback URLs for success/failure
    
    payment_url = f"https://payment-gateway.dz/pay?transaction_id={transaction_id}&amount={amount}&method={transaction_data.payment_method}"
    
    return success_response(
        data={
            "escrowId": transaction_id,
            "paymentUrl": payment_url,
            "amount": amount,
            "status": "in_escrow",
            "message": "Payment is being processed. Funds will be held in escrow until you confirm delivery."
        }
    )

@router.post("/confirm-delivery")
async def confirm_delivery(
    confirm_data: EscrowConfirm,
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Buyer confirms product delivery - releases escrow payment
    
    This releases money from escrow to:
    - Seller (amount - commission - referral fees)
    - Platform (commission)
    - Level 1 referrer (0.25%)
    - Level 2 referrer (0.25%)
    """
    
    transaction = await db.transactions.find_one({"id": confirm_data.transaction_id})
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Only buyer can confirm
    if transaction["buyer_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only buyer can confirm delivery"
        )
    
    if transaction["status"] != "in_escrow":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transaction is not in escrow status"
        )
    
    if transaction["escrow_released"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Escrow already released"
        )
    
    # Release escrow
    await db.transactions.update_one(
        {"id": confirm_data.transaction_id},
        {
            "$set": {
                "status": "completed",
                "escrow_released": True,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Update product status to sold
    await db.products.update_one(
        {"id": transaction["product_id"]},
        {"$set": {"status": "sold"}}
    )
    
    # Update seller stats
    await db.users.update_one(
        {"id": transaction["seller_id"]},
        {"$inc": {"total_sales": 1}}
    )
    
    # Update buyer stats
    await db.users.update_one(
        {"id": transaction["buyer_id"]},
        {"$inc": {"total_purchases": 1}}
    )
    
    # Update referral earnings (Level 1)
    if transaction.get("referral_l1_id"):
        await db.referrals.update_one(
            {
                "referrer_id": transaction["referral_l1_id"],
                "referred_user_id": transaction["buyer_id"],
                "level": 1
            },
            {
                "$inc": {
                    "total_earnings": transaction["referral_l1_amount"],
                    "transaction_count": 1
                }
            }
        )
    
    # Update referral earnings (Level 2)
    if transaction.get("referral_l2_id"):
        await db.referrals.update_one(
            {
                "referrer_id": transaction["referral_l2_id"],
                "referred_user_id": transaction["buyer_id"],
                "level": 2
            },
            {
                "$inc": {
                    "total_earnings": transaction["referral_l2_amount"],
                    "transaction_count": 1
                }
            }
        )
    
    return success_response(
        message="Payment released to seller. Thank you for confirming delivery!"
    )

@router.get("/transactions")
async def get_user_transactions(
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's transaction history"""
    
    # Get transactions where user is buyer or seller
    cursor = db.transactions.find({
        "$or": [
            {"buyer_id": user_id},
            {"seller_id": user_id}
        ]
    }).sort("created_at", -1)
    
    transactions = await cursor.to_list(length=100)
    
    # Enrich with product and user info
    enriched_transactions = []
    for tx in transactions:
        product = await db.products.find_one({"id": tx["product_id"]})
        
        tx_data = {
            "id": tx["id"],
            "type": "purchase" if tx["buyer_id"] == user_id else "sale",
            "productTitle": product["title"] if product else "Deleted Product",
            "amount": tx["amount"],
            "status": tx["status"],
            "paymentMethod": tx["payment_method"],
            "createdAt": tx["created_at"].isoformat(),
            "completedAt": tx["completed_at"].isoformat() if tx.get("completed_at") else None
        }
        
        if tx["buyer_id"] == user_id:
            seller = await db.users.find_one({"id": tx["seller_id"]})
            tx_data["seller"] = seller["name"] if seller else "Unknown"
        else:
            buyer = await db.users.find_one({"id": tx["buyer_id"]})
            tx_data["buyer"] = buyer["name"] if buyer else "Unknown"
        
        enriched_transactions.append(tx_data)
    
    return success_response(data=enriched_transactions)

@router.get("/referral-earnings")
async def get_referral_earnings(
    user_id: str = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user's referral earnings and stats"""
    
    user = await db.users.find_one({"id": user_id})
    
    # Get Level 1 referrals
    l1_cursor = db.referrals.find({"referrer_id": user_id, "level": 1})
    l1_referrals = await l1_cursor.to_list(length=1000)
    
    # Get Level 2 referrals
    l2_cursor = db.referrals.find({"referrer_id": user_id, "level": 2})
    l2_referrals = await l2_cursor.to_list(length=1000)
    
    # Calculate totals
    l1_earnings = sum(ref["total_earnings"] for ref in l1_referrals)
    l2_earnings = sum(ref["total_earnings"] for ref in l2_referrals)
    total_earnings = l1_earnings + l2_earnings
    
    # Get detailed referrals
    referral_details = []
    for ref in l1_referrals + l2_referrals:
        referred_user = await db.users.find_one({"id": ref["referred_user_id"]})
        if referred_user:
            referral_details.append({
                "id": ref["id"],
                "name": referred_user["name"],
                "joinDate": ref["created_at"].isoformat(),
                "level": ref["level"],
                "totalTransactions": ref["transaction_count"],
                "yourEarnings": ref["total_earnings"],
                "status": ref["status"]
            })
    
    return success_response(
        data={
            "referralCode": user["referral_code"],
            "totalEarnings": total_earnings,
            "level1Count": len(l1_referrals),
            "level2Count": len(l2_referrals),
            "level1Earnings": l1_earnings,
            "level2Earnings": l2_earnings,
            "referrals": referral_details
        }
    )
