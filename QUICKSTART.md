# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cypress-erp-test-automation.git
cd cypress-erp-test-automation

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### Start the Application

```bash
# Start the ERP server
npm start

# The server will run on http://localhost:3000
```

### Run Tests

```bash
# Run all tests
npm test

# Run API tests only
npm run test:api

# Run UI tests only  
npm run test:ui

# Open Cypress Test Runner
npm run cypress:open
```

### Verify Installation

Open your browser and navigate to:
- **Health Check**: http://localhost:3000/health
- **API Root**: http://localhost:3000/api
- **Feature Flags**: http://localhost:3000/api/feature-flags

---

## 📚 Project Structure

```
cypress-erp-test-automation/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions CI/CD
├── cypress/
│   ├── api/                          # API tests
│   │   ├── finance.cy.js
│   │   ├── inventory.cy.js
│   │   ├── sales.cy.js
│   │   ├── purchasing.cy.js
│   │   └── feature-flags.cy.js
│   ├── e2e/                          # UI tests
│   │   └── integration.cy.js
│   ├── fixtures/                     # Test data
│   │   └── testData.json
│   └── support/                      # Test helpers
│       ├── commands.js               # Custom commands
│       └── e2e.js                    # Global config
├── docs/                             # Documentation
│   ├── testrail-test-plan.md        # Complete test plan
│   ├── feature-flags-guide.md       # Feature flags guide
│   └── ci-cd-guide.md               # CI/CD documentation
├── src/
│   ├── modules/                      # ERP modules
│   │   ├── finance.js
│   │   ├── inventory.js
│   │   ├── sales.js
│   │   └── purchasing.js
│   └── middleware/
│       └── featureFlags.js           # Feature flag system
├── server.js                         # Main server
├── cypress.config.js                 # Cypress configuration
├── azure-pipelines.yml               # Azure DevOps pipeline
├── package.json
└── README.md
```

---

## 🧪 Testing

### API Testing Examples

```bash
# Test Finance module
npx cypress run --spec cypress/api/finance.cy.js

# Test Inventory module
npx cypress run --spec cypress/api/inventory.cy.js

# Test Sales module
npx cypress run --spec cypress/api/sales.cy.js

# Test Purchasing module
npx cypress run --spec cypress/api/purchasing.cy.js
```

### Test Coverage

- **190 test cases** across all modules
- **170 automated tests** (90% automation)
- **API tests**: Complete CRUD operations
- **Integration tests**: Cross-module workflows
- **Feature flag tests**: Dynamic feature testing

---

## 🎯 Key Features

### 1. MVP ERP System
- ✅ Finance module (accounts, transactions, reports)
- ✅ Inventory module (items, stock, warehouses)
- ✅ Sales module (customers, orders, quotes)
- ✅ Purchasing module (vendors, POs, requisitions)

### 2. Test Automation
- ✅ Cypress for UI and API testing
- ✅ 190 test cases mapped to TestRail
- ✅ Custom commands for reusability
- ✅ Integration tests for workflows

### 3. Feature Flags (WOW Factor!)
- ✅ LaunchDarkly-compatible system
- ✅ 8 feature flags for A/B testing
- ✅ Real-time feature toggling
- ✅ Mock and production modes

### 4. CI/CD Pipelines
- ✅ GitHub Actions with AWS integration
- ✅ Azure DevOps pipeline
- ✅ Automated testing on every PR
- ✅ Cloud connectivity demonstrations

---

## 📊 API Endpoints

### Finance Module
```
GET    /api/finance/accounts           # List accounts
POST   /api/finance/accounts           # Create account
GET    /api/finance/accounts/:id       # Get account
PUT    /api/finance/accounts/:id       # Update account
GET    /api/finance/transactions       # List transactions
POST   /api/finance/transactions       # Create transaction
GET    /api/finance/reports            # Get financial reports
```

### Inventory Module
```
GET    /api/inventory/items            # List items
POST   /api/inventory/items            # Create item
GET    /api/inventory/items/:id        # Get item
PUT    /api/inventory/items/:id        # Update item
DELETE /api/inventory/items/:id        # Delete item
GET    /api/inventory/stock            # Get stock levels
POST   /api/inventory/stock/adjust     # Adjust stock
GET    /api/inventory/warehouses       # List warehouses
```

### Sales Module
```
GET    /api/sales/customers            # List customers
POST   /api/sales/customers            # Create customer
GET    /api/sales/orders               # List orders
POST   /api/sales/orders               # Create order
PATCH  /api/sales/orders/:id/status    # Update order status
GET    /api/sales/quotes               # List quotes
POST   /api/sales/quotes               # Create quote
POST   /api/sales/quotes/:id/convert   # Convert to order
```

