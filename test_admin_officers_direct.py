import requests
import json

BASE_URL = "http://localhost:8000"

def test_officers_direct():
    print("🚀 Testing Backend /admin/officers Directly...")
    
    # 1. Login as Dev Admin (citizen_v3)
    # Note: I promoted citizen_v3 to ADMIN previously.
    # I can use 'MOCK_GOOGLE_TOKEN' to get the token.
    print("   👉 Logging in as Dev Admin...")
    try:
        res = requests.post(f"{BASE_URL}/auth/google", json={"token": "MOCK_GOOGLE_TOKEN"})
        if res.status_code == 200:
            token = res.json().get("token")
            print(f"   ✅ Login Success. Token: {token[:10]}...")
            
            # 2. GET /admin/officers
             # 2. GET /admin/officers
            print("   👉 GET /admin/officers...")
            headers = {"Authorization": f"Bearer {token}"}
            off_res = requests.get(f"{BASE_URL}/admin/officers", headers=headers)
            
            print(f"   👉 Status: {off_res.status_code}")
            if off_res.status_code == 200:
                print(f"   ✅ Success! Found {len(off_res.json())} officers.")
                # print(off_res.json())
            else:
                print(f"   ❌ Failed: {off_res.text}")
        else:
            print(f"❌ Login Failed: {res.text}")

    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_officers_direct()
