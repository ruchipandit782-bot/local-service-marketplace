@echo off
title LocalFix - Development Server

echo ========================================
echo        Starting LocalFix...
echo ========================================
echo.

cd /d "%~dp0"

echo Starting Next.js server...
start "LocalFix Server" cmd /k "npm run dev"

echo Waiting for server to start...
timeout /t 5 /nobreak >nul

echo Opening LocalFix in Google Chrome...
start chrome http://localhost:3000

echo.
echo LocalFix is running at:
echo http://localhost:3000
echo.
pause