/**
 * System Health and Integration Tests
 */

describe('System Integration Tests', () => {
  describe('API Health Check', () => {
    it('Should verify server is running', () => {
      cy.request('http://localhost:3000/health').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'healthy');
        expect(response.body).to.have.property('version');
        expect(response.body).to.have.property('environment');
      });
    });

    it('Should verify API root endpoint', () => {
      cy.apiRequest('GET', '').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message');
        expect(response.body).to.have.property('modules');
        expect(response.body.modules).to.include.members([
          'finance',
          'inventory',
          'sales',
          'purchasing'
        ]);
      });
    });
  });

  describe('Cross-Module Integration', () => {
    it('Should create complete sales workflow', () => {
      // 1. Create customer
      cy.createTestCustomer().then((customerResponse) => {
        const customerId = customerResponse.body.data.id;

        // 2. Create items
        cy.createTestItem({ name: 'Integration Test Item', unitPrice: 500 }).then((itemResponse) => {
          const itemId = itemResponse.body.data.id;

          // 3. Create sales order
          const order = {
            customerId,
            date: '2024-12-08',
            items: [
              {
                itemId,
                itemName: 'Integration Test Item',
                quantity: 2,
                unitPrice: 500
              }
            ]
          };

          cy.apiPost('/sales/orders', order).then((orderResponse) => {
            cy.validateSuccess(orderResponse, 201);
            expect(orderResponse.body.data.total).to.eq(1000);

            // 4. Update order status
            cy.apiPatch(`/sales/orders/${orderResponse.body.data.id}/status`, {
              status: 'Completed'
            }).then((statusResponse) => {
              cy.validateSuccess(statusResponse, 200);
              expect(statusResponse.body.data.status).to.eq('Completed');
            });
          });
        });
      });
    });

    it('Should create complete purchasing workflow', () => {
      // 1. Create requisition
      const requisition = {
        requestedBy: 'Integration Test User',
        department: 'IT',
        items: [
          {
            itemName: 'Test Equipment',
            quantity: 5,
            estimatedPrice: 300
          }
        ],
        justification: 'Integration testing'
      };

      cy.apiPost('/purchasing/requisitions', requisition).then((reqResponse) => {
        const reqId = reqResponse.body.data.id;

        // 2. Approve requisition
        cy.apiPatch(`/purchasing/requisitions/${reqId}/approve`, {
          approved: true,
          approvedBy: 'Test Manager',
          notes: 'Approved for testing'
        }).then(() => {
          // 3. Convert to PO
          cy.apiPost(`/purchasing/requisitions/${reqId}/convert`, {
            vendorId: '1'
          }).then((poResponse) => {
            cy.validateSuccess(poResponse, 201);

            // 4. Update PO status
            cy.apiPatch(`/purchasing/orders/${poResponse.body.data.id}/status`, {
              status: 'Approved'
            }).then((statusResponse) => {
              cy.validateSuccess(statusResponse, 200);
            });
          });
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('Should handle 404 errors gracefully', () => {
      cy.apiRequest('GET', '/non-existent-endpoint').then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('error', 'Not Found');
      });
    });

    it('Should handle invalid JSON payloads', () => {
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/finance/accounts`,
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });
  });

  describe('Performance Tests', () => {
    it('Should handle bulk operations efficiently', () => {
      const startTime = Date.now();
      const promises = [];

      // Create 10 items simultaneously
      for (let i = 0; i < 10; i++) {
        promises.push(
          cy.createTestItem({
            sku: `BULK-SKU-${i}-${Date.now()}`,
            name: `Bulk Test Item ${i}`,
            unitPrice: 100 * (i + 1)
          })
        );
      }

      cy.wrap(Promise.all(promises)).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        cy.log(`Bulk operation completed in ${duration}ms`);
        expect(duration).to.be.lessThan(5000); // Should complete within 5 seconds
      });
    });
  });
});
