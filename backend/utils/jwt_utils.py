from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from ..config import settings
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from .. import models, database, schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"type": "access"})
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"type": "refresh"})
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ Token decoded successfully: {payload}")  # DEBUG
        return payload
    except JWTError as e:
        print(f"❌ JWT Decode Error: {str(e)}")  # DEBUG
        print(f"❌ Token: {token[:50]}...")  # DEBUG (first 50 chars)
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def get_current_user(request: Request, db: Session = Depends(database.get_db)):
    # DEBUG LOGGING
    print(f"DEBUG: Cookies received: {request.cookies}")
    print(f"DEBUG: Headers received: {request.headers}")

    token_from_cookie = request.cookies.get("access_token")
    token_from_header = None
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token_from_header = auth_header.split(" ")[1]

    user = None
    
    # helper to try verify
    def verify_token(token):
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except Exception as e:
            print(f"Token validation failed: {e}")
        return None

    # 1. Try Cookie
    if token_from_cookie:
        print(f"Testing Cookie Token...")
        uid = verify_token(token_from_cookie)
        if uid:
            user = db.query(models.User).filter(models.User.id == int(uid)).first()
            if user:
                print(f"✅ Authenticated via Cookie")
                return user
        print(f"❌ Cookie Token invalid or user not found.")

    # 2. Try Header (Fallback)
    if token_from_header:
        print(f"Testing Header Token...")
        uid = verify_token(token_from_header)
        if uid:
            user = db.query(models.User).filter(models.User.id == int(uid)).first()
            if user:
                print(f"✅ Authenticated via Header")
                return user
        print(f"❌ Header Token invalid or user not found.")

    # If we get here, neither worked
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
