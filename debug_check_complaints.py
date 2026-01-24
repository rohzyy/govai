
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.models import Complaint, User
from backend.database import Base

# Setup DB connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./grievance_enterprise_v3.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("-" * 50)
print("DEBUG: Checking Complaints Table")
print("-" * 50)

complaints = db.query(Complaint).all()

if not complaints:
    print("❌ No complaints found in database.")
else:
    print(f"✅ Found {len(complaints)} complaints:")
    for c in complaints:
        user = db.query(User).filter(User.id == c.user_id).first()
        owner_email = user.email if user else "UNKNOWN"
        print(f"ID: {c.id} | Title: {c.title} | Status: {c.status} | Owner: {owner_email} (ID: {c.user_id}) | Archived: {c.is_archived}")

print("-" * 50)
print("DEBUG: Checking Users Table (for reference)")
print("-" * 50)
users = db.query(User).all()
for u in users:
    print(f"ID: {u.id} | Email: {u.email} | Role: {u.role}")

db.close()
