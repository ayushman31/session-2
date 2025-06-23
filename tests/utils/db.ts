import { Pool } from 'pg'

// Mock contact data for testing
export const mockContacts = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    message: 'Hello world',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '098-765-4321',
    message: 'Test message',
    created_at: new Date().toISOString(),
  },
]

// Helper to seed test database
export async function seedTestDb(pool: Pool) {
  // First ensure the table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  for (const contact of mockContacts) {
    await pool.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)',
      [contact.name, contact.email, contact.phone, contact.message]
    )
  }
}

// Helper to clear test database
export async function clearTestDb(pool: Pool) {
  await pool.query('DELETE FROM contacts')
}

// Mock database responses
export const mockDbResponses = {
  getAllContacts: {
    rows: mockContacts,
    rowCount: mockContacts.length,
  },
  getContactById: (id: number) => ({
    rows: mockContacts.filter(c => c.id === id),
    rowCount: mockContacts.filter(c => c.id === id).length,
  }),
  createContact: (contact: Omit<typeof mockContacts[0], 'id' | 'created_at'>) => ({
    rows: [{ ...contact, id: 3, created_at: new Date().toISOString() }],
    rowCount: 1,
  }),
  updateContact: (id: number, contact: Omit<typeof mockContacts[0], 'id' | 'created_at'>) => ({
    rows: [{ ...contact, id, created_at: new Date().toISOString() }],
    rowCount: 1,
  }),
  deleteContact: (id: number) => ({
    rows: mockContacts.filter(c => c.id === id),
    rowCount: mockContacts.filter(c => c.id === id).length,
  }),
} 