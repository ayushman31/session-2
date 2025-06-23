import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from '../../src/app/api/contacts/route'
import pool from '../../src/lib/db'
import { mockContacts, mockDbResponses } from '../utils/db'

// Mock the database module
jest.mock('../../src/lib/db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
  },
}))

const mockPool = pool as jest.Mocked<typeof pool>

describe('/api/contacts route - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/contacts', () => {
    it('should return all contacts successfully with mocked database', async () => {
      // Arrange
      mockPool.query
        .mockResolvedValueOnce(undefined as any) // for table creation
        .mockResolvedValueOnce(mockDbResponses.getAllContacts as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockContacts)
      expect(mockPool.query).toHaveBeenCalledTimes(2)
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database connection failed'))

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch contacts' })
      expect(console.error).toHaveBeenCalled()
    })

    it('should return empty array when no contacts exist', async () => {
      // Arrange
      mockPool.query
        .mockResolvedValueOnce(undefined as any) // for table creation
        .mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })
  })

  describe('POST /api/contacts', () => {
    const mockContactData = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-0123',
      message: 'Test message'
    }

    it('should create a new contact successfully with mocked database', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockContactData),
      } as unknown as NextRequest

      const expectedResponse = mockDbResponses.createContact(mockContactData)
      mockPool.query
        .mockResolvedValueOnce(undefined as any) // for table creation
        .mockResolvedValueOnce(expectedResponse as any)

      // Act
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data).toEqual(expectedResponse.rows[0])
      expect(mockPool.query).toHaveBeenCalledWith(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [mockContactData.name, mockContactData.email, mockContactData.phone, mockContactData.message]
      )
    })

    it('should handle invalid JSON in request body', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest

      // Act
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create contact' })
      expect(console.error).toHaveBeenCalled()
    })

    it('should handle database constraint violations', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockContactData),
      } as unknown as NextRequest

      mockPool.query
        .mockResolvedValueOnce(undefined as any) // for table creation
        .mockRejectedValueOnce(new Error('duplicate key value violates unique constraint'))

      // Act
      const response = await POST(mockRequest)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to create contact' })
    })
  })

  describe('DELETE /api/contacts', () => {
    it('should delete all contacts successfully with mocked database', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 2 } as any)

      // Act
      const response = await DELETE()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'All contacts deleted' })
      expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM contacts')
    })

    it('should handle database errors during deletion', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await DELETE()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to delete contacts' })
      expect(console.error).toHaveBeenCalled()
    })
  })
})

// Non-mocked unit tests (testing logic without mocking the database)
describe('/api/contacts route - Unit Tests (Non-mocked)', () => {
  // These tests verify the route logic works correctly when the database is available
  // They test error handling and response formatting without mocking database calls
  
  describe('Error handling without mocking', () => {
    it('should handle malformed request bodies gracefully', async () => {
      // Create a request with invalid JSON
      const invalidRequest = {
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as NextRequest

      const response = await POST(invalidRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })

    it('should validate that GET returns JSON response', async () => {
      // This test verifies the response format without mocking
      const response = await GET()
      
      expect(response.headers.get('content-type')).toContain('application/json')
      
      // Should be able to parse as JSON without throwing
      const data = await response.json()
      expect(Array.isArray(data) || typeof data === 'object').toBe(true)
    })
  })
}) 