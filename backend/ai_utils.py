from textblob import TextBlob
import random

# India Government Department Mapping (Comprehensive)
INDIA_GOVT_DEPARTMENTS = {
    "Roads & Public Works": {
        "keywords": ["pothole", "road", "street", "footpath", "pavement", "cave-in", "damaged road", 
                     "broken road", "road damage", "highway", "asphalt", "tar road", "divider"],
        "full_name": "Public Works Department (PWD)",
        "officer": "Junior Engineer (JE)"
    },
    "Water Supply": {
        "keywords": ["water", "supply", "pipeline", "leak", "pressure", "contaminated", "tap", 
                     "water supply", "no water", "irregular water", "dirty water", "pipeline burst"],
        "full_name": "Water Supply & Sewerage Board",
        "officer": "Junior Engineer (Water)"
    },
    "Sewerage & Drainage": {
        "keywords": ["drain", "sewage", "manhole", "overflow", "foul smell", "blocked drain", 
                     "drainage", "sewer", "open manhole", "sewerage"],
        "full_name": "Public Health Engineering Department (PHED)",
        "officer": "Sanitary Inspector"
    },
    "Sanitation & Waste Management": {
        "keywords": ["garbage", "trash", "waste", "bin", "dumping", "dead animal", "litter",
                     "garbage collection", "dustbin", "waste disposal", "rubbish", "cleaning", "sweeping"],
        "full_name": "Sanitation & Waste Management Department",
        "officer": "Sanitary Inspector"
    },
    "Street Lighting Department": {
        "keywords": ["street light", "lamp", "pole", "dark street", "no light", "broken light", "flickering light"],
        "full_name": "Department of Street Lighting",
        "officer": "Electrical Supervisor"
    },
    "Electricity & Power Supply": {
        "keywords": ["electricity", "power", "voltage", "current", "wire", "electric pole", "spark", "transformer", 
                     "no power", "power cut", "low voltage", "hanging wire", "shock"],
        "full_name": "Electricity Department",
        "officer": "Junior Engineer (Electrical)"
    },
    "Public Health & Hygiene": {
        "keywords": ["mosquito", "dengue", "malaria", "fogging", "stagnant water", "health hazard", "epidemic", 
                     "food safety", "unsanitary", "public toilet", "urinal"],
        "full_name": "Department of Public Health",
        "officer": "Health Officer"
    },
    "Public Safety & Law Enforcement": {
        "keywords": ["theft", "crime", "illegal", "encroachment", "nuisance", "hooliganism", "unsafe", "security", 
                     "police", "patrol", "noise", "loudspeaker", "cctv"],
        "full_name": "Public Safety & Vigilance Department",
        "officer": "Station House Officer (SHO)"
    },
    "Parks & Environment": {
        "keywords": ["tree", "park", "garden", "branch", "horticulture", "fallen tree", 
                     "plant", "green space", "playground"],
        "full_name": "Horticulture Department",
        "officer": "Horticulture Inspector"
    },
    "Traffic & Road Safety": {
        "keywords": ["traffic", "signal", "traffic light", "road sign", "zebra crossing", 
                     "speed breaker", "traffic jam"],
        "full_name": "Traffic Engineering Cell",
        "officer": "Traffic Engineer"
    }
}

# Priority Classification Keywords
PRIORITY_KEYWORDS = {
    "Critical": ["urgent", "emergency", "danger", "life-threatening", "accident", "immediate",
                 "critical", "fatal", "death", "fire", "explosion", "collapse", "crisis"],
    "High": ["broken", "severe", "major", "hazardous", "leak", "overflow", "unsafe", 
             "open wire", "burst", "flooding", "hanging wire", "exposed", "serious"],
    "Medium": ["damaged", "poor", "irregular", "not working", "malfunctioning",
               "blocked", "clogged", "overflowing", "dirty"],
}

def classify_priority(text: str) -> str:
    """
    Classifies complaint priority based on keywords and severity indicators.
    Returns: Critical, High, Medium, or Low
    """
    text_lower = text.lower()
    
    # Check for critical keywords
    for keyword in PRIORITY_KEYWORDS["Critical"]:
        if keyword in text_lower:
            return "Critical"
    
    # Check for high priority keywords
    for keyword in PRIORITY_KEYWORDS["High"]:
        if keyword in text_lower:
            return "High"
    
    # Check for medium priority keywords
    for keyword in PRIORITY_KEYWORDS["Medium"]:
        if keyword in text_lower:
            return "Medium"
    
    # Default to Low
    return "Low"

def categorize_department(text: str) -> dict:
    """
    Categorizes complaint into India Government Department.
    Returns department info with name, full name, and assigned officer.
    """
    text_lower = text.lower()
    max_score = 0
    detected_dept = None
    
    for dept_name, dept_info in INDIA_GOVT_DEPARTMENTS.items():
        score = sum(1 for keyword in dept_info["keywords"] if keyword in text_lower)
        if score > max_score:
            max_score = score
            detected_dept = {
                "category": dept_name,
                "full_name": dept_info["full_name"],
                "officer": dept_info["officer"],
                "confidence": min(0.95, 0.5 + (score * 0.15))  # Confidence based on keyword matches
            }
    
    # Default to General if no match
    if not detected_dept:
        detected_dept = {
            "category": "General",
            "full_name": "General Grievance Cell",
            "officer": "Municipal Officer",
            "confidence": 0.3
        }
    
    return detected_dept

