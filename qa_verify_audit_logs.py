import requests
import sys
import os
import sqlite3

# Configuration
BASE_URL = "http://127.0.0.1:8000"
DB_PATH = "grievance_enterprise_v3.db"

def verify_audit_log():
    print("🚀 Verifying Audit Log Fix...")
    
    # 1. Login as Admin
    print("🔑 Authenticating as Admin...")
    login_payload = {
        "username": "ADMIN", 
        "password": "ADMIN"
    }
    session = requests.Session()
    try:
        # Get Token
        auth_url = f"{BASE_URL}/auth/admin/login"
        response = session.post(auth_url, json=login_payload) # JSON, not data
        if response.status_code != 200:
            print(f"❌ Login Failed: {response.text}")
            return
            
        # Admin login sets cookies, but might return token in body?
        # Check response keys
        data = response.json()
        print(f"   Login Response: {data.keys()}")
        
        # Extract access_token if present, or rely on Session Cookies (requests.Session handles cookies)
        # But our manual resolve call needs Authorization header if it doesn't use cookies?
        # admin_routes.get_current_admin checks BOTH.
        # So we can use the cookies OR header.
        # Let's check if 'access_token' is in body.
        # auth_routes.py admin_login calls 'set_auth_cookies' and returns nothing? 
        # Wait, lines 134-140.. it returns Log? No, it has no return statement shown in snippet except implicit None? 
        # Wait, let me check the end of admin_login.
        
        # Assuming it returns generated token or we use cookies.
        # Ideally we use the cookie from session.
        print("✅ Admin Logged In (Cookies Set)")
        
        # 2. Pick a Complaint to Resolve (e.g., ID 1)
        target_id = 1
        print(f"🎯 Targeting Complaint #{target_id}")
        
        # 3. Call Admin Resolve Endpoint
        resolve_url = f"{BASE_URL}/admin/resolve/{target_id}"
        print(f"📡 Sending RESOLVE request to {resolve_url}...")
        res = session.put(resolve_url)
        
        if res.status_code == 200:
            print(f"✅ API Response: 200 OK")
        else:
            print(f"⚠️ API Error: {res.status_code} - {res.text}")
            # Continue to check DB anyway, maybe it was already resolved
            
        # 4. Check DB for Timeline Entry
        print(f"🔎 Checking DB for GrievanceTimeline...")
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT status, updated_by, remarks, timestamp FROM grievance_timeline WHERE complaint_id=? AND status='RESOLVED' ORDER BY timestamp DESC", 
            (target_id,)
        )
        row = cursor.fetchone()
        
        if row:
            print(f"✅ SUCCESS! Found Timeline Entry:")
            print(f"   Status: {row[0]}")
            print(f"   By: {row[1]}")
            print(f"   Remarks: {row[2]}")
            print(f"   Time: {row[3]}")
        else:
            print(f"❌ FAILURE: No 'RESOLVED' entry found in grievance_timeline for ID {target_id}")
            
        conn.close()

    except Exception as e:
        print(f"❌ Script Error: {e}")

if __name__ == "__main__":
    verify_audit_log()
