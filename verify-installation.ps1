# SCMA Installation Verification Script
# Sequential MCP + Context7 Implementation

Write-Host "🔍 SCMA Installation Verification" -ForegroundColor Green
Write-Host "Sequential MCP + Context7 Implementation" -ForegroundColor Cyan
Write-Host ""

# Function to check if a command exists and get version
function Test-Installation($cmdname, $versionArg = "--version") {
    try {
        $version = & $cmdname $versionArg 2>$null
        if ($LASTEXITCODE -eq 0) {
            return @{
                Installed = $true
                Version = $version[0]
                Status = "✅"
                Color = "Green"
            }
        } else {
            return @{
                Installed = $false
                Version = "Not found"
                Status = "❌"
                Color = "Red"
            }
        }
    } catch {
        return @{
            Installed = $false
            Version = "Not found"
            Status = "❌"
            Color = "Red"
        }
    }
}

# Check all required tools
Write-Host "🔧 Checking Development Tools:" -ForegroundColor Cyan
Write-Host ""

$tools = @(
    @{Name = "Git"; Command = "git"},
    @{Name = "Node.js"; Command = "node"},
    @{Name = "npm"; Command = "npm"},
    @{Name = "Expo CLI"; Command = "expo"}
)

$allInstalled = $true

foreach ($tool in $tools) {
    $result = Test-Installation $tool.Command
    Write-Host "$($result.Status) $($tool.Name): $($result.Version)" -ForegroundColor $result.Color
    
    if (-not $result.Installed) {
        $allInstalled = $false
    }
}

Write-Host ""

# Check project setup if tools are available
if ($allInstalled) {
    Write-Host "🎯 Project Setup Verification:" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if we're in the right directory
    $currentDir = Get-Location
    Write-Host "📁 Current directory: $currentDir" -ForegroundColor White
    
    # Check for package.json
    if (Test-Path "package.json") {
        Write-Host "✅ package.json found" -ForegroundColor Green
        
        # Check if node_modules exists
        if (Test-Path "node_modules") {
            Write-Host "✅ node_modules found (dependencies installed)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  node_modules not found" -ForegroundColor Yellow
            Write-Host "   Run: npm install" -ForegroundColor Yellow
        }
        
        # Check SDK 53 compatibility
        Write-Host ""
        Write-Host "📱 SDK 53 Compatibility Check:" -ForegroundColor Cyan
        
        try {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json
            $expoVersion = $packageJson.dependencies.expo
            
            if ($expoVersion -like "*53*") {
                Write-Host "✅ Expo SDK 53 configured correctly" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Expo SDK version: $expoVersion" -ForegroundColor Yellow
                Write-Host "   Should be ~53.0.0 for your phone" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Could not verify package.json" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ package.json not found" -ForegroundColor Red
        Write-Host "   Make sure you're in the project directory" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "🚀 Ready to Start Development:" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. Install dependencies: npm install" -ForegroundColor White
    Write-Host "2. Verify SDK 53: npm run verify:sdk53" -ForegroundColor White
    Write-Host "3. Start development: npm start" -ForegroundColor White
    Write-Host "4. Scan QR code with Expo Go app on your phone" -ForegroundColor White
    
} else {
    Write-Host "❌ Some tools are missing. Please install them first." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Installation Commands:" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Installation "git").Installed) {
        Write-Host "Git: Download from https://git-scm.com/download/win" -ForegroundColor White
    }
    
    if (-not (Test-Installation "node").Installed) {
        Write-Host "Node.js: Download from https://nodejs.org/ (LTS version)" -ForegroundColor White
    }
    
    if (-not (Test-Installation "expo").Installed -and (Test-Installation "npm").Installed) {
        Write-Host "Expo CLI: npm install -g @expo/cli@latest" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "📱 Mobile Testing Requirements:" -ForegroundColor Cyan
Write-Host "✅ Install Expo Go app on your phone" -ForegroundColor White
Write-Host "✅ Ensure phone and computer on same WiFi" -ForegroundColor White
Write-Host "✅ Phone should support SDK 53" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Verification completed!" -ForegroundColor Green
