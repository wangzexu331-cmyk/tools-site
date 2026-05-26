@echo off
chcp 65001 >nul
setlocal

set "PORT=8080"
set "APP_DIR=%~dp0app"
set "NODE_EXE=%~dp0runtime\node.exe"
set "NODE_SERVER=%~dp0server.cjs"
set "SERVER_SCRIPT=%~dp0server.ps1"
set "URL=http://127.0.0.1:%PORT%/"

title 隐患整改报告生成系统

echo.
echo 正在启动隐患整改报告生成系统...
echo 请不要关闭本窗口。
echo.

if not exist "%APP_DIR%\index.html" (
    echo 未找到 app\index.html。
    echo 请确认本文件与 app 文件夹在同一个离线包目录中。
    echo.
    pause
    exit /b 1
)

if exist "%NODE_EXE%" if exist "%NODE_SERVER%" (
    echo 使用离线包内置运行环境启动本地服务。
    echo 打开地址：%URL%
    echo.
    "%NODE_EXE%" "%NODE_SERVER%" %PORT%
    set "EXIT_CODE=%errorlevel%"
    echo.
    echo 本地服务已停止。如非主动关闭，请查看上方错误信息。
    echo 按任意键关闭窗口。
    pause >nul
    exit /b %EXIT_CODE%
)

where node >nul 2>nul
if %errorlevel% equ 0 if exist "%NODE_SERVER%" (
    echo 未找到内置运行环境，改用本机 Node 启动本地服务。
    echo 打开地址：%URL%
    echo.
    node "%NODE_SERVER%" %PORT%
    set "EXIT_CODE=%errorlevel%"
    echo.
    echo 本地服务已停止。如非主动关闭，请查看上方错误信息。
    echo 按任意键关闭窗口。
    pause >nul
    exit /b %EXIT_CODE%
)

if not exist "%SERVER_SCRIPT%" (
    echo 未找到 server.ps1。
    echo 请确认离线包完整，启动系统.bat、server.cjs、server.ps1、app 文件夹应在同一目录。
    echo.
    pause
    exit /b 1
)

where powershell >nul 2>nul
if %errorlevel% neq 0 (
    echo 未检测到 Windows PowerShell。
    echo 请确认当前电脑为 Windows 7 或更新版本。
    echo.
    pause
    exit /b 1
)

echo 使用 Windows 自带 PowerShell 启动本地服务。
echo 打开地址：%URL%
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%SERVER_SCRIPT%" -Port %PORT%

echo.
echo 本地服务已停止。如非主动关闭，请查看上方错误信息。
echo 按任意键关闭窗口。
pause >nul
