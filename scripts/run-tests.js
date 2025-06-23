#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Running Comprehensive Test Suite');
console.log('=====================================\n');

const tests = [
  {
    name: 'Unit Tests (Mocked)',
    command: 'npx jest tests/unit/ --testNamePattern="mocked|Unit Tests" --passWithNoTests',
    description: 'Testing individual API functions with mocked dependencies'
  },
  {
    name: 'Unit Tests (Non-mocked)',
    command: 'npx jest tests/unit/ --testNamePattern="Non-mocked" --passWithNoTests',
    description: 'Testing error handling without mocking'
  },
  {
    name: 'Integration Tests',
    command: 'npx jest tests/integration/ --passWithNoTests',
    description: 'Testing API routes with real database interactions'
  },
  {
    name: 'API Tests (End-to-End)',
    command: 'npx jest tests/api/ --passWithNoTests',
    description: 'Testing complete API endpoints with HTTP requests'
  }
];

console.log('📋 Test Types:');
tests.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}: ${test.description}`);
});

console.log('\n🚀 Starting test execution...\n');

let totalPassed = 0;
let totalFailed = 0;

tests.forEach((test) => {
  console.log(`🔍 Running: ${test.name}`);
  console.log(`Command: ${test.command}`);
  
  try {
    execSync(test.command, { stdio: 'inherit' });
    console.log(`✅ ${test.name} - PASSED\n`);
    totalPassed++;
  } catch (error) {
    console.log(`❌ ${test.name} - FAILED\n`);
    totalFailed++;
  }
});

console.log('📊 Test Summary:');
console.log('================');
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);
console.log(`📈 Success Rate: ${((totalPassed / tests.length) * 100).toFixed(1)}%`);

if (totalFailed === 0) {
  console.log('\n🎉 All test suites passed!');
  console.log('Now run: npm run test:coverage-report');
} else {
  console.log('\n⚠️ Some tests failed. Check the output above for details.');
  process.exit(1);
} 