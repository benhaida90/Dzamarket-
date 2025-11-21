# DzaMarket API Contracts

## Overview
This document defines the API contracts between Frontend and Backend for DzaMarket social marketplace platform.

---

## Authentication APIs

### POST /api/auth/register
**Description:** Register new user account

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "location": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "string"
  }
}
```

---

### POST /api/auth/login
**Description:** Login user and return JWT token

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "jwt_token_string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "avatar": "string",
    "isPremium": false,
    "verified": true,
    "location": "string",
    "referralCode": "string"
  }
}
```

---

## Product APIs

### GET /api/products
**Description:** Get all products with filters

**Query Parameters:**
- `category`: string (optional)
- `location`: string (optional)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 200
    }
  }
}
```

---

### GET /api/products/:id
**Description:** Get single product details

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "title": "string",
    "price": 180000,
    "currency": "DZD",
    "description": "string",
    "images": ["url1", "url2"],
    "category": "Electronics",
    "location": "Algiers, Algeria",
    "seller": {
      "id": "string",
      "name": "string",
      "avatar": "string",
      "rating": 4.8,
      "verified": true
    },
    "status": "available",
    "createdAt": "ISO date"
  }
}
```

---

### POST /api/products
**Description:** Create new product (requires authentication)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "price": number,
  "category": "string",
  "images": ["url1", "url2"],
  "location": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "productId": "string"
  }
}
```

---

## Payment & Escrow APIs

### POST /api/payments/create-escrow
**Description:** Create escrow payment for product purchase

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "string",
  "paymentMethod": "CIB" | "EDAHABIA"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "escrowId": "string",
    "paymentUrl": "string",
    "amount": number,
    "status": "pending"
  }
}
```

---

### POST /api/payments/confirm-delivery
**Description:** Buyer confirms product delivery (releases escrow)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "escrowId": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment released to seller"
}
```

---

## Referral System APIs

### GET /api/referrals
**Description:** Get user's referral stats and earnings

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "referralCode": "string",
    "totalEarnings": 1250.50,
    "level1Count": 5,
    "level2Count": 12,
    "referrals": [...]
  }
}
```

---

### POST /api/referrals/validate
**Description:** Validate referral code during registration

**Request Body:**
```json
{
  "referralCode": "string"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "valid": true,
  "referrerName": "string"
}
```

---

## User Profile APIs

### GET /api/users/:id
**Description:** Get user/seller profile

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "avatar": "string",
    "location": "string",
    "verified": true,
    "isPremium": false,
    "rating": 4.7,
    "followers": 234,
    "totalSales": 12,
    "joinedDate": "ISO date"
  }
}
```

---

### PUT /api/users/profile
**Description:** Update user profile

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "location": "string",
  "avatar": "string"
}
```

---

## Comments APIs

### POST /api/products/:productId/comments
**Description:** Add comment to product

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "comment": "string"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "commentId": "string"
  }
}
```

---

## Mock Data Migration Plan

**Current Mock Data (frontend/src/utils/mock.js):**
- mockProducts → MongoDB products collection
- mockUser → MongoDB users collection
- mockComments → MongoDB comments collection
- mockReferrals → MongoDB referrals collection
- mockTransactions → MongoDB transactions collection

**Backend Integration Steps:**
1. Create MongoDB schemas for all entities
2. Implement JWT authentication middleware
3. Build all API endpoints listed above
4. Integrate Algerian payment gateway (CIB/SATIM)
5. Implement escrow logic
6. Add referral tracking system
7. Replace frontend mock data with API calls

---

## Payment Gateway Integration (Algeria)

### Supported Methods:
1. **CIB (Centre Interbancaire de Compensation)**
2. **EDAHABIA** (La Poste Algérienne)

### Integration Flow:
1. User selects product → "Buy Now"
2. Backend creates escrow transaction
3. Redirect to payment gateway
4. Gateway redirects back with payment status
5. Money held in escrow until buyer confirms delivery
6. Release payment to seller + calculate referral commissions

---

## Error Handling

All API errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

**Common Error Codes:**
- `AUTH_REQUIRED`: Authentication needed
- `INVALID_TOKEN`: JWT token invalid or expired
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `INSUFFICIENT_FUNDS`: Not enough balance
- `ESCROW_ERROR`: Escrow transaction failed
