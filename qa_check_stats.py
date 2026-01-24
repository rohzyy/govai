import requests
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8000"

def check_stats():
    print("🚀 Checking Admin Stats...")
    
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
        res = session.post(auth_url, json=login_payload)
        if res.status_code != 200:
            print(f"❌ Login Failed: {res.text}")
            return
        print("✅ Admin Logged In")
        
        # 2. Call Stats Endpoint
        stats_url = f"{BASE_URL}/admin/stats"
        print(f"📡 GET {stats_url}...")
        res = session.get(stats_url)
        
        if res.status_code == 200:
            stats = res.json()
            print(f"✅ Stats Response:")
            print(f"   Total: {stats.get('total')}")
            print(f"   Pending: {stats.get('pending')}")
            print(f"   Resolved: {stats.get('resolved')}")
            print(f"   Critical: {stats.get('critical')}")
        else:
            print(f"⚠️ API Error: {res.status_code} - {res.text}")

    except Exception as e:
        print(f"❌ Script Error: {e}")

if __name__ == "__main__":
    check_stats()
