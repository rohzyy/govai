import urllib.request
import urllib.error
import json

url = "http://localhost:3000/api/complaints/13/status"
print(f"Testing {url}...")

try:
    with urllib.request.urlopen(url) as response:
        print(f"Status: {response.status}")
        body = response.read().decode()
        print(f"Body: {body}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
