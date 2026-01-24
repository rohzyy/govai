import secrets
from fastapi import Request, HTTPException, Depends
from fastapi.security import APIKeyCookie, APIKeyHeader

def generate_csrf_token():
    return secrets.token_urlsafe(32)

def csrf_protect(request: Request):
    # Only enforce on state-changing methods
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return

    csrf_cookie = request.cookies.get("csrf_token")
    csrf_header = request.headers.get("X-CSRF-Token")

    if not csrf_cookie:
        raise HTTPException(status_code=403, detail="CSRF cookie missing")
    
    if not csrf_header:
        raise HTTPException(status_code=403, detail="CSRF header missing")

    if csrf_cookie != csrf_header:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
