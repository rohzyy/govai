import sys
import os
from sqlalchemy.orm import Session

sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend import models, schemas

def check_schema():
    with open("py_schema_validation.log", "w", encoding="utf-8") as f:
        f.write("[INFO] Checking Schema Validation...\n")
        db = SessionLocal()
        try:
            officers = db.query(models.Officer).all()
            f.write(f"[INFO] Found {len(officers)} officers.\n")
            
            for off in officers:
                f.write(f"[TEST] Officer: {off.name} (ID: {off.id})\n")
                f.write(f"       Raw CreatedAt: {off.created_at} (Type: {type(off.created_at)})\n")
                f.write(f"       Dept ID: {off.department_id}\n")
                try:
                    # Try validation
                    model = schemas.OfficerResponse.model_validate(off)
                    f.write(f"   [PASS] Valid!\n")
                except AttributeError:
                     # Fallback for Pydantic v1
                    try:
                        model = schemas.OfficerResponse.from_orm(off)
                        f.write(f"   [PASS] Valid (from_orm)!\n")
                    except Exception as e:
                        f.write(f"   [FAIL] Pydantic v1 Error: {e}\n")
                except Exception as e:
                    f.write(f"   [FAIL] Validation Error: {e}\n")
                    
        except Exception as e:
            f.write(f"[ERROR] DB Error: {e}\n")
        finally:
            db.close()

if __name__ == "__main__":
    check_schema()
