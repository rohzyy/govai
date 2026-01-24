from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, timedelta
from .. import models, database, schemas
from ..utils import jwt_utils

router = APIRouter(prefix="/admin", tags=["Admin"])

# Dependency to check Admin Role
# Dependency to check Admin Role
def get_current_admin(request: Request, db: Session = Depends(database.get_db)):
    print(f"🔍 [get_current_admin] Checking auth...")
    
    token_from_cookie = request.cookies.get("access_token")
    token_from_header = None
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token_from_header = auth_header.split(" ")[1]

    # Helper to validate a specific token
    def validate_and_get_user(token_str):
        try:
            payload = jwt_utils.decode_token(token_str)
            if payload.get("role") != "ADMIN":
                print(f"❌ [get_current_admin] Token valid but Role is {payload.get('role')} (Required: ADMIN)")
                return "FORBIDDEN" 
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            u = db.query(models.User).filter(models.User.id == int(user_id)).first()
            return u
        except Exception as e:
            print(f"⚠️ Token validation failed: {e}")
            return None

    user = None

    # 1. Try Header FIRST
    if token_from_header:
        print(f"Testing Header Token...")
        result = validate_and_get_user(token_from_header)
        if result and result != "FORBIDDEN":
            print(f"✅ Authenticated via Header")
            return result
        else:
            print(f"⚠️ Header Token failed/forbidden. Falling back to Cookie...")

    # 2. Try Cookie SECOND (Fallback)
    if token_from_cookie:
        print(f"Testing Cookie Token...")
        result = validate_and_get_user(token_from_cookie)
        if result and result != "FORBIDDEN":
            print(f"✅ Authenticated via Cookie")
            return result
        else:
             print(f"⚠️ Cookie Token failed/forbidden.")

    # 3. If neither worked -> Reject
    raise HTTPException(status_code=403, detail="Admin access required")


# SLA Hours Mapping (India Govt Standard)
SLA_HOURS = {
    "Critical": 24,
    "High": 48,
    "Medium": 120,  # 5 days
    "Low": 168  # 7 days
}

# ============ OFFICER MANAGEMENT ============

