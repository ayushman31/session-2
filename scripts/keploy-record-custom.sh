#!/bin/bash

echo "🎬 Starting Keploy Recording with Your Custom Database..."

# Load environment variables from .env.local or set manually
if [ -f ".env.local" ]; then
    echo "📁 Loading variables from .env.local"
    source .env.local
else
    echo "⚠️  .env.local not found. Please set DATABASE_URL manually:"
    echo "   export DATABASE_URL='postgresql://username:password@host:5432/database'"
    echo "   Or create .env.local file (see env-template.txt)"
fi

# Verify DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not set. Please configure your database connection first."
    echo "📖 See env-template.txt for examples"
    exit 1
fi

echo "✅ Using database: $(echo $DATABASE_URL | sed 's/\/\/.*@/\/\/***:***@/')"
echo "📡 Recording API calls... Make your API requests now!"
echo "Press Ctrl+C to stop recording"

# Start recording with Keploy using your custom database
docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v $(pwd):$(pwd) -w $(pwd) -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock --rm -e DATABASE_URL="$DATABASE_URL" -e NODE_ENV="$NODE_ENV" ghcr.io/keploy/keploy record -c "npm start" 