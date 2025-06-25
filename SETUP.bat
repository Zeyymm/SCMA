@echo off
echo 🚀 SCMA Development Environment Setup
echo Sequential MCP + Context7 Implementation
echo.
echo This will install Git, Node.js, and Expo CLI for mobile development
echo.
pause

REM Run PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -File "setup-dev-environment.ps1"

echo.
echo ✅ Setup completed!
echo.
echo 🎯 IMPORTANT: Please RESTART PowerShell after installation
echo.
echo 📋 Next steps:
echo 1. Restart PowerShell
echo 2. cd C:\Users\Azeem\Documents\augment-projects\fyp1
echo 3. git --version (should work)
echo 4. node --version (should work)
echo 5. npm install
echo 6. npm start
echo.
pause
