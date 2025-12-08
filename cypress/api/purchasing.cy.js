/**
 * Purchasing Module API Tests
 * Test cases: PUR-001 to PUR-024 from TestRail test plan
 */

describe('Purchasing Module - API Tests', () => {
  let testVendorId;
  let testPOId;
  let testRequisitionId;

  describe('Vendor Management', () => {
    it('PUR-001: Should create a new vendor', () => {
      const newVendor = {
        code: `VEND${Date.now()}`,
        name: 'Test Supplier Inc',
        email: `supplier${Date.now()}@test.com`,
        phone: '555-7777',
        status: 'Active'
      };

      cy.apiPost('/purchasing/vendors', newVendor).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data.name).to.eq(newVendor.name);
        testVendorId = response.body.data.id;
      });
    });

    it('PUR-002: Should validate vendor required fields', () => {
      const invalidVendor = {
        phone: '555-0000'
      };

      cy.apiPost('/purchasing/vendors', invalidVendor).then((response) => {
        cy.validateError(response, 400);
        expect(response.body.error).to.contain('required');
      });
    });

    it('PUR-003: Should list all vendors', () => {
      cy.apiRequest('GET', '/purchasing/vendors').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
        expect(response.body.count).to.be.greaterThan(0);
      });
    });

    it('PUR-004: Should filter vendors by status', () => {
      cy.apiRequest('GET', '/purchasing/vendors?status=Active').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((vendor) => {
          expect(vendor.status).to.eq('Active');
        });
      });
    });

    it('PUR-005: Should search vendors', () => {
      cy.apiRequest('GET', '/purchasing/vendors?search=Tech').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
      });
    });

    it('PUR-006: Should get a single vendor', () => {
      cy.apiRequest('GET', '/purchasing/vendors/1').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', '1');
      });
    });

    it('PUR-007: Should update vendor', () => {
      const updates = {
        phone: '555-8888',
        email: 'updated@supplier.com'
      };

      cy.apiPut(`/purchasing/vendors/${testVendorId}`, updates).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.phone).to.eq(updates.phone);
      });
    });
  });

  describe('Purchase Orders', () => {
    it('PUR-009: Should create a purchase order', () => {
      const newPO = {
        vendorId: '1',
        date: '2024-12-08',
        items: [
          {
            itemId: '1',
            itemName: 'Laptop Computer',
            quantity: 10,
            unitPrice: 1200
          }
        ]
      };

      cy.apiPost('/purchasing/orders', newPO).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('poNumber');
        expect(response.body.data.status).to.eq('Draft');
        testPOId = response.body.data.id;
      });
    });

    it('PUR-010: Should validate PO required fields', () => {
      const invalidPO = {
        date: '2024-12-08'
      };

      cy.apiPost('/purchasing/orders', invalidPO).then((response) => {
        cy.validateError(response, 400);
      });
    });

    it('PUR-011: Should list all POs', () => {
      cy.apiRequest('GET', '/purchasing/orders').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
      });
    });

    it('PUR-012: Should filter POs by vendor', () => {
      cy.apiRequest('GET', '/purchasing/orders?vendorId=1').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((po) => {
          expect(po.vendorId).to.eq('1');
        });
      });
    });

    it('PUR-013: Should filter POs by status', () => {
      cy.apiRequest('GET', '/purchasing/orders?status=Draft').then((response) => {
        cy.validateSuccess(response, 200);
        response.body.data.forEach((po) => {
          expect(po.status).to.eq('Draft');
        });
      });
    });

    it('PUR-014: Should get a single PO', () => {
      cy.apiRequest('GET', `/purchasing/orders/${testPOId}`).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.have.property('id', testPOId);
      });
    });

    it('PUR-015: Should update PO status', () => {
      const statusUpdate = {
        status: 'Submitted'
      };

      cy.apiPatch(`/purchasing/orders/${testPOId}/status`, statusUpdate).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.status).to.eq('Submitted');
      });
    });

    it('PUR-016: Should validate PO status values', () => {
      const invalidStatus = {
        status: 'InvalidStatus'
      };

      cy.apiPatch(`/purchasing/orders/${testPOId}/status`, invalidStatus).then((response) => {
        cy.validateError(response, 400);
      });
    });
  });

  describe('Requisitions', () => {
    it('PUR-018: Should create a requisition', () => {
      const newRequisition = {
        requestedBy: 'John Doe',
        department: 'IT',
        items: [
          {
            itemName: 'Monitors',
            quantity: 5,
            estimatedPrice: 400
          }
        ],
        justification: 'New employee equipment'
      };

      cy.apiPost('/purchasing/requisitions', newRequisition).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('id');
        expect(response.body.data).to.have.property('requisitionNumber');
        expect(response.body.data.status).to.eq('Pending');
        testRequisitionId = response.body.data.id;
      });
    });

    it('PUR-019: Should list requisitions', () => {
      cy.apiRequest('GET', '/purchasing/requisitions').then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data).to.be.an('array');
      });
    });

    it('PUR-020: Should approve requisition', () => {
      const approval = {
        approved: true,
        approvedBy: 'Manager',
        notes: 'Approved for purchase'
      };

      cy.apiPatch(`/purchasing/requisitions/${testRequisitionId}/approve`, approval).then((response) => {
        cy.validateSuccess(response, 200);
        expect(response.body.data.status).to.eq('Approved');
        expect(response.body.data.approvedBy).to.eq(approval.approvedBy);
      });
    });

    it('PUR-021: Should reject requisition', () => {
      // Create a new requisition to reject
      const newRequisition = {
        requestedBy: 'Jane Smith',
        department: 'Marketing',
        items: [{ itemName: 'Supplies', quantity: 10, estimatedPrice: 50 }]
      };

      cy.apiPost('/purchasing/requisitions', newRequisition).then((createResponse) => {
        const reqId = createResponse.body.data.id;

        const rejection = {
          approved: false,
          approvedBy: 'Manager',
          notes: 'Budget constraints'
        };

        cy.apiPatch(`/purchasing/requisitions/${reqId}/approve`, rejection).then((response) => {
          cy.validateSuccess(response, 200);
          expect(response.body.data.status).to.eq('Rejected');
        });
      });
    });

    it('PUR-022: Should convert requisition to PO', () => {
      const conversion = {
        vendorId: '1'
      };

      cy.apiPost(`/purchasing/requisitions/${testRequisitionId}/convert`, conversion).then((response) => {
        cy.validateSuccess(response, 201);
        expect(response.body.data).to.have.property('poNumber');
        expect(response.body.data).to.have.property('requisitionId', testRequisitionId);
      });
    });

    it('PUR-023: Should validate only approved requisitions convert', () => {
      // Create a pending requisition
      const newRequisition = {
        requestedBy: 'Test User',
        department: 'Sales',
        items: [{ itemName: 'Test Item', quantity: 1, estimatedPrice: 100 }]
      };

      cy.apiPost('/purchasing/requisitions', newRequisition).then((createResponse) => {
        const reqId = createResponse.body.data.id;

        const conversion = {
          vendorId: '1'
        };

        cy.apiPost(`/purchasing/requisitions/${reqId}/convert`, conversion).then((response) => {
          cy.validateError(response, 400);
          expect(response.body.error).to.contain('approved');
        });
      });
    });
  });
});
