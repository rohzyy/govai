
from backend.ai_utils import analyze_complaint, PRIORITY_KEYWORDS

print("--- CONSTRUCTION PRIORITY CHECK ---")

text = "Construction work is being carried out without proper safety barriers. Debris is scattered on the road, endangering pedestrians. There is a high risk of accidents. Necessary safety measures must be enforced immediately."
print(f"\nTEST TEXT: {text}")

# Debug keywords
text_lower = text.lower()
found_critical = [k for k in PRIORITY_KEYWORDS["Critical"] if k in text_lower]
print(f"Found Critical Keywords: {found_critical}")

res = analyze_complaint(text)
print(f"Result: Category={res['category']} | Priority={res['priority']}")
