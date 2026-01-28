import google.generativeai as genai
import os
import re

def test_key(api_key, source):
    print(f"--- Testing Key from {source} ---")
    print(f"Key: ...{api_key[-10:] if len(api_key) > 10 else api_key}")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'OK'")
        print(f"RESULT: SUCCESS - {response.text}")
    except Exception as e:
        print(f"RESULT: FAILURE - {str(e)}")

def scan_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Find anything looking like an API key
    keys = re.findall(r'AIzaSy[A-Za-z0-9_-]+', content)
    for key in set(keys):
        test_key(key, filepath)

if __name__ == "__main__":
    scan_file("frontend/.env.local")
    scan_file("backend/config.py")
    # Scan root for any hidden env files just in case
    for f in os.listdir("."):
        if "env" in f.lower():
            scan_file(f)
