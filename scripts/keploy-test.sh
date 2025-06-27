#!/bin/bash

echo "🧪 Running Keploy Tests..."

# Set environment variables
export DATABASE_URL="postgresql://testuser:testpass@localhost:5432/contacts_test"
export NODE_ENV="development"

echo "🔍 Executing recorded test cases..."

# Run tests with Keploy
docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v $(pwd):$(pwd) -w $(pwd) -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock --rm ghcr.io/keploy/keploy test -c "pnpm start" --delay 10

echo "✅ Keploy tests completed!" 