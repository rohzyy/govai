import requests
import json

BASE_URL = "http://localhost:8000"

def test_auth():
    print("🚀 Starting Auth Diagnosis...")
    
    # 1. Try ADMIN Login
    print("\n🔐 Attempting ADMIN Login ('ADMIN' / 'ADMIN')...")
    try:
        res = requests.post(f"{BASE_URL}/auth/admin/login", json={"username": "ADMIN", "password": "ADMIN"})
        if res.status_code == 200:
            admin_data = res.json()
            admin_token = admin_data.get("access_token")
            print(f"✅ Admin Login Successful. Token: {admin_token[:15]}...")
            
            # 2. Try Admin Route with Admin Token
            print("   👉 Testing /admin/stats with ADMIN Token...")
            stats_res = requests.get(
                f"{BASE_URL}/admin/stats", 
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            if stats_res.status_code == 200:
                print(f"   ✅ Access GRANTED. Pending: {stats_res.json().get('pending')}")
            else:
                print(f"   ❌ Access DENIED ({stats_res.status_code}): {stats_res.text}")
        else:
            print(f"❌ Admin Login Failed ({res.status_code}): {res.text}")
            admin_token = None
    except Exception as e:
         print(f"❌ Connection Failed: {e}")

    # 3. Try USER Login (Dev Mode)
    print("\n👤 Attempting USER Login (Dev Mode)...")
    try:
        res = requests.post(f"{BASE_URL}/auth/google", json={"token": "MOCK_GOOGLE_TOKEN"})
        if res.status_code == 200:
            user_data = res.json()
            user_token = user_data.get("token") # API returns "token" for localStorage
            print(f"✅ User Login Successful. Token: {user_token[:15]}...")
            
            # 4. Try Admin Route with USER Token
            print("   👉 Testing /admin/stats with USER Token...")
            stats_res = requests.get(
                f"{BASE_URL}/admin/stats", 
                headers={"Authorization": f"Bearer {user_token}"}
            )
            if stats_res.status_code == 403:
                print(f"   ✅ Access DENIED (403) as expected.")
            elif stats_res.status_code == 200:
                print(f"   ⚠️  CRITICAL: Access GRANTED to User! (Security Risk)")
            else:
                print(f"   ❓ Unexpected Status ({stats_res.status_code}): {stats_res.text}")
        else:
            print(f"❌ User Login Failed ({res.status_code}): {res.text}")
            
    except Exception as e:
         print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    test_auth()
