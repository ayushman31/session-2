#!/bin/bash

echo "🎬 Using Your Existing Database with Keploy..."
echo "============================================="

# Load your existing .env file
if [ -f ".env" ]; then
    echo "📁 Loading your .env file..."
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded .env"
elif [ -f ".env.local" ]; then
    echo "📁 Loading your .env.local file..."
    export $(cat .env.local | grep -v '^#' | xargs)
    echo "✅ Loaded .env.local"
else
    echo "⚠️  No .env or .env.local file found."
    echo "Please make sure your DATABASE_URL is set:"
    echo "export DATABASE_URL='your_database_url_here'"
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in your .env file"
    echo "Please add this line to your .env file:"
    echo "DATABASE_URL=postgresql://username:password@host:5432/database"
    exit 1
fi

# Hide password in output for security
SAFE_URL=$(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')
echo "✅ Using your database: $SAFE_URL"

# Fix Windows path for Docker
CURRENT_DIR=$(pwd)
# Convert Windows path to Unix format for Docker
if [[ "$CURRENT_DIR" =~ ^/[a-zA-Z]/ ]]; then
    # Already in Unix format (like /d/session2)
    DOCKER_PATH="$CURRENT_DIR"
elif [[ "$CURRENT_DIR" =~ ^[a-zA-Z]:/ ]]; then
    # Windows format (like D:/session2) - convert to Unix
    DOCKER_PATH="/$(echo $CURRENT_DIR | sed 's|^\([a-zA-Z]\):|/\L\1|' | sed 's|\\|/|g')"
else
    # Default to current directory
    DOCKER_PATH="$CURRENT_DIR"
fi

echo "🐳 Docker path: $DOCKER_PATH"

# Choose action
echo ""
echo "What would you like to do?"
echo "1) Start recording API tests"
echo "2) Run existing tests"
echo "3) Exit"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🎬 Starting Keploy recording with your database..."
        echo "📡 Recording API calls... Make your API requests now!"
        echo "Press Ctrl+C to stop recording"
        
        docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host \
            -v "$DOCKER_PATH:$DOCKER_PATH" -w "$DOCKER_PATH" \
            -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -e DATABASE_URL="$DATABASE_URL" -e NODE_ENV="development" \
            --rm ghcr.io/keploy/keploy record -c "npm start"
        ;;
    2)
        echo "🧪 Running Keploy tests with your database..."
        echo "🔍 Executing recorded test cases..."
        
        docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host \
            -v "$DOCKER_PATH:$DOCKER_PATH" -w "$DOCKER_PATH" \
            -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf \
            -v /var/run/docker.sock:/var/run/docker.sock \
            -e DATABASE_URL="$DATABASE_URL" -e NODE_ENV="development" \
            --rm ghcr.io/keploy/keploy test -c "npm start" --delay 10
        
        echo "✅ Keploy tests completed!"
        ;;
    3)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac 