import requests

BASE_URL = "http://localhost:8000"

def test_invalid_google_login():
    print("🚀 Testing Invalid Google Login...")
    
    try:
        res = requests.post(f"{BASE_URL}/auth/google", json={"token": "INVALID_TOKEN_XYZ"})
        
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.text}")
        
        if res.status_code == 401:
            print("✅ SUCCESS: Received expected 401 Unauthorized for invalid token.")
        else:
            print(f"❌ FAILURE: Expected 401, got {res.status_code}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_invalid_google_login()
