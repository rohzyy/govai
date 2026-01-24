import requests

BASE_URL = "http://localhost:8000"

def test_token_logic():
    print("🚀 Testing Google Token Logic...")
    
    # Test 1: Non-JWT (Access Token / Random String)
    print("   [1] Sending Non-JWT Token...")
    try:
        res = requests.post(f"{BASE_URL}/auth/google", json={"token": "this_is_not_a_jwt_it_has_no_dots"})
        print(f"       Response: {res.status_code} - {res.text}")
        if res.status_code == 401 and "Invalid Token Type" in res.text:
            print("       ✅ Correctly rejected as Invalid Token Type.")
        elif res.status_code == 401 and "Invalid Google Token" in res.text:
             print("       ⚠️ Rejected, but with generic message. (Did the logic trigger?)")
             # Actually my code raises ValueError("Invalid Token Type...") which auth_routes catches and prints str(e).
             # So it SHOULD show "Invalid Token Type".
        else:
            print("       ❌ Unexpected response.")
            
    except Exception as e:
        print(f"       ❌ Exception: {e}")

    # Test 2: Invalid JWT (Bad Signature)
    print("   [2] Sending Invalid JWT...")
    try:
        # A token with 2 dots but garbage
        fake_jwt = "header.payload.signature" 
        res = requests.post(f"{BASE_URL}/auth/google", json={"token": fake_jwt})
        print(f"       Response: {res.status_code} - {res.text}")
        if res.status_code == 401 and "Invalid" in res.text:
             print("       ✅ Correctly rejected Invalid JWT.")
        else:
             print("       ❌ Unexpected response.")

    except Exception as e:
        print(f"       ❌ Exception: {e}")

if __name__ == "__main__":
    test_token_logic()
