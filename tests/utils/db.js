// Mock contact data for testing
const mockContacts = [
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
async function seedTestDb(pool) {
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
async function clearTestDb(pool) {
  try {
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
    
    // Then clear it
    await pool.query('DELETE FROM contacts')
  } catch (error) {
    console.warn('Could not clear test database:', error.message)
    // Don't throw - let tests continue
  }
}

// Mock database responses
const mockDbResponses = {
  getAllContacts: {
    rows: mockContacts,
    rowCount: mockContacts.length,
  },
  getContactById: (id) => ({
    rows: mockContacts.filter(c => c.id === id),
    rowCount: mockContacts.filter(c => c.id === id).length,
  }),
  createContact: (contact) => ({
    rows: [{ ...contact, id: 3, created_at: new Date().toISOString() }],
    rowCount: 1,
  }),
  updateContact: (id, contact) => ({
    rows: [{ ...contact, id, created_at: new Date().toISOString() }],
    rowCount: 1,
  }),
  deleteContact: (id) => ({
    rows: mockContacts.filter(c => c.id === id),
    rowCount: mockContacts.filter(c => c.id === id).length,
  }),
}

module.exports = {
  mockContacts,
  seedTestDb,
  clearTestDb,
  mockDbResponses,
} 