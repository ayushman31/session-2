#!/bin/bash

echo "=== Keploy Proxy Recording Setup ==="
echo "This will record API calls made to your running application"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📋 Instructions:"
echo "1. Keep this terminal open - it will run Keploy in proxy mode"
echo "2. Open a NEW terminal and run: npm run dev"
echo "3. Open a THIRD terminal and run: bash scripts/api-test-commands.sh"
echo "4. Press Ctrl+C here when done recording"
echo ""

echo "⏳ Starting Keploy proxy in 5 seconds..."
sleep 5

echo "🎬 Starting Keploy recording in proxy mode..."
echo "🔗 Keploy proxy will run on http://localhost:16789"
echo "📝 All API calls will be recorded automatically"
echo ""

# Run Keploy in proxy mode
docker run --name keploy-proxy \
    -p 16789:16789 \
    --network host \
    -v "$PWD:/workspace" \
    -w "/workspace" \
    --rm \
    ghcr.io/keploy/keploy:latest \
    record \
    --config-path="/workspace/keploy.yml"

echo ""
echo "✅ Recording completed!"
echo "📁 Check the 'keploy' directory for recorded test cases"
echo "🧪 Run tests with: bash scripts/keploy-test.sh" 