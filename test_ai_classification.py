"""
Test script for AI Priority Classification and Department Mapping
"""
from backend.ai_utils import analyze_complaint

print("=" * 80)
print("AI PRIORITY CLASSIFICATION TEST SUITE")
print("=" * 80)

# Test 1: Critical Priority
print("\n🔴 TEST 1: CRITICAL PRIORITY")
print("-" * 80)
result = analyze_complaint('Urgent! Open electric wire hanging near school. Immediate danger to children.')
print(f"Priority: {result['priority']}")
print(f"Category: {result['category']}")
print(f"Department: {result['department_full_name']}")
print(f"Officer: {result['assigned_officer_type']}")
print(f"Confidence: {result['confidence']:.2f}")
print(f"Sentiment: {result['sentiment_score']:.2f}")

# Test 2: High Priority
print("\n🟠 TEST 2: HIGH PRIORITY")
print("-" * 80)
result = analyze_complaint('Major water pipeline burst on Main Road. Severe flooding and damage.')
print(f"Priority: {result['priority']}")
print(f"Category: {result['category']}")
print(f"Department: {result['department_full_name']}")
print(f"Officer: {result['assigned_officer_type']}")
print(f"Confidence: {result['confidence']:.2f}")

# Test 3: Medium Priority
print("\n🟡 TEST 3: MEDIUM PRIORITY")
print("-" * 80)
result = analyze_complaint('Garbage not collected for 3 days. Bin is overflowing.')
print(f"Priority: {result['priority']}")
print(f"Category: {result['category']}")
print(f"Department: {result['department_full_name']}")
print(f"Officer: {result['assigned_officer_type']}")
print(f"Confidence: {result['confidence']:.2f}")

# Test 4: Low Priority
print("\n🟢 TEST 4: LOW PRIORITY")
print("-" * 80)
result = analyze_complaint('Small pothole on residential street near house 42.')
print(f"Priority: {result['priority']}")
print(f"Category: {result['category']}")
print(f"Department: {result['department_full_name']}")
print(f"Officer: {result['assigned_officer_type']}")
print(f"Confidence: {result['confidence']:.2f}")

# Test 5: Different Departments
print("\n🏛️ TEST 5: DEPARTMENT CLASSIFICATION")
print("-" * 80)

test_cases = [
    ("Broken street light on highway", "Street Lights & Electrical"),
    ("Park needs cleaning and maintenance", "Parks & Environment"),
    ("Blocked drain causing foul smell", "Sewerage & Drainage"),
    ("Traffic signal not working", "Traffic & Road Safety"),
]

for text, expected_dept in test_cases:
    result = analyze_complaint(text)
    status = "✅" if expected_dept in result['category'] else "❌"
    print(f"{status} {expected_dept}: {result['category']}")

print("\n" + "=" * 80)
print("TEST SUITE COMPLETE")
print("=" * 80)
