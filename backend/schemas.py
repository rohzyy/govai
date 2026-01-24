from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    photo_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Trusted Contact Schemas
class TrustedContactBase(BaseModel):
    name: str
    relationship: str
    phone: str

class TrustedContactCreate(TrustedContactBase):
    pass

class TrustedContactResponse(TrustedContactBase):
    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Complaint Schemas
class ComplaintBase(BaseModel):
    title: str
    description: str
    location: str

class ComplaintCreate(ComplaintBase):
    priority: Optional[str] = None  # Optional: Allow manual priority override

class DepartmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class ComplaintHistoryResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    timestamp: datetime
    class Config:
        from_attributes = True

class ComplaintResponse(ComplaintBase):
    id: int
    status: str
    category: Optional[str] = None
    is_women_safety: bool = False
    is_panic_button: bool = False
    urgency_level: Optional[str] = None
    priority: Optional[str] = None
    created_at: datetime
    department_id: Optional[int] = None
    department: Optional[DepartmentResponse] = None
    history: List[ComplaintHistoryResponse] = []

    class Config:
        from_attributes = True

# Citizen Feedback Schemas
class FeedbackCreate(BaseModel):
    rating: int  # 1-5 stars
    comment: Optional[str] = None
    
    class Config:
        # Pydantic v2 validation
        json_schema_extra = {
            "example": {
                "rating": 5,
                "comment": "Issue was resolved quickly and efficiently"
            }
        }

class FeedbackResponse(BaseModel):
    id: int
    complaint_id: int
    rating: int
    comment: Optional[str] = None
    submitted_at: datetime
    
    class Config:
        from_attributes = True

class ResolveComplaintRequest(BaseModel):
    feedback: Optional[FeedbackCreate] = None

# Officer Schemas (India Government)
class OfficerBase(BaseModel):
    employee_id: str
    name: str
    designation: str  # JE, AE, EE, Inspector
    ward: str
    zone: Optional[str] = None
    circle: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class OfficerCreate(OfficerBase):
    department_id: int
    status: str = "Active"

class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    ward: Optional[str] = None
    zone: Optional[str] = None
    status: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class OfficerResponse(OfficerBase):
    id: int
    department_id: Optional[int] = None
    status: str
    # Soften constraints for existing bad data
    designation: Optional[str] = None
    ward: Optional[str] = None
    created_at: Optional[datetime] = None
    department: Optional[DepartmentResponse] = None
    
    class Config:
        from_attributes = True

# Assignment Schemas
class AssignComplaintRequest(BaseModel):
    officer_id: int
    priority: Optional[str] = None  # Override AI priority if needed

class ReassignComplaintRequest(BaseModel):
    new_officer_id: int
    reason: str  # Mandatory for India Govt compliance

# Analytics Schemas
class OfficerPerformance(BaseModel):
    officer_id: int
    officer_name: str
    designation: str
    assigned_count: int
    resolved_count: int
    avg_resolution_hours: float
    sla_breach_count: int

# Timeline Schemas
class TimelineEventRequest(BaseModel):
    event: str # VISITED, IN_PROGRESS, RESOLVED
    remarks: Optional[str] = None
