from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import List
from ..ai_utils import generate_analysis_response

router = APIRouter(prefix="/helper", tags=["Helper"])

@router.get("/ping")
async def ping_helper():
    return {"status": "helper_active"}

class AIAnalysisRequest(BaseModel):
    description: str

class AIAnalysisResponse(BaseModel):
    category: str
    department: str
    priority: str
    ert: str
    confidence: int
    reasoning: List[str]

@router.post("/scan-text", response_model=AIAnalysisResponse)
async def analyze_complaint_endpoint(payload: AIAnalysisRequest):
    """
    Analyzes complaint description in real-time.
    Returns structured AI insights including Department, Priority, ERT, and Reasoning.
    Non-blocking / Fail-safe design.
    """
    if not payload.description or len(payload.description.strip()) < 5:
        return {
            "category": "General",
            "department": "General Grievance Cell",
            "priority": "Medium",
            "ert": "3-5 days",
            "confidence": 0,
            "reasoning": ["Description too short for analysis"]
        }
        
    try:
        # Calls the heuristic/LLM hybrid function
        result = generate_analysis_response(payload.description)
        return result
    except Exception as e:
        print(f"AI Analysis Failed: {e}")
        # Graceful Fallback
        return {
            "category": "General",
            "department": "General Grievance Cell",
            "priority": "Medium",
            "ert": "3-5 days",
            "confidence": 0,
            "reasoning": ["AI analysis temporarily unavailable"]
        }

from fastapi import UploadFile, File, Form
from ..ai_utils import transcribe_audio

@router.post("/transcribe")
async def transcribe_endpoint(
    audio: UploadFile = File(...),
    lang: str = Form("en-IN")
):
    """
    Receives audio blob, transcribes using backend LLM, and returns text.
    Bypasses unreliable browser Web Speech API.
    """
    try:
        content = await audio.read()
        text = transcribe_audio(content, lang=lang)
        return {"transcript": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
