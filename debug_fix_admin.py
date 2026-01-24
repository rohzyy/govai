
from backend.database import SessionLocal
from backend.models import User

db = SessionLocal()
admin = db.query(User).filter(User.email == "admin@grievance.ai").first()
if admin:
    print(f"Old Role: {admin.role}")
    admin.role = "ADMIN"
    db.commit()
    print(f"New Role: {admin.role}")
else:
    print("Admin user not found")
