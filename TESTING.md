# Testing Documentation

This document describes the comprehensive testing suite for the Contacts Management Application.

## Overview

The testing suite includes three types of tests focused on backend logic:
1. **Unit Tests** - Test individual API route functions with both mocked and non-mocked approaches
2. **Integration Tests** - Test API routes with actual database interactions
3. **API Tests** - End-to-end tests that verify API endpoints functionality

## Test Coverage Goals

- **Target Coverage**: 70% minimum
- **Current Coverage**: Run `npm run test:coverage-report` to see current coverage
- **Coverage Types**: Statements, Branches, Functions, Lines

## Test Structure

```
session2/
└── tests/
    ├── unit/
    │   ├── contacts-route.test.ts             # Unit tests for /api/contacts
    │   └── contacts-id-route.test.ts          # Unit tests for /api/contacts/[id]
    ├── integration/
    │   └── contacts.integration.test.ts       # Integration tests
    ├── api/
    │   └── contacts.api.test.ts               # End-to-end API tests
    ├── setup/
    │   ├── api.setup.js                       # API test setup
    │   └── integration.setup.js               # Integration test setup
    └── utils/
        └── db.ts                              # Test utilities
```

## Test Types Explained

### 1. Unit Tests (Mocked)

**Location**: `tests/unit/contacts-route.test.ts`, `tests/unit/contacts-id-route.test.ts`

**Purpose**: Test individual API route handlers with mocked database connections

**Key Features**:
- Database operations are mocked using Jest
- Tests focus on business logic and error handling
- Fast execution without database dependencies
- Tests both success and failure scenarios

**Example**:
```typescript
// Mock the database module
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}))

// Test successful contact creation
it('should create a new contact successfully with mocked database', async () => {
  mockPool.query
    .mockResolvedValueOnce(undefined as any) // table creation
    .mockResolvedValueOnce(mockDbResponses.createContact(mockContactData) as any)
    
  const response = await POST(mockRequest)
  // Assertions...
})
```

### 2. Unit Tests (Non-mocked)

**Location**: Same files as mocked tests, separate describe blocks

**Purpose**: Test route logic without mocking database calls to verify error handling

**Key Features**:
- Tests actual error handling paths
- Verifies response formatting
- Tests malformed request handling

### 3. Integration Tests

**Location**: `tests/integration/contacts.integration.test.ts`

**Purpose**: Test API routes with actual database interactions

**Key Features**:
- Uses real database connection (test database)
- Tests complete CRUD operations
- Verifies data persistence
- Tests database constraints and transactions

**Setup**:
```typescript
beforeEach(async () => {
  await clearTestDb(pool)
  await seedTestDb(pool)
})
```

### 4. API Tests (End-to-End)

**Location**: `tests/api/contacts.api.test.ts`

**Purpose**: Test complete API endpoints as they would be used by clients

**Key Features**:
- Uses Supertest to make HTTP requests
- Tests complete request/response cycle
- Verifies HTTP status codes and headers
- Tests API contract compliance

**Example**:
```typescript
it('should create a new contact with valid data', async () => {
  const response = await request(server)
    .post('/api/contacts')
    .send(validContact)
    .expect(201)
    .expect('Content-Type', /json/)
    
  expect(response.body).toHaveProperty('id')
  // More assertions...
})
```



## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# API tests only
npm run test:api

# Watch mode
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage-report
```

## Test Database Setup

### Environment Variables

For integration and API tests, ensure you have a test database:

```bash
# .env.test
DATABASE_URL=postgres://test_user:test_password@localhost:5432/test_contacts_db
NODE_ENV=test
```

### Database Requirements

- PostgreSQL instance running
- Test database created
- Proper permissions for test user

## Coverage Metrics

The test suite tracks four types of coverage:

1. **Statements**: Percentage of code statements executed
2. **Branches**: Percentage of code branches (if/else) tested
3. **Functions**: Percentage of functions called
4. **Lines**: Percentage of code lines executed

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Terminal**: Summary displayed after test run
- **HTML**: Detailed report in `coverage/lcov-report/index.html`
- **LCOV**: Machine-readable format in `coverage/lcov.info`

## Test Data

### Mock Data

Test utilities provide consistent mock data:

```typescript
export const mockContacts = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    message: 'Hello world',
    created_at: new Date().toISOString(),
  },
  // More mock data...
]
```

### Database Seeding

Tests automatically seed and clean the database:

```typescript
export async function seedTestDb(pool: Pool) {
  // Create table if not exists
  // Insert mock data
}

export async function clearTestDb(pool: Pool) {
  await pool.query('DELETE FROM contacts')
}
```

## API Endpoints Coverage

All API endpoints are thoroughly tested:

| Endpoint | Method | Unit Tests | Integration Tests | API Tests |
|----------|--------|------------|------------------|-----------|
| `/api/contacts` | GET | ✅ | ✅ | ✅ |
| `/api/contacts` | POST | ✅ | ✅ | ✅ |
| `/api/contacts` | DELETE | ✅ | ✅ | ✅ |
| `/api/contacts/[id]` | GET | ✅ | ✅ | ✅ |
| `/api/contacts/[id]` | PUT | ✅ | ✅ | ✅ |
| `/api/contacts/[id]` | DELETE | ✅ | ✅ | ✅ |

## Error Scenarios Tested

- Database connection failures
- Invalid request data
- Missing required fields
- Duplicate email constraints
- Non-existent resource operations
- Malformed JSON requests
- Network errors
- Database transaction integrity

## Best Practices

1. **Isolation**: Each test is isolated and can run independently
2. **Cleanup**: Database is cleaned between tests
3. **Mocking**: External dependencies are mocked in unit tests
4. **Assertions**: Tests include comprehensive assertions
5. **Error Handling**: Both success and failure paths are tested
6. **Performance**: Tests run efficiently with parallel execution where possible

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure test database is running and accessible
2. **Port Conflicts**: API tests use random ports to avoid conflicts
3. **Async Operations**: All async operations are properly awaited
4. **Mock Cleanup**: Mocks are cleared between tests

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- path/to/test.file.ts

# Run tests matching pattern
npm test -- --testNamePattern="should create"
```

## Contributing

When adding new features:

1. Write unit tests for new functions
2. Add integration tests for database interactions
3. Include API tests for new endpoints
4. Update component tests for UI changes
5. Maintain >70% coverage
6. Update this documentation

## Configuration Files

- `jest.config.js` - Main Jest configuration
- `jest.setup.js` - Global test setup
- `tests/setup/*.js` - Environment-specific setup files 