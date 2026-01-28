# Deployment checklist

1. Rotate any API keys that were committed previously.
2. Add secrets to your host or GitHub repo settings:
   - SECRET_KEY
   - DATABASE_URL
   - GEMINI_API_KEY (server-only)
   - STT_API_KEY (server-only)
   - BACKEND_URL (frontend)
3. Backend: ensure uvicorn is started with host 0.0.0.0 and the platform-provided PORT.
4. Frontend: set NEXT_PUBLIC_ prefixed variables only if they must be exposed to the browser.
5. CI: use GitHub Actions secrets and reference them in workflows rather than hard-coding.
6. Verify CORS and allowed origins for your backend.
