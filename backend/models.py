from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text, Float, UniqueConstraint, Index
from sqlalchemy.orm import relationship as sql_relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True) # Optional for Google Auth users
    photo_url = Column(String, nullable=True) 
    is_active = Column(Boolean, default=True)
    role = Column(String, default="USER") # USER or ADMIN
    
    complaints = sql_relationship("Complaint", back_populates="owner")
    trusted_contacts = sql_relationship("TrustedContact", back_populates="user")

class TrustedContact(Base):
    __tablename__ = "trusted_contacts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    relationship = Column(String) # Parent, Sibling, Friend, etc.
    phone = Column(String, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = sql_relationship("User", back_populates="trusted_contacts")

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    refresh_token = Column(String, index=True)
    device_info = Column(String) # User Agent
    ip_address = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class RevokedToken(Base):
    __tablename__ = "revoked_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, index=True)
    revoked_at = Column(DateTime, default=datetime.utcnow)

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, nullable=True) # User ID of admin
    action = Column(String)
    target_resource = Column(String, nullable=True) # Resource identifier like "officer:GOV-100"
    target_id = Column(Integer, nullable=True) # ID of object affected
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    complaints = sql_relationship("Complaint", back_populates="department")
    officers = sql_relationship("Officer", back_populates="department")

class Officer(Base):
    """
    Government Officer Model - India Govt Compliance
    Represents JE, AE, EE, Inspector, etc. assigned to specific wards/zones
    """
    __tablename__ = "officers"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)  # PWD-JE-1042
    name = Column(String, index=True)
    designation = Column(String)  # JE, AE, EE, SE, Inspector, Supervisor
    department_id = Column(Integer, ForeignKey("departments.id"))
    
    # India Govt Hierarchy
    ward = Column(String, index=True)  # Ward 1, Ward 2, etc.
    zone = Column(String, nullable=True)  # Zone A, Zone B
    circle = Column(String, nullable=True)  # Circle 1, Circle 2
    
    status = Column(String, default="Active")  # Active, On Leave, Suspended
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    department = sql_relationship("Department", back_populates="officers")
    assigned_complaints = sql_relationship("Complaint", back_populates="assigned_officer")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True) 
    sentiment_score = Column(Float) 
    urgency_level = Column(String) 
    location = Column(String)
    status = Column(String, default="NEW") # NEW, IN_PROGRESS, RESOLVED, Work Completed, Closed by Citizen, etc.
    priority = Column(String, default="Medium") # Low, Medium, High, Critical
    
    # Women Safety Specific Fields
    is_women_safety = Column(Boolean, default=False, index=True)
    emergency_metadata = Column(Text, nullable=True) # JSON String: {lat, long, device_info}
    is_panic_button = Column(Boolean, default=False)

    # AI Trust Intelligence
    ai_trust_score = Column(Float, default=1.0) # 0.0 - 1.0 (Low to High Trust)
    ai_trust_flags = Column(Text, nullable=True) # JSON: ["Duplicate", "Velocity", "Spam"]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Archive & Resolution fields (India Govt Compliance - No Delete)
    is_archived = Column(Boolean, default=False)
    closed_by_role = Column(String, nullable=True)  # "CITIZEN", "OFFICER", "ADMIN", "SYSTEM"
    closed_by_user_id = Column(Integer, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    closed_reason = Column(String, nullable=True)  # "Resolved", "Withdrawn", "No Response"
    
    # Officer Assignment (India Govt - ONE OFFICER ONLY)
    assigned_officer_id = Column(Integer, ForeignKey("officers.id"), nullable=True)
    assigned_at = Column(DateTime, nullable=True)
    assigned_by_admin_id = Column(Integer, nullable=True)  # Which admin assigned it
    
    # Reassignment Tracking
    previous_officer_id = Column(Integer, nullable=True)
    reassignment_reason = Column(Text, nullable=True)
    reassignment_count = Column(Integer, default=0)
    
    # SLA (Service Level Agreement) Tracking
    sla_hours = Column(Integer, nullable=True)  # Based on priority: Critical=24, High=48, Medium=120, Low=168
    sla_deadline = Column(DateTime, nullable=True)  # assigned_at + sla_hours
    sla_breached = Column(Boolean, default=False)  # Auto-flagged when past deadline
    
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = sql_relationship("User", back_populates="complaints")
    
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    department = sql_relationship("Department", back_populates="complaints")
    
    assigned_officer = sql_relationship("Officer", back_populates="assigned_complaints")

    ai_analysis = sql_relationship("AIAnalysis", back_populates="complaint", uselist=False)
    officer_ai_summary = sql_relationship("ComplaintAISummary", back_populates="complaint", uselist=False)
    history = sql_relationship("ComplaintHistory", back_populates="complaint")

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    action = Column(String)
    performed_by = Column(String) # "ADMIN" or "SYSTEM" or User Email
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    complaint = sql_relationship("Complaint", back_populates="history")

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    original_text = Column(Text)
    detected_category = Column(String)
    confidence_score = Column(Float)
    sentiment_label = Column(String) 
    
    complaint = sql_relationship("Complaint", back_populates="ai_analysis")

class ComplaintAISummary(Base):
    """
    Stores AI-generated summaries for officers.
    Memoized using hash of description to save compute.
    """
    __tablename__ = "complaint_ai_summary"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True)
    summary_text = Column(Text)
    description_hash = Column(String, index=True) # SHA256 of title + description
    generated_at = Column(DateTime, default=datetime.utcnow)
    
    complaint = sql_relationship("Complaint", back_populates="officer_ai_summary")


class CitizenFeedback(Base):
    """
    Stores citizen feedback when marking complaint as resolved.
    India Govt Compliance: Preserves citizen satisfaction data for audit/RTI.
    """
    __tablename__ = "citizen_feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True)
    rating = Column(Integer)  # 1-5 stars
    comment = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    
    
    complaint = sql_relationship("Complaint", backref="feedback")

class GrievanceTimeline(Base):
    """
    Timeline tracking for grievance lifecycle.
    Append-only log for status tracking.
    """
    __tablename__ = "grievance_timeline"
    
    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    status = Column(String) # SUBMITTED, ASSIGNED, VISITED, IN_PROGRESS, RESOLVED, VERIFIED
    timestamp = Column(DateTime, default=datetime.utcnow)
    updated_by = Column(String) # ADMIN, OFFICER, SYSTEM, CITIZEN
    remarks = Column(Text, nullable=True)
    is_public_visible = Column(Boolean, default=True)
    
    # Performance Indices (User Requirement)
    __table_args__ = (
        # Fast lookups by complaint
        # Index on (complaint_id, status) ensures uniqueness per status (Idempotency)
        UniqueConstraint('complaint_id', 'status', name='uix_complaint_status_timeline'),
        Index('idx_timeline_complaint_id', 'complaint_id'),
    )
    
    complaint = sql_relationship("Complaint", back_populates="timeline")

# Add relationship to Complaint model
Complaint.timeline = sql_relationship("GrievanceTimeline", back_populates="complaint", order_by="GrievanceTimeline.timestamp")
