import requests

def test_officer_login():
    url = "http://localhost:8000/auth/officer/login"
    payload = {
        "username": "GOV-100",
        "password": "GOV-100"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_officer_login()
