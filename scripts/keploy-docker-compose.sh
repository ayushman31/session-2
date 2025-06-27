#!/bin/bash

echo "=== Starting Keploy Recording with Docker Compose ==="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down -v

# Build and start the services
echo "🔨 Building and starting services..."
docker-compose up --build -d postgres app

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if app is running
if ! docker-compose ps | grep -q "contacts-app.*running"; then
    echo "❌ Application container failed to start. Checking logs..."
    docker-compose logs app
    exit 1
fi

echo "✅ Services are running!"

# Start Keploy recording
echo "🎬 Starting Keploy recording..."
docker-compose run --rm keploy record -c "cd /workspace && docker-compose exec app pnpm dev"

echo "📝 Recording completed. Check the 'keploy' directory for recorded test cases."
echo "🔗 You can now run: bash scripts/keploy-test.sh to replay the tests"

# Clean up
echo "🧹 Cleaning up..."
docker-compose down 