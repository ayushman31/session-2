# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and deployment with comprehensive API testing using Jest and Keploy.

## 🚀 Pipeline Overview

The CI/CD pipeline includes multiple workflows:

### 1. Main CI Pipeline (`.github/workflows/ci.yml`)
Runs on: `push` to main/master/develop, `pull_request`

**Jobs:**
- **Lint & Type Check**: ESLint and TypeScript validation
- **Unit Tests**: Fast, isolated tests with mocked dependencies
- **Integration Tests**: Tests with real PostgreSQL database
- **API Tests**: End-to-end HTTP testing
- **Keploy Tests**: Automated API testing with recorded scenarios
- **Coverage Report**: Aggregated test coverage with PR comments
- **Build & Deploy**: Production build validation
- **Security Scan**: npm audit and CodeQL analysis

### 2. PR Checks (`.github/workflows/pr-checks.yml`)
Runs on: `pull_request`

**Quick validation:**
- Linting and type checking
- Build verification
- Unit tests
- PR title validation (conventional commits)

## 🧪 Testing Strategy

### Jest Testing (Traditional)
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests with mocks
npm run test:integration   # Integration tests with real DB
npm run test:api           # End-to-end API tests

# Coverage reporting
npm run test:coverage      # Generate coverage report
npm run test:coverage-report # Detailed coverage analysis
```

### Keploy Testing (AI-Powered)
```bash
# Record API interactions
npm run keploy:record

# Run recorded tests
npm run keploy:test

# API test commands (for recording)
npm run keploy:api-tests
```

## 📊 Coverage Requirements

- **Minimum Coverage**: 70% lines/statements, 50% branches/functions
- **Coverage Reports**: Generated in multiple formats (HTML, LCOV, Cobertura)
- **PR Comments**: Automatic coverage reporting on pull requests
- **Codecov Integration**: Upload to Codecov for tracking

## 🔧 Environment Setup

### Required Environment Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=test|development|production
CI=true  # Automatically set in GitHub Actions
```

### Database Schema
The CI pipeline automatically sets up a PostgreSQL test database with:
```sql
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 🚦 Pipeline Status

### Status Badges
Add these to your README:
```markdown
![CI](https://github.com/your-username/your-repo/actions/workflows/ci.yml/badge.svg)
![PR Checks](https://github.com/your-username/your-repo/actions/workflows/pr-checks.yml/badge.svg)
```

### Pipeline Triggers
- **Push to main/master**: Full CI pipeline + deployment checks
- **Pull Request**: PR checks + full CI pipeline
- **Manual**: Can be triggered manually from Actions tab

## 🛠 Local Development

### Pre-commit Setup
Install git hooks for local validation:
```bash
# Install dependencies
npm ci

# Run pre-commit checks
npm run lint
npm run test:unit
npx tsc --noEmit
```

### Testing Locally
```bash
# Health check
bash scripts/ci-health-check.sh

# Prepare Keploy tests
bash scripts/ci-prepare-keploy.sh

# Run all tests like CI
CI=true npm run test:coverage
```

## 📦 Build & Deployment

### Docker Support
The pipeline automatically:
- Builds Docker images on main branch
- Uploads build artifacts
- Validates Dockerfile if present

### Artifacts
Generated artifacts (retained for 30 days):
- Test results (JUnit XML)
- Coverage reports (HTML, LCOV)
- Build files (.next/)
- Docker images (7 days retention)
- Keploy test results

## 🔐 Security

### Automated Security Scanning
- **npm audit**: Vulnerability scanning for dependencies
- **CodeQL**: Static code analysis for security issues
- **Dependabot**: Automated dependency updates

### Security Best Practices
- Secrets managed through GitHub Secrets
- No sensitive data in logs
- Database credentials isolated per environment
- Regular dependency updates

## 🎯 Keploy Integration

### Recording Tests
1. Start your application: `npm run dev`
2. Start Keploy recording: `npm run keploy:record`
3. Make API calls: `npm run keploy:api-tests`
4. Commit generated test files in `keploy/test-sets/`

### CI Execution
- Keploy tests run automatically if test data exists
- Tests are skipped gracefully if no data found
- Results uploaded as artifacts for review

### Test Data Management
- Test recordings stored in `keploy/test-sets/`
- YAML format with request/response pairs
- Version controlled with your code
- Validated during CI execution

## 🚨 Troubleshooting

### Common Issues

**Tests failing in CI but passing locally:**
- Check environment variables are set
- Verify database connection
- Review test timeouts (CI uses 30s timeout)

**Keploy tests not running:**
- Ensure test data is committed: `git add keploy/`
- Validate YAML files: `bash scripts/ci-prepare-keploy.sh`
- Check Keploy configuration in `keploy.yml`

**Coverage below threshold:**
- Review uncovered code in coverage report
- Add tests for critical paths
- Consider adjusting thresholds in `jest.config.js`

### Getting Help
1. Check workflow logs in GitHub Actions tab
2. Review coverage reports in artifacts
3. Run health check script locally
4. Check individual test results

## 📈 Monitoring & Metrics

### Key Metrics Tracked
- Test coverage percentage
- Test execution time
- Build success rate
- Security vulnerability count
- Dependency freshness

### Reporting
- PR comments with coverage details
- Codecov dashboard integration
- GitHub Actions status checks
- Artifact downloads for detailed analysis

---

## 🔄 Maintenance

### Regular Tasks
- Review and update dependencies weekly (automated via Dependabot)
- Monitor test coverage trends
- Update Keploy test scenarios as API evolves
- Review security scan results

### Pipeline Updates
- GitHub Actions are auto-updated via Dependabot
- Node.js version specified in workflow files
- PostgreSQL version configurable via environment variables 