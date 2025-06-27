# PowerShell script for Keploy on Windows
Write-Host "🎬 Keploy Recording for Windows" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Load .env file if it exists
if (Test-Path ".env") {
    Write-Host "📁 Loading .env file..." -ForegroundColor Yellow
    Get-Content .env | ForEach-Object {
        if ($_ -match "^(.+)=(.+)$" -and !$_.StartsWith("#")) {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Loaded .env" -ForegroundColor Green
}
elseif (Test-Path ".env.local") {
    Write-Host "📁 Loading .env.local file..." -ForegroundColor Yellow
    Get-Content .env.local | ForEach-Object {
        if ($_ -match "^(.+)=(.+)$" -and !$_.StartsWith("#")) {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Host "✅ Loaded .env.local" -ForegroundColor Green
}

# Check DATABASE_URL
$databaseUrl = $env:DATABASE_URL
if (-not $databaseUrl) {
    Write-Host "❌ DATABASE_URL not found" -ForegroundColor Red
    Write-Host "Please add DATABASE_URL to your .env file" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit
}

# Convert Windows path to Unix format for Docker
$currentPath = (Get-Location).Path
$dockerPath = "/" + $currentPath.Substring(0,1).ToLower() + $currentPath.Substring(2).Replace("\", "/")

Write-Host "✅ Using database: $($databaseUrl -replace '://.*@', '://***:***@')" -ForegroundColor Green
Write-Host "🐳 Docker path: $dockerPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "What would you like to do?" -ForegroundColor Yellow
Write-Host "1) Start recording API tests"
Write-Host "2) Run existing tests"
Write-Host "3) Exit"
$choice = Read-Host "Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "🎬 Starting Keploy recording..." -ForegroundColor Green
        Write-Host "📡 Recording API calls... Make your API requests now!" -ForegroundColor Yellow
        Write-Host "Press Ctrl+C to stop recording" -ForegroundColor Yellow
        
        docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host `
            -v "${dockerPath}:${dockerPath}" -w "$dockerPath" `
            -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf `
            -v /var/run/docker.sock:/var/run/docker.sock `
            -e DATABASE_URL="$databaseUrl" -e NODE_ENV="development" `
            --rm ghcr.io/keploy/keploy record -c "npm start"
    }
    "2" {
        Write-Host "🧪 Running Keploy tests..." -ForegroundColor Green
        
        docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host `
            -v "${dockerPath}:${dockerPath}" -w "$dockerPath" `
            -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf `
            -v /var/run/docker.sock:/var/run/docker.sock `
            -e DATABASE_URL="$databaseUrl" -e NODE_ENV="development" `
            --rm ghcr.io/keploy/keploy test -c "npm start" --delay 10
            
        Write-Host "✅ Tests completed!" -ForegroundColor Green
    }
    "3" {
        Write-Host "👋 Goodbye!" -ForegroundColor Green
        exit
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        Read-Host "Press Enter to exit"
    }
} 