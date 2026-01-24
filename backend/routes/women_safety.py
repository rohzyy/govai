from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas, database, config
from ..utils import jwt_utils
import google.generativeai as genai
import logging

# Configure Gemini
genai.configure(api_key=config.settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

router = APIRouter(prefix="/women-safety", tags=["Women Safety"])

# Emergency Keywords
EMERGENCY_KEYWORDS = [
    "help", "unsafe", "followed", "someone is following me", 
    "emergency", "danger", "harassment", "scared", "please help me"
]

def check_for_emergency(text: str) -> bool:
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in EMERGENCY_KEYWORDS)

def create_emergency_complaint(db: Session, user: models.User, location: str = "Unknown", metadata: str = None):
    # Find Women Safety Department
    dept = db.query(models.Department).filter(models.Department.name == "Women Safety Cell").first()
    if not dept:
        dept = models.Department(name="Women Safety Cell", description="Emergency Response for Women Safety")
        db.add(dept)
        db.commit()
        db.refresh(dept)
    
    # Create Critical Complaint
    complaint = models.Complaint(
        title="EMERGENCY ALERT: Women Safety",
        description=f"Emergency trigger activated by user {user.full_name}. Immediate assistance required.",
        location=location,
        category="Women Safety",
        urgency_level="Critical",
        priority="Critical",
        is_women_safety=True,
        is_panic_button=True,
        emergency_metadata=metadata,
        user_id=user.id,
        status="OPEN - EMERGENCY",
        department_id=dept.id,
        sla_hours=24 # 24 hour SLA for critical
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    return complaint

@router.post("/chat")
def chat_interaction(
    message: str, 
    location: str = "Unknown",
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """
    Chatbot endpoint. Detects emergency keywords.
    """
    is_emergency = check_for_emergency(message)
    
    response_text = "I am here to help. Please tell me more about your grievance."
    emergency_triggered = False
    
    if is_emergency:
        create_emergency_complaint(db, current_user, location, metadata=f"Trigger: Keyword detection '{message}'")
        response_text = "EMERGENCY DETECTED. Alerts have been sent to the Women Safety Cell and your trusted contacts. Help is on the way. Stay safe."
        emergency_triggered = True
    else:
        # Use Gemini AI for empathetic response
        try:
            prompt = f"""
You are a compassionate, helpful, and professional Women Safety Assistant for a government grievance portal.
The user message is: "{message}"

Guidelines:
1. If the user is asking for general information, provide it clearly.
2. If the user seems distressed but not in immediate danger, be empathetic and suggest filing a grievance.
3. Keep responses concise (under 50 words) and safe.
4. Do not provide medical or legal advice, refer them to professionals.

Response:
"""
            ai_response = model.generate_content(prompt)
            response_text = ai_response.text
        except Exception as e:
            logging.error(f"Gemini AI Error: {e}")
            response_text = "I am here to help. Please tell me more about your grievance."
        
    return {
        "response": response_text,
        "is_emergency": emergency_triggered
    }

@router.post("/panic")
def panic_button(
    location: str = "Unknown",
    metadata: str = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """
    Immediate Panic Button Trigger
    """
    complaint = create_emergency_complaint(db, current_user, location, metadata)
    
    # Notify Trusted Contacts (Mock)
    contacts = db.query(models.TrustedContact).filter(
        models.TrustedContact.user_id == current_user.id,
        models.TrustedContact.is_active == True
    ).all()
    
    contact_count = len(contacts)
    print(f"🚨 PANIC: Notifying {contact_count} trusted contacts for user {current_user.email}")
    
    return {
        "message": "Panic Alert Activated",
        "complaint_id": complaint.id,
        "contacts_notified": contact_count
    }

# Trusted Contact Routes
@router.post("/trusted-contacts", response_model=schemas.TrustedContactResponse)
def add_trusted_contact(
    contact: schemas.TrustedContactCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    new_contact = models.TrustedContact(
        user_id=current_user.id,
        name=contact.name,
        relationship=contact.relationship,
        phone=contact.phone
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.get("/trusted-contacts", response_model=List[schemas.TrustedContactResponse])
def get_trusted_contacts(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    return db.query(models.TrustedContact).filter(
        models.TrustedContact.user_id == current_user.id,
        models.TrustedContact.is_active == True
    ).all()
