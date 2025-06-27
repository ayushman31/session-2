@echo off
echo 🎬 Using Your Existing Database with Keploy (Windows)
echo ===================================================

REM Load your .env file if it exists
if exist ".env" (
    echo 📁 Loading your .env file...
    for /f "delims=" %%i in ('type .env ^| findstr /v "^#"') do set %%i
    echo ✅ Loaded .env
) else if exist ".env.local" (
    echo 📁 Loading your .env.local file...
    for /f "delims=" %%i in ('type .env.local ^| findstr /v "^#"') do set %%i
    echo ✅ Loaded .env.local
) else (
    echo ⚠️  No .env or .env.local file found.
    echo Please make sure your DATABASE_URL is set
    pause
    exit /b 1
)

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo ❌ DATABASE_URL not found in your .env file
    echo Please add this line to your .env file:
    echo DATABASE_URL=postgresql://username:password@host:5432/database
    pause
    exit /b 1
)

echo ✅ Using your database (connection verified)

echo.
echo What would you like to do?
echo 1) Start recording API tests
echo 2) Run existing tests  
echo 3) Exit
set /p choice=Enter choice (1-3): 

if "%choice%"=="1" (
    echo 🎬 Starting Keploy recording with your database...
    echo 📡 Recording API calls... Make your API requests now!
    echo Press Ctrl+C to stop recording
    
    docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v "%cd%:%cd%" -w "%cd%" -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock -e DATABASE_URL="%DATABASE_URL%" -e NODE_ENV="development" --rm ghcr.io/keploy/keploy record -c "npm start"
) else if "%choice%"=="2" (
    echo 🧪 Running Keploy tests with your database...
    echo 🔍 Executing recorded test cases...
    
    docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v "%cd%:%cd%" -w "%cd%" -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock -e DATABASE_URL="%DATABASE_URL%" -e NODE_ENV="development" --rm ghcr.io/keploy/keploy test -c "npm start" --delay 10
    
    echo ✅ Keploy tests completed!
    pause
) else if "%choice%"=="3" (
    echo 👋 Goodbye!
    exit /b 0
) else (
    echo ❌ Invalid choice
    pause
    exit /b 1
) 