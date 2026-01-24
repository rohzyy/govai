import requests

from datetime import datetime, timedelta

# Config
BASE_URL = "http://localhost:8000"
SECRET_KEY = "your-secret-key-here" # I need to know the real secret key or rely on the backend to accept a mock if I can't sign it. 
# Actually, I can just use the login endpoint if I knew a credential.
# But I can't easily login as admin without credentials.
# However, I can try to access it without auth to see if I get 401/403 (which proves connectivity).

def test_fetch_officers():
    print(f"🚀 Testing Connectivity to {BASE_URL}/admin/officers?status=Active")
    
    try:
        # 1. Test connectivity (No Auth)
        # Should return 401 or 403
        r = requests.get(f"{BASE_URL}/admin/officers?status=Active")
        print(f"Status Code (No Auth): {r.status_code}")
        
        if r.status_code in [401, 403]:
            print(f"✅ Endpoint exists and handles Auth (Received 401/403)")
            print(f"    Headers: {r.headers}")
            print(f"    Access-Control-Allow-Origin: {r.headers.get('Access-Control-Allow-Origin')}")
            print("⚠️ Endpoint is PUBLIC (Unexpected for Admin route!)")
        elif r.status_code == 404:
            print("❌ Endpoint NOT FOUND (404)")
        elif r.status_code == 500:
            print("❌ Internal Server Error (500)")
        else:
            print(f"❓ Unexpected status: {r.status_code}")

        # 2. Test OPTIONS (CORS preflight)
        print("\n🚀 Testing OPTIONS (CORS Preflight)...")
        headers = {
            "Access-Control-Request-Method": "GET",
            "Origin": "http://localhost:3000",
        }
        r_opt = requests.options(f"{BASE_URL}/admin/officers?status=Active", headers=headers)
        print(f"Status Code (OPTIONS): {r_opt.status_code}")
        
        if r_opt.status_code == 200:
            print("✅ OPTIONS handled correctly")
            print("Access-Control-Allow-Origin:", r_opt.headers.get("Access-Control-Allow-Origin"))
        else:
            print(f"❌ OPTIONS failed: {r_opt.status_code}")

    except requests.exceptions.ConnectionError:
        print("❌ Connection Refused! Is backend running?")
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_fetch_officers()
