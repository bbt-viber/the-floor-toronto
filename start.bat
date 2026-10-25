@echo off
title The Floor Toronto
cd /d "%~dp0"

echo Starting The Floor Toronto...

where agy-node >nul 2>nul
if %errorlevel% equ 0 (
  start "" http://localhost:3000
  agy-node server.js
  goto end
)

where node >nul 2>nul
if %errorlevel% equ 0 (
  start "" http://localhost:3000
  node server.js
  goto end
)

:: If node is not found, launch directly in default browser
echo Launching directly in your browser...
start "" "%~dp0index.html"

:end
