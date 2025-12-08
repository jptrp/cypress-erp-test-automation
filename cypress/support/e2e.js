// ***********************************************************
// This support file is processed and loaded automatically before test files.
// ***********************************************************

// Import commands
import './commands';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent failing the test on uncaught exceptions
  return false;
});

// Before each test
beforeEach(() => {
  // Clear cookies and local storage
  cy.clearCookies();
  cy.clearLocalStorage();
});

// Custom error handling
Cypress.on('fail', (error, runnable) => {
  throw error;
});
