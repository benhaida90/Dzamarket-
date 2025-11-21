#!/usr/bin/env python3
"""
DzaMarket Backend API Testing Suite
Tests all backend APIs including authentication, products, and payments
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://dzamarket.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

# Test data
TEST_USER_DATA = {
    "name": "Ahmed Test User",
    "email": "ahmed.test@example.com", 
    "phone": "+213555111222",
    "password": "testpassword123",
    "location": "Algiers, Algeria"
}

TEST_BUYER_DATA = {
    "name": "Fatima Buyer User",
    "email": "fatima.buyer@example.com", 
    "phone": "+213555333444",
    "password": "buyerpassword123",
    "location": "Oran, Algeria"
}

TEST_PRODUCT_DATA = {
    "title": "Test Product Samsung Phone",
    "description": "This is a test product for API testing",
    "price": 150000,
    "category": "Electronics", 
    "images": ["https://example.com/image.jpg"],
    "location": "Algiers, Algeria"
}

# Global variables to store test results
auth_token = None
buyer_token = None
user_id = None
buyer_id = None
product_id = None
transaction_id = None

def print_test_result(test_name, success, details=""):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if details:
        print(f"   Details: {details}")
    print()

def test_health_check():
    """Test API health check endpoint"""
    print("🔍 Testing API Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            details = f"Status: {data.get('status')}, Version: {data.get('version')}"
        else:
            details = f"Status Code: {response.status_code}"
            
        print_test_result("API Health Check", success, details)
        return success
    except Exception as e:
        print_test_result("API Health Check", False, f"Exception: {str(e)}")
        return False

def test_user_registration():
    """Test user registration endpoint"""
    global user_id
    print("🔍 Testing User Registration...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers=HEADERS,
            json=TEST_USER_DATA,
            timeout=10
        )
        
        success = response.status_code in [200, 201]
        
        if success:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("userId"):
                user_id = data["data"]["userId"]
                details = f"User ID: {user_id}, Message: {data.get('message')}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("User Registration", success, details)
        return success
    except Exception as e:
        print_test_result("User Registration", False, f"Exception: {str(e)}")
        return False

def test_user_login():
    """Test user login endpoint"""
    global auth_token
    print("🔍 Testing User Login...")
    
    try:
        login_data = {
            "email": TEST_USER_DATA["email"],
            "password": TEST_USER_DATA["password"]
        }
        
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers=HEADERS,
            json=login_data,
            timeout=10
        )
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") and data.get("token"):
                auth_token = data["token"]
                user_info = data.get("user", {})
                details = f"Token received, User: {user_info.get('name')}, Email: {user_info.get('email')}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("User Login", success, details)
        return success
    except Exception as e:
        print_test_result("User Login", False, f"Exception: {str(e)}")
        return False

def test_validate_referral():
    """Test referral code validation endpoint"""
    print("🔍 Testing Referral Code Validation...")
    
    try:
        # Test with invalid referral code
        response = requests.post(
            f"{BASE_URL}/auth/validate-referral?referral_code=INVALID123",
            headers=HEADERS,
            timeout=10
        )
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") is True and data.get("valid") is False:
                details = "Invalid referral code correctly rejected"
            else:
                success = False
                details = f"Unexpected response: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Referral Code Validation", success, details)
        return success
    except Exception as e:
        print_test_result("Referral Code Validation", False, f"Exception: {str(e)}")
        return False

def test_create_product():
    """Test product creation endpoint (requires auth)"""
    global product_id
    print("🔍 Testing Product Creation...")
    
    if not auth_token:
        print_test_result("Product Creation", False, "No auth token available")
        return False
    
    try:
        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {auth_token}"
        }
        
        response = requests.post(
            f"{BASE_URL}/products",
            headers=auth_headers,
            json=TEST_PRODUCT_DATA,
            timeout=10
        )
        
        success = response.status_code in [200, 201]
        
        if success:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("productId"):
                product_id = data["data"]["productId"]
                details = f"Product ID: {product_id}, Message: {data.get('message')}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Product Creation", success, details)
        return success
    except Exception as e:
        print_test_result("Product Creation", False, f"Exception: {str(e)}")
        return False

def test_get_products():
    """Test get products endpoint"""
    print("🔍 Testing Get Products...")
    
    try:
        response = requests.get(f"{BASE_URL}/products", timeout=10)
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") and "data" in data:
                items = data["data"].get("items", [])
                pagination = data["data"].get("pagination", {})
                details = f"Found {len(items)} products, Total: {pagination.get('totalItems', 0)}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Get Products", success, details)
        return success
    except Exception as e:
        print_test_result("Get Products", False, f"Exception: {str(e)}")
        return False

def test_get_product_details():
    """Test get single product details endpoint"""
    print("🔍 Testing Get Product Details...")
    
    if not product_id:
        print_test_result("Get Product Details", False, "No product ID available")
        return False
    
    try:
        response = requests.get(f"{BASE_URL}/products/{product_id}", timeout=10)
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") and data.get("data"):
                product_data = data["data"]
                details = f"Product: {product_data.get('title')}, Price: {product_data.get('price')}, Views: {product_data.get('views')}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Get Product Details", success, details)
        return success
    except Exception as e:
        print_test_result("Get Product Details", False, f"Exception: {str(e)}")
        return False

def test_register_buyer():
    """Register a second user to act as buyer"""
    global buyer_id, buyer_token
    print("🔍 Testing Buyer Registration...")
    
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            headers=HEADERS,
            json=TEST_BUYER_DATA,
            timeout=10
        )
        
        success = response.status_code in [200, 201]
        
        if success:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("userId"):
                buyer_id = data["data"]["userId"]
                
                # Login the buyer to get token
                login_data = {
                    "email": TEST_BUYER_DATA["email"],
                    "password": TEST_BUYER_DATA["password"]
                }
                
                login_response = requests.post(
                    f"{BASE_URL}/auth/login",
                    headers=HEADERS,
                    json=login_data,
                    timeout=10
                )
                
                if login_response.status_code == 200:
                    login_data_resp = login_response.json()
                    if login_data_resp.get("success") and login_data_resp.get("token"):
                        buyer_token = login_data_resp["token"]
                        details = f"Buyer ID: {buyer_id}, Token obtained"
                    else:
                        success = False
                        details = "Failed to get buyer token"
                else:
                    success = False
                    details = f"Buyer login failed: {login_response.status_code}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Buyer Registration", success, details)
        return success
    except Exception as e:
        print_test_result("Buyer Registration", False, f"Exception: {str(e)}")
        return False

def test_create_escrow_payment():
    """Test create escrow payment endpoint (requires auth)"""
    global transaction_id
    print("🔍 Testing Create Escrow Payment...")
    
    if not buyer_token or not product_id:
        print_test_result("Create Escrow Payment", False, "Missing buyer token or product ID")
        return False
    
    try:
        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {buyer_token}"
        }
        
        payment_data = {
            "product_id": product_id,
            "payment_method": "CIB"
        }
        
        response = requests.post(
            f"{BASE_URL}/payments/create-escrow",
            headers=auth_headers,
            json=payment_data,
            timeout=10
        )
        
        success = response.status_code in [200, 201]
        
        if success:
            data = response.json()
            if data.get("success") and data.get("data", {}).get("escrowId"):
                transaction_id = data["data"]["escrowId"]
                payment_url = data["data"].get("paymentUrl")
                amount = data["data"].get("amount")
                details = f"Escrow ID: {transaction_id}, Amount: {amount}, Payment URL: {payment_url[:50]}..."
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Create Escrow Payment", success, details)
        return success
    except Exception as e:
        print_test_result("Create Escrow Payment", False, f"Exception: {str(e)}")
        return False

def test_get_referral_earnings():
    """Test get referral earnings endpoint (requires auth)"""
    print("🔍 Testing Get Referral Earnings...")
    
    if not auth_token:
        print_test_result("Get Referral Earnings", False, "No auth token available")
        return False
    
    try:
        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {auth_token}"
        }
        
        response = requests.get(
            f"{BASE_URL}/payments/referral-earnings",
            headers=auth_headers,
            timeout=10
        )
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") and "data" in data:
                earnings_data = data["data"]
                referral_code = earnings_data.get("referralCode")
                total_earnings = earnings_data.get("totalEarnings", 0)
                level1_count = earnings_data.get("level1Count", 0)
                level2_count = earnings_data.get("level2Count", 0)
                details = f"Referral Code: {referral_code}, Total Earnings: {total_earnings}, L1: {level1_count}, L2: {level2_count}"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Get Referral Earnings", success, details)
        return success
    except Exception as e:
        print_test_result("Get Referral Earnings", False, f"Exception: {str(e)}")
        return False

def test_get_user_transactions():
    """Test get user transactions endpoint (requires auth)"""
    print("🔍 Testing Get User Transactions...")
    
    if not auth_token:
        print_test_result("Get User Transactions", False, "No auth token available")
        return False
    
    try:
        auth_headers = {
            **HEADERS,
            "Authorization": f"Bearer {auth_token}"
        }
        
        response = requests.get(
            f"{BASE_URL}/payments/transactions",
            headers=auth_headers,
            timeout=10
        )
        
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get("success") and "data" in data:
                transactions = data["data"]
                details = f"Found {len(transactions)} transactions"
            else:
                success = False
                details = f"Invalid response structure: {data}"
        else:
            details = f"Status Code: {response.status_code}, Response: {response.text}"
            
        print_test_result("Get User Transactions", success, details)
        return success
    except Exception as e:
        print_test_result("Get User Transactions", False, f"Exception: {str(e)}")
        return False

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting DzaMarket Backend API Tests")
    print("=" * 50)
    print(f"Base URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    print()
    
    # Track test results
    test_results = []
    
    # Run tests in sequence
    test_results.append(("Health Check", test_health_check()))
    test_results.append(("User Registration", test_user_registration()))
    test_results.append(("User Login", test_user_login()))
    test_results.append(("Validate Referral", test_validate_referral()))
    test_results.append(("Create Product", test_create_product()))
    test_results.append(("Get Products", test_get_products()))
    test_results.append(("Get Product Details", test_get_product_details()))
    test_results.append(("Create Escrow Payment", test_create_escrow_payment()))
    test_results.append(("Get Referral Earnings", test_get_referral_earnings()))
    test_results.append(("Get User Transactions", test_get_user_transactions()))
    
    # Summary
    print("=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in test_results if result)
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! Backend APIs are working correctly.")
        return True
    else:
        print(f"⚠️  {total - passed} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)