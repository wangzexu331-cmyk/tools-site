@echo off
setlocal
cd /d "%~dp0"

set "PORT=8080"
set "APP_DIR=%~dp0app"
set "NODE_EXE=%~dp0runtime\node.exe"
set "NODE_SERVER=%~dp0server.cjs"
set "SERVER_SCRIPT=%~dp0server.ps1"
set "LOG_FILE=%~dp0startup-log.txt"

title Hazard Governance System

echo.
echo Starting Hazard Governance System...
echo Please keep this window open while using the system.
echo.

echo [%date% %time%] Start-System.cmd launched > "%LOG_FILE%"
echo BaseDir=%~dp0 >> "%LOG_FILE%"

if not exist "%APP_DIR%\index.html" (
    echo ERROR: app\index.html was not found.
    echo Please extract the whole offline-package folder before running.
    echo [%date% %time%] app\index.html missing >> "%LOG_FILE%"
    goto END_WITH_ERROR
)

if exist "%NODE_EXE%" if exist "%NODE_SERVER%" (
    echo Using bundled runtime.
    echo If port 8080 is busy, the system will try 8081, 8082 and so on.
    echo.
    echo [%date% %time%] Using bundled node.exe >> "%LOG_FILE%"
    "%NODE_EXE%" "%NODE_SERVER%" %PORT% 1>>"%LOG_FILE%" 2>>&1
    set "EXIT_CODE=%errorlevel%"
    echo [%date% %time%] bundled node exited: %EXIT_CODE% >> "%LOG_FILE%"
    if "%EXIT_CODE%"=="0" goto END_OK
    echo Bundled runtime failed. Trying PowerShell fallback...
    echo.
)

where node >nul 2>nul
if %errorlevel% equ 0 if exist "%NODE_SERVER%" (
    echo Using system Node.js.
    echo.
    echo [%date% %time%] Using system node >> "%LOG_FILE%"
    node "%NODE_SERVER%" %PORT% 1>>"%LOG_FILE%" 2>>&1
    set "EXIT_CODE=%errorlevel%"
    echo [%date% %time%] system node exited: %EXIT_CODE% >> "%LOG_FILE%"
    if "%EXIT_CODE%"=="0" goto END_OK
    echo System Node.js failed. Trying PowerShell fallback...
    echo.
)

if not exist "%SERVER_SCRIPT%" (
    echo ERROR: server.ps1 was not found.
    echo [%date% %time%] server.ps1 missing >> "%LOG_FILE%"
    goto END_WITH_ERROR
)

where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Windows PowerShell was not found.
    echo [%date% %time%] powershell missing >> "%LOG_FILE%"
    goto END_WITH_ERROR
)

echo Using Windows PowerShell fallback.
echo.
echo [%date% %time%] Using PowerShell fallback >> "%LOG_FILE%"
powershell -NoProfile -ExecutionPolicy Bypass -File "%SERVER_SCRIPT%" -Port %PORT% 1>>"%LOG_FILE%" 2>>&1
set "EXIT_CODE=%errorlevel%"
echo [%date% %time%] powershell exited: %EXIT_CODE% >> "%LOG_FILE%"
if "%EXIT_CODE%"=="0" goto END_OK

:END_WITH_ERROR
echo.
echo Startup failed.
echo Please send me this file if it still cannot open:
echo %LOG_FILE%
echo.
echo Last log lines:
type "%LOG_FILE%"
echo.
pause
exit /b 1

:END_OK
echo.
echo System stopped.
echo.
pause
exit /b 0