### Purchasing Module
```
GET    /api/purchasing/vendors         # List vendors
POST   /api/purchasing/vendors         # Create vendor
GET    /api/purchasing/orders          # List purchase orders
POST   /api/purchasing/orders          # Create PO
PATCH  /api/purchasing/orders/:id/status  # Update PO status
GET    /api/purchasing/requisitions    # List requisitions
POST   /api/purchasing/requisitions    # Create requisition
POST   /api/purchasing/requisitions/:id/convert  # Convert to PO
```

---

## 🎨 Feature Flags

Access feature flags at: `GET /api/feature-flags`

**Available Flags:**
- `new-ui-dashboard` - New dashboard UI (Enabled)
- `enhanced-reporting` - Enhanced reports (Enabled)
- `bulk-operations` - Bulk import/export (Disabled)
- `advanced-inventory` - RFID tracking (Enabled)
- `ai-recommendations` - AI suggestions (Disabled)
- `multi-currency` - Multi-currency (Enabled)
- `mobile-app` - Mobile features (Disabled)
- `real-time-sync` - Real-time sync (Enabled)

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Feature Flags
FEATURE_FLAGS_ENABLED=true
LAUNCHDARKLY_SDK_KEY=your_key_here

# AWS (for CI/CD)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# TestRail (optional)
TESTRAIL_HOST=https://yourcompany.testrail.io
TESTRAIL_USER=your_email
TESTRAIL_API_KEY=your_key
```

---

## 🚀 Deployment

### Deploy with GitHub Actions

```bash
# Push to main branch
git push origin main

# GitHub Actions will:
# 1. Run all tests
# 2. Build application
# 3. Test AWS connectivity
# 4. Deploy to staging/production
```

### Deploy with Azure DevOps

```bash
# Push to main or develop
git push origin main

# Azure Pipeline will:
# 1. Run tests and security scans
# 2. Build and package
# 3. Test Azure services
# 4. Deploy to App Service
```

---

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3000/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-12-08T...",
  "version": "1.0.0",
  "environment": "development"
}
```

### API Status

```bash
curl http://localhost:3000/api

# Response:
{
  "message": "ERP System API",
  "version": "1.0.0",
  "modules": ["finance", "inventory", "sales", "purchasing"]
}
```

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port is in use
lsof -i :3000

# Kill existing process
kill -9 <PID>

# Start server
npm start
```

### Tests Failing

```bash
# Make sure server is running
npm start

# In another terminal, run tests
npm test

# Check specific test
npx cypress run --spec cypress/api/finance.cy.js
```

### Dependencies Issues

```bash
# Clear node modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Clear Cypress cache
npx cypress cache clear
npx cypress install
```

---

## 📝 Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/new-feature
```

### 2. Make Changes

```bash
# Edit code
# Add tests
```

### 3. Run Tests Locally

```bash
npm test
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 5. Create Pull Request

- Tests run automatically via GitHub Actions
- Review test results
- Merge when approved

---

## 🎓 Learning Resources

### Documentation
- [Complete Test Plan](docs/testrail-test-plan.md)
- [Feature Flags Guide](docs/feature-flags-guide.md)
- [CI/CD Guide](docs/ci-cd-guide.md)

### External Resources
- [Cypress Documentation](https://docs.cypress.io/)
- [TestRail Documentation](https://www.gurock.com/testrail/docs/)
- [LaunchDarkly Documentation](https://docs.launchdarkly.com/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Azure DevOps](https://docs.microsoft.com/en-us/azure/devops/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 License

ISC License - See LICENSE file for details

---

## 🎉 What Makes This Project Special

### Modern Testing
- ✅ 190 comprehensive test cases
- ✅ API and UI testing with Cypress
- ✅ TestRail integration ready
- ✅ Automated test execution

### Feature Flags (WOW!)
- ✅ LaunchDarkly-compatible system
- ✅ A/B testing capabilities
- ✅ Real-time feature toggling
- ✅ Production-ready implementation

### Cloud Integration
- ✅ GitHub Actions with AWS
- ✅ Azure DevOps pipeline
- ✅ Multi-cloud demonstration
- ✅ Automated deployments

### Professional Architecture
- ✅ Modular ERP design
- ✅ RESTful API
- ✅ Comprehensive documentation
- ✅ Industry best practices

---

## 💡 Next Steps

1. **Run the application**: `npm start`
2. **Run tests**: `npm test`
3. **Explore API**: Visit http://localhost:3000/api
4. **Check feature flags**: Visit http://localhost:3000/api/feature-flags
5. **Review test plan**: Open `docs/testrail-test-plan.md`
6. **Setup CI/CD**: Configure GitHub Actions or Azure DevOps

---

**Built with ❤️ for modern ERP testing**
