#!/bin/bash

# CI script to prepare Keploy tests
set -e

echo "🔧 Preparing Keploy tests for CI..."

# Check if Keploy test directory exists
KEPLOY_TEST_DIR="./keploy/test-sets"

if [ ! -d "$KEPLOY_TEST_DIR" ]; then
    echo "❌ Keploy test directory not found: $KEPLOY_TEST_DIR"
    echo "ℹ️  To generate Keploy tests:"
    echo "   1. Run: npm run keploy:record"
    echo "   2. Make API calls to generate test data"
    echo "   3. Commit the generated test files"
    exit 0
fi

# Check if there are any test files
TEST_FILES=$(find "$KEPLOY_TEST_DIR" -name "*.yaml" -o -name "*.yml" | wc -l)

if [ "$TEST_FILES" -eq 0 ]; then
    echo "❌ No Keploy test files found in $KEPLOY_TEST_DIR"
    echo "ℹ️  Directory exists but contains no test files"
    exit 0
fi

echo "✅ Found $TEST_FILES Keploy test file(s)"

# Validate test files
echo "🔍 Validating Keploy test files..."

for file in $(find "$KEPLOY_TEST_DIR" -name "*.yaml" -o -name "*.yml"); do
    if ! python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
        echo "❌ Invalid YAML in file: $file"
        exit 1
    fi
done

echo "✅ All Keploy test files are valid"

# Check Keploy configuration
if [ ! -f "keploy.yml" ]; then
    echo "⚠️  keploy.yml configuration file not found"
    echo "ℹ️  Using default Keploy configuration"
else
    echo "✅ Keploy configuration file found"
fi

echo "🎉 Keploy tests ready for CI execution"
exit 0 