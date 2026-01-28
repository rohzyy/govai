from fastapi import FastAPI, APIRouter, Response, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# 1. ROBUST CORS CONFIGURATION
# Using 127.0.0.1 instead of localhost for maximum compatibility
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True, # REQUIRED for Cookies/Sessions
    allow_methods=["POST", "OPTIONS"], # Explicitly allow OPTIONS for preflight
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["set-cookie"],
)

router = APIRouter(prefix="/auth")

class OAuthPayload(BaseModel):
    token: str

@router.post("/google")
async def google_oauth(payload: OAuthPayload, response: Response):
    """
    Canonical Google OAuth endpoint.
    - Explicitly handles JSON body via Pydantic.
    - Returns standardized success response.
    """
    # In a real app, you would verify the token here using google-auth library
    if not payload.token:
        raise HTTPException(status_code=400, detail="Token is required")
    
    return {
        "status": "success", 
        "user": {
            "email": "user@example.com",
            "name": "Example User"
        },
        "message": "Authentication successful"
    }

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    # Bind to 127.0.0.1 explicitly to match frontend call
    print("🚀 Starting Canonical Backend at http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
