/**
 * Inventory Module API Tests
 * Test cases: INV-001 to INV-020 from TestRail test plan
 */

describe('Inventory Module - API Tests', () => {
  let testItemId;
  let testStockId;

  describe('Item Management', () => {
    it('INV-001: Should create a new item', () => {
      const newItem = {
        sku: `SKU${Date.now()}`,
        name: 'Test Product',
        description: 'Test product description',
        unitPrice: 299.99,
        category: 'Electronics'
      };

      cy.apiPost('/inventory/items', newItem).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data.sku).to.eq(newItem.sku);
        expect(response.body.data.name).to.eq(newItem.name);
        expect(response.body.data.unitPrice).to.eq(newItem.unitPrice);
        testItemId = response.body.data.id;
      });
    });

    it('INV-002: Should validate item required fields', () => {
      const invalidItem = {
        description: 'Item without SKU'
        // Missing sku, name, unitPrice
      };

      cy.apiPost('/inventory/items', invalidItem).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.contain('required');
      });
    });

    it('INV-003: Should list all items', () => {
      cy.apiRequest('GET', '/inventory/items').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
      });
    });

    it('INV-004: Should filter items by category', () => {
      cy.apiRequest('GET', '/inventory/items?category=Electronics').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((item) => {
          expect(item.category).to.eq('Electronics');
        });
      });
    });

    it('INV-005: Should search items by name/SKU', () => {
      cy.apiRequest('GET', '/inventory/items?search=Laptop').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        if (response.body.data.length > 0) {
          const hasMatch = response.body.data.some(item =>
            item.name.toLowerCase().includes('laptop') ||
            item.sku.toLowerCase().includes('laptop')
          );
          expect(hasMatch).to.be.true;
        }
      });
    });

    it('INV-006: Should get a single item', () => {
      cy.apiRequest('GET', '/inventory/items/1').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', '1');
        expect(response.body.data).to.have.property('sku');
        expect(response.body.data).to.have.property('name');
      });
    });

    it('INV-007: Should update item details', () => {
      const updates = {
        unitPrice: 349.99,
        description: 'Updated description'
      };

      cy.apiPut(`/inventory/items/${testItemId}`, updates).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.unitPrice).to.eq(updates.unitPrice);
        expect(response.body.data.description).to.eq(updates.description);
      });
    });

    it('INV-008: Should delete an item', () => {
      // Create an item to delete
      cy.createTestItem().then((createResponse) => {
        const itemId = createResponse.body.data.id;

        cy.apiDelete(`/inventory/items/${itemId}`).then((deleteResponse) => {
          cy.validateSuccess(deleteResponse, 200);
          expect(deleteResponse.body.message).to.contain('deleted');

          // Verify item is deleted
          cy.apiRequest('GET', `/inventory/items/${itemId}`).then((getResponse) => {
            cy.validateError(getResponse, 404);
          });
        });
      });
    });
  });

  describe('Stock Management', () => {
    it('INV-011: Should get stock levels', () => {
      cy.apiRequest('GET', '/inventory/stock').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
        
        // Verify stock record structure
        if (response.body.data.length > 0) {
          const stock = response.body.data[0];
          expect(stock).to.have.property('itemId');
          expect(stock).to.have.property('warehouseId');
          expect(stock).to.have.property('quantity');
          expect(stock).to.have.property('reorderPoint');
        }
      });
    });

    it('INV-012: Should filter stock by warehouse', () => {
      cy.apiRequest('GET', '/inventory/stock?warehouseId=WH001').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((stock) => {
          expect(stock.warehouseId).to.eq('WH001');
        });
      });
    });

    it('INV-013: Should get low stock items', () => {
      cy.apiRequest('GET', '/inventory/stock?lowStock=true').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((stock) => {
          expect(stock.quantity).to.be.at.most(stock.reorderPoint);
        });
      });
    });

    it('INV-014: Should update stock level', () => {
      const updates = {
        quantity: 100,
        reorderPoint: 15
      };

      cy.apiPut('/inventory/stock/1', updates).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.quantity).to.eq(updates.quantity);
        expect(response.body.data.reorderPoint).to.eq(updates.reorderPoint);
      });
    });

    it('INV-015: Should perform stock adjustment', () => {
      const adjustment = {
        itemId: '1',
        warehouseId: 'WH001',
        quantity: 10,
        reason: 'Received shipment'
      };

      cy.apiPost('/inventory/stock/adjust', adjustment).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('oldQuantity');
        expect(response.body.data).to.have.property('newQuantity');
        expect(response.body.data.adjustment).to.eq(adjustment.quantity);
      });
    });

    it('INV-016: Should validate adjustment fields', () => {
      const invalidAdjustment = {
        itemId: '1'
        // Missing warehouseId and quantity
      };

      cy.apiPost('/inventory/stock/adjust', invalidAdjustment).then((response) => {
        cy.validateError(response, 400);
      });
    });
  });

  describe('Warehouses', () => {
    it('INV-019: Should list all warehouses', () => {
      cy.apiRequest('GET', '/inventory/warehouses').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
        
        // Verify warehouse structure
        if (response.body.data.length > 0) {
          const warehouse = response.body.data[0];
          expect(warehouse).to.have.property('id');
          expect(warehouse).to.have.property('code');
          expect(warehouse).to.have.property('name');
          expect(warehouse).to.have.property('location');
        }
      });
    });
  });
});
