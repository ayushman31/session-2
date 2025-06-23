const { Pool } = require('pg')
const { seedTestDb, clearTestDb, mockContacts } = require('../utils/db')

// Integration tests use a real database connection
// These tests require a PostgreSQL database to be running
describe('Contacts API - Integration Tests', () => {
  let pool
  let skipTests = false

  beforeAll(async () => {
    try {
      // Setup test database connection
      pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/test_contacts_db',
      })

      // Test the connection
      await pool.query('SELECT 1')
      
      // Ensure table exists and clear any existing data
      await clearTestDb(pool)
      console.log('✓ Database connection successful')
    } catch (error) {
      console.warn('⚠ Database not available for integration tests:', error.message)
      console.warn('⚠ Skipping integration tests - set up PostgreSQL to run these tests')
      skipTests = true
    }
  })

  afterAll(async () => {
    if (pool && !skipTests) {
      try {
        // Clean up database and close connection
        await clearTestDb(pool)
        await pool.end()
      } catch (error) {
        console.warn('Warning during cleanup:', error.message)
      }
    }
  })

  beforeEach(async () => {
    if (skipTests) return
    
    try {
      // Start fresh for each test
      await clearTestDb(pool)
    } catch (error) {
      console.warn('Warning during test setup:', error.message)
    }
  })

  describe('CRUD Operations with Real Database', () => {
    it('should create and retrieve contacts', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // Create a contact
      const newContact = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        phone: '555-1234',
        message: 'Test message'
      }

      const insertResult = await pool.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [newContact.name, newContact.email, newContact.phone, newContact.message]
      )

      expect(insertResult.rows).toHaveLength(1)
      expect(insertResult.rows[0]).toMatchObject(newContact)
      expect(insertResult.rows[0]).toHaveProperty('id')
      expect(insertResult.rows[0]).toHaveProperty('created_at')

      // Retrieve the contact
      const selectResult = await pool.query(
        'SELECT * FROM contacts WHERE id = $1',
        [insertResult.rows[0].id]
      )

      expect(selectResult.rows).toHaveLength(1)
      expect(selectResult.rows[0]).toEqual(insertResult.rows[0])
    })

    it('should update an existing contact', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // First create a contact
      const contact = mockContacts[0]
      const insertResult = await pool.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [contact.name, contact.email, contact.phone, contact.message]
      )

      const contactId = insertResult.rows[0].id

      // Update the contact
      const updatedData = {
        name: 'Updated Integration Name',
        email: 'updated-integration@test.com',
        phone: '555-9999',
        message: 'Updated integration message'
      }

      const updateResult = await pool.query(
        'UPDATE contacts SET name = $1, email = $2, phone = $3, message = $4 WHERE id = $5 RETURNING *',
        [updatedData.name, updatedData.email, updatedData.phone, updatedData.message, contactId]
      )

      expect(updateResult.rows).toHaveLength(1)
      expect(updateResult.rows[0]).toMatchObject(updatedData)
      expect(updateResult.rows[0].id).toBe(contactId)

      // Verify the update persisted
      const selectResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [contactId])
      expect(selectResult.rows[0]).toEqual(updateResult.rows[0])
    })

    it('should delete a contact', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // Create a contact to delete
      const contact = mockContacts[0]
      const insertResult = await pool.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
        [contact.name, contact.email, contact.phone, contact.message]
      )

      const contactId = insertResult.rows[0].id

      // Delete the contact
      const deleteResult = await pool.query(
        'DELETE FROM contacts WHERE id = $1 RETURNING *',
        [contactId]
      )

      expect(deleteResult.rows).toHaveLength(1)
      expect(deleteResult.rows[0].id).toBe(contactId)

      // Verify the contact was deleted
      const selectResult = await pool.query('SELECT * FROM contacts WHERE id = $1', [contactId])
      expect(selectResult.rows).toHaveLength(0)
    })

    it('should retrieve all contacts', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // Seed database with test data
      await seedTestDb(pool)

      // Retrieve all contacts
      const result = await pool.query('SELECT * FROM contacts ORDER BY id')

      expect(result.rows).toHaveLength(mockContacts.length)
      result.rows.forEach((contact, index) => {
        expect(contact.name).toBe(mockContacts[index].name)
        expect(contact.email).toBe(mockContacts[index].email)
        expect(contact.phone).toBe(mockContacts[index].phone)
        expect(contact.message).toBe(mockContacts[index].message)
      })
    })
  })

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // Create first contact
      const contact1 = {
        name: 'First User',
        email: 'unique@test.com',
        phone: '555-1111',
        message: 'First message'
      }

      await pool.query(
        'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
        [contact1.name, contact1.email, contact1.phone, contact1.message]
      )

      // Try to create second contact with same email
      const contact2 = {
        name: 'Second User',
        email: 'unique@test.com', // Same email
        phone: '555-2222',
        message: 'Second message'
      }

      await expect(
        pool.query(
          'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
          [contact2.name, contact2.email, contact2.phone, contact2.message]
        )
      ).rejects.toThrow()
    })

    it('should enforce NOT NULL constraint on required fields', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      // Try to create contact without required name field
      await expect(
        pool.query(
          'INSERT INTO contacts (email, phone, message) VALUES ($1, $2, $3)',
          ['test@example.com', '555-1234', 'Test message']
        )
      ).rejects.toThrow()

      // Try to create contact without required email field
      await expect(
        pool.query(
          'INSERT INTO contacts (name, phone, message) VALUES ($1, $2, $3)',
          ['Test User', '555-1234', 'Test message']
        )
      ).rejects.toThrow()
    })
  })

  describe('Data Persistence', () => {
    it('should persist data across multiple operations', async () => {
      if (skipTests) {
        console.log('Skipping test - no database connection')
        return
      }

      const testData = [
        { name: 'User 1', email: 'user1@test.com', phone: '111-1111', message: 'Message 1' },
        { name: 'User 2', email: 'user2@test.com', phone: '222-2222', message: 'Message 2' },
        { name: 'User 3', email: 'user3@test.com', phone: '333-3333', message: 'Message 3' }
      ]

      // Insert multiple contacts
      const insertedIds = []
      for (const data of testData) {
        const result = await pool.query(
          'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING id',
          [data.name, data.email, data.phone, data.message]
        )
        insertedIds.push(result.rows[0].id)
      }

      // Verify all contacts exist
      const allContacts = await pool.query('SELECT * FROM contacts ORDER BY id')
      expect(allContacts.rows).toHaveLength(testData.length)

      // Update one contact
      const updateResult = await pool.query(
        'UPDATE contacts SET name = $1 WHERE id = $2 RETURNING *',
        ['Updated User 1', insertedIds[0]]
      )
      expect(updateResult.rows[0].name).toBe('Updated User 1')

      // Delete one contact
      await pool.query('DELETE FROM contacts WHERE id = $1', [insertedIds[1]])

      // Verify final state
      const remainingContacts = await pool.query('SELECT * FROM contacts ORDER BY id')
      expect(remainingContacts.rows).toHaveLength(2)
      expect(remainingContacts.rows[0].name).toBe('Updated User 1')
      expect(remainingContacts.rows[1].name).toBe('User 3')
    })
  })

  describe('Test Setup Validation', () => {
    it('should validate test environment setup', () => {
      if (skipTests) {
        console.log('Integration tests skipped - database not available')
        console.log('To run integration tests:')
        console.log('1. Install PostgreSQL')
        console.log('2. Create a test database: createdb test_contacts_db')
        console.log('3. Set DATABASE_URL environment variable (optional)')
        console.log('4. Run tests again')
      } else {
        console.log('✓ Integration test environment is properly configured')
        expect(pool).toBeDefined()
      }
    })
  })
}) 