@echo off
echo Starting GrievanceAI Enterprise...

REM Set paths for Python and Node to ensure they are found
set "PATH=C:\Program Files\Python311;C:\Program Files\Python311\Scripts;C:\Program Files\nodejs;%PATH%"

start "GrievanceAI Backend" cmd /k "call backend\venv\Scripts\activate && uvicorn backend.app:app --reload"
start "GrievanceAI Frontend" cmd /k "cd frontend && npm run dev"

echo Servers starting in new windows...
