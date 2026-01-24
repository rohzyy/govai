import requests

url = "http://127.0.0.1:8000/auth/admin/login"
payload = {
    "username": "ADMIN",
    "password": "ADMIN"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
