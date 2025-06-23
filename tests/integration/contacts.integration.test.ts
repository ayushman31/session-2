import { GET, POST, DELETE } from '../../src/app/api/contacts/route'
import { GET as getById, PUT, DELETE as deleteById } from '../../src/app/api/contacts/[id]/route'
import { NextRequest } from 'next/server'
import pool from '../../src/lib/db'
import { clearTestDb, seedTestDb, mockContacts } from '../utils/db'

describe('Contacts API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure we're using a test database
    if (!process.env.DATABASE_URL?.includes('test')) {
      throw new Error('Integration tests must use a test database')
    }
  })

  beforeEach(async () => {
    // Clear and seed the database before each test
    await clearTestDb(pool)
    await seedTestDb(pool)
  })

  afterAll(async () => {
    // Clean up after all tests
    await clearTestDb(pool)
    await pool.end()
  })

  describe('GET /api/contacts integration', () => {
    it('should fetch all contacts from actual database', async () => {
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(2)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('name')
      expect(data[0]).toHaveProperty('email')
      expect(data[0]).toHaveProperty('created_at')
    })

    it('should return empty array when no contacts exist', async () => {
      // Clear all contacts
      await clearTestDb(pool)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('should handle database table creation', async () => {
      // Drop the table first
      await pool.query('DROP TABLE IF EXISTS contacts')

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST /api/contacts integration', () => {
    it('should create a new contact in actual database', async () => {
      const newContact = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        phone: '555-0000',
        message: 'Integration test message'
      }

      const mockRequest = {
        json: jest.fn().mockResolvedValue(newContact),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe(newContact.name)
      expect(data.email).toBe(newContact.email)
      expect(data.phone).toBe(newContact.phone)
      expect(data.message).toBe(newContact.message)
      expect(data).toHaveProperty('created_at')

      // Verify the contact was actually created in the database
      const result = await pool.query('SELECT * FROM contacts WHERE email = $1', [newContact.email])
      expect(result.rows).toHaveLength(1)
      expect(result.rows[0].name).toBe(newContact.name)
    })

    it('should handle duplicate email constraint', async () => {
      const duplicateContact = {
        name: 'Duplicate User',
        email: 'john@example.com', // This email already exists in seeded data
        phone: '555-1111',
        message: 'Duplicate test'
      }

      const mockRequest = {
        json: jest.fn().mockResolvedValue(duplicateContact),
      } as unknown as NextRequest

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('DELETE /api/contacts integration', () => {
    it('should delete all contacts from actual database', async () => {
      // Verify contacts exist first
      const beforeResult = await pool.query('SELECT COUNT(*) FROM contacts')
      expect(parseInt(beforeResult.rows[0].count)).toBeGreaterThan(0)

      const response = await DELETE()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'All contacts deleted' })

      // Verify all contacts were deleted
      const afterResult = await pool.query('SELECT COUNT(*) FROM contacts')
      expect(parseInt(afterResult.rows[0].count)).toBe(0)
    })
  })

  describe('GET /api/contacts/[id] integration', () => {
    it('should fetch a specific contact from actual database', async () => {
      // Get the first contact's ID from the database
      const result = await pool.query('SELECT id FROM contacts LIMIT 1')
      const contactId = result.rows[0].id.toString()

      const response = await getById({} as NextRequest, { params: { id: contactId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('id')
      expect(data.id.toString()).toBe(contactId)
      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('email')
    })

    it('should return 404 for non-existent contact', async () => {
      const response = await getById({} as NextRequest, { params: { id: '99999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })
  })

  describe('PUT /api/contacts/[id] integration', () => {
    it('should update a specific contact in actual database', async () => {
      // Get the first contact's ID from the database
      const result = await pool.query('SELECT id FROM contacts LIMIT 1')
      const contactId = result.rows[0].id.toString()

      const updateData = {
        name: 'Updated Integration Name',
        email: 'updated-integration@test.com',
        phone: '555-9999',
        message: 'Updated integration message'
      }

      const mockRequest = {
        json: jest.fn().mockResolvedValue(updateData),
      } as unknown as NextRequest

      const response = await PUT(mockRequest, { params: { id: contactId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe(updateData.name)
      expect(data.email).toBe(updateData.email)
      expect(data.phone).toBe(updateData.phone)
      expect(data.message).toBe(updateData.message)

      // Verify the contact was actually updated in the database
      const verifyResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [contactId])
      expect(verifyResult.rows[0].name).toBe(updateData.name)
      expect(verifyResult.rows[0].email).toBe(updateData.email)
    })

    it('should return 404 when updating non-existent contact', async () => {
      const updateData = {
        name: 'Non-existent',
        email: 'nonexistent@test.com',
        phone: '555-0000',
        message: 'Does not exist'
      }

      const mockRequest = {
        json: jest.fn().mockResolvedValue(updateData),
      } as unknown as NextRequest

      const response = await PUT(mockRequest, { params: { id: '99999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })
  })

  describe('DELETE /api/contacts/[id] integration', () => {
    it('should delete a specific contact from actual database', async () => {
      // Get the first contact's ID from the database
      const result = await pool.query('SELECT id FROM contacts LIMIT 1')
      const contactId = result.rows[0].id.toString()

      const response = await deleteById({} as NextRequest, { params: { id: contactId } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Contact deleted successfully' })

      // Verify the contact was actually deleted from the database
      const verifyResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [contactId])
      expect(verifyResult.rows).toHaveLength(0)
    })

    it('should return 404 when deleting non-existent contact', async () => {
      const response = await deleteById({} as NextRequest, { params: { id: '99999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Contact not found' })
    })
  })

  describe('Database transaction integrity', () => {
    it('should maintain data integrity across multiple operations', async () => {
      // Create a new contact
      const newContact = {
        name: 'Transaction Test',
        email: 'transaction@test.com',
        phone: '555-1234',
        message: 'Transaction test message'
      }

      const createRequest = {
        json: jest.fn().mockResolvedValue(newContact),
      } as unknown as NextRequest

      const createResponse = await POST(createRequest)
      const createdContact = await createResponse.json()
      
      expect(createResponse.status).toBe(201)
      expect(createdContact).toHaveProperty('id')

      // Update the contact
      const updateData = {
        ...newContact,
        name: 'Updated Transaction Test'
      }

      const updateRequest = {
        json: jest.fn().mockResolvedValue(updateData),
      } as unknown as NextRequest

      const updateResponse = await PUT(updateRequest, { params: { id: createdContact.id.toString() } })
      const updatedContact = await updateResponse.json()

      expect(updateResponse.status).toBe(200)
      expect(updatedContact.name).toBe('Updated Transaction Test')

      // Delete the contact
      const deleteResponse = await deleteById({} as NextRequest, { params: { id: createdContact.id.toString() } })
      expect(deleteResponse.status).toBe(200)

      // Verify it's gone
      const getResponse = await getById({} as NextRequest, { params: { id: createdContact.id.toString() } })
      expect(getResponse.status).toBe(404)
    })
  })
}) 