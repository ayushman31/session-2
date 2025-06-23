import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '../../src/app/api/contacts/[id]/route'
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

describe('/api/contacts/[id] route - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mockParams = { params: { id: '1' } }

  describe('GET /api/contacts/[id]', () => {
    it('should return a specific contact successfully with mocked database', async () => {
      // Arrange
      const expectedContact = mockContacts[0]
      mockPool.query.mockResolvedValueOnce(mockDbResponses.getContactById(1) as any)

      // Act
      const response = await GET({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(expectedContact)
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM contacts WHERE id = $1',
        ['1']
      )
    })

    it('should return 404 when contact not found', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      // Act
      const response = await GET({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await GET({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to fetch contact' })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('PUT /api/contacts/[id]', () => {
    const mockUpdateData = {
      name: 'Updated Name',
      email: 'updated@example.com',
      phone: '555-9999',
      message: 'Updated message'
    }

    it('should update a contact successfully with mocked database', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockUpdateData),
      } as unknown as NextRequest

      const expectedResponse = mockDbResponses.updateContact(1, mockUpdateData)
      mockPool.query.mockResolvedValueOnce(expectedResponse as any)

      // Act
      const response = await PUT(mockRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(expectedResponse.rows[0])
      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE contacts SET name = $1, email = $2, phone = $3, message = $4 WHERE id = $5 RETURNING *',
        [mockUpdateData.name, mockUpdateData.email, mockUpdateData.phone, mockUpdateData.message, '1']
      )
    })

    it('should return 404 when updating non-existent contact', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockResolvedValue(mockUpdateData),
      } as unknown as NextRequest

      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      // Act
      const response = await PUT(mockRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })

    it('should handle invalid JSON in request body', async () => {
      // Arrange
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest

      // Act
      const response = await PUT(mockRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to update contact' })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/contacts/[id]', () => {
    it('should delete a contact successfully with mocked database', async () => {
      // Arrange
      const expectedResponse = mockDbResponses.deleteContact(1)
      mockPool.query.mockResolvedValueOnce(expectedResponse as any)

      // Act
      const response = await DELETE({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Contact deleted successfully' })
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM contacts WHERE id = $1 RETURNING *',
        ['1']
      )
    })

    it('should return 404 when deleting non-existent contact', async () => {
      // Arrange
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 } as any)

      // Act
      const response = await DELETE({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })

    it('should handle database errors during deletion', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await DELETE({} as NextRequest, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to delete contact' })
      expect(console.error).toHaveBeenCalled()
    })
  })
})

// Non-mocked unit tests
describe('/api/contacts/[id] route - Unit Tests (Non-mocked)', () => {
  describe('Parameter validation without mocking', () => {
    const mockParams = { params: { id: 'invalid-id' } }

    it('should handle invalid ID parameters gracefully', async () => {
      // Test with invalid ID - should still attempt the query but likely fail gracefully
      const response = await GET({} as NextRequest, mockParams)
      
      // Response should be JSON and handle the error
      expect(response.headers.get('content-type')).toContain('application/json')
      
      const data = await response.json()
      expect(data).toHaveProperty('error')
    })
  })
}) 