@router.post("/officers", response_model=schemas.OfficerResponse)
def create_officer(
    officer: schemas.OfficerCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Create new government officer (JE, AE, EE, Inspector)
    Admin only - India Govt Compliance
    """
    # Check if employee_id already exists
    existing = db.query(models.Officer).filter(
        models.Officer.employee_id == officer.employee_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    
    # Create officer
    new_officer = models.Officer(
        employee_id=officer.employee_id,
        name=officer.name,
        designation=officer.designation,
        department_id=officer.department_id,
        ward=officer.ward,
        zone=officer.zone,
        circle=officer.circle,
        status=officer.status,
        email=officer.email,
        phone=officer.phone
    )
    
    db.add(new_officer)
    
    # Create audit log
    audit_log = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Created officer {officer.employee_id} - {officer.name}",
        target_resource=f"officer:{officer.employee_id}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_officer)
    
    print(f"✅ Admin {current_admin.email} created officer: {officer.employee_id}")
    
    return new_officer

@router.get("/officers", response_model=List[schemas.OfficerResponse])
def list_officers(
    department_id: int = None,
    ward: str = None,
    status: str = None,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    List all officers with optional filters
    """
    try:
        query = db.query(models.Officer)
        
        if department_id:
            query = query.filter(models.Officer.department_id == department_id)
        if ward:
            query = query.filter(models.Officer.ward == ward)
        if status:
            query = query.filter(models.Officer.status == status)
        
        officers = query.all()
        # Force Validation Debugging
        for off in officers:
            try:
                # Use schema to validate
                schemas.OfficerResponse.model_validate(off) 
            except Exception as ve:
                print(f"❌ Pydantic Validation Error for Officer {off.id}: {ve}")
                # Don't raise, just log to see all errors. Function will still return and crash, but we get logs.
        
        return officers
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Error in list_officers: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error fetching officers")

@router.put("/officers/{officer_id}", response_model=schemas.OfficerResponse)
def update_officer(
    officer_id: int,
    officer_update: schemas.OfficerUpdate,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Update officer details (name, designation, ward, status)
    """
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    # Update fields
    if officer_update.name:
        officer.name = officer_update.name
    if officer_update.designation:
        officer.designation = officer_update.designation
    if officer_update.ward:
        officer.ward = officer_update.ward
    if officer_update.zone is not None:
        officer.zone = officer_update.zone
    if officer_update.status:
        officer.status = officer_update.status
    if officer_update.email is not None:
        officer.email = officer_update.email
    if officer_update.phone is not None:
        officer.phone = officer_update.phone
    
    # Audit log
    audit_log = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Updated officer {officer.employee_id}",
        target_resource=f"officer:{officer.id}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(officer)
    
    return officer

@router.get("/officers/{officer_id}/performance", response_model=schemas.OfficerPerformance)
def get_officer_performance(
    officer_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Get officer performance metrics
    """
    officer = db.query(models.Officer).filter(models.Officer.id == officer_id).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    # Count assigned complaints
    assigned_count = db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == officer_id
    ).count()
    
    # Count resolved
    resolved_count = db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == officer_id,
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Action Completed"])
    ).count()
    
    # SLA breaches
    sla_breach_count = db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == officer_id,
        models.Complaint.sla_breached == True
    ).count()
    
    # Average resolution time (simplified)
    # Average resolution time
    resolved_complaints = db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == officer_id,
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen"]),
        models.Complaint.closed_at != None
    ).all()

    total_hours = 0
    count_with_time = 0
    for c in resolved_complaints:
        if c.created_at and c.closed_at:
            diff = c.closed_at - c.created_at
            total_hours += diff.total_seconds() / 3600
            count_with_time += 1
    
    avg_hours = round(total_hours / count_with_time, 1) if count_with_time > 0 else 0
    
    return schemas.OfficerPerformance(
        officer_id=officer.id,
        officer_name=officer.name,
        designation=officer.designation,
        assigned_count=assigned_count,
        resolved_count=resolved_count,
        avg_resolution_hours=avg_hours,
        sla_breach_count=sla_breach_count
    )

@router.get("/analytics/officer-performance", response_model=List[schemas.OfficerPerformance])
def get_all_officer_performance(db: Session = Depends(database.get_db)):
    """
    Get performance list for ALL officers
    """
    officers = db.query(models.Officer).all()
    results = []
    
    for officer in officers:
        assigned_count = db.query(models.Complaint).filter(
            models.Complaint.assigned_officer_id == officer.id
        ).count()
        
        resolved_count = db.query(models.Complaint).filter(
            models.Complaint.assigned_officer_id == officer.id,
            models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Action Completed"])
        ).count()
        
        sla_breach_count = db.query(models.Complaint).filter(
            models.Complaint.assigned_officer_id == officer.id,
            models.Complaint.sla_breached == True
        ).count()
        
        # Calc Avg Time for this officer
        resolved_complaints = db.query(models.Complaint).filter(
            models.Complaint.assigned_officer_id == officer.id,
            models.Complaint.status.in_(["RESOLVED", "Closed by Citizen"]),
            models.Complaint.closed_at != None
        ).all()

        total_hours = 0
        count_with_time = 0
        for c in resolved_complaints:
            if c.created_at and c.closed_at:
                diff = c.closed_at - c.created_at
                total_hours += diff.total_seconds() / 3600
                count_with_time += 1
        
        avg_hours = round(total_hours / count_with_time, 1) if count_with_time > 0 else 0
        
        results.append(schemas.OfficerPerformance(
            officer_id=officer.id,
            officer_name=officer.name,
            designation=officer.designation,
            assigned_count=assigned_count,
            resolved_count=resolved_count,
            avg_resolution_hours=avg_hours,
            sla_breach_count=sla_breach_count
        ))
    
    return results
