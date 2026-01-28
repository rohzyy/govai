from backend.ai_utils import analyze_complaint, classify_priority, categorize_department

text = "building broke down"
print(f"Testing text: {text}")

cp_res = classify_priority(text)
print(f"classify_priority(text) -> {cp_res}")

cd_res = categorize_department(text)
print(f"categorize_department(text) -> {cd_res['category']} (Confidence: {cd_res['confidence']})")

result = analyze_complaint(text)
print(f"analyze_complaint(text) -> {result['priority']}")
