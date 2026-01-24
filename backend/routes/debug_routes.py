
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, database, utils
from ..utils import jwt_utils

router = APIRouter(prefix="/debug-complaints", tags=["Debug"])

@router.get("/")
def debug_list_complaints(
    db: Session = Depends(database.get_db)
):
    try:
        complaints = db.query(models.Complaint).all()
        return {
            "status": "success",
            "total_complaints_in_db": len(complaints),
            "complaints": [
                {
                    "id": c.id, 
                    "title": c.title, 
                    "user_id": c.user_id, 
                    "is_archived": c.is_archived
                } for c in complaints
            ]
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}