@router.get("/complaints", response_model=List[schemas.ComplaintResponse])
def list_complaints(
    skip: int = 0,
    limit: int = 100,
    filter: str = None,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    List ALL complaints for Admin Dashboard
    Supports filtering: unassigned, sla_breached
    """
    try:
        query = db.query(models.Complaint)
        
        if filter == "unassigned":
            query = query.filter(
                models.Complaint.assigned_officer_id == None,
                models.Complaint.is_archived == False
            )
        elif filter == "sla_breached":
            query = query.filter(models.Complaint.sla_breached == True)
        
        # Sort by Newest First
        query = query.order_by(models.Complaint.created_at.desc())
        
        return query.offset(skip).limit(limit).all()
    except Exception as e:
        import traceback
        print(f"❌ CRITICAL ERROR IN LIST_COMPLAINTS: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# ============ COMPLAINT ASSIGNMENT ============

@router.post("/complaints/{complaint_id}/assign")
def assign_complaint(
    complaint_id: int,
    assignment: schemas.AssignComplaintRequest,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Assign complaint to ONE specific officer
    India Govt Compliance - Strict single-officer assignment
    """
    # Get complaint
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check if already assigned
    if complaint.assigned_officer_id:
        raise HTTPException(
            status_code=400, 
            detail="Complaint already assigned. Use reassign endpoint instead."
        )
    
    # Get officer
    officer = db.query(models.Officer).filter(
        models.Officer.id == assignment.officer_id
    ).first()
    
    if not officer:
        raise HTTPException(status_code=404, detail="Officer not found")
    
    # Check officer status
    if officer.status != "Active":
        raise HTTPException(status_code=400, detail=f"Officer is {officer.status}")
    
    # Assign
    complaint.assigned_officer_id = assignment.officer_id
    complaint.assigned_at = datetime.utcnow()
    complaint.assigned_by_admin_id = current_admin.id
    complaint.status = "Assigned"
    
    # Set/override priority if provided
    if assignment.priority:
        complaint.priority = assignment.priority
    
    # Calculate SLA
    priority = complaint.priority or "Medium"
    complaint.sla_hours = SLA_HOURS.get(priority, 120)
    complaint.sla_deadline = datetime.utcnow() + timedelta(hours=complaint.sla_hours)
    
    # Create history
    history = models.ComplaintHistory(
        complaint_id=complaint_id,
        action=f"Assigned to {officer.name} ({officer.designation}) - SLA: {complaint.sla_hours}h",
        performed_by=current_admin.email
    )
    db.add(history)
    
    # Audit log
    audit_log = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Assigned complaint #{complaint_id} to officer {officer.employee_id}",
        target_resource=f"complaint:{complaint_id}"
    )
    db.add(audit_log)

    # Timeline: Assigned to Officer
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint_id,
        status="ASSIGNED",
        updated_by="ADMIN",
        remarks=f"Assigned to {officer.name} ({officer.designation})"
    )
    db.add(timeline_entry)
    
    db.commit()
    
    print(f"📋 Complaint #{complaint_id} assigned to {officer.name} by {current_admin.email}")
    
    return {
        "message": "Grievance assigned successfully",
        "complaint_id": complaint_id,
        "officer": {
            "id": officer.id,
            "name": officer.name,
            "designation": officer.designation
        },
        "sla_hours": complaint.sla_hours,
        "sla_deadline": complaint.sla_deadline
    }

