@echo off
echo 🧪 Testing Keploy Setup (Windows)...
echo ==================================

REM Set environment variables
set DATABASE_URL=postgresql://testuser:testpass@localhost:5432/contacts_test
set NODE_ENV=development
echo ✅ Environment variables set

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Check database container
docker container ls | findstr contacts-postgres >nul
if %errorlevel% neq 0 (
    echo ❌ PostgreSQL container not running. Starting it...
    docker-compose up -d postgres
    timeout /t 5 /nobreak >nul
)
echo ✅ PostgreSQL container is running

REM Check Keploy network
docker network ls | findstr keploy-network >nul
if %errorlevel% neq 0 (
    echo ❌ Keploy network not found. Creating it...
    docker network create keploy-network
)
echo ✅ Keploy network exists

echo.
echo 🎯 Quick Manual Test:
echo ===================
echo 1. Open Command Prompt/PowerShell in this directory
echo 2. Run: npm start
echo 3. In another terminal: curl http://localhost:3000/api/contacts
echo 4. If that works, run: npm run keploy:record
echo 5. In third terminal: npm run keploy:api-tests
echo.
echo 📖 See KEPLOY-GUIDE.md for detailed instructions
pause 