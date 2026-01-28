from google.oauth2 import id_token
from google.auth.transport import requests
from .. import models, schemas
from ..config import settings
from sqlalchemy.orm import Session

def verify_google_token(token: str, db: Session):
    # DEV MODE CHECK
    if token == "MOCK_GOOGLE_TOKEN":
        # Check if Dev User exists
        user = db.query(models.User).filter(models.User.email == "citizen@test.com").first()
        if not user:
            user = models.User(
                # Remove explicit ID to let AutoIncrement work, or handle carefully
                # id=999, 
                email="citizen@test.com",
                full_name="Test Citizen",
                photo_url="https://ui-avatars.com/api/?name=Test+Citizen&background=random",
                role="USER"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    # 1. VERIFY TOKEN TYPE (Must be JWT id_token, not access_token)
    if "." not in token:
        print("DEBUG AUTH: Token rejected - Not a JWT (likely access_token)")
        raise ValueError("Invalid Token Type: Expected id_token")

    try:
        # DEBUG: Log Client ID for Verification
        # print(f"DEBUG AUTH: Verifying against Client ID: {settings.GOOGLE_CLIENT_ID}")
        
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=60 # Increased to 60s to handle system time differences
        )
        
        # print(f"DEBUG AUTH: Token Verified. Audience: {idinfo.get('aud')}")

        user_email = idinfo['email']
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == user_email).first()
        if not user:
            user = models.User(
                email=user_email,
                full_name=idinfo.get('name'),
                photo_url=idinfo.get('picture'),
                role="USER" 
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
        
    except ValueError as e:
        print(f"DEBUG AUTH ERROR: Token Verification Failed. Details: {str(e)}")
        raise ValueError(f"Invalid Google Token: {str(e)}")
