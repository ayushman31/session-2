# 🚀 Keploy API Testing Guide for Contacts API

## Overview
This guide walks you through setting up Keploy for AI-powered API testing with your Contacts API project. Keploy will automatically record API interactions and generate test cases with mocks.

## 🛠️ Prerequisites
- Docker Desktop installed and running
- Node.js and pnpm installed
- Your Contacts API project (already set up ✅)

## 📁 Files Created
The following files have been added to your project:

### Configuration Files
- `openapi.yaml` - Complete OpenAPI 3.0.3 specification
- `keploy.yml` - Keploy configuration
- `docker-compose.yml` - Database and app orchestration
- `Dockerfile` - Application containerization

### Scripts
- `scripts/setup-keploy.sh` - Initial Keploy setup
- `scripts/keploy-record.sh` - Record API interactions
- `scripts/keploy-test.sh` - Run recorded tests
- `scripts/api-test-commands.sh` - Comprehensive API testing

## 🎯 Step-by-Step Setup

### Step 1: Start Docker Desktop
1. **Launch Docker Desktop** on your Windows machine
2. **Wait for Docker to fully initialize** (green status indicator)

### Step 2: Initial Setup
```bash
# Make sure you're in the project directory
cd /d/session2

# Install dependencies if not already done
pnpm install
```

### Step 3: Set Environment Variables
Create a `.env.local` file or set these variables:
```bash
DATABASE_URL=postgresql://testuser:testpass@localhost:5432/contacts_test
NODE_ENV=development
```

### Step 4: Setup Keploy Network & Database
```bash
# Create Docker network for Keploy
docker network create keploy-network

# Start PostgreSQL database
docker-compose up -d postgres

# Wait for database to be ready (30 seconds)
```

## 🎬 Recording API Tests with Keploy

### Method 1: Using npm Scripts (Recommended)
```bash
# Start recording mode
pnpm run keploy:record
```

This will:
- Start your Next.js application
- Initialize Keploy in recording mode
- Wait for API calls to record

### Method 2: Manual Setup
```bash
# In one terminal - start recording
docker run --name keploy-v2 -p 16789:16789 --network keploy-network --privileged --pid=host -v $(pwd):$(pwd) -w $(pwd) -v /sys/fs/cgroup:/sys/fs/cgroup -v /sys/kernel/debug:/sys/kernel/debug -v /sys/fs/bpf:/sys/fs/bpf -v /var/run/docker.sock:/var/run/docker.sock --rm ghcr.io/keploy/keploy record -c "pnpm start"
```

## 📡 Making API Calls for Recording

### Option 1: Automated Testing (Recommended)
In a **new terminal window**, run the comprehensive test suite:
```bash
pnpm run keploy:api-tests
```

This script will test all endpoints:
- ✅ Create contacts (POST)
- ✅ Get all contacts (GET)
- ✅ Get specific contact (GET)
- ✅ Update contact (PUT)
- ✅ Delete contact (DELETE)
- ✅ Error scenarios (404 cases)

### Option 2: Manual Testing
You can also use individual curl commands:

**Create a contact:**
```bash
curl --request POST \
  --url http://localhost:3000/api/contacts \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "message": "Hello from Keploy!"
  }'
```

**Get all contacts:**
```bash
curl --request GET \
  --url http://localhost:3000/api/contacts
```

**Update a contact:**
```bash
curl --request PUT \
  --url http://localhost:3000/api/contacts/1 \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "John Doe Updated",
    "email": "john.updated@example.com"
  }'
```

### Option 3: Using GUI Tools
- **Postman**: Import the OpenAPI schema (`openapi.yaml`)
- **Insomnia**: Use the OpenAPI spec for automatic endpoint generation
- **VS Code REST Client**: Create `.http` files

## 🧪 Running Recorded Tests

After recording your API interactions, stop the recording (Ctrl+C) and run tests:

```bash
# Run all recorded tests
pnpm run keploy:test
```

## 📊 Understanding Test Results

Keploy will generate:

### Test Cases (`/keploy/test-*.yml`)
```yaml
version: api.keploy.io/v1beta1
kind: Http
name: test-1
spec:
  req:
    method: POST
    url: http://localhost:3000/api/contacts
    body: '{"name":"John Doe","email":"john@example.com"}'
  resp:
    status_code: 201
    body: '{"id":1,"name":"John Doe","email":"john@example.com"}'
```

### Mocks (`/keploy/mocks.yml`)
Database interactions and external service calls are automatically mocked.

## 🔍 Analyzing Results

### ✅ Successful Tests
```
🎉 Test Passed: test-1
✅ Status Code: Expected 201, Got 201
✅ Response Body: Match successful
✅ Database State: Consistent
```

### ❌ Failed Tests
```
❌ Test Failed: test-2
🚨 Status Code: Expected 200, Got 500
🚨 Response Body: Mismatch detected
📝 Suggestion: Check database connection
```

## 🚀 Advanced Features

### AI-Powered Test Generation
Keploy's AI can:
- **Generate edge cases** automatically
- **Detect API changes** and suggest updates
- **Optimize test coverage** by identifying gaps
- **Self-heal tests** when non-breaking changes occur

### Integration with CI/CD
Add to your GitHub Actions:
```yaml
- name: Run Keploy Tests
  run: |
    docker network create keploy-network
    docker-compose up -d postgres
    pnpm run keploy:test
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

**1. Docker Network Error**
```bash
# Solution: Create the network manually
docker network create keploy-network
```

**2. Database Connection Failed**
```bash
# Solution: Check if PostgreSQL is running
docker-compose ps
docker-compose up -d postgres
```

**3. Permission Denied on Scripts**
```bash
# Solution: Make scripts executable
chmod +x scripts/*.sh
```

**4. Port Already in Use**
```bash
# Solution: Kill processes using the port
npx kill-port 3000
npx kill-port 16789
```

**5. Keploy Recording Not Starting**
- Ensure Docker Desktop is running
- Check if the network exists: `docker network ls`
- Verify the application starts: `pnpm start`

## 📈 Best Practices

### 1. Test Coverage Strategy
- **Happy Path**: Test successful API operations
- **Error Scenarios**: Test 400, 404, 500 responses
- **Edge Cases**: Invalid data, boundary conditions
- **Security**: Authentication, authorization flows

### 2. Data Management
- Use **test database** (contacts_test) separate from production
- **Clean state**: Reset database between test runs
- **Realistic data**: Use representative test data

### 3. CI/CD Integration
- Run Keploy tests in **pull requests**
- **Fail builds** on test regressions
- **Generate reports** for test coverage

## 🎯 Next Steps

1. **Record Comprehensive Tests**: Cover all API endpoints
2. **Review Generated Tests**: Verify test accuracy
3. **Add to CI/CD**: Integrate with your deployment pipeline
4. **Monitor Changes**: Use Keploy to detect API regressions
5. **Expand Coverage**: Add authentication, rate limiting tests

## 📚 Additional Resources

- [Keploy Documentation](https://keploy.io/docs/)
- [OpenAPI Specification](./openapi.yaml)
- [Test Cases Directory](./keploy/)
- [Docker Compose Configuration](./docker-compose.yml)

## 🆘 Support

If you encounter issues:
1. Check the [troubleshooting section](#-troubleshooting)
2. Review Keploy logs in the terminal
3. Join [Keploy Slack Community](https://keploy.io/slack)
4. Create an issue on [Keploy GitHub](https://github.com/keploy/keploy)

---

**Happy Testing with Keploy! 🚀** 