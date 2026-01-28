import google.generativeai as genai
import os

def list_models(api_key):
    print(f"--- Listing Models for Key: ...{api_key[-10:]} ---")
    try:
        genai.configure(api_key=api_key)
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"FAILURE: {str(e)}")

if __name__ == "__main__":
    # Test with the new key from the user
    list_models("AIzaSyCYOqPV7LFPjfgSnxZFua4desMHaa0V5ZM")
