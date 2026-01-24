import requests
import time
import json

BASE_URL = "http://localhost:5000"
USER_EMAIL = "test_citizen@example.com"
USER_PASSWORD = "password123"

# 1. Login/Register User
def get_auth_token():
    print("Using Mock Google Login...")
    response = requests.post(f"{BASE_URL}/auth/google", json={"token": "MOCK_GOOGLE_TOKEN"})
    
    if response.status_code == 200:
        token = response.json().get('token') or response.json().get('access_token')
        print(f"Login successful. Token: {token[:10]}...")
        return token
    else:
        print(f"Login failed: {response.text}")
        return None

def create_complaint(token, title, description):
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "title": title,
        "description": description,
        "location": "Test Ward 1",
        "priority": "Low",
        "category": "Sanitation"
    }
    response = requests.post(f"{BASE_URL}/api/complaints", json=data, headers=headers)
    return response

def main():
    print("--- Starting AI Trust Verification ---")
    token = get_auth_token()
    if not token:
        print("CRITICAL: Could not authenticate.")
        return

    # Case 1: Normal Complaint (Baseline)
    print("\n1. Submitting Normal Complaint...")
    r1 = create_complaint(token, "Normal Trash Issue", "There is a pile of garbage on Main St that needs pickup.")
    if r1.status_code == 201:
        print(f"  Success: ID {r1.json().get('id')} - Should have High Trust Score.")
    else:
        print(f"  Failed: {r1.text}")

    # Case 2: Spam (Short Description)
    print("\n2. Submitting Spam Complaint (Too Short)...")
    r2 = create_complaint(token, "Spam Test", "Bad.")
    if r2.status_code == 201:
        print(f"  Success: ID {r2.json().get('id')} - Should be flagged as SPAM/Low Quality.")
    else:
        print(f"  Failed: {r2.text}")

    # Case 3: Duplicate Content
    print("\n3. Submitting Duplicate Complaint...")
    desc = "This is a unique description for duplicate testing " + str(time.time())
    # First one
    create_complaint(token, "Dup Original", desc)
    # Second one (Immediate duplicate)
    r3 = create_complaint(token, "Dup Copy", desc)
    if r3.status_code == 201:
        print(f"  Success: ID {r3.json().get('id')} - Should be flagged as DUPLICATE.")
    else:
        print(f"  Failed: {r3.text}")

    # Case 4: High Velocity (3 in < 5 mins)
    print("\n4. Submitting High Velocity Complaints...")
    for i in range(3):
        print(f"  Submitting velocity test {i+1}...")
        r = create_complaint(token, f"Velocity Test {i}", f"Velocity description test number {i} with timestamp {time.time()}")
        if r.status_code == 201:
            print(f"    Created ID {r.json().get('id')}")
        time.sleep(1) 
    print("  The last one should definitely be flagged for HIGH VELOCITY.")

    print("\n--- Verification Data Generation Complete ---")
    print("Now check the Admin Dashboard for the proper badges.")

if __name__ == "__main__":
    main()
