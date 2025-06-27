#!/bin/bash

# CI Health Check Script
set -e

echo "🏥 Running CI health check..."

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version

# Check database connection
echo "📋 Checking database connection..."
if [ -n "$DATABASE_URL" ]; then
    echo "✅ DATABASE_URL is set"
    
    # Extract database details for connection test
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    
    if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
        echo "🔍 Testing database connection to $DB_HOST:$DB_PORT..."
        
        # Wait for database to be ready
        timeout 30s bash -c "until pg_isready -h $DB_HOST -p $DB_PORT; do sleep 1; done" || {
            echo "❌ Database connection failed"
            exit 1
        }
        
        echo "✅ Database connection successful"
    else
        echo "⚠️  Could not parse database host/port from URL"
    fi
else
    echo "❌ DATABASE_URL environment variable not set"
    exit 1
fi

# Check application build
echo "📋 Checking application build..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
else
    echo "❌ package.json not found"
    exit 1
fi

# Check test configuration
echo "📋 Checking test configuration..."
if [ -f "jest.config.js" ]; then
    echo "✅ Jest configuration found"
else
    echo "❌ Jest configuration not found"
    exit 1
fi

# Check if tests exist
TEST_COUNT=$(find tests/ -name "*.test.js" -o -name "*.test.ts" 2>/dev/null | wc -l)
echo "📊 Found $TEST_COUNT test files"

if [ "$TEST_COUNT" -eq 0 ]; then
    echo "⚠️  No test files found"
else
    echo "✅ Test files found"
fi

# Check Keploy setup
echo "📋 Checking Keploy setup..."
if [ -f "keploy.yml" ]; then
    echo "✅ Keploy configuration found"
    
    if [ -d "keploy/test-sets" ]; then
        KEPLOY_TESTS=$(find keploy/test-sets -name "*.yaml" -o -name "*.yml" 2>/dev/null | wc -l)
        echo "📊 Found $KEPLOY_TESTS Keploy test files"
    else
        echo "ℹ️  No Keploy test data found (tests will be skipped)"
    fi
else
    echo "ℹ️  Keploy configuration not found (tests will be skipped)"
fi

echo "🎉 Health check completed successfully!" 