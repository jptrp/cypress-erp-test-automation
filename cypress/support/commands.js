// ***********************************************
// Custom Cypress Commands
// ***********************************************

// API Commands

/**
 * Make API request with standard headers
 */
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const options = {
    method,
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    failOnStatusCode: false,
  };

  if (body) {
    options.body = body;
  }

  return cy.request(options);
});

/**
 * Get request helper
 */
Cypress.Commands.add('get', (endpoint, headers = {}) => {
  return cy.apiRequest('GET', endpoint, null, headers);
});

/**
 * Post request helper
 */
Cypress.Commands.add('apiPost', (endpoint, body, headers = {}) => {
  return cy.apiRequest('POST', endpoint, body, headers);
});

/**
 * Put request helper
 */
Cypress.Commands.add('apiPut', (endpoint, body, headers = {}) => {
  return cy.apiRequest('PUT', endpoint, body, headers);
});

/**
 * Patch request helper
 */
Cypress.Commands.add('apiPatch', (endpoint, body, headers = {}) => {
  return cy.apiRequest('PATCH', endpoint, body, headers);
});

/**
 * Delete request helper
 */
Cypress.Commands.add('apiDelete', (endpoint, headers = {}) => {
  return cy.apiRequest('DELETE', endpoint, null, headers);
});

// Validation Commands

/**
 * Validate API response structure
 */
Cypress.Commands.add('validateResponse', (response, expectedStatus = 200) => {
  expect(response.status).to.eq(expectedStatus);
  expect(response.body).to.have.property('success');
});

/**
 * Validate successful response
 */
Cypress.Commands.add('validateSuccess', (response, expectedStatus = 200) => {
  cy.validateResponse(response, expectedStatus);
  expect(response.body.success).to.be.true;
  expect(response.body).to.have.property('data');
});

/**
 * Validate error response
 */
Cypress.Commands.add('validateError', (response, expectedStatus = 400) => {
  expect(response.status).to.eq(expectedStatus);
  expect(response.body.success).to.be.false;
  expect(response.body).to.have.property('error');
});

// Data Generation Commands

/**
 * Generate random email
 */
Cypress.Commands.add('generateEmail', () => {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
});

/**
 * Generate random string
 */
Cypress.Commands.add('generateString', (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
});

/**
 * Generate random number
 */
Cypress.Commands.add('generateNumber', (min = 1, max = 1000) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
});

// Test Data Commands

/**
 * Create test account
 */
Cypress.Commands.add('createTestAccount', (overrides = {}) => {
  const account = {
    code: `ACC${Date.now()}`,
    name: `Test Account ${Date.now()}`,
    type: 'Asset',
    balance: 1000,
    ...overrides,
  };

  return cy.apiPost('/finance/accounts', account);
});

/**
 * Create test item
 */
Cypress.Commands.add('createTestItem', (overrides = {}) => {
  const item = {
    sku: `SKU${Date.now()}`,
    name: `Test Item ${Date.now()}`,
    description: 'Test item description',
    unitPrice: 100,
    category: 'Test',
    ...overrides,
  };

  return cy.apiPost('/inventory/items', item);
});

/**
 * Create test customer
 */
Cypress.Commands.add('createTestCustomer', (overrides = {}) => {
  const customer = {
    code: `CUST${Date.now()}`,
    name: `Test Customer ${Date.now()}`,
    email: cy.generateEmail(),
    phone: '555-0000',
    status: 'Active',
    ...overrides,
  };

  return cy.apiPost('/sales/customers', customer);
});

/**
 * Create test vendor
 */
Cypress.Commands.add('createTestVendor', (overrides = {}) => {
  const vendor = {
    code: `VEND${Date.now()}`,
    name: `Test Vendor ${Date.now()}`,
    email: cy.generateEmail(),
    phone: '555-0000',
    status: 'Active',
    ...overrides,
  };

  return cy.apiPost('/purchasing/vendors', vendor);
});

// Feature Flag Commands

/**
 * Check if feature flag is enabled
 */
Cypress.Commands.add('checkFeatureFlag', (flagName) => {
  return cy.apiRequest('GET', '/feature-flags').then((response) => {
    return response.body.flags && response.body.flags[flagName] === true;
  });
});

/**
 * Skip test if feature flag is disabled
 */
Cypress.Commands.add('skipIfFeatureDisabled', (flagName) => {
  cy.checkFeatureFlag(flagName).then((enabled) => {
    if (!enabled) {
      cy.log(`Skipping test - feature flag '${flagName}' is disabled`);
      // This will be handled by test implementation
    }
  });
});

// UI Commands (for future UI tests)

/**
 * Login to application
 */
Cypress.Commands.add('login', (username = 'admin', password = 'admin') => {
  // Placeholder for future authentication
  cy.log(`Logging in as ${username}`);
});

/**
 * Navigate to module
 */
Cypress.Commands.add('navigateTo', (module) => {
  cy.visit(`/${module}`);
});
