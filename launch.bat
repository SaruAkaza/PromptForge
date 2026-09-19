@echo off
setlocal
set "APP_PATH=%~dp0index.html"
set "APP_PATH=%APP_PATH:\=/%"

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="file:///%APP_PATH%"
) else (
    start "" "%~dp0index.html"
)
