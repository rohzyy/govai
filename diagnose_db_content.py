import sys
import os
from sqlalchemy.orm import Session

sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend import models

def diagnose():
    print("🚀 Starting DB Diagnosis...")
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        officer_count = db.query(models.Officer).count()
        complaint_count = db.query(models.Complaint).count()
        dept_count = db.query(models.Department).count()
        
        print(f"✅ Users: {user_count}")
        print(f"✅ Officers: {officer_count}")
        print(f"✅ Complaints: {complaint_count}")
        print(f"✅ Departments: {dept_count}")
        
        # Check Roles
        admin = db.query(models.User).filter(models.User.role == "ADMIN").first()
        if admin:
            print(f"ℹ️  Admin Found: {admin.email} (ID: {admin.id})")
        else:
            print("⚠️  NO ADMIN USER FOUND.")

        # Check Complaints status distribution
        if complaint_count > 0:
            print("\nComplaint Status Breakdown:")
            from sqlalchemy import func
            stats = db.query(models.Complaint.status, func.count(models.Complaint.status)).group_by(models.Complaint.status).all()
            for status, count in stats:
                print(f"   - {status}: {count}")

    except Exception as e:
        print(f"❌ DB Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    diagnose()
