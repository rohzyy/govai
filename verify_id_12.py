import urllib.request
import json

def check_url(url, name):
    print(f"--- Checking {name} ---")
    print(f"URL: {url}")
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            print(f"HTTP Status: {response.status}")
            data = response.read().decode()
            print(f"Raw Body: {data}")
            try:
                json_data = json.loads(data)
                print(f"Parsed Status Field: '{json_data.get('status')}'")
            except:
                print("Failed to parse JSON")
    except Exception as e:
        print(f"Error: {e}")
    print("\n")

check_url("http://127.0.0.1:8000/complaints/12/status", "Direct Backend")
check_url("http://localhost:3000/api/complaints/12/status", "Frontend Proxy")
