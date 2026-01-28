
import requests
import time

print("Checking Root...")
try:
    r = requests.get("http://127.0.0.1:8000/", timeout=2)
    print(f"Root: {r.status_code}")
except Exception as e:
    print(f"Root Failed: {e}")

print("Checking AI...")
try:
    r = requests.post("http://127.0.0.1:8000/ai/analyze", json={"description": "test"}, timeout=5)
    print(f"AI: {r.status_code}")
except Exception as e:
    print(f"AI Failed: {e}")
