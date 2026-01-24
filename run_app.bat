@echo off
echo Starting GrievanceAI Enterprise...

start "GrievanceAI Backend" cmd /k "call backend\venv\Scripts\activate && uvicorn backend.app:app --reload"
start "GrievanceAI Frontend" cmd /k "cd frontend && npm run dev"

echo Servers starting in new windows...
