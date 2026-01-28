from backend.database import SessionLocal
from backend.models import Officer

db = SessionLocal()
officers = db.query(Officer).all()

print("\n--- OFFICER CREDENTIALS ---")
for off in officers:
    print(f"Name: {off.name}")
    print(f"Officer ID: {off.employee_id}")
    print(f"Password: {off.employee_id}") # As per code logic
    print("-" * 20)
db.close()
