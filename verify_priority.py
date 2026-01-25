
# Script to verify improved priority logic
from backend.ai_utils import analyze_complaint, classify_complaint_with_llm

print("--- VERIFYING PRIORITY LOGIC ---")

# Test 1: Garbage (User used "Immediate" but it's just garbage)
t1 = "Garbage has remained uncollected. Please arrange for an immediate pickup. Urgent action required."
print(f"\nTEST 1: {t1}")
res1 = analyze_complaint(t1)
print(f"Result 1: Priority={res1['priority']} | Reason={res1.get('confidence', 'N/A')}")

# Test 2: Live Wire (Actually Critical)
t2 = "There is a live electric wire hanging near the primary school gate. Sparks are coming out."
print(f"\nTEST 2: {t2}")
res2 = analyze_complaint(t2)
print(f"Result 2: Priority={res2['priority']} | Reason={res2.get('confidence', 'N/A')}")

# Manual verification of direct LLM call
print("\n--- DIRECT LLM CALL CHECK ---")
res_llm = classify_complaint_with_llm("Uncollected garbage emitting foul smell", "Sector 4")
print(f"LLM Raw Output: {res_llm}")
