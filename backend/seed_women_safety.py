import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.database import SessionLocal, engine
from backend import models
from backend.models import Department, Officer

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed_women_safety():
    # 1. Create Department
    dept_name = "Women Safety Cell"
    dept = db.query(Department).filter(Department.name == dept_name).first()
    if not dept:
        dept = Department(name=dept_name, description="Dedicated 24/7 Women Safety Response Team")
        db.add(dept)
        db.commit()
        print(f"✅ Created Department: {dept_name}")
    else:
        print(f"ℹ️ Department already exists: {dept_name}")
        
    # 2. Create Officer
    officer_id = "WS-001"
    isofficer = db.query(Officer).filter(Officer.employee_id == officer_id).first()
    
    if not isofficer:
        officer = Officer(
            employee_id=officer_id,
            name="Priya Sharma",
            designation="Women Safety Inspector",
            department_id=dept.id,
            ward="City Wide",
            zone="Central",
            email="safety@gov.in",
            phone="1091",
            status="Active"
        )
        db.add(officer)
        db.commit()
        print(f"✅ Created Officer: {officer.name} ({officer_id})")
    else:
        print(f"ℹ️ Officer already exists: {isofficer.name}")

if __name__ == "__main__":
    seed_women_safety()
    db.close()
