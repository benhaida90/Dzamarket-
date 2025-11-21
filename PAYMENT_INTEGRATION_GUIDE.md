# دليل دمج نظام الدفع الجزائري - DzaMarket

## نظرة عامة

حالياً، نظام الدفع في DzaMarket يعمل بشكل **وهمي (Mock)**. هذا الدليل يشرح كيفية دمج بوابات الدفع الجزائرية الحقيقية.

---

## 🏦 بوابات الدفع المدعومة

### 1. CIB (Centre Interbancaire de Compensation)
**الموقع:** https://www.cib.dz/

**الخصائص:**
- دعم جميع البطاقات البنكية الجزائرية
- أمان عالي ومتوافق مع معايير PCI DSS
- رسوم معاملات تنافسية

**خطوات التكامل:**
1. التسجيل كتاجر (Merchant) على موقع CIB
2. الحصول على Merchant ID و Secret Key
3. تنفيذ API Integration باستخدام REST API

**API Endpoints:**
```
Production: https://payment.cib.dz/api/v1/
Test: https://sandbox.payment.cib.dz/api/v1/
```

---

### 2. SATIM (Société d'Automatisation des Transactions Interbancaires et de Monétique)
**الموقع:** https://www.satim.dz/

**الخصائص:**
- البوابة الرئيسية للمدفوعات في الجزائر
- دعم CIB و EDAHABIA
- تكامل مع جميع البنوك الجزائرية

**خطوات التكامل:**
1. التسجيل في SATIM كتاجر
2. الحصول على API credentials
3. تنفيذ SDK أو REST API

---

### 3. EDAHABIA (La Poste Algérienne)
**الموقع:** https://edahabia.poste.dz/

**الخصائص:**
- بطاقة مسبقة الدفع
- تغطية واسعة في الجزائر
- مناسبة للمستخدمين بدون حساب بنكي

**خطوات التكامل:**
- التكامل يتم عبر SATIM أو CIB
- لا يوجد API مباشر من La Poste

---

## 📝 كيفية استبدال Mock Payment بـ Real Payment

### الملفات المطلوب تعديلها:

#### 1. Backend Environment Variables
**ملف:** `/app/backend/.env`

أضف المتغيرات التالية:
```env
# Payment Gateway Settings
PAYMENT_GATEWAY=CIB  # أو SATIM
PAYMENT_MERCHANT_ID=your_merchant_id_here
PAYMENT_SECRET_KEY=your_secret_key_here
PAYMENT_API_URL=https://payment.cib.dz/api/v1
PAYMENT_CALLBACK_URL=https://dzamarket.dz/api/payments/callback
```

---

#### 2. إنشاء Payment Gateway Service
**ملف جديد:** `/app/backend/services/payment_gateway.py`

```python
import requests
import hashlib
import hmac
import os
from typing import Dict, Any

class PaymentGateway:
    def __init__(self):
        self.gateway = os.getenv("PAYMENT_GATEWAY", "CIB")
        self.merchant_id = os.getenv("PAYMENT_MERCHANT_ID")
        self.secret_key = os.getenv("PAYMENT_SECRET_KEY")
        self.api_url = os.getenv("PAYMENT_API_URL")
        self.callback_url = os.getenv("PAYMENT_CALLBACK_URL")
    
    def create_payment_signature(self, data: Dict[str, Any]) -> str:
        """Generate HMAC signature for payment request"""
        message = "|".join([str(v) for v in data.values()])
        signature = hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def initiate_payment(
        self, 
        transaction_id: str,
        amount: float,
        customer_email: str,
        payment_method: str
    ) -> Dict[str, Any]:
        """Initiate payment with CIB/SATIM gateway"""
        
        payment_data = {
            "merchant_id": self.merchant_id,
            "transaction_id": transaction_id,
            "amount": int(amount * 100),  # Convert to cents
            "currency": "DZD",
            "customer_email": customer_email,
            "payment_method": payment_method,
            "callback_url": self.callback_url,
            "cancel_url": f"{self.callback_url}/cancel",
            "success_url": f"{self.callback_url}/success"
        }
        
        # Generate signature
        payment_data["signature"] = self.create_payment_signature(payment_data)
        
        # Call payment gateway API
        response = requests.post(
            f"{self.api_url}/payments/init",
            json=payment_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "payment_url": result["payment_url"],
                "payment_id": result["payment_id"]
            }
        else:
            return {
                "success": False,
                "error": response.json().get("message", "Payment initiation failed")
            }
    
    def verify_payment(self, payment_id: str, signature: str) -> Dict[str, Any]:
        """Verify payment status with gateway"""
        
        response = requests.get(
            f"{self.api_url}/payments/{payment_id}/status",
            headers={
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Verify signature
            expected_signature = self.create_payment_signature({
                "payment_id": payment_id,
                "status": result["status"]
            })
            
            if signature == expected_signature:
                return {
                    "success": True,
                    "status": result["status"],  # SUCCESS, FAILED, PENDING
                    "amount": result["amount"] / 100
                }
        
        return {
            "success": False,
            "error": "Payment verification failed"
        }

# Initialize gateway instance
payment_gateway = PaymentGateway()
```

---

