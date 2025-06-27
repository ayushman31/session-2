Screenshot:
![image](https://github.com/user-attachments/assets/04acf67a-45bf-4066-b72b-a3a7030bd8e3)



APIs Created and Their Functionality

 GET `/api/contacts` - Fetch all contacts
- Returns list of all contacts in the database

 POST `/api/contacts` - Create new contact
- Creates a new contact with name, email, phone, and message

 GET `/api/contacts/[id]` - Fetch single contact
- Returns specific contact by ID

 PUT `/api/contacts/[id]` - Update contact
- Updates existing contact information

 DELETE `/api/contacts/[id]` - Delete contact
- Removes contact from database

Database Used and Integration

Database: PostgreSQL

Integration: 
- Used `pg` library (PostgreSQL client for Node.js)
- Direct SQL queries without ORM
- Automatic table creation on first API call
- Connection pooling for performance

Schema:
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## How to Run Your Server

1. Install PostgreSQL and create a database

2. Create `.env.local` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

3. Install dependencies:
```bash
pnpm install
```

4. Run the server:
```bash
pnpm dev
```

Server runs on `http://localhost:3000`

## How to Run Frontend Locally

The frontend is part of the same Next.js application. Just run:
```bash
pnpm dev
```

Frontend will be available at `http://localhost:3000`

## How to Interact with API

### Create Contact
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "message": "Hello world"
  }'
```

**Response**:
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "message": "Hello world",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Get All Contacts
```bash
curl http://localhost:3000/api/contacts
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "message": "Hello world",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### Update Contact
```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "phone": "123-456-7890",
    "message": "Updated message"
  }'
```

### Delete Contact
```bash
curl -X DELETE http://localhost:3000/api/contacts/1
```

**Response**:
```json
{
  "message": "Contact deleted successfully"
}
```