def analyze_complaint(text: str):
    """
    Comprehensive complaint analysis with priority, category, sentiment, and department.
    """
    blob = TextBlob(text)
    
    # 1. Department & Category Detection
    dept_info = categorize_department(text)
    
    # 2. Priority Classification
    priority = classify_priority(text)
    
    # 3. Sentiment Analysis (-1.0 to 1.0)
    sentiment = blob.sentiment.polarity
    
    # 4. Legacy urgency (for backward compatibility)
    urgency_map = {
        "Critical": "Critical",
        "High": "High",
        "Medium": "Medium",
        "Low": "Low"
    }
    urgency = urgency_map[priority]
    
    return {
        "category": dept_info["category"],
        "department_full_name": dept_info["full_name"],
        "assigned_officer_type": dept_info["officer"],
        "priority": priority,
        "urgency": urgency,  # Legacy field
        "sentiment_score": sentiment,
        "confidence": dept_info["confidence"]
    }


def generate_complaint_summary(complaint) -> str:
    """
    Generates a high-quality summary for officers.
    Strategy: 
    1. Try Rule-Based Semantic Compression (Fast, Safe)
    2. Validate Quality (Check for repetition, length)
    3. Fallback to LLM (Gemini) if rules fail to abstract
    """
    text = f"{complaint.title}. {complaint.description}".lower()
    
    # --- 1. Rule-Based Semantic Inference ---
    insights = []
    
    # Risk Detection
    if any(w in text for w in ["accident", "injury", "death", "casualty", "hurt"]):
        insights.append("poses a public safety risk")
    elif any(w in text for w in ["wire", "shock", "current", "spark"]):
        insights.append("presents an electrocution hazard")
        
    # Location Severity
    if any(w in text for w in ["highway", "nh16", "nh-16", "national highway", "main road", "traffic"]):
        insights.append("on a high-traffic route")
    
    # Priority Emphasis
    if complaint.priority == "Critical":
        insights.append("requires immediate attention")
    elif complaint.priority == "High":
        insights.append("needs prompt maintenance")
        
    # --- 2. Construct Candidate Summary ---
    candidate_summary = ""
    if insights:
        base = f"A reported issue at {complaint.location or 'the location'}"
        detail = ", ".join(insights)
        candidate_summary = f"{base} {detail}."
    
    # --- 3. Quality Check ---
    # Fail if:
    # - No insights generated (empty)
    # - Candidate is just title restatement (text overlap high?)
    # - Candidate contains original title verbatim? (User's rule)
    
    should_force_llm = False
    
    if not candidate_summary:
        should_force_llm = True
    elif complaint.title.lower() in candidate_summary.lower():
        should_force_llm = True
        
    # --- 4. Final Decision ---
    if not should_force_llm:
        return candidate_summary
        
    # --- 5. Forced LLM Fallback ---
    return force_llm_summary(complaint)

def force_llm_summary(complaint) -> str:
    """
    Calls Gemini API to generate an abstractive summary.
    Falls back to robust extraction if API fails.
    """
    try:
        import google.generativeai as genai
        from .config import settings
        
        if not settings.GEMINI_API_KEY:
            raise ValueError("No API Key")
            
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-pro')
        
        prompt = f"""
        You are assisting a government officer.
        Summarise the complaint into 1–2 short sentences.
        
        Rules:
        - Do NOT repeat the complaint title verbatim
        - Do NOT repeat department name
        - Focus on risk, urgency, and impact
        - Use neutral, official language
        - No emojis, no markdown
        
        Complaint Title: {complaint.title}
        Complaint Description: {complaint.description}
        Location: {complaint.location}
        Priority: {complaint.priority}
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Safety cleanup
        if text.startswith("Summary:"):
            text = text[8:].strip()
            
        return text
        
    except Exception as e:
        print(f"LLM Summary Failed: {e}")
        # Final Fail-Safe: Advanced Extraction
        # Extract Noun Phrases + Action verbs logic not implemented fully, 
        # but we use a safe truncation fallback.
        desc = complaint.description.replace("\n", " ").strip()
        return f"Issue at {complaint.location}: {desc[:100]}... (Manual review recommended)"

def generate_analysis_response(text: str):
    """
    Generates the full AI Analysis Payload for the frontend.
    Includes Reasoning, ERT, and Confidence.
    """
    analysis = analyze_complaint(text)
    
    # 1. Generate Reasoning (Heuristic)
    reasoning = []
    text_lower = text.lower()
    
    # Keyword matches
    keywords_found = []
    if analysis["category"] != "General":
        dept_info = INDIA_GOVT_DEPARTMENTS.get(analysis["category"], {})
        for kw in dept_info.get("keywords", []):
            if kw in text_lower:
                keywords_found.append(kw)
                if len(keywords_found) >= 3: break
    
    if keywords_found:
        reasoning.append(f"Detected keywords: {', '.join(keywords_found)}")
    
    # Priority Reasoning
    if analysis["priority"] == "Critical":
        reasoning.append("Classified as Critical due to urgent safety vocabulary")
    elif analysis["priority"] == "High":
        reasoning.append("Classified as High priority due to severity indicators")
        
    # Sentiment Reasoning
    if analysis["sentiment_score"] < -0.3:
        reasoning.append("Negative sentiment indicates user frustration/urgency")
        
    # Default Reasoning
    if not reasoning:
        reasoning.append("Based on standard keyword matching algorithms")
        
    # 2. Estimate Resolution Time (ERT)
    ert_map = {
        "Critical": "24 hours",
        "High": "2-3 days",
        "Medium": "3-5 days",
        "Low": "5-7 days"
    }
    ert = ert_map.get(analysis["priority"], "3-5 days")
    
    # 3. Construct Final Response
    return {
        "category": analysis["category"],
        "department": analysis["department_full_name"],
        "priority": analysis["priority"],
        "ert": ert,
        "confidence": int(analysis["confidence"] * 100),
        "reasoning": reasoning
    }
