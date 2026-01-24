@echo off
echo ===================================================
echo Testing Next.js API Routing...
echo ===================================================
echo.
echo 1. Testing Test Proxy...
curl -s http://localhost:3000/api/test-proxy
echo.
echo.
echo 2. Testing Tracking API directly (ID 13)...
curl -s http://localhost:3000/api/complaints/13/status
echo.
echo.
echo 3. Testing Generic Complaints API...
curl -s http://localhost:3000/api/complaints
echo.
echo.
echo ===================================================
echo If "Testing Tracking API" returns "BACKEND_ERROR" or "Unable to fetch complaints", 
echo then Next.js is misrouting the request.
echo ===================================================
pause
