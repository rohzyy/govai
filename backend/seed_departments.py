"""
Seed script to add India Government departments to the database
"""
from backend.database import SessionLocal
from backend.models import Department

def seed_departments():
    db = SessionLocal()
    
    # India Government Departments - Common Municipal/PWD Departments
    departments = [
        {
            "name": "Public Works Department (PWD)",
            "description": "Responsible for construction and maintenance of public infrastructure"
        },
        {
            "name": "Roads & Bridges Department",
            "description": "Maintenance and construction of roads, bridges, and flyovers"
        },
        {
            "name": "Water Supply & Sewerage Board",
            "description": "Water supply, drainage, and sewerage systems"
        },
        {
            "name": "Department of Street Lighting",
            "description": "Installation and maintenance of street lights"
        },
        {
            "name": "Electricity Department",
            "description": "Power supply, electrical poles, and transformers"
        },
        {
            "name": "General Grievance Cell",
            "description": "General complaints and grievance redressal"
        },
        {
            "name": "Sanitation & Waste Management Department",
            "description": "Garbage collection, waste disposal, and cleaning"
        },
        {
            "name": "Public Health Engineering Department (PHED)",
            "description": "Sewage and drainage maintenance"
        },
        {
            "name": "Department of Public Health",
            "description": "Disease control, food safety, and hygiene"
        },
        {
            "name": "Public Safety & Vigilance Department",
            "description": "Law enforcement, safety, and security"
        },
        {
            "name": "Town Planning Department",
            "description": "Urban planning and building approvals"
        },
        {
            "name": "Property Tax Department",
            "description": "Property tax collection and assessment"
        },
        {
            "name": "Horticulture Department",
            "description": "Maintenance of public gardens and parks"
        },
        {
            "name": "Traffic Engineering Cell",
            "description": "Traffic signals, road signs, and road safety infrastructure"
        }
    ]
    
    try:
        # Add departments (Idempotent Check)
        added_count = 0
        for dept_data in departments:
            existing = db.query(Department).filter(Department.name == dept_data["name"]).first()
            if not existing:
                dept = Department(**dept_data)
                db.add(dept)
                added_count += 1
                print(f"   [+] Added: {dept_data['name']}")
            else:
                print(f"   [=] Exists: {dept_data['name']}")
        
        db.commit()
        if added_count > 0:
            print(f"✅ Successfully added {added_count} new departments!")
        else:
            print("✅ All departments already exist.")
        

        
        # Display added departments
        all_depts = db.query(Department).all()
        print("\n📋 Departments in database:")
        for d in all_depts:
            print(f"   {d.id}. {d.name}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_departments()
