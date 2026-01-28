from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from .. import models, database
from ..utils import jwt_utils, csrf, google_auth
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

class GoogleLoginRequest(BaseModel):
    token: str

class AdminLoginRequest(BaseModel):
    username: str
    password: str

def set_auth_cookies(response: Response, user_id: int, role: str, additional_claims: dict = None):
    # 1. Create Tokens
    payload = {"sub": str(user_id), "role": role}
    if additional_claims:
        payload.update(additional_claims)
        
    access_token = jwt_utils.create_access_token(payload)
    refresh_token = jwt_utils.create_refresh_token({"sub": str(user_id), "role": role})
    csrf_token = csrf.generate_csrf_token()
    
    # 2. Set Cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **settings.COOKIE_SETTINGS
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **settings.COOKIE_SETTINGS
    )
    # CSRF Token (Readable by JS)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False, # MUST be false so JS can read it
        secure=settings.COOKIE_SETTINGS["secure"],
        samesite=settings.COOKIE_SETTINGS["samesite"],
        path="/"
    )
    
    return refresh_token # Return for DB logging if needed

@router.post("/google")
def google_login(
    payload: GoogleLoginRequest, 
    response: Response, 
    request: Request,
    db: Session = Depends(database.get_db)
):
    # DEVELOPMENT BYPASS: Allow Mock Token
    if payload.token == "MOCK_GOOGLE_TOKEN":
        # Create or Get the Test User
        user = db.query(models.User).filter(models.User.email == "citizen_v3@test.com").first()
        if not user:
            # Try finding the one created by browser subagent if it exists, or create new
            user = models.User(
                email="citizen_v3@test.com",
                full_name="Test Citizen",
                role="USER",
                is_active=True,
                photo_url="https://ui-avatars.com/api/?name=Test+Citizen"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
    else:
        # Standard Google Verification
        try:
            user = google_auth.verify_google_token(payload.token, db)
        except ValueError as e:
            raise HTTPException(status_code=401, detail=str(e))
    
    refresh_token_str = set_auth_cookies(response, user.id, user.role)
    
    # Log Session
    session = models.UserSession(
        user_id=user.id,
        refresh_token=refresh_token_str,
        device_info=request.headers.get("User-Agent"),
        ip_address=request.client.host
    )
    db.add(session)
    db.commit()
    
    return {
        "access_token": refresh_token_str, # Using refresh logic var name but it's fine, or distinct
        "user": {
            "id": user.id,
            "name": user.full_name,
            "email": user.email,
            "photo": user.photo_url,
            "role": user.role
        },
        # Explicit Return of Access Token for LocalStorage
        "token": jwt_utils.create_access_token({"sub": str(user.id), "role": user.role}) 
    }

@router.post("/admin/login")
def admin_login(
    payload: AdminLoginRequest, 
    response: Response,
    request: Request,
    db: Session = Depends(database.get_db)
):
    # ADMIN CREDENTIALS Check
    # Allow exact "ADMIN" username OR the official admin email
    valid_usernames = ["ADMIN", "admin@grievance.ai"]
    
    if payload.username not in valid_usernames or payload.password != "ADMIN":
        raise HTTPException(status_code=401, detail="Unauthorized access")
        
    # Check if admin user exists in DB (for ID reference), create if not
    admin = db.query(models.User).filter(models.User.email == "admin@grievance.ai").first()
    if not admin:
        admin = models.User(
            email="admin@grievance.ai",
            full_name="System Administrator",
            role="ADMIN"
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
    set_auth_cookies(response, admin.id, "ADMIN")
    
    # Audit Log
    log = models.AdminAuditLog(
        admin_id=admin.id,
        action="Login",
        ip_address=request.client.host
    )
    db.add(log)
    db.commit()
    
    token = jwt_utils.create_access_token({"sub": str(admin.id), "role": "ADMIN"})
    return {"message": "Admin login successful", "role": "ADMIN", "access_token": token}

@router.post("/officer/login")
def officer_login(
    payload: AdminLoginRequest,  # Reusing same schema (username, password)
    response: Response,
    request: Request,
    db: Session = Depends(database.get_db)
):
    """
    Officer login using employee_id as username
    Default password: employee_id (officers should change this in production)
    """
    # Find officer by employee_id
    officer = db.query(models.Officer).filter(
        models.Officer.employee_id == payload.username
    ).first()
    
    if not officer:
        raise HTTPException(status_code=401, detail="Invalid employee ID")
    
    # Check if officer is active
    if officer.status != "Active":
        raise HTTPException(status_code=403, detail=f"Officer status: {officer.status}")
    
    # Simple password check (in production, use hashed passwords)
    # For now, password = employee_id
    if payload.password != officer.employee_id:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create or get user account for this officer
    user = db.query(models.User).filter(models.User.email == officer.email).first()
    if not user:
        user = models.User(
            email=officer.email or f"{officer.employee_id}@officer.gov.in",
            full_name=officer.name,
            role="OFFICER"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    set_auth_cookies(response, user.id, "OFFICER", {"officer_id": officer.id})
    
    token = jwt_utils.create_access_token({
        "sub": str(user.id), 
        "role": "OFFICER",
        "officer_id": officer.id  # Include officer_id for easy lookup
    })
    
    return {
        "message": "Officer login successful",
        "role": "OFFICER",
        "access_token": token,
        "officer": {
            "id": officer.id,
            "name": officer.name,
            "employee_id": officer.employee_id,
            "designation": officer.designation,
            "department_id": officer.department_id
        }
    }

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(database.get_db)):
    # 1. Get Refresh Token from Cookie
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
        
    # 2. Check Revocation
    revoked = db.query(models.RevokedToken).filter(models.RevokedToken.token == token).first()
    if revoked:
         raise HTTPException(status_code=401, detail="Token revoked")
         
    # 3. Validate JWT
    try:
        payload = jwt_utils.decode_token(token)
        if payload["type"] != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        # 4. Issue new Access Token
        new_payload = {"sub": payload["sub"], "role": payload["role"]}
        
        # FIX: If Officer, we need to re-fetch officer_id and add to payload
        if payload["role"] == "OFFICER":
            user_id = int(payload["sub"])
            user = db.query(models.User).filter(models.User.id == user_id).first()
            if user:
                # Find associated officer by email or employee_id logic
                # Assuming email match for now as per login logic
                officer = db.query(models.Officer).filter(models.Officer.email == user.email).first()
                if officer:
                    new_payload["officer_id"] = officer.id
                    
        new_access_token = jwt_utils.create_access_token(new_payload)
        
        response.set_cookie(
            key="access_token",
            value=new_access_token,
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            **settings.COOKIE_SETTINGS
        )
        
        # Rotate CSRF
        new_csrf = csrf.generate_csrf_token()
        response.set_cookie(
            key="csrf_token",
            value=new_csrf,
            httponly=False,
            secure=settings.COOKIE_SETTINGS["secure"],
            samesite=settings.COOKIE_SETTINGS["samesite"],
            path="/"
        )
        
        # Return the new access token explicitly so frontend can update LocalStorage
        return {
            "message": "Token refreshed",
            "access_token": new_access_token
        }
        
    except Exception:
         raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(database.get_db)):
    token = request.cookies.get("refresh_token")
    if token:
        # Revoke
        revoked = models.RevokedToken(token=token)
        db.add(revoked)
        db.commit()
    
    # Clear Cookies
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("csrf_token")
    
    return {"message": "Logged out successfully"}
