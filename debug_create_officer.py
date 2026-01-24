import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_admin_flow():
    print("1. Logging in as ADMIN...")
    login_payload = {"username": "ADMIN", "password": "ADMIN"}
    
    try:
        session = requests.Session()
        login_res = session.post(f"{BASE_URL}/auth/admin/login", json=login_payload)
        
        if login_res.status_code != 200:
            print(f"❌ Login Failed: {login_res.status_code} - {login_res.text}")
            return
            
        data = login_res.json()
        token = data.get("access_token")
        print(f"✅ Login Successful. Token: {token[:20]}...")
        
        # Verify Cookies in Session
        print(f"🍪 Cookies in session: {session.cookies.get_dict()}")
        
        # 2. Add Authorization Header manually (Simulating what Frontend should do)
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 3. Try to Create Officer
        print("\n2. Creating Officer (Direct Backend Request)...")
        officer_payload = {
            "employee_id": "TEST_OFFICER_999",
            "name": "Test Officer",
            "designation": "Junior Engineer",
            "department_id": 1,
            "ward": "Ward 99",
            "zone": "North",
            "circle": "Circle 1",
            "status": "Active",
            "email": "test999@gov.in",
            "phone": "9999999999"
        }
        
        # Try with Cookies AND Header (Simulate robust client)
        create_res = session.post(
            f"{BASE_URL}/admin/officers", 
            json=officer_payload,
            headers=headers
        )
        
        if create_res.status_code == 200:
            print(f"✅ Create Officer Successful! Response: {create_res.json()}")
        else:
            print(f"❌ Create Officer Failed: {create_res.status_code}")
            print(f"Response: {create_res.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_admin_flow()
