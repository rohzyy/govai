
import requests

BASE_URL = "http://127.0.0.1:8000"

def test_admin_flow():
    # 1. Login
    print("Testing Admin Login...")
    resp = requests.post(f"{BASE_URL}/auth/admin/login", json={
        "username": "admin@grievance.ai",
        "password": "ADMIN"
    })
    
    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} {resp.text}")
        return

    data = resp.json()
    token = data.get("access_token")
    role = data.get("role")
    print(f"Login Success. Role: {role}")
    print(f"Token: {token[:20]}...")

    # 2. Access Admin Complaints
    print("\nAccessing /admin/complaints...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/admin/complaints", headers=headers)
    
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        complaints = resp.json()
        print(f"Success! {len(complaints)} complaints found.")
    else:
        print(f"Failed: {resp.text}")

if __name__ == "__main__":
    test_admin_flow()
