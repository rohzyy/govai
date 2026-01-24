from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .models import Complaint
import json

def detect_trust_anomalies(db: Session, title: str, description: str, user_id: int):
    """
    Analyzes complaint for patterns indicating spam, duplication, or unusual velocity.
    Returns (trust_score: float, flags: list[str])
    """
    flags = []
    trust_score = 1.0 # Start perfect
    
    # 1. Velocity Check (Rapid submission)
    five_mins_ago = datetime.utcnow() - timedelta(minutes=5)
    recent_count = db.query(Complaint).filter(
        Complaint.owner_id == user_id, 
        Complaint.created_at >= five_mins_ago
    ).count()
    
    if recent_count >= 2:
        flags.append("High Velocity (Multiple submissions < 5m)")
        trust_score -= 0.15 * recent_count
        
    # 2. Duplicate Content Check (Simple exact match for now)
    # In production, use Vector DB or Fuzzy Match
    duplicate = db.query(Complaint).filter(
        Complaint.description == description,
        Complaint.owner_id == user_id
    ).first()
    
    if duplicate:
        flags.append("Duplicate Content (Identical description exists)")
        trust_score -= 0.4
        
    # 3. Spam / Low Quality Check
    if len(description) < 15:
        flags.append("Low Info (Description too short)")
        trust_score -= 0.1
    elif len(set(description)) < 5: # "asdfasdf" check
        flags.append("Possible Spam (Repetitive characters)")
        trust_score -= 0.5
        
    # Cap score
    trust_score = max(0.0, min(1.0, trust_score))
    
    return trust_score, json.dumps(flags) if flags else None
