/**
 * Finance Module API Tests
 * Test cases: FIN-001 to FIN-020 from TestRail test plan
 */

describe('Finance Module - API Tests', () => {
  let testAccountId;

  describe('Accounts Management', () => {
    it('FIN-001: Should create a new account', () => {
      const newAccount = {
        code: `ACC${Date.now()}`,
        name: 'Test Asset Account',
        type: 'Asset',
        balance: 5000
      };

      cy.apiPost('/finance/accounts', newAccount).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data.code).to.eq(newAccount.code);
        expect(response.body.data.name).to.eq(newAccount.name);
        expect(response.body.data.type).to.eq(newAccount.type);
        testAccountId = response.body.data.id;
      });
    });

    it('FIN-002: Should validate required fields for account creation', () => {
      const invalidAccount = {
        name: 'Incomplete Account'
        // Missing code and type
      };

      cy.apiPost('/finance/accounts', invalidAccount).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.contain('required');
      });
    });

    it('FIN-003: Should list all accounts', () => {
      cy.apiRequest('GET', '/finance/accounts').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body).to.have.property('count');
        expect(response.body.count).to.be.greaterThan(0);
      });
    });

    it('FIN-004: Should filter accounts by type', () => {
      cy.apiRequest('GET', '/finance/accounts?type=Asset').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        response.body.data.forEach((account) => {
          expect(account.type).to.eq('Asset');
        });
      });
    });

    it('FIN-005: Should get a single account by ID', () => {
      cy.apiRequest('GET', '/finance/accounts/1').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', '1');
        expect(response.body.data).to.have.property('code');
        expect(response.body.data).to.have.property('name');
      });
    });

    it('FIN-006: Should update account details', () => {
      const updates = {
        name: 'Updated Account Name'
      };

      cy.apiPut(`/finance/accounts/${testAccountId}`, updates).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.name).to.eq(updates.name);
      });
    });

    it('FIN-007: Should handle non-existent account', () => {
      cy.apiRequest('GET', '/finance/accounts/invalid-id-999').then((response) => {
        cy.validateError(response, 404);
        expect(response.body.error).to.contain('not found');
      });
    });
  });

  describe('Transactions', () => {
    it('FIN-011: Should create a valid transaction', () => {
      const transaction = {
        date: '2024-12-08',
        description: 'Test Transaction',
        debitAccountId: '1',
        creditAccountId: '2',
        amount: 500
      };

      cy.apiPost('/finance/transactions', transaction).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data.amount).to.eq(transaction.amount);
      });
    });

    it('FIN-012: Should validate transaction required fields', () => {
      const invalidTransaction = {
        description: 'Incomplete Transaction'
        // Missing required fields
      };

      cy.apiPost('/finance/transactions', invalidTransaction).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.exist;
      });
    });

    it('FIN-013: Should list all transactions', () => {
      cy.apiRequest('GET', '/finance/transactions').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body).to.have.property('count');
      });
    });

    it('FIN-014: Should filter transactions by account', () => {
      cy.apiRequest('GET', '/finance/transactions?accountId=1').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
      });
    });

    it('FIN-015: Should update account balances after transaction', () => {
      // Get initial balance
      cy.apiRequest('GET', '/finance/accounts/1').then((initialResponse) => {
        const initialBalance = initialResponse.body.data.balance;

        // Create transaction
        const transaction = {
          date: '2024-12-08',
          description: 'Balance Test Transaction',
          debitAccountId: '1',
          creditAccountId: '3',
          amount: 100
        };

        cy.apiPost('/finance/transactions', transaction).then(() => {
          // Verify balance updated
          cy.apiRequest('GET', '/finance/accounts/1').then((finalResponse) => {
            const finalBalance = finalResponse.body.data.balance;
            expect(finalBalance).to.eq(initialBalance + 100);
          });
        });
      });
    });
  });

  describe('Financial Reports', () => {
    it('FIN-017: Should generate balance sheet', () => {
      cy.apiRequest('GET', '/finance/reports?type=balance-sheet').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.report).to.eq('Balance Sheet');
        expect(response.body.data).to.have.property('assets');
        expect(response.body.data).to.have.property('liabilities');
        expect(response.body.data).to.have.property('equity');
      });
    });

    it('FIN-018: Should generate income statement', () => {
      cy.apiRequest('GET', '/finance/reports?type=income-statement').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.report).to.eq('Income Statement');
        expect(response.body.data).to.have.property('revenue');
        expect(response.body.data).to.have.property('expenses');
        expect(response.body.data).to.have.property('netIncome');
      });
    });

    it('FIN-019: Should validate report calculations', () => {
      cy.apiRequest('GET', '/finance/reports?type=income-statement').then((response) => {
        const { revenue, expenses, netIncome } = response.body.data;
        expect(netIncome).to.eq(revenue - expenses);
      });
    });
  });
});
