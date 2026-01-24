from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models
import logging

# Configure logger
logger = logging.getLogger(__name__)

# Copied from backend/routes/complaint_routes.py to avoid circular imports or refactoring issues
# Ideally this would be in a shared config, but constraints prevent refactoring.
DEPARTMENT_MAP = {
    "water": "Water Supply Department",
    "leak": "Water Supply Department",
    "pipe": "Water Supply Department",
    "road": "Roads & Infrastructure",
    "pothole": "Roads & Infrastructure",
    "traffic": "Roads & Infrastructure",
    "electric": "Electricity Department",
    "light": "Street Lighting",
    "dark": "Street Lighting",
    "garbage": "Sanitation Department",
    "trash": "Sanitation Department",
    "waste": "Sanitation Department",
    "clean": "Sanitation Department",
    "crime": "Public Safety",
    "theft": "Public Safety",
    "unsafe": "Public Safety"
}

ACTIVE_STATUSES = ["NEW", "ASSIGNED", "IN_PROGRESS"]

def resolve_department(db: Session, ai_department_name: str, complaint_text: str) -> models.Department:
    """
    Resolves the correct department for a complaint.
    Logic:
    1. Check if AI-suggested department exists in DB.
    2. Fallback to keyword matching using DEPARTMENT_MAP.
    3. Fallback to "General Grievance Cell".
    """
    department = None
    
    # 1. Try AI Department Name
    if ai_department_name:
        department = db.query(models.Department).filter(
            func.lower(models.Department.name) == ai_department_name.lower()
        ).first()
        
    if department:
        return department

    # 2. Fallback to Keyword Matching
    text_lower = complaint_text.lower()
    dept_name = None
    
    for keyword, name in DEPARTMENT_MAP.items():
        if keyword in text_lower:
            dept_name = name
            break
            
    if dept_name:
        department = db.query(models.Department).filter(models.Department.name == dept_name).first()
        if department:
            return department

    # 3. Fallback to General Grievance Cell
    department = db.query(models.Department).filter(models.Department.name == "General Grievance Cell").first()
    
    # If General Grievance Cell doesn't exist, we might need to create it or handle it.
    # The existing code in complaint_routes.py creates it if missing.
    # To be safe and idempotent, we return whatever we found or None if truly nothing exists (unlikely if DB seeded).
    
    return department

def assign_to_best_officer(db: Session, complaint_id: int, department_id: int):
    """
    Auto-assigns a complaint to the officer with the lowest load in the department.
    """
    logger.info(f"Attempting auto-assignment for Complaint #{complaint_id} in Department #{department_id}")
    
    try:
        # Start Transaction
        
        # 1. Idempotency Guard
        complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
        if not complaint:
            logger.warning(f"Complaint #{complaint_id} not found.")
            return

        if complaint.assigned_officer_id:
            logger.info(f"Complaint #{complaint_id} already assigned to Officer #{complaint.assigned_officer_id}. Skipping.")
            return

        # 2. Find Candidate Officers in Department
        # Must be Active
        officers = db.query(models.Officer).filter(
            models.Officer.department_id == department_id,
            models.Officer.status == "Active" 
        ).all()
        
        if not officers:
            logger.info(f"No active officers found for Department #{department_id}. Assignment skipped.")
            return
            
        logger.info(f"Found {len(officers)} active officers.")

        # 3. Calculate Load
        best_officer = None
        min_load = float('inf')
        
        for officer in officers:
            load = db.query(models.Complaint).filter(
                models.Complaint.assigned_officer_id == officer.id,
                models.Complaint.status.in_(ACTIVE_STATUSES)
            ).count()
            # logger.debug(f"Officer {officer.id} ...") # Optional debug
            
            if load < min_load:
                min_load = load
                best_officer = officer
        
        if not best_officer:
             logger.warning(f"Could not determine best officer for Department #{department_id}.")
             return

        # 4. Assign
        complaint.assigned_officer_id = best_officer.id
        complaint.status = "ASSIGNED"
        complaint.assigned_by_admin_id = None # System assignment
        
        # 5. Timeline Entry
        timeline_entry = models.GrievanceTimeline(
            complaint_id=complaint.id,
            status="ASSIGNED",
            updated_by="SYSTEM",
            remarks="Automatically assigned to department officer"
        )
        db.add(timeline_entry)
        
        # 6. Commit
        db.commit()
        db.refresh(complaint)
        
        logger.info(f"Successfully auto-assigned Complaint #{complaint_id} to Officer #{best_officer.id} (Load: {min_load})")

    except Exception as e:
        db.rollback()
        logger.error(f"DB Error during auto-assignment: {str(e)}")

