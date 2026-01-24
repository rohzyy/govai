from fastapi import FastAPI
import sys
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_routes(app: FastAPI):
    """
    CRITICAL: Validates that all required timeline routes are registered.
    Fails startup if routes are missing to prevent 404 errors.
    """
    required_routes = [
        # Method, Path Pattern (simplified for check)
        ("GET", "/complaints/{complaint_id}/timeline"),
        ("POST", "/officer/complaints/{complaint_id}/timeline-event")
    ]
    
    registered_routes = set()
    
    logger.info("---| STARTUP ROUTE CHECK |---")
    
    for route in app.routes:
        # FastAPI routes usually have .path and .methods
        if hasattr(route, "path") and hasattr(route, "methods"):
            for method in route.methods:
                # Normalize path: remove trailing slash if needed, though FastAPI usually handles it
                # We store as "METHOD path"
                key = f"{method} {route.path}"
                registered_routes.add(key)
                logger.info(f"Registered: {key}")

    missing = []
    for method, path in required_routes:
        key = f"{method} {path}"
        if key not in registered_routes:
            missing.append(key)
            
    if missing:
        logger.error("!!! CRITICAL STARTUP ERROR !!!")
        logger.error("The following REQUIRED routes are missing:")
        for m in missing:
            logger.error(f" - {m}")
        logger.error("Server refuses to start to prevent persistent 404 errors.")
        sys.exit(1)
        
    logger.info("[OK] All critical timeline routes verified.")
