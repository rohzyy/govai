from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import auth_routes, complaint_routes, admin_routes, officer_routes, women_safety, debug_routes, public_routes, ai_routes
from .config import settings

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Grievance Management System",
    version="2.0.0"
)

# CORS (Allow Frontend to send Cookies)
origins = ["http://localhost:3000"] 

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"], # INVALID with allow_credentials=True
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5000", 
        "http://127.0.0.1:5000"
    ],
    allow_credentials=True, # Critical for Cookies
    allow_methods=["*"],
    allow_headers=["*", "Authorization", "Content-Type", "Access-Control-Allow-Origin"],
    expose_headers=["*"]
)

from fastapi import Request
@app.middleware("http")
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"DEBUG MIDDLEWARE: {request.method} {request.url}")
    # print(f"DEBUG COOKIES: {request.cookies}") 
    # print(f"DEBUG HEADERS: {request.headers}")
    
    response = await call_next(request)
    
    # REQUIRED FOR GOOGLE OAUTH POPUPS
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"
    
    # print(f"DEBUG RESPONSE: {response.status_code}")
    return response

# Include Routes
app.include_router(auth_routes.router)
app.include_router(complaint_routes.router)
app.include_router(admin_routes.router)
app.include_router(officer_routes.router)
app.include_router(women_safety.router)
app.include_router(ai_routes.router)
app.include_router(debug_routes.router)
app.include_router(public_routes.router)
print("[OK] Registered officer_routes router")
print("[OK] Registered women_safety router")

# CRITICAL: Validate Routes at Startup
from .utils.startup_check import validate_routes
@app.on_event("startup")
async def startup_event():
    # validate_routes(app)
    from .config import settings
    key = settings.STT_API_KEY
    print(f"[STARTUP] Loaded STT_API_KEY: ...{key[-4:] if key else 'None'}")
    if not key or "AIzaSyCX" in key:
        print("[STARTUP] STT_API_KEY status: MISSING/PLACEHOLDER (Transcription will fail)")
    else:
        print("[STARTUP] STT_API_KEY status: CONFIGURED (Ready for AI features)")
    pass


@app.get("/")
def read_root():
    from .config import settings
    print(f"[STARTUP] SERVER STARTED using Database: {settings.DATABASE_URL}")
    print("Force Reload Triggered")
    return {"message": "GrievanceAI Enterprise API Running"}

if __name__ == "__main__":
    import uvicorn
    # Use standard port 5000 as per other configurations
    uvicorn.run("backend.app:app", host="127.0.0.1", port=5000, reload=False)
