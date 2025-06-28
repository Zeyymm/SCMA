# SCMA Development Environment Setup Script
# Sequential MCP + Context7 Implementation
# This script will help you install all required tools for mobile development

Write-Host "🚀 SCMA Development Environment Setup" -ForegroundColor Green
Write-Host "Sequential MCP + Context7 Implementation" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to download and install software
function Install-Software($name, $url, $installer) {
    Write-Host "📥 Downloading $name..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Host "✅ Downloaded $name successfully" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Failed to download $name" -ForegroundColor Red
        Write-Host "Please download manually from: $url" -ForegroundColor Yellow
        return $false
    }
}

# Check current status
Write-Host "🔍 Checking current installation status..." -ForegroundColor Cyan

$gitInstalled = Test-Command "git"
$nodeInstalled = Test-Command "node"
$npmInstalled = Test-Command "npm"

Write-Host "Git installed: $(if($gitInstalled){'✅ Yes'}else{'❌ No'})" -ForegroundColor $(if($gitInstalled){'Green'}else{'Red'})
Write-Host "Node.js installed: $(if($nodeInstalled){'✅ Yes'}else{'❌ No'})" -ForegroundColor $(if($nodeInstalled){'Green'}else{'Red'})
Write-Host "npm installed: $(if($npmInstalled){'✅ Yes'}else{'❌ No'})" -ForegroundColor $(if($npmInstalled){'Green'}else{'Red'})
Write-Host ""

# Install Git if not present
if (-not $gitInstalled) {
    Write-Host "🔧 Installing Git for Windows..." -ForegroundColor Yellow
    
    $gitUrl = "https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe"
    $gitInstaller = "$env:TEMP\GitInstaller.exe"
    
    if (Install-Software "Git" $gitUrl $gitInstaller) {
        Write-Host "🚀 Starting Git installation..." -ForegroundColor Yellow
        Write-Host "⚠️  Please use DEFAULT SETTINGS during installation" -ForegroundColor Yellow
        Write-Host "⚠️  Make sure 'Git from command line' option is selected" -ForegroundColor Yellow
        
        Start-Process -FilePath $gitInstaller -Wait
        Remove-Item $gitInstaller -ErrorAction SilentlyContinue
        
        Write-Host "✅ Git installation completed" -ForegroundColor Green
        Write-Host "⚠️  Please RESTART PowerShell after installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Git is already installed" -ForegroundColor Green
    git --version
}

Write-Host ""

# Install Node.js if not present
if (-not $nodeInstalled) {
    Write-Host "🔧 Installing Node.js..." -ForegroundColor Yellow
    
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\NodeInstaller.msi"
    
    if (Install-Software "Node.js" $nodeUrl $nodeInstaller) {
        Write-Host "🚀 Starting Node.js installation..." -ForegroundColor Yellow
        Write-Host "⚠️  Please use DEFAULT SETTINGS during installation" -ForegroundColor Yellow
        
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$nodeInstaller`" /quiet" -Wait
        Remove-Item $nodeInstaller -ErrorAction SilentlyContinue
        
        Write-Host "✅ Node.js installation completed" -ForegroundColor Green
        Write-Host "⚠️  Please RESTART PowerShell after installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Node.js is already installed" -ForegroundColor Green
    node --version
    npm --version
}

Write-Host ""

# Install Expo CLI if Node.js is available
if (Test-Command "npm") {
    Write-Host "🔧 Installing Expo CLI..." -ForegroundColor Yellow
    
    try {
        npm install -g @expo/cli@latest
        Write-Host "✅ Expo CLI installed successfully" -ForegroundColor Green
        expo --version
    } catch {
        Write-Host "❌ Failed to install Expo CLI" -ForegroundColor Red
        Write-Host "Please run: npm install -g @expo/cli@latest" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Skipping Expo CLI installation (Node.js required)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📱 Mobile Testing Setup:" -ForegroundColor Cyan
Write-Host "1. Install Expo Go app on your phone from app store" -ForegroundColor White
Write-Host "2. Make sure your phone and computer are on the same WiFi" -ForegroundColor White
Write-Host "3. Your phone should have SDK 53 support" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps After Installation:" -ForegroundColor Cyan
Write-Host "1. RESTART PowerShell" -ForegroundColor Yellow
Write-Host "2. Navigate to project: cd C:\Users\Azeem\Documents\augment-projects\fyp1" -ForegroundColor White
Write-Host "3. Run: git --version (should work)" -ForegroundColor White
Write-Host "4. Run: node --version (should work)" -ForegroundColor White
Write-Host "5. Run: npm install (install project dependencies)" -ForegroundColor White
Write-Host "6. Run: npm start (start development server)" -ForegroundColor White

Write-Host ""
Write-Host "🔧 If you need to install manually:" -ForegroundColor Cyan
Write-Host "Git: https://git-scm.com/download/win" -ForegroundColor White
Write-Host "Node.js: https://nodejs.org/ (LTS version)" -ForegroundColor White

Write-Host ""
Write-Host "✅ Setup script completed!" -ForegroundColor Green
Write-Host "Please restart PowerShell and test the installations" -ForegroundColor Yellow
