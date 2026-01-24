from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
import time
from .. import models, database

router = APIRouter(prefix="/public", tags=["Public Data"])

# Simple In-Memory Cache
# Format: {"data": dict, "timestamp": float}
ANALYTICS_CACHE = {
    "data": None,
    "expires_at": 0
}
CACHE_DURATION_SECONDS = 300  # 5 Minutes

@router.get("/analytics/overview")
def get_public_analytics_overview(db: Session = Depends(database.get_db)):
    """
    Public Endpoint: Aggregated Government Impact Metrics.
    Cached for 5 minutes.
    """
    global ANALYTICS_CACHE
    
    # Check Cache
    if ANALYTICS_CACHE["data"] and time.time() < ANALYTICS_CACHE["expires_at"]:
        return ANALYTICS_CACHE["data"]
    
    try:
        current_time = datetime.now()
        current_month = current_time.month
        current_year = current_time.year
        
        last_month_date = current_time.replace(day=1) - timedelta(days=1)
        last_month = last_month_date.month
        last_month_year = last_month_date.year

        # 1. Total Resolved (All time)
        total_resolved = db.query(models.Complaint).filter(
            models.Complaint.status.in_(["RESOLVED", "VERIFIED", "Closed by Citizen", "Action Completed"])
        ).count()
        
        # 2. Resolution Efficiency (Resolved count this month vs last month)
        resolved_this_month = db.query(models.Complaint).filter(
            models.Complaint.status.in_(["RESOLVED", "VERIFIED", "Closed by Citizen"]),
            extract('month', models.Complaint.closed_at) == current_month,
            extract('year', models.Complaint.closed_at) == current_year
        ).count()
        
        resolved_last_month = db.query(models.Complaint).filter(
            models.Complaint.status.in_(["RESOLVED", "VERIFIED", "Closed by Citizen"]),
            extract('month', models.Complaint.closed_at) == last_month,
            extract('year', models.Complaint.closed_at) == last_month_year
        ).count()
        
        resolution_improvement = 0
        if resolved_last_month > 0:
            resolution_improvement = ((resolved_this_month - resolved_last_month) / resolved_last_month) * 100
        elif resolved_this_month > 0:
             resolution_improvement = 100 # Default to 100% growth if started from 0
        
        # 3. Complaint Reduction (New complaints this month vs last month)
        # Note: A negative number here means FEWER complaints, which is GOOD.
        # We want to show "Reduction %". 
        # If new_this < new_last, reduction is Positive %.
        
        new_this_month = db.query(models.Complaint).filter(
             extract('month', models.Complaint.created_at) == current_month,
             extract('year', models.Complaint.created_at) == current_year
        ).count()
        
        new_last_month = db.query(models.Complaint).filter(
             extract('month', models.Complaint.created_at) == last_month,
             extract('year', models.Complaint.created_at) == last_month_year
        ).count()
        
        complaint_reduction = 0
        if new_last_month > 0:
             # Calculate change
             change = new_this_month - new_last_month
             # Reduction % = (Change / Last) * 100 * -1 (inverted)
             complaint_reduction = (change / new_last_month) * 100
             
             # If change is negative (e.g. -5), reduction is + (drop in complaints)
             # If change is positive (e.g. +5), reduction is - (increase in complaints)
             # The UI likely expects a positive number for "Reduction" and negative for "Increase"?
             # Actually, user said: "Value: ▼ 22%, Label: Complaint Reduction"
             # So we should return the raw drop percentage?
             # Let's return the signed percentage change. UI decides arrow.
             pass
        
        # Simplification for UI consistency:
        # Let's return the percentage change in Volume. 
        # If Volume dropped by 20%, we return -20.
        complaint_volume_change_percent = 0
        if new_last_month > 0:
            complaint_volume_change_percent = ((new_this_month - new_last_month) / new_last_month) * 100
            
        # 4. Average Resolution Time (All time, or recent? User said "3.4 days")
        # Let's do recent (Last 90 days) to be relevant, or all time if simpler.
        # All time is safer for demo if data is sparse.
        resolved_complaints = db.query(models.Complaint).filter(
            models.Complaint.status.in_(["RESOLVED", "VERIFIED", "Closed by Citizen"]),
            models.Complaint.closed_at != None
        ).all()
        
        total_hours = 0
        count = 0
        for c in resolved_complaints:
            if c.created_at and c.closed_at:
                diff = c.closed_at - c.created_at
                total_hours += diff.total_seconds() / 3600
                count += 1
        
        avg_days = 0
        if count > 0:
            avg_days = round((total_hours / 24) / count, 1)
            
        data = {
            "total_resolved": total_resolved,
            "resolution_improvement_percent": round(resolution_improvement, 1),
            "complaint_reduction_percent": round(complaint_volume_change_percent * -1, 1), # Invert so positive means reduction
            "avg_resolution_time_days": avg_days
        }
        
        # Update Cache
        ANALYTICS_CACHE["data"] = data
        ANALYTICS_CACHE["expires_at"] = time.time() + CACHE_DURATION_SECONDS
        
        return data

    except Exception as e:
        print(f"Analytics Error: {e}")
        # Return Safe Defaults
        return {
            "total_resolved": 0,
            "resolution_improvement_percent": 0,
            "complaint_reduction_percent": 0,
            "avg_resolution_time_days": 0
        }
