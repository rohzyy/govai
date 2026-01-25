from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "GrievanceAI Enterprise"
    API_V1_STR: str = "/api"
    
    # Security Config
    SECRET_KEY: str = "PERMANENT_DEV_SECRET_KEY_12345" # STRICTLY PINNED FOR DEBUGGING
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 Hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = "760616524479-p9c0m5gnjn462u1k6eeb8cnp5as2jktt.apps.googleusercontent.com"
    
    # Gemini AI
    GEMINI_API_KEY: str = "AIzaSyCX_52lZ8yVj1w2C3d4E5f6G7h8I9j0kLM" # Updated Key
    
    # Cookie Settings for Production Security
    COOKIE_SETTINGS: dict = {
        "httponly": True, # Enhanced Security
        "secure": False, # Localhost (HTTP)
        "samesite": "lax", # Reliable for Localhost
        "path": "/"
    }
    
    # Database
    DATABASE_URL: str = "sqlite:///./grievance_enterprise_v3.db"

settings = Settings()
