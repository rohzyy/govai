import sys
import os
import time

# Add parent directory to path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal
from backend import models, schemas
from pydantic import ValidationError

def debug_complaints():
    db = SessionLocal()
    try:
        print("Fetching all complaints...", flush=True)
        # Order by created_at desc like the endpoint
        complaints = db.query(models.Complaint).order_by(models.Complaint.created_at.desc()).all()
        print(f"Found {len(complaints)} complaints.", flush=True)
        
        for i, c in enumerate(complaints):
            # Slow down to prevent buffer issues
            time.sleep(0.1)
            try:
                # Validation
                m = schemas.ComplaintResponse.model_validate(c)
                # Serialization check
                m.model_dump(mode='json')
                print(f"ID {c.id}: OK", flush=True)
            except ValidationError as e:
                print(f"ID {c.id}: VALIDATION FAIL", flush=True)
                print(e)
            except Exception as e:
                print(f"ID {c.id}: RUNTIME FAIL", flush=True)
                print(e)
                
    finally:
        db.close()

if __name__ == "__main__":
    debug_complaints()