@router.put("/complaints/{complaint_id}/reassign")
def reassign_complaint(
    complaint_id: int,
    reassignment: schemas.ReassignComplaintRequest,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Reassign complaint to different officer
    Mandatory reason for India Govt audit compliance
    """
    # Get complaint
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    if not complaint.assigned_officer_id:
        raise HTTPException(status_code=400, detail="Complaint not assigned yet")
    
    # Validate reason length
    if len(reassignment.reason) < 10:
        raise HTTPException(
            status_code=400, 
            detail="Reassignment reason must be at least 10 characters"
        )
    
    # Get new officer
    new_officer = db.query(models.Officer).filter(
        models.Officer.id == reassignment.new_officer_id
    ).first()
    
    if not new_officer:
        raise HTTPException(status_code=404, detail="New officer not found")
    
    if new_officer.status != "Active":
        raise HTTPException(status_code=400, detail=f"Officer is {new_officer.status}")
    
    # Store previous officer
    old_officer_id = complaint.assigned_officer_id
    old_officer = db.query(models.Officer).filter(models.Officer.id == old_officer_id).first()
    
    # Reassign
    complaint.previous_officer_id = old_officer_id
    complaint.assigned_officer_id = reassignment.new_officer_id
    complaint.reassignment_reason = reassignment.reason
    complaint.reassignment_count += 1
    complaint.assigned_at = datetime.utcnow()  # Reset SLA
    complaint.sla_deadline = datetime.utcnow() + timedelta(hours=complaint.sla_hours)
    
    # History
    history = models.ComplaintHistory(
        complaint_id=complaint_id,
        action=f"Reassigned from {old_officer.name if old_officer else 'Unknown'} to {new_officer.name}. Reason: {reassignment.reason}",
        performed_by=current_admin.email
    )
    db.add(history)
    
    # Audit
    audit_log = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Reassigned complaint #{complaint_id} from {old_officer_id} to {reassignment.new_officer_id}",
        target_resource=f"complaint:{complaint_id}"
    )
    db.add(audit_log)

    # Timeline: Reassigned (counts as new assignment)
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint_id,
        status="ASSIGNED",
        updated_by="ADMIN",
        remarks=f"Reassigned to {new_officer.name}. Reason: {reassignment.reason}"
    )
    db.add(timeline_entry)

    
    db.commit()
    
    print(f"🔄 Complaint #{complaint_id} reassigned by {current_admin.email}")
    
    return {
        "message": "Grievance reassigned successfully",
        "complaint_id": complaint_id,
        "from_officer": old_officer.name if old_officer else "Unknown",
        "to_officer": new_officer.name,
        "reason": reassignment.reason
    }

# ============ ANALYTICS & DASHBOARD ============

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    """
    Dashboard overview metrics
    """
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["NEW", "Assigned", "IN_PROGRESS", "Pending"])
    ).count()
    resolved = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen"])
    ).count()
    critical = db.query(models.Complaint).filter(
        models.Complaint.priority == "Critical"
    ).count()
    sla_breached = db.query(models.Complaint).filter(
        models.Complaint.sla_breached == True
    ).count()
    unassigned = db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == None,
        models.Complaint.is_archived == False
    ).count()
    
    # Calculate trends and rates
    now = datetime.now()
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_last_month = (first_day_this_month - timedelta(days=1)).replace(day=1)
    
    # Total Processed (Resolved + Closed)
    # Ensure this query captures ALL non-pending states for accuracy
    total_processed = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Work Completed", "Action Completed"])
    ).count()

    # CRITICAL DATA SYNC: Pending must strictly be Total - Processed
    # This avoids "floating" complaints that don't appear in either category due to status mismatches
    pending = total - total_processed
    if pending < 0: pending = 0 # Safety guard

    # Last Month Processed
    last_month_processed = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Work Completed", "Action Completed"]),
        models.Complaint.closed_at >= first_day_last_month,
        models.Complaint.closed_at < first_day_this_month
    ).count()

    total_growth = 0
    if last_month_processed > 0:
        total_growth = ((total_processed - last_month_processed) / last_month_processed) * 100

    # Resolution Rate
    resolution_rate = 0
    if total > 0:
        resolution_rate = (total_processed / total) * 100

    # Avg Resolution Time
    resolved_complaints = db.query(models.Complaint).filter(
        models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Work Completed", "Action Completed"]),
        models.Complaint.closed_at != None
    ).all()

    total_hours = 0
    count_with_time = 0
    for c in resolved_complaints:
        if c.created_at and c.closed_at:
            diff = c.closed_at - c.created_at
            # Guard against negative time (server clock skew)
            seconds = diff.total_seconds()
            if seconds > 0:
                total_hours += seconds / 3600
                count_with_time += 1
    
    avg_resolution_time = 0
    if count_with_time > 0:
        avg_resolution_time = round(total_hours / count_with_time, 1)

    return {
        "total": total,
        "total_processed": total_processed,
        "total_growth": round(total_growth, 1),
        "pending": pending,
        "resolved": total_processed, # Map resolved to processed for frontend consistency
        "resolution_rate": round(resolution_rate, 1),
        "avg_resolution_time": avg_resolution_time,
        "critical": critical,
        "sla_breached": sla_breached,
        "unassigned": unassigned,
        "active_officers": db.query(models.Officer).filter(models.Officer.status == "Active").count()
    }

@router.get("/complaints/unassigned", response_model=List[schemas.ComplaintResponse])
def get_unassigned_complaints(
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    List complaints not yet assigned to any officer
    """
    return db.query(models.Complaint).filter(
        models.Complaint.assigned_officer_id == None,
        models.Complaint.is_archived == False
    ).all()

@router.get("/complaints/sla-breached", response_model=List[schemas.ComplaintResponse])
def get_sla_breached_complaints(
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    List complaints that have breached SLA deadline
    """
    return db.query(models.Complaint).filter(
        models.Complaint.sla_breached == True
    ).order_by(models.Complaint.sla_deadline).all()

@router.get("/heatmap")
def get_heatmap_data(db: Session = Depends(database.get_db)):
    complaints = db.query(models.Complaint.location, models.Complaint.urgency_level).all()
    return [{"location": c.location, "intensity": 3 if c.urgency_level == "Critical" else 1} for c in complaints]

@router.get("/recent")
def get_recent_complaints(db: Session = Depends(database.get_db)):
    return db.query(models.Complaint)\
        .order_by(models.Complaint.created_at.desc())\
        .limit(10)\
        .all()

@router.get("/departments", response_model=List[schemas.DepartmentResponse])
def get_departments(db: Session = Depends(database.get_db)):
    return db.query(models.Department).all()

@router.get("/analytics/departments")
def get_department_stats(db: Session = Depends(database.get_db)):
    """
    Department-wise pendency and totals
    """
    departments = db.query(models.Department).all()
    stats = []
    
    for dept in departments:
        total = db.query(models.Complaint).filter(models.Complaint.department_id == dept.id).count()
        pending = db.query(models.Complaint).filter(
            models.Complaint.department_id == dept.id,
            models.Complaint.status.in_(["NEW", "Assigned", "IN_PROGRESS", "Pending"])
        ).count()
        
        stats.append({
            "dept": dept.name,
            "total": total,
            "pending": pending,
            "color": "bg-blue-500" # Frontend can map colors or we can dynamic here
        })
        
    return stats

@router.get("/analytics/trends")
def get_monthly_trends(
    db: Session = Depends(database.get_db)
):
    """
    Monthly grievance trends - submitted vs resolved
    Returns last 12 months data for charts
    """
    from sqlalchemy import extract, func
    from datetime import datetime, timedelta
    
    # Get last 12 months
    current_date = datetime.now()
    trends = []
    
    for i in range(11, -1, -1):  # Last 12 months
        target_date = current_date - timedelta(days=30*i)
        month = target_date.month
        year = target_date.year
        
        # Count submitted complaints in this month
        submitted = db.query(func.count(models.Complaint.id)).filter(
            extract('month', models.Complaint.created_at) == month,
            extract('year', models.Complaint.created_at) == year
        ).scalar() or 0
        
        # Count resolved complaints in this month
        resolved = db.query(func.count(models.Complaint.id)).filter(
            extract('month', models.Complaint.created_at) == month,
            extract('year', models.Complaint.created_at) == year,
            models.Complaint.status.in_(["RESOLVED", "Closed by Citizen", "Action Completed"])
        ).scalar() or 0
        
        trends.append({
            "month": target_date.strftime("%b"),
            "year": year,
            "submitted": submitted,
            "resolved": resolved
        })
    
    return trends

@router.get("/audit-logs")
def get_audit_logs(
    action_type: str = None,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Retrieve audit logs - Immutable administrative action trail
    RTI compliant, read-only access
    """
    query = db.query(models.AdminAuditLog).order_by(models.AdminAuditLog.created_at.desc())
    
    # Filter by action type if provided
    if action_type:
        if action_type == "assignment":
            query = query.filter(models.AdminAuditLog.action.like('%Assigned complaint%'))
        elif action_type == "reassignment":
            query = query.filter(models.AdminAuditLog.action.like('%Reassigned complaint%'))
        elif action_type == "override":
            query = query.filter(models.AdminAuditLog.action.like('%Override%'))
    
    logs = query.limit(limit).all()
    
    # Format for frontend
    return [
        {
            "id": log.id,
            "timestamp": log.created_at.isoformat(),
            "admin_id": log.admin_id,
            "action": log.action,
            "target_resource": log.target_resource if hasattr(log, 'target_resource') else f"resource:{log.target_id}"
        }
        for log in logs
    ]

@router.put("/assign/{complaint_id}/{dept_id}")
def assign_department(
    complaint_id: int, 
    dept_id: int, 
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    dept = db.query(models.Department).filter(models.Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    
    complaint.department_id = dept_id
    complaint.status = "IN_PROGRESS"
    
     # Create history
    history = models.ComplaintHistory(
        complaint_id=complaint_id,
        action=f"Manually assigned to Department: {dept.name}",
        performed_by=current_admin.email
    )
    db.add(history)
    
    # Audit log
    audit_log = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Assigned complaint #{complaint_id} to Department {dept.id}",
        target_resource=f"complaint:{complaint_id}"
    )
    db.add(audit_log)
    
    # Timeline: Department Assignment
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint.id,
        status="ASSIGNED",
        updated_by="ADMIN",
        remarks=f"Assigned to {dept.name} Department"
    )
    db.add(timeline_entry)

    db.commit()
    
    return {
        "message": f"Complaint assigned to department {dept_id}"
    }

@router.put("/resolve/{complaint_id}")
def admin_resolve_complaint(complaint_id: int, db: Session = Depends(database.get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    complaint.status = "RESOLVED"
    
    history = models.ComplaintHistory(
        complaint_id=complaint.id,
        action="Marked as RESOLVED by Admin",
        performed_by="ADMIN"
    )
    db.add(history)
    
    # Timeline: Resolved by Admin
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint.id,
        status="RESOLVED",
        updated_by="ADMIN",
        remarks="Marked as RESOLVED by Admin"
    )
    db.add(timeline_entry)
    
    db.commit()
    
    return {"message": "Complaint resolved"}

@router.put("/complaints/{complaint_id}/reopen")
def reopen_complaint(
    complaint_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """
    Admin reopens an archived complaint.
    India Govt Compliance: Allows admin override for errors or appeals.
    """
    # Find the complaint
    complaint = db.query(models.Complaint).filter(
        models.Complaint.id == complaint_id
    ).first()
    
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    # Check if it's archived
    if not complaint.is_archived:
        raise HTTPException(status_code=400, detail="Complaint is not archived")
    
    # Reopen the complaint
    complaint.is_archived = False
    complaint.status = "NEW"  # Reset to NEW status
    complaint.closed_by_role = None
    complaint.closed_by_user_id = None
    complaint.closed_at = None
    complaint.closed_reason = None
    
    # Create audit log
    audit_log = models.ComplaintHistory(
        complaint_id=complaint_id,
        action=f"Complaint reopened by admin {current_admin.email}",
        performed_by=current_admin.email
    )
    db.add(audit_log)
    
    # Log to admin audit
    admin_audit = models.AdminAuditLog(
        admin_id=current_admin.id,
        action=f"Reopened complaint #{complaint_id}",
        target_resource=f"complaint:{complaint_id}"
    )
    db.add(admin_audit)
    
    # Timeline: Reopened
    timeline_entry = models.GrievanceTimeline(
        complaint_id=complaint_id,
        status="REOPENED",
        updated_by="ADMIN",
        remarks=f"Reopened by Admin {current_admin.name}"
    )
    db.add(timeline_entry)
    
    db.commit()
    
    print(f"🔄 Admin {current_admin.email} reopened complaint #{complaint_id}")
    
    return {
        "message": "Complaint reopened successfully",
        "complaint_id": complaint_id,
        "new_status": complaint.status
    }
