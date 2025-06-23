# Testing Suite

This folder contains all tests for the Contacts Management Application's backend logic.

## Structure

```
tests/
├── unit/                           # Unit tests with mocked dependencies
│   ├── contacts-route.test.ts      # Tests for /api/contacts endpoints
│   └── contacts-id-route.test.ts   # Tests for /api/contacts/[id] endpoints
├── integration/                    # Integration tests with real database
│   └── contacts.integration.test.ts
├── api/                           # End-to-end API tests
│   └── contacts.api.test.ts
├── setup/                         # Test environment configuration
│   ├── api.setup.js
│   └── integration.setup.js
└── utils/                         # Test utilities and mock data
    └── db.ts
```

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only  
npm run test:api          # API tests only

# Run with coverage
npm run test:coverage

# Generate coverage report
npm run test:coverage-report
```

## Test Types

- **Unit Tests**: Test individual API route functions with mocked database
- **Integration Tests**: Test API routes with actual database interactions
- **API Tests**: End-to-end HTTP request/response testing

## Coverage Goal

- Target: 70% minimum coverage
- Focus: Application logic, API server, and database interactions

For detailed documentation, see [TESTING.md](../TESTING.md) in the project root. 