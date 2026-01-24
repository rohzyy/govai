import requests
import sys
import os

# Add project root to path for db access if needed, but we'll use API first
sys.path.append(os.getcwd())

BACKEND_URL = "http://127.0.0.1:8000"
ID = 13

def debug_tracking():
    print(f"--- Debugging Tracking for ID {ID} ---")
    
    # 1. Call Backend Directly
    url = f"{BACKEND_URL}/complaints/{ID}/status"
    print(f"GET {url}")
    try:
        res = requests.get(url)
        print(f"Status Code: {res.status_code}")
        print(f"Raw Response: {res.text}")
        if res.status_code == 200:
            data = res.json()
            print(f"FULL JSON: {data}")
            print(f"Status Field: '{data.get('status')}'")
            print(f"Status Type: {type(data.get('status'))}")
    except Exception as e:
        print(f"Backend Call Failed: {e}")

if __name__ == "__main__":
    debug_tracking()
