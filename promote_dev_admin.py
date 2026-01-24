import sys
import os
from sqlalchemy.orm import Session

sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend import models

def promote_dev_user():
    print("🚀 Promoting Dev User to ADMIN...")
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "citizen_v3@test.com").first()
        if user:
            print(f"✅ Found User: {user.full_name} (Role: {user.role})")
            user.role = "ADMIN"
            db.commit()
            print(f"🎉 User promoted to ADMIN successfully!")
        else:
            print("❌ Dev User not found. Run Dev Login once properly.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    promote_dev_user()
