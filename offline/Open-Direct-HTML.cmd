@echo off
cd /d "%~dp0"
if exist "打开系统.html" (
    start "" "%~dp0打开系统.html"
) else (
    echo open html file not found.
    pause
)
