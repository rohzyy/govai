
import requests

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_PROXY_URL = "http://localhost:3000/api/admin/complaints"

def debug_proxy():
    # 1. Login to get Token
    print("1. Logging in as Admin...")
    try:
        login_resp = requests.post(f"{BACKEND_URL}/auth/admin/login", json={
            "username": "admin@grievance.ai", 
            "password": "ADMIN"
        })
        login_resp.raise_for_status()
        token = login_resp.json().get("access_token")
        print(f"   SUCCESS. Token: {token[:15]}...")
    except Exception as e:
        print(f"   LOGIN FAILED: {e}")
        return

    # 2. Hit Proxy
    print(f"\n2. Hitting Proxy: {FRONTEND_PROXY_URL}")
    try:
        # Pass Token as Header (Simulation of Client Client)
        headers = {"Authorization": f"Bearer {token}"}
        proxy_resp = requests.get(FRONTEND_PROXY_URL, headers=headers)
        
        print(f"   Status Code: {proxy_resp.status_code}")
        print(f"   Headers: {dict(proxy_resp.headers)}")
        
        try:
            data = proxy_resp.json()
            print(f"   Response Body (First 500 chars): {str(data)[:500]}")
            
            if isinstance(data, list):
                print(f"   ✅ Structure is ARRAY. Length: {len(data)}")
            elif isinstance(data, dict):
                 print(f"   ⚠️ Structure is DICT. Keys: {list(data.keys())}")
            else:
                 print(f"   ❓ Structure is {type(data)}")
                 
        except:
            print(f"   ❌ Response is NOT JSON: {proxy_resp.text[:500]}")
            
    except Exception as e:
        print(f"   PROXY REQUEST FAILED: {e}")

if __name__ == "__main__":
    debug_proxy()
