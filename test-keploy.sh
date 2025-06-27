#!/bin/bash

echo "🧪 Testing Keploy Setup..."
echo "=========================="

# Set environment variables
export DATABASE_URL=postgresql://testuser:testpass@localhost:5432/contacts_test
export NODE_ENV=development

echo "✅ Environment variables set"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi
echo "✅ Docker is running"

# Check if database container is running
if ! docker container ls | grep -q contacts-postgres; then
    echo "❌ PostgreSQL container not running. Starting it..."
    docker-compose up -d postgres
    sleep 5
fi
echo "✅ PostgreSQL container is running"

# Check if Keploy network exists
if ! docker network ls | grep -q keploy-network; then
    echo "❌ Keploy network not found. Creating it..."
    docker network create keploy-network
fi
echo "✅ Keploy network exists"

# Test if we can pull Keploy image
echo "📥 Testing Keploy Docker image..."
if docker pull ghcr.io/keploy/keploy:latest > /dev/null 2>&1; then
    echo "✅ Keploy image available"
else
    echo "⚠️  Could not pull latest Keploy image, but may work with cached version"
fi

# Create a simple curl test
echo "🌐 Testing basic API accessibility..."

# Start the app in background for testing
echo "🚀 Starting Next.js app in background..."
export DATABASE_URL=postgresql://testuser:testpass@localhost:5432/contacts_test
nohup npm start > app.log 2>&1 &
APP_PID=$!

# Wait for app to start
echo "⏳ Waiting for app to start (15 seconds)..."
sleep 15

# Test if app is responding
if curl -s http://localhost:3000/api/contacts > /dev/null; then
    echo "✅ API is responding on port 3000"
    
    # Test basic API endpoint
    echo "📡 Testing POST /api/contacts..."
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/contacts \
        -H "Content-Type: application/json" \
        -d '{"name":"Test User","email":"test@example.com","message":"Keploy test"}')
    
    if [[ $RESPONSE == *"Test User"* ]]; then
        echo "✅ API POST endpoint working"
    else
        echo "⚠️  API POST might have issues: $RESPONSE"
    fi
    
    # Test GET endpoint
    echo "📡 Testing GET /api/contacts..."
    GET_RESPONSE=$(curl -s http://localhost:3000/api/contacts)
    if [[ $GET_RESPONSE == *"["* ]]; then
        echo "✅ API GET endpoint working"
    else
        echo "⚠️  API GET might have issues: $GET_RESPONSE"
    fi
    
else
    echo "❌ API not responding on port 3000"
    echo "📋 App logs:"
    tail -10 app.log
fi

# Cleanup
echo "🧹 Cleaning up..."
kill $APP_PID 2>/dev/null
rm -f app.log

echo ""
echo "🎯 Test Results Summary:"
echo "========================"
echo "If all items show ✅, your Keploy setup is ready!"
echo ""
echo "Next steps to record with Keploy:"
echo "1. Run: npm run keploy:record"
echo "2. In another terminal: npm run keploy:api-tests"
echo "3. Run: npm run keploy:test"
echo ""
echo "📖 See KEPLOY-GUIDE.md for detailed instructions" 