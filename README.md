# ERP Test Automation System

A comprehensive MVP ERP system inspired by Acumatica, featuring modern test automation, feature flags, and CI/CD integration with AWS/Azure DevOps.

## 🚀 Features

- **MVP ERP System**: Modular ERP with Finance, Inventory, Sales, and Purchasing modules
- **Comprehensive Test Automation**: Cypress for both UI and API testing
- **Feature Flags**: Modern feature flag system for A/B testing and gradual rollouts
- **TestRail Integration**: Complete test plan and integration ready
- **CI/CD Pipeline**: GitHub Actions with AWS/Azure DevOps connectivity
- **Modern Architecture**: RESTful API, modular design, production-ready structure

## 📋 Modules

### Finance
- General Ledger
- Accounts Payable
- Accounts Receivable
- Financial Reporting

### Inventory
- Item Management
- Stock Levels
- Warehouses
- Adjustments

### Sales
- Orders
- Customers
- Quotes
- Invoicing

### Purchasing
- Purchase Orders
- Vendors
- Requisitions
- Receiving

## 🛠️ Technology Stack

- **Backend**: Node.js + Express
- **Testing**: Cypress (UI & API)
- **Feature Flags**: LaunchDarkly SDK
- **CI/CD**: GitHub Actions
- **Cloud**: AWS & Azure DevOps ready

## 📦 Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configurations

# Start the server
npm start

# Or use development mode with hot reload
npm run dev
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run UI tests only
npm run test:ui

# Run API tests only
npm run test:api

# Open Cypress Test Runner
npm run cypress:open
```

## 🎯 Test Plan

See `docs/testrail-test-plan.md` for the comprehensive TestRail test plan covering all modules.

## 🚦 Feature Flags

The system uses feature flags for:
- New UI features (A/B testing)
- Module toggles
- Beta feature rollouts
- Performance optimizations

Configure in `.env`:
```
FEATURE_FLAGS_ENABLED=true
LAUNCHDARKLY_SDK_KEY=your_key
```

## ☁️ CI/CD

The project includes:
- GitHub Actions workflow (`.github/workflows/ci-cd.yml`)
- AWS integration examples
- Azure DevOps pipeline template
- Automated testing on PR
- Deployment to staging/production

## 📊 API Endpoints

### Finance
- `GET /api/finance/accounts` - List accounts
- `POST /api/finance/transactions` - Create transaction
- `GET /api/finance/reports` - Financial reports

### Inventory
- `GET /api/inventory/items` - List items
- `POST /api/inventory/items` - Create item
- `PUT /api/inventory/items/:id` - Update item
- `GET /api/inventory/stock` - Check stock levels

### Sales
- `GET /api/sales/orders` - List orders
- `POST /api/sales/orders` - Create order
- `GET /api/sales/customers` - List customers

### Purchasing
- `GET /api/purchasing/orders` - List POs
- `POST /api/purchasing/orders` - Create PO
- `GET /api/purchasing/vendors` - List vendors

## 🏗️ Project Structure

```
cypress-erp-test-automation/
├── server.js                 # Main application server
├── src/
│   ├── modules/             # ERP modules
│   ├── utils/               # Utilities and helpers
│   └── middleware/          # Express middleware
├── cypress/
│   ├── e2e/                 # UI tests
│   ├── api/                 # API tests
│   ├── fixtures/            # Test data
│   └── support/             # Test helpers
├── docs/                    # Documentation
├── .github/workflows/       # CI/CD pipelines
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

ISC

## 🎓 Learning Resources

This project demonstrates:
- Modern ERP architecture
- Test automation best practices
- Feature flag implementation
- CI/CD pipeline configuration
- Cloud integration patterns
- API testing strategies
