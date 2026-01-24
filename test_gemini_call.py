import google.generativeai as genai

# Test with the new API key
genai.configure(api_key="AIzaSyDBse6cwIzDstwNlOxDHLSp3llSpt-G9nE")
model = genai.GenerativeModel("gemini-1.5-flash")

# Test simple prompt
response = model.generate_content("Say 'Gemini is working!' if you can see this")
print(f"Gemini Response: {response.text}")
