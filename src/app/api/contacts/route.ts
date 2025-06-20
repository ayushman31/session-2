import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function GET() {
  try {
    await initializeDatabase();
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase();
    const { name, email, phone, message } = await request.json();
    
    const result = await pool.query(
      'INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, message]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST Error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await pool.query('DELETE FROM contacts');
    return NextResponse.json({ message: 'All contacts deleted' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 });
  }
} 