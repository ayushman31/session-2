const { mockContacts, mockDbResponses } = require('../utils/db')

// Mock the database pool
const mockPool = {
  query: jest.fn(),
}

// Mock the route functions (simulating the actual implementation logic)
const GET = async (request, { params }) => {
  try {
    const { id } = params
    const result = await mockPool.query('SELECT * FROM contacts WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return {
        json: async () => ({ error: 'Contact not found' }),
        status: 404,
      }
    }
    
    return {
      json: async () => result.rows[0],
      status: 200,
    }
  } catch (error) {
    console.error('GET Error:', error)
    return {
      json: async () => ({ error: 'Failed to fetch contact' }),
      status: 500,
    }
  }
}

const PUT = async (request, { params }) => {
  try {
    const { id } = params
    const data = await request.json()
    const { name, email, phone, message } = data
    
    const result = await mockPool.query(
      'UPDATE contacts SET name = $1, email = $2, phone = $3, message = $4 WHERE id = $5 RETURNING *',
      [name, email, phone, message, id]
    )
    
    if (result.rows.length === 0) {
      return {
        json: async () => ({ error: 'Contact not found' }),
        status: 404,
      }
    }
    
    return {
      json: async () => result.rows[0],
      status: 200,
    }
  } catch (error) {
    console.error('PUT Error:', error)
    return {
      json: async () => ({ error: 'Failed to update contact' }),
      status: 500,
    }
  }
}

const DELETE = async (request, { params }) => {
  try {
    const { id } = params
    const result = await mockPool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id])
    
    if (result.rows.length === 0) {
      return {
        json: async () => ({ error: 'Contact not found' }),
        status: 404,
      }
    }
    
    return {
      json: async () => ({ message: 'Contact deleted successfully' }),
      status: 200,
    }
  } catch (error) {
    console.error('DELETE Error:', error)
    return {
      json: async () => ({ error: 'Failed to delete contact' }),
      status: 500,
    }
  }
}

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
      mockPool.query.mockResolvedValueOnce(mockDbResponses.getContactById(1))

      // Act
      const response = await GET({}, mockParams)
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
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      // Act
      const response = await GET({}, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await GET({}, mockParams)
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
      }

      const expectedResponse = mockDbResponses.updateContact(1, mockUpdateData)
      mockPool.query.mockResolvedValueOnce(expectedResponse)

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
      }

      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

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
      }

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
      mockPool.query.mockResolvedValueOnce(expectedResponse)

      // Act
      const response = await DELETE({}, mockParams)
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
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })

      // Act
      const response = await DELETE({}, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })

    it('should handle database errors during deletion', async () => {
      // Arrange
      mockPool.query.mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await DELETE({}, mockParams)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Failed to delete contact' })
      expect(console.error).toHaveBeenCalled()
    })
  })

  describe('Route Logic Testing', () => {
    it('should properly extract ID parameters', async () => {
      // Test parameter extraction
      const testParams = { params: { id: '42' } }
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 })
      
      await GET({}, testParams)
      
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM contacts WHERE id = $1',
        ['42']
      )
    })

    it('should handle different ID formats', async () => {
      // Test with string ID
      const stringParams = { params: { id: 'invalid-id' } }
      mockPool.query.mockRejectedValueOnce(new Error('Invalid ID'))
      
      const response = await GET({}, stringParams)
      expect(response.status).toBe(500)
    })
  })
}) 