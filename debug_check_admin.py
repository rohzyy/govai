
from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()
admin = db.query(User).filter(User.email == "admin@grievance.ai").first()
if admin:
    print(f"User: {admin.email}")
    print(f"ID: {admin.id}")
    print(f"Role: {admin.role}")
else:
    print("Admin user not found")
