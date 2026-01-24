import google.generativeai as genai
import sys

# Test with the new API key
genai.configure(api_key="AIzaSyDBse6cwIzDstwNlOxDHLSp3llSpt-G9nE")

try:
    # List available models
    print("=== Available Models ===")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model: {m.name}")
    
    print("\n=== Testing gemini-pro ===")
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content("Say 'Working!' if you can see this")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc()