#### 3. تحديث Payment Route
**ملف:** `/app/backend/routes/payments.py`

استبدل الكود الحالي:
```python
# OLD (Mock)
payment_url = f"https://payment-gateway.dz/pay?transaction_id={transaction_id}"

# NEW (Real)
from services.payment_gateway import payment_gateway

payment_result = payment_gateway.initiate_payment(
    transaction_id=transaction_id,
    amount=amount,
    customer_email=buyer["email"],
    payment_method=transaction_data.payment_method
)

if not payment_result["success"]:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=payment_result["error"]
    )

payment_url = payment_result["payment_url"]
```

---

#### 4. إضافة Payment Callback Route
**ملف:** `/app/backend/routes/payments.py`

```python
@router.post("/callback")
async def payment_callback(
    payment_id: str,
    signature: str,
    status: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handle payment gateway callback"""
    
    # Verify payment
    verification = payment_gateway.verify_payment(payment_id, signature)
    
    if not verification["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment signature"
        )
    
    # Find transaction
    transaction = await db.transactions.find_one({"id": payment_id})
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Update transaction based on payment status
    if status == "SUCCESS":
        # Payment successful - move to escrow
        await db.transactions.update_one(
            {"id": payment_id},
            {
                "$set": {
                    "status": "in_escrow",
                    "payment_confirmed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return success_response(message="Payment confirmed - funds in escrow")
    
    elif status == "FAILED":
        # Payment failed
        await db.transactions.update_one(
            {"id": payment_id},
            {"$set": {"status": "cancelled"}}
        )
        
        # Make product available again
        await db.products.update_one(
            {"id": transaction["product_id"]},
            {"$set": {"status": "available"}}
        )
        
        return success_response(message="Payment failed - transaction cancelled")
    
    return success_response(message="Payment status updated")
```

---

## 🔒 الأمان والحماية

### 1. تخزين المفاتيح السرية
- **NEVER** commit API keys to Git
- استخدم متغيرات البيئة فقط
- استخدم `.env` وأضفه إلى `.gitignore`

### 2. التحقق من التوقيع
- **دائماً** تحقق من signature في callback
- استخدم HMAC SHA-256

### 3. HTTPS
- استخدم HTTPS فقط في Production
- شهادة SSL مطلوبة لقبول المدفوعات

---

## 📊 Flow الكامل للدفع

```
1. User clicks "Buy Now"
   ↓
2. Frontend calls: POST /api/payments/create-escrow
   ↓
3. Backend creates transaction in DB (status: pending)
   ↓
4. Backend calls Payment Gateway API
   ↓
5. Gateway returns payment_url
   ↓
6. Frontend redirects user to payment_url
   ↓
7. User completes payment on gateway website
   ↓
8. Gateway calls: POST /api/payments/callback
   ↓
9. Backend verifies signature
   ↓
10. Backend updates transaction (status: in_escrow)
    ↓
11. User confirms delivery
    ↓
12. Backend calls: POST /api/payments/confirm-delivery
    ↓
13. Money released to seller + referral commissions
```

---

## 🧪 الاختبار

### Test Mode (Sandbox)
جميع البوابات توفر بيئة اختبار:

**CIB Sandbox:**
```
URL: https://sandbox.payment.cib.dz
Test Cards: يوفرها CIB في documentation
```

**بطاقات اختبار نموذجية:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

---

## 📞 الحصول على Merchant Account

### الوثائق المطلوبة:
1. السجل التجاري (Registre de Commerce)
2. البطاقة الضريبية (Carte fiscale)
3. RIB البنكي
4. وثيقة إثبات العنوان
5. نسخة من بطاقة الهوية

### خطوات التسجيل:
1. زيارة موقع CIB/SATIM
2. تقديم طلب merchant account
3. تقديم الوثائق المطلوبة
4. انتظار الموافقة (5-10 أيام عمل)
5. الحصول على API credentials

---

## 💡 نصائح مهمة

1. **ابدأ بالـ Sandbox أولاً** - اختبر كل شيء قبل Production
2. **احتفظ بسجلات المعاملات** - Log كل transaction
3. **معالجة الأخطاء** - Handle network failures gracefully
4. **Timeout Handling** - اضبط timeouts مناسبة للـ API calls
5. **Monitoring** - راقب معدل نجاح المعاملات
6. **Customer Support** - جهز نظام دعم للمشاكل المالية

---

## 🚨 حالات الطوارئ

### إذا فشل Payment Gateway:
1. عرض رسالة خطأ واضحة للمستخدم
2. السماح بإعادة المحاولة
3. تسجيل الخطأ للتحقيق
4. إرسال notification للـ admin

### Webhook Failures:
1. إعادة محاولة automatic (retry logic)
2. Queue system للـ callbacks
3. Manual verification tool للـ admin

---

## 📚 موارد إضافية

- **CIB Documentation:** https://docs.cib.dz/
- **SATIM Integration Guide:** https://satim.dz/integration
- **PCI DSS Compliance:** https://www.pcisecuritystandards.org/

---

**ملاحظة:** هذا دليل إرشادي. تفاصيل التكامل الفعلي قد تختلف حسب البوابة المختارة. دائماً راجع الـ official documentation من CIB/SATIM.
