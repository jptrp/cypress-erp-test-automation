/**
 * Sales Module API Tests
 * Test cases: SAL-001 to SAL-023 from TestRail test plan
 */

describe('Sales Module - API Tests', () => {
  let testCustomerId;
  let testOrderId;
  let testQuoteId;

  describe('Customer Management', () => {
    it('SAL-001: Should create a new customer', () => {
      const newCustomer = {
        code: `CUST${Date.now()}`,
        name: 'Acme Test Corporation',
        email: `test${Date.now()}@acme.com`,
        phone: '555-9999',
        status: 'Active'
      };

      cy.apiPost('/sales/customers', newCustomer).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data.name).to.eq(newCustomer.name);
        expect(response.body.data.email).to.eq(newCustomer.email);
        testCustomerId = response.body.data.id;
      });
    });

    it('SAL-002: Should validate customer required fields', () => {
      const invalidCustomer = {
        phone: '555-0000'
        // Missing code, name, email
      };

      cy.apiPost('/sales/customers', invalidCustomer).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.contain('required');
      });
    });

    it('SAL-003: Should list all customers', () => {
      cy.apiRequest('GET', '/sales/customers').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
      });
    });

    it('SAL-004: Should filter customers by status', () => {
      cy.apiRequest('GET', '/sales/customers?status=Active').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((customer) => {
          expect(customer.status).to.eq('Active');
        });
      });
    });

    it('SAL-005: Should search customers', () => {
      cy.apiRequest('GET', '/sales/customers?search=Acme').then((response) => {
        cy.validateSuccess(response, 200);
        if (response.body.data.length > 0) {
          const hasMatch = response.body.data.some(customer =>
            customer.name.toLowerCase().includes('acme') ||
            customer.code.toLowerCase().includes('acme')
          );
          expect(hasMatch).to.be.true;
        }
      });
    });

    it('SAL-006: Should get a single customer', () => {
      cy.apiRequest('GET', '/sales/customers/1').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', '1');
        expect(response.body.data).to.have.property('code');
        expect(response.body.data).to.have.property('name');
      });
    });

    it('SAL-007: Should update customer', () => {
      const updates = {
        phone: '555-1111',
        email: 'newemail@acme.com'
      };

      cy.apiPut(`/sales/customers/${testCustomerId}`, updates).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.phone).to.eq(updates.phone);
        expect(response.body.data.email).to.eq(updates.email);
      });
    });
  });

  describe('Sales Orders', () => {
    it('SAL-009: Should create a sales order', () => {
      const newOrder = {
        customerId: '1',
        date: '2024-12-08',
        items: [
          {
            itemId: '1',
            itemName: 'Laptop Computer',
            quantity: 2,
            unitPrice: 1200
          },
          {
            itemId: '2',
            itemName: 'Office Chair',
            quantity: 4,
            unitPrice: 350
          }
        ]
      };

      cy.apiPost('/sales/orders', newOrder).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('orderNumber');
        expect(response.body.data.customerId).to.eq(newOrder.customerId);
        expect(response.body.data.status).to.eq('Pending');
        testOrderId = response.body.data.id;
      });
    });

    it('SAL-010: Should validate order required fields', () => {
      const invalidOrder = {
        date: '2024-12-08'
        // Missing customerId and items
      };

      cy.apiPost('/sales/orders', invalidOrder).then((response) => {
        cy.validateError(response, 400);
      });
    });

    it('SAL-011: Should list all orders', () => {
      cy.apiRequest('GET', '/sales/orders').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
      });
    });

    it('SAL-012: Should filter orders by customer', () => {
      cy.apiRequest('GET', '/sales/orders?customerId=1').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((order) => {
          expect(order.customerId).to.eq('1');
        });
      });
    });

    it('SAL-013: Should filter orders by status', () => {
      cy.apiRequest('GET', '/sales/orders?status=Pending').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((order) => {
          expect(order.status).to.eq('Pending');
        });
      });
    });

    it('SAL-014: Should get a single order', () => {
      cy.apiRequest('GET', `/sales/orders/${testOrderId}`).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', testOrderId);
        expect(response.body.data).to.have.property('orderNumber');
        expect(response.body.data).to.have.property('items');
      });
    });

    it('SAL-015: Should update order status', () => {
      const statusUpdate = {
        status: 'Confirmed'
      };

      cy.apiPatch(`/sales/orders/${testOrderId}/status`, statusUpdate).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.status).to.eq('Confirmed');
      });
    });

    it('SAL-016: Should validate order status values', () => {
      const invalidStatus = {
        status: 'InvalidStatus'
      };

      cy.apiPatch(`/sales/orders/${testOrderId}/status`, invalidStatus).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.contain('Invalid');
      });
    });

    it('SAL-017: Should verify order total calculation', () => {
      const order = {
        customerId: '1',
        date: '2024-12-08',
        items: [
          { itemId: '1', itemName: 'Item 1', quantity: 3, unitPrice: 100 },
          { itemId: '2', itemName: 'Item 2', quantity: 2, unitPrice: 50 }
        ]
      };

      const expectedTotal = (3 * 100) + (2 * 50);

      cy.apiPost('/sales/orders', order).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data.total).to.eq(expectedTotal);
      });
    });
  });

  describe('Quotes', () => {
    it('SAL-019: Should create a quote', () => {
      const newQuote = {
        customerId: '1',
        validUntil: '2025-01-08',
        items: [
          {
            itemId: '1',
            itemName: 'Laptop Computer',
            quantity: 5,
            unitPrice: 1200
          }
        ]
      };

      cy.apiPost('/sales/quotes', newQuote).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('quoteNumber');
        expect(response.body.data.status).to.eq('Draft');
        testQuoteId = response.body.data.id;
      });
    });

    it('SAL-020: Should list quotes', () => {
      cy.apiRequest('GET', '/sales/quotes').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
      });
    });

    it('SAL-021: Should convert quote to order', () => {
      cy.apiPost(`/sales/quotes/${testQuoteId}/convert`).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('orderNumber');
        expect(response.body.data).to.have.property('quoteId', testQuoteId);

        // Verify quote status updated
        cy.apiRequest('GET', `/sales/quotes`).then((quotesResponse) => {
          const quote = quotesResponse.body.data.find(q => q.id === testQuoteId);
          expect(quote.status).to.eq('Converted');
        });
      });
    });
  });
});
