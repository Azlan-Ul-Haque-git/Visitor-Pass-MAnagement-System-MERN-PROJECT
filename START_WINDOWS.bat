@echo off
echo ========================================
echo  Visitor Pass Management System
echo ========================================
echo.
echo Step 1: Starting Backend Server...
start cmd /k "cd backend && npm run dev"
timeout /t 3 >nul
echo Step 2: Starting Frontend...
start cmd /k "cd frontend && npm start"
echo.
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
