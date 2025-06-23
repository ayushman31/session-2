// Setup for integration tests
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test_db'

// Increase timeout for integration tests
jest.setTimeout(30000) 