# 🚀 Quick Start: CI/CD Setup

Get your CI/CD pipeline running in 5 minutes!

## ✅ Prerequisites Checklist

- [ ] GitHub repository created
- [ ] Node.js 20+ installed locally
- [ ] PostgreSQL database available
- [ ] Git configured with your GitHub account

## 🎯 Quick Setup (5 steps)

### 1. Install Dependencies
```bash
npm ci
npm run ci:health-check  # Verify everything is ready
```

### 2. Set Environment Variables
Create `.env.local`:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
NODE_ENV=development
```

### 3. Generate Keploy Test Data (Optional)
```bash
# Start your app
npm run dev

# In another terminal, record API calls
npm run keploy:record

# Generate test data
npm run keploy:api-tests

# Stop recording (Ctrl+C) and commit the data
git add keploy/
git commit -m "feat: add Keploy test data"
```

### 4. Test Locally
```bash
# Run the same tests as CI
npm run ci:test-all

# Or run individual test suites
npm run test:unit
npm run test:integration  # Requires database
npm run test:api         # Requires database
```

### 5. Push to GitHub
```bash
git push origin main
```

🎉 **That's it!** Your CI/CD pipeline will automatically start running.

## 🔍 Verify It's Working

1. **Check GitHub Actions**: Go to your repo → Actions tab
2. **Watch the Pipeline**: See all jobs running (lint, test, build, etc.)
3. **Review Results**: Check test coverage and reports

## ⚡ Common Commands

```bash
# Local development
npm run dev              # Start development server
npm run lint            # Check code style
npm run test:watch      # Run tests in watch mode

# CI-like testing
npm run ci:test-all     # Run all CI checks locally
npm run test:ci         # Run tests with CI configuration
npm run validate        # Quick validation (lint + type-check + unit tests)

# Keploy testing
npm run keploy:record   # Record new API tests
npm run keploy:test     # Run recorded tests
npm run ci:prepare-keploy # Validate Keploy setup for CI
```

## 🚦 Pipeline Status

Your CI/CD pipeline runs on:
- ✅ **Push to main/master/develop**: Full pipeline
- ✅ **Pull Requests**: Quick checks + full pipeline  
- ✅ **Manual**: Trigger from GitHub Actions tab

## 📊 What Gets Tested

| Test Type | Coverage | Purpose |
|-----------|----------|---------|
| **Unit Tests** | Individual functions | Fast feedback, mocked dependencies |
| **Integration Tests** | API + Database | Real database interactions |
| **API Tests** | HTTP endpoints | End-to-end request/response |
| **Keploy Tests** | Recorded scenarios | AI-powered regression testing |

## 🔧 Customization

### Coverage Thresholds
Edit `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    lines: 70,        // Adjust as needed
    statements: 70,   // Adjust as needed
    branches: 50,     // Adjust as needed
    functions: 50     // Adjust as needed
  }
}
```

### Workflow Triggers
Edit `.github/workflows/ci.yml`:
```yaml
on:
  push:
    branches: [ main, master, develop, staging ]  # Add more branches
  pull_request:
    branches: [ main, master ]
```

## 🚨 Troubleshooting

### Pipeline Failing?
```bash
# 1. Check locally first
npm run ci:health-check

# 2. Run the same tests as CI
npm run ci:test-all

# 3. Check specific issues
npm run lint            # Linting errors?
npm run type-check      # TypeScript errors?
npm run test:unit       # Unit test failures?
```

### Database Issues?
```bash
# Check connection
npm run ci:health-check

# Verify DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/database
```

### Keploy Not Working?
```bash
# Check if test data exists
npm run ci:prepare-keploy

# Regenerate test data
npm run keploy:record
npm run keploy:api-tests
git add keploy/ && git commit -m "update: Keploy test data"
```

## 📈 Monitoring

### Coverage Reports
- **Local**: Open `coverage/lcov-report/index.html`
- **CI**: Download from GitHub Actions artifacts
- **PR Comments**: Automatic coverage reporting

### Build Status
Add badges to your README:
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/pr-checks.yml/badge.svg)
```

## 🎓 Next Steps

1. **Set up Codecov** for coverage tracking
2. **Configure notifications** in GitHub repository settings
3. **Add deployment** to your preferred hosting platform
4. **Set up monitoring** for production API endpoints
5. **Review security scans** regularly

## 💡 Pro Tips

- **Run tests locally** before pushing to save CI minutes
- **Use `npm run validate`** as a pre-commit hook
- **Generate Keploy tests** for critical user journeys
- **Review coverage reports** to find untested code paths
- **Monitor CI execution time** and optimize slow tests

---

**Need help?** Check the [full documentation](./CI-CD-README.md) or open an issue using our bug report template! 