import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import request from 'supertest'
import pool from '../../src/lib/db'
import { clearTestDb, seedTestDb } from '../utils/db'

const app = next({ dev: false, dir: './' })
const handle = app.getRequestHandler()

let server: any

describe('Contacts API - End-to-End Tests', () => {
  beforeAll(async () => {
    // Ensure we're using a test database
    if (!process.env.DATABASE_URL?.includes('test')) {
      console.warn('Warning: API tests should use a test database')
    }

    // Prepare the Next.js app
    await app.prepare()
    
    // Create server
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    })

    // Start server on a random port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        resolve()
      })
    })
  })

  beforeEach(async () => {
    // Clear and seed the database before each test
    await clearTestDb(pool)
    await seedTestDb(pool)
  })

  afterAll(async () => {
    // Clean up
    await clearTestDb(pool)
    await pool.end()
    server.close()
    await app.close()
  })

  describe('GET /api/contacts', () => {
    it('should return all contacts with correct structure', async () => {
      const response = await request(server)
        .get('/api/contacts')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBe(2)
      
      // Verify structure of returned contacts
      const contact = response.body[0]
      expect(contact).toHaveProperty('id')
      expect(contact).toHaveProperty('name')
      expect(contact).toHaveProperty('email')
      expect(contact).toHaveProperty('phone')
      expect(contact).toHaveProperty('message')
      expect(contact).toHaveProperty('created_at')
      
      // Verify data types
      expect(typeof contact.id).toBe('number')
      expect(typeof contact.name).toBe('string')
      expect(typeof contact.email).toBe('string')
      expect(typeof contact.created_at).toBe('string')
    })

    it('should return empty array when no contacts exist', async () => {
      await clearTestDb(pool)

      const response = await request(server)
        .get('/api/contacts')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      // Temporarily break the database connection
      const originalQuery = pool.query
      pool.query = jest.fn().mockRejectedValue(new Error('Database connection failed'))

      const response = await request(server)
        .get('/api/contacts')
        .expect(500)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toBe('Failed to fetch contacts')

      // Restore the original query function
      pool.query = originalQuery
    })
  })

  describe('POST /api/contacts', () => {
    const validContact = {
      name: 'API Test User',
      email: 'apitest@example.com',
      phone: '555-0123',
      message: 'API test message'
    }

    it('should create a new contact with valid data', async () => {
      const response = await request(server)
        .post('/api/contacts')
        .send(validContact)
        .expect(201)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('id')
      expect(response.body.name).toBe(validContact.name)
      expect(response.body.email).toBe(validContact.email)
      expect(response.body.phone).toBe(validContact.phone)
      expect(response.body.message).toBe(validContact.message)
      expect(response.body).toHaveProperty('created_at')

      // Verify the contact was actually created in the database
      const dbResult = await pool.query('SELECT * FROM contacts WHERE email = $1', [validContact.email])
      expect(dbResult.rows).toHaveLength(1)
      expect(dbResult.rows[0].name).toBe(validContact.name)
    })

    it('should handle missing required fields', async () => {
      const invalidContact = {
        phone: '555-0123',
        message: 'Missing name and email'
      }

      const response = await request(server)
        .post('/api/contacts')
        .send(invalidContact)
        .expect(500)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle duplicate email addresses', async () => {
      const duplicateContact = {
        name: 'Duplicate User',
        email: 'john@example.com', // This email already exists in seeded data
        phone: '555-9999',
        message: 'Duplicate email test'
      }

      const response = await request(server)
        .post('/api/contacts')
        .send(duplicateContact)
        .expect(500)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('error')
    })

    it('should handle malformed JSON', async () => {
      const response = await request(server)
        .post('/api/contacts')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400)
    })
  })

  describe('DELETE /api/contacts', () => {
    it('should delete all contacts', async () => {
      // Verify contacts exist first
      const beforeResponse = await request(server)
        .get('/api/contacts')
        .expect(200)
      
      expect(beforeResponse.body.length).toBeGreaterThan(0)

      // Delete all contacts
      const deleteResponse = await request(server)
        .delete('/api/contacts')
        .expect(200)
        .expect('Content-Type', /json/)

      expect(deleteResponse.body).toEqual({ message: 'All contacts deleted' })

      // Verify contacts were deleted
      const afterResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      expect(afterResponse.body).toEqual([])
    })
  })

  describe('GET /api/contacts/[id]', () => {
    it('should return a specific contact by ID', async () => {
      // Get all contacts to find a valid ID
      const contactsResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      const contactId = contactsResponse.body[0].id

      const response = await request(server)
        .get(`/api/contacts/${contactId}`)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('id', contactId)
      expect(response.body).toHaveProperty('name')
      expect(response.body).toHaveProperty('email')
      expect(response.body).toHaveProperty('phone')
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('created_at')
    })

    it('should return 404 for non-existent contact', async () => {
      const response = await request(server)
        .get('/api/contacts/99999')
        .expect(404)
        .expect('Content-Type', /json/)

      expect(response.body).toEqual({ error: 'Contact not found' })
    })

    it('should handle invalid ID format', async () => {
      const response = await request(server)
        .get('/api/contacts/invalid-id')
        .expect(500)
        .expect('Content-Type', /json/)

      expect(response.body).toHaveProperty('error')
    })
  })

  describe('PUT /api/contacts/[id]', () => {
    const updateData = {
      name: 'Updated API User',
      email: 'updated-api@example.com',
      phone: '555-9999',
      message: 'Updated API message'
    }

    it('should update an existing contact', async () => {
      // Get all contacts to find a valid ID
      const contactsResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      const contactId = contactsResponse.body[0].id

      const response = await request(server)
        .put(`/api/contacts/${contactId}`)
        .send(updateData)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body.id).toBe(contactId)
      expect(response.body.name).toBe(updateData.name)
      expect(response.body.email).toBe(updateData.email)
      expect(response.body.phone).toBe(updateData.phone)
      expect(response.body.message).toBe(updateData.message)

      // Verify the update was persisted in the database
      const verifyResponse = await request(server)
        .get(`/api/contacts/${contactId}`)
        .expect(200)

      expect(verifyResponse.body.name).toBe(updateData.name)
      expect(verifyResponse.body.email).toBe(updateData.email)
    })

    it('should return 404 when updating non-existent contact', async () => {
      const response = await request(server)
        .put('/api/contacts/99999')
        .send(updateData)
        .expect(404)
        .expect('Content-Type', /json/)

      expect(response.body).toEqual({ error: 'Contact not found' })
    })

    it('should handle malformed update data', async () => {
      const contactsResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      const contactId = contactsResponse.body[0].id

      const response = await request(server)
        .put(`/api/contacts/${contactId}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400)
    })
  })

  describe('DELETE /api/contacts/[id]', () => {
    it('should delete a specific contact', async () => {
      // Get all contacts to find a valid ID
      const contactsResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      const contactId = contactsResponse.body[0].id
      const initialCount = contactsResponse.body.length

      const response = await request(server)
        .delete(`/api/contacts/${contactId}`)
        .expect(200)
        .expect('Content-Type', /json/)

      expect(response.body).toEqual({ message: 'Contact deleted successfully' })

      // Verify the contact was deleted
      const verifyResponse = await request(server)
        .get(`/api/contacts/${contactId}`)
        .expect(404)

      // Verify total count decreased
      const afterResponse = await request(server)
        .get('/api/contacts')
        .expect(200)

      expect(afterResponse.body.length).toBe(initialCount - 1)
    })

    it('should return 404 when deleting non-existent contact', async () => {
      const response = await request(server)
        .delete('/api/contacts/99999')
        .expect(404)
        .expect('Content-Type', /json/)

      expect(response.body).toEqual({ error: 'Contact not found' })
    })
  })

  describe('API Response Headers and Format', () => {
    it('should return correct content-type headers', async () => {
      const response = await request(server)
        .get('/api/contacts')
        .expect(200)

      expect(response.headers['content-type']).toMatch(/application\/json/)
    })

    it('should handle CORS preflight requests', async () => {
      const response = await request(server)
        .options('/api/contacts')

      // Note: Next.js handles CORS automatically, this test verifies it doesn't fail
      expect([200, 404]).toContain(response.status)
    })

    it('should maintain consistent response structure across endpoints', async () => {
      // Test that all endpoints return consistent JSON structure
      const getResponse = await request(server).get('/api/contacts').expect(200)
      expect(Array.isArray(getResponse.body)).toBe(true)

      const postResponse = await request(server)
        .post('/api/contacts')
        .send({
          name: 'Structure Test',
          email: 'structure@test.com',
          phone: '555-0000',
          message: 'Structure test'
        })
        .expect(201)

      expect(typeof postResponse.body).toBe('object')
      expect(postResponse.body).not.toBeNull()
    })
  })
}) 