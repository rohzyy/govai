import google.generativeai as genai
import os
import sys

def test_key(api_key):
    print(f"Testing Gemini API Key: ...{api_key[-10:]}")
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content("Say 'Key is Valid'")
        print(f"SUCCESS: {response.text}")
        return True
    except Exception as e:
        print(f"FAILURE: {str(e)}")
        if "API_KEY_INVALID" in str(e):
            print("Reason: The key itself is fundamentally incorrect or malformed.")
        elif "403" in str(e):
            print("Reason: Access denied. Probable causes: API not enabled, restricted restricted IP, or project suspended.")
        elif "expired" in str(e).lower():
            print("Reason: The key or project has expired.")
        return False

if __name__ == "__main__":
    # 1. Test key from config/env
    # We'll use the one from the local session context or ask for it
    key_to_test = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not key_to_test:
        print("Usage: python test_gemini_key.py YOUR_API_KEY")
    else:
        test_key(key_to_test)
