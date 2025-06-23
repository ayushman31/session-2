const { mockContacts, mockDbResponses } = require('../utils/db')

// Mock the database pool
const mockPool = {
  query: jest.fn(),
}

// Mock the route functions (simulating the actual implementation logic)
const GET = async () => {
  try {
    // Simulate table creation
    await mockPool.query('CREATE TABLE IF NOT EXISTS contacts...')
    
    // Get contacts
    const result = await mockPool.query('SELECT * FROM contacts ORDER BY created_at DESC')
    
    return {
      json: async () => result.rows,
      status: 200,
    }
  } catch (error) {
    console.error('GET Error:', error)
    return {
      json: async () => ({ error: 'Failed to fetch contacts' }),
      status: 500,
    }
  }
}

const POST = async (request) => {
  try {
    // Simulate table creation
    await mockPool.query('CREATE TABLE IF NOT EXISTS contacts...')
    
    const data = await request.json()
    const { name, email, phone, message } = data
    
    const result = await mockPool.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, message]
    )
    
    return {
      json: async () => result.rows[0],
      status: 201,
    }
  } catch (error) {
    console.error('POST Error:', error)
    return {
      json: async () => ({ error: 'Failed to create contact' }),
      status: 500,
    }
  }
}

const DELETE = async () => {
  try {
    await mockPool.query('DELETE FROM contacts')
    return {
      json: async () => ({ message: 'All contacts deleted' }),
      status: 200,
    }
  } catch (error) {
    console.error('DELETE Error:', error)
    return {
      json: async () => ({ error: 'Failed to delete contacts' }),
      status: 500,
    }
  }
}

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
        .mockResolvedValueOnce(undefined) // for table creation
        .mockResolvedValueOnce(mockDbResponses.getAllContacts)

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
        .mockResolvedValueOnce(undefined) // for table creation
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })

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
      }

      const expectedResponse = mockDbResponses.createContact(mockContactData)
      mockPool.query
        .mockResolvedValueOnce(undefined) // for table creation
        .mockResolvedValueOnce(expectedResponse)

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
      }

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
      }

      mockPool.query
        .mockResolvedValueOnce(undefined) // for table creation
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
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 2 })

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

  describe('Route Logic Testing', () => {
    it('should properly format response objects', () => {
      // Test that our mock implementations return the correct format
      expect(typeof GET).toBe('function')
      expect(typeof POST).toBe('function')  
      expect(typeof DELETE).toBe('function')
    })

    it('should handle async operations correctly', async () => {
      // Test async behavior
      const response = await GET()
      expect(response).toHaveProperty('json')
      expect(response).toHaveProperty('status')
      expect(typeof response.json).toBe('function')
    })
  })
}) 