#!/bin/bash

echo "🚀 Setting up Keploy for Contacts API Testing..."

# Create Keploy alias for Docker
alias keploy="docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v $(pwd):$(pwd) -w $(pwd) -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock --rm ghcr.io/keploy/keploy"

echo "✅ Keploy alias created!"

# Create keploy directory for tests
mkdir -p keploy

echo "📁 Keploy test directory created!"

# Set environment variables
export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/contacts_test"
export NODE_ENV="development"

echo "🔧 Environment variables set!"

echo "🎉 Keploy setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Docker Desktop"
echo "2. Run: docker network create keploy-network"
echo "3. Run: docker-compose up -d postgres"
echo "4. Run: ./scripts/keploy-record.sh"
echo "5. Run: ./scripts/keploy-test.sh" 