#!/bin/bash

echo "🚀 Testing Contacts API Endpoints..."
echo "Make sure your app is running and Keploy is recording!"
echo ""

# Base URL
BASE_URL="http://localhost:3000"

echo "1️⃣ Creating a new contact..."
curl --request POST \
  --url $BASE_URL/api/contacts \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "message": "Hello, this is a test contact from Keploy!"
  }'

echo -e "\n\n2️⃣ Creating another contact..."
curl --request POST \
  --url $BASE_URL/api/contacts \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "+0987654321",
    "message": "Another test contact for API testing"
  }'

echo -e "\n\n3️⃣ Getting all contacts..."
curl --request GET \
  --url $BASE_URL/api/contacts \
  --header 'Accept: application/json'

echo -e "\n\n4️⃣ Getting specific contact (ID: 1)..."
curl --request GET \
  --url $BASE_URL/api/contacts/1 \
  --header 'Accept: application/json'

echo -e "\n\n5️⃣ Updating contact (ID: 1)..."
curl --request PUT \
  --url $BASE_URL/api/contacts/1 \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "John Doe Updated",
    "email": "john.doe.updated@example.com",
    "phone": "+1234567890",
    "message": "Updated message from Keploy test"
  }'

echo -e "\n\n6️⃣ Getting updated contact..."
curl --request GET \
  --url $BASE_URL/api/contacts/1 \
  --header 'Accept: application/json'

echo -e "\n\n7️⃣ Testing non-existent contact (should return 404)..."
curl --request GET \
  --url $BASE_URL/api/contacts/999 \
  --header 'Accept: application/json'

echo -e "\n\n8️⃣ Deleting specific contact (ID: 2)..."
curl --request DELETE \
  --url $BASE_URL/api/contacts/2 \
  --header 'Accept: application/json'

echo -e "\n\n✅ All API tests completed!"
echo "Check your Keploy folder for generated test cases!" 