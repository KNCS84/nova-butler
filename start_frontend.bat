@echo off
title NOVA Web Frontend
cd /d "%~dp0"
if not exist "node_modules\" (
    echo ========================================================
    echo node_modules not found. Installing dependencies...
    echo (This is a one-time install, please wait 30-60 seconds)
    echo ========================================================
    call npm install
)
echo Starting NOVA Web Frontend on http://localhost:3000...
npm run dev
pause
