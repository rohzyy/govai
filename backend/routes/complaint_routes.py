from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from .. import models, schemas, database, ai_utils, ai_trust
from ..utils import jwt_utils
from ..utils.assignment_logic import resolve_department, assign_to_best_officer

# ... (rest of imports)


# Create Router
router = APIRouter(
    prefix="/api/complaints",
    tags=["Complaints"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ComplaintResponse)
def create_complaint(
    complaint: schemas.ComplaintCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    try:
        # AI-powered analysis of complaint text
        combined_text = f"{complaint.title} {complaint.description}"
        analysis = ai_utils.analyze_complaint(combined_text)
        
        # AI Trust Intelligence Pattern Detection
        trust_score = 1.0
        trust_flags = None
        try:
            trust_score, trust_flags = ai_trust.detect_trust_anomalies(
                db, complaint.title, complaint.description, current_user.id
            )
            if trust_flags:
                print(f"[AI Trust] Flags Detected: {trust_flags} (Score: {trust_score})")
        except Exception as e:
            print(f"[WARN] Trust Analysis Failed: {e}")
            # Fail-safe: Proceed with perfect trust
        
        # Use manual priority if provided, otherwise use AI classification
        final_priority = complaint.priority if complaint.priority else analysis["priority"]
        
        # Auto-assign department based on category
        department = resolve_department(db, analysis.get("department_full_name"), combined_text)
        
        # Create complaint with AI-classified fields
        new_complaint = models.Complaint(
            title=complaint.title,
            description=complaint.description,
            location=complaint.location,
            category=analysis["category"],
            sentiment_score=analysis["sentiment_score"],
            urgency_level=analysis["urgency"],
            priority=final_priority,  # AI-classified or manual
            user_id=current_user.id,
            status="NEW",
            department_id=department.id if department else None,
            ai_trust_score=trust_score,
            ai_trust_flags=trust_flags
        )
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        
        # Timeline: Complaint Submitted
        timeline_entry = models.GrievanceTimeline(
            complaint_id=new_complaint.id,
            status="SUBMITTED",
            updated_by="CITIZEN",
            remarks="Grievance filed successfully"
        )
        db.add(timeline_entry)
        db.commit()
        
        print(f"[OK] Complaint created with AI classification:")
        print(f"   Priority: {final_priority}")
        print(f"   Category: {analysis['category']}")
        print(f"   Department: {analysis.get('department_full_name', 'N/A')}")
        print(f"   Confidence: {analysis['confidence']:.2f}")

        # --- Automatic Officer Assignment ---
        try:
            if department:
                assign_to_best_officer(db, new_complaint.id, department.id)
        except Exception as e:
            # Silently fail, log error, do not affect response
            print(f"[WARN] Auto-assignment failed: {e}")
            pass
        # ------------------------------------
        
        return new_complaint
    except Exception as e:
        db.rollback()
        print(f"ERROR CREATING COMPLAINT: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create complaint: {str(e)}")

@router.get("/active", response_model=List[schemas.ComplaintResponse])
def get_active_complaints(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """Get only active (non-archived) complaints for current user"""
    print(f"🔍 DEBUG: Fetching active complaints for User ID: {current_user.id} ({current_user.email})")
    
    complaints = db.query(models.Complaint).filter(
        models.Complaint.user_id == current_user.id,
        models.Complaint.is_archived == False
    ).offset(skip).limit(limit).all()
    
    print(f"✅ DEBUG: Found {len(complaints)} active complaints for User {current_user.id}")
    return complaints

@router.get("/archived", response_model=List[schemas.ComplaintResponse])
def get_archived_complaints(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """Get only archived complaints for current user"""
    return db.query(models.Complaint).filter(
        models.Complaint.user_id == current_user.id,
        models.Complaint.is_archived == True
    ).offset(skip).limit(limit).all()

@router.get("/", response_model=List[schemas.ComplaintResponse])
def read_complaints(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """Get ALL complaints (active + archived) - deprecated, use /active or /archived"""
    return db.query(models.Complaint).filter(models.Complaint.user_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/{complaint_id}", response_model=schemas.ComplaintResponse)
def read_complaint(
    complaint_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if complaint.user_id != current_user.id and current_user.role != "ADMIN":
         raise HTTPException(status_code=403, detail="Not authorized")
    return complaint

@router.get("/{complaint_id}/status")
def get_complaint_status(
    complaint_id: int,
    db: Session = Depends(database.get_db)
):
    """
    Public Endpoint: Track complaint status by ID.
    No Auth required. Returns limited info.
    """
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    return {
        "id": complaint.id,
        "status": complaint.status,
        "title": complaint.title, # Optional: verify context
        "updated_at": complaint.updated_at
    }



@router.post("/{complaint_id}/resolve")
def resolve_complaint(
    complaint_id: int,
    request: schemas.ResolveComplaintRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """
    Citizen marks complaint as resolved (Archive, not delete).
    India Govt Compliance: Preserves complaint for audit/RTI.
    """
    # 1. Validate complaint ownership
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id,
        models.Complaint.user_id == current_user.id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found or not authorized")
    
    # 2. Check if already archived
    if complaint.is_archived:
        raise HTTPException(status_code=400, detail="Complaint already archived")
    
    # 3. Check if resolution is allowed (Work Completed status recommended)
    # For now, allow resolution from any status except already closed
    
    # 4. Archive complaint (soft delete)
    complaint.is_archived = True
    complaint.status = "Closed by Citizen"
    complaint.closed_by_role = "CITIZEN"
    complaint.closed_by_user_id = current_user.id
    complaint.closed_at = datetime.utcnow()
    complaint.closed_reason = "Resolved"
    
    # 5. Store feedback if provided
    if request.feedback:
        # Check if feedback already exists
        existing_feedback = db.query(models.CitizenFeedback).filter(
            models.CitizenFeedback.complaint_id == complaint_id
        ).first()
        
        if not existing_feedback:
            citizen_feedback = models.CitizenFeedback(
                complaint_id=complaint_id,
                rating=request.feedback.rating,
                comment=request.feedback.comment
            )
            db.add(citizen_feedback)
    
    # 6. Create audit log
    feedback_text = f" (Rating: {request.feedback.rating}/5)" if request.feedback else ""
    audit_log = models.ComplaintHistory(
        complaint_id=complaint_id,
        action=f"Complaint marked as resolved by citizen{feedback_text}",
        performed_by=current_user.email
    )
    db.add(audit_log)

    # Timeline: Verified by Citizen
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint_id,
        status="VERIFIED",
        updated_by="CITIZEN",
        remarks="Resolution confirmed by citizen"
    )
    db.add(timeline_entry)
    
    db.commit()
    
    print(f"📁 Complaint #{complaint_id} archived by citizen {current_user.email}")
    
    return {"message": "Complaint resolved and archived successfully"}

@router.post("/{complaint_id}/withdraw")
def withdraw_complaint(
    complaint_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(jwt_utils.get_current_active_user)
):
    """
    Citizen withdraws complaint (Archive, not delete).
    """
    # 1. Validate complaint ownership
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id,
        models.Complaint.user_id == current_user.id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found or not authorized")
    
    # 2. Check if already archived
    if complaint.is_archived:
        raise HTTPException(status_code=400, detail="Complaint already archived")
    
    # 3. Archive complaint
    complaint.is_archived = True
    complaint.status = "Withdrawn by Citizen"
    complaint.closed_by_role = "CITIZEN"
    complaint.closed_by_user_id = current_user.id
    complaint.closed_at = datetime.utcnow()
    complaint.closed_reason = "Withdrawn"
    
    # 4. Create audit log
    audit_log = models.ComplaintHistory(
        complaint_id=complaint_id,
        action="Complaint withdrawn by citizen",
        performed_by=current_user.email
    )
    db.add(audit_log)
    
    db.commit()
    
    print(f"🗑️ Complaint #{complaint_id} withdrawn by citizen {current_user.email}")
    
    return {"message": "Complaint withdrawn successfully"}
