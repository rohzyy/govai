import urllib.request
import json

url = "http://localhost:3000/api/track-status?id=12"
print(f"Testing New Route: {url}")

try:
    with urllib.request.urlopen(url) as response:
        print(f"Status: {response.status}")
        data = response.read().decode()
        print(f"Body: {data}")
        json_data = json.loads(data)
        if isinstance(json_data, dict) and "status" in json_data and isinstance(json_data["status"], str):
             print(f"SUCCESS: Found status '{json_data['status']}'")
        elif "data" in json_data and isinstance(json_data["data"], list):
             print("FAILURE: Still getting generic list response!")
        else:
             print("Unknown response format")

except Exception as e:
    print(f"Error: {e}")
