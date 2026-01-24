from backend.database import SessionLocal
from backend.models import Officer

def check_officers():
    db = SessionLocal()
    officers = db.query(Officer).all()
    
    print(f"Found {len(officers)} officers:")
    for officer in officers:
        print(f"ID: {officer.id} | Employee ID: {officer.employee_id} | Name: {officer.name} | Status: {officer.status}")

if __name__ == "__main__":
    check_officers()
