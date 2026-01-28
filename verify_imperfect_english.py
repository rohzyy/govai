from backend.ai_utils import analyze_complaint, classify_priority, categorize_department

test_cases = [
    "building broke down",
    "building there in area which not strong might broke down",
    "wire hanging on road",
    "water leak in house",
    "garbage smelling bad",
]

print("=" * 60)
print("AI PRIORITY VERIFICATION")
print("=" * 60)

for text in test_cases:
    print(f"\nComplaint: {text}")
    result = analyze_complaint(text)
    cp_res = classify_priority(text)
    cd_res = categorize_department(text)
    
    print(f"Final Priority: {result['priority']}")
    print(f"Classify Priority Result: {cp_res}")
    print(f"Category: {result['category']} (Confidence: {result['confidence']:.2f})")
    print(f"Raw Dept Match: {cd_res['category']}")
    print(f"Reasoning: {result.get('reasoning', 'N/A')}")

print("\n" + "=" * 60)
