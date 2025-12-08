const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data store
let vendors = [
  { id: '1', code: 'VEND001', name: 'Tech Supplies Co', email: 'orders@techsupplies.com', phone: '555-1000', status: 'Active' },
  { id: '2', code: 'VEND002', name: 'Office Furniture Plus', email: 'sales@officefurniture.com', phone: '555-2000', status: 'Active' },
  { id: '3', code: 'VEND003', name: 'Equipment Direct', email: 'info@equipmentdirect.com', phone: '555-3000', status: 'Active' }
];

let purchaseOrders = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    vendorId: '1',
    date: '2024-11-15',
    status: 'Received',
    total: 6000,
    items: [
      { itemId: '1', itemName: 'Laptop Computer', quantity: 5, unitPrice: 1200 }
    ]
  }
];

let requisitions = [];

// Get all vendors
router.get('/vendors', (req, res) => {
  const { status, search } = req.query;
  let filtered = vendors;
  
  if (status) {
    filtered = filtered.filter(v => v.status === status);
  }
  
  if (search) {
    filtered = filtered.filter(v => 
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.code.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single vendor
router.get('/vendors/:id', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id);
  
  if (!vendor) {
    return res.status(404).json({
      success: false,
      error: 'Vendor not found'
    });
  }
  
  res.json({
    success: true,
    data: vendor
  });
});

// Create vendor
router.post('/vendors', (req, res) => {
  const { code, name, email, phone, status = 'Active' } = req.body;
  
  if (!code || !name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: code, name, email'
    });
  }
  
  const newVendor = {
    id: uuidv4(),
    code,
    name,
    email,
    phone: phone || '',
    status,
    createdAt: new Date().toISOString()
  };
  
  vendors.push(newVendor);
  
  res.status(201).json({
    success: true,
    data: newVendor
  });
});

// Update vendor
router.put('/vendors/:id', (req, res) => {
  const index = vendors.findIndex(v => v.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Vendor not found'
    });
  }
  
  vendors[index] = {
    ...vendors[index],
    ...req.body,
    id: req.params.id
  };
  
  res.json({
    success: true,
    data: vendors[index]
  });
});

// Get all purchase orders
router.get('/orders', (req, res) => {
  const { vendorId, status } = req.query;
  let filtered = purchaseOrders;
  
  if (vendorId) {
    filtered = filtered.filter(po => po.vendorId === vendorId);
  }
  
  if (status) {
    filtered = filtered.filter(po => po.status === status);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single purchase order
router.get('/orders/:id', (req, res) => {
  const po = purchaseOrders.find(p => p.id === req.params.id);
  
  if (!po) {
    return res.status(404).json({
      success: false,
      error: 'Purchase order not found'
    });
  }
  
  res.json({
    success: true,
    data: po
  });
});

// Create purchase order
router.post('/orders', (req, res) => {
  const { vendorId, date, items } = req.body;
  
  if (!vendorId || !date || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: vendorId, date, items'
    });
  }
  
  const total = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  
  const newPO = {
    id: uuidv4(),
    poNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
    vendorId,
    date,
    status: 'Draft',
    total,
    items,
    createdAt: new Date().toISOString()
  };
  
  purchaseOrders.push(newPO);
  
  res.status(201).json({
    success: true,
    data: newPO
  });
});

// Update PO status
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const po = purchaseOrders.find(p => p.id === req.params.id);
  
  if (!po) {
    return res.status(404).json({
      success: false,
      error: 'Purchase order not found'
    });
  }
  
  if (!['Draft', 'Submitted', 'Approved', 'Received', 'Cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }
  
  po.status = status;
  po.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: po
  });
});

// Get all requisitions
router.get('/requisitions', (req, res) => {
  const { status } = req.query;
  let filtered = requisitions;
  
  if (status) {
    filtered = filtered.filter(r => r.status === status);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Create requisition
router.post('/requisitions', (req, res) => {
  const { requestedBy, department, items, justification } = req.body;
  
  if (!requestedBy || !department || !items) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  const total = items.reduce((sum, item) => 
    sum + (item.quantity * (item.estimatedPrice || 0)), 0
  );
  
  const newRequisition = {
    id: uuidv4(),
    requisitionNumber: `REQ-2024-${String(requisitions.length + 1).padStart(3, '0')}`,
    requestedBy,
    department,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    total,
    items,
    justification: justification || '',
    createdAt: new Date().toISOString()
  };
  
  requisitions.push(newRequisition);
  
  res.status(201).json({
    success: true,
    data: newRequisition
  });
});

// Approve/Reject requisition
router.patch('/requisitions/:id/approve', (req, res) => {
  const { approved, approvedBy, notes } = req.body;
  const requisition = requisitions.find(r => r.id === req.params.id);
  
  if (!requisition) {
    return res.status(404).json({
      success: false,
      error: 'Requisition not found'
    });
  }
  
  requisition.status = approved ? 'Approved' : 'Rejected';
  requisition.approvedBy = approvedBy;
  requisition.approvalNotes = notes;
  requisition.approvalDate = new Date().toISOString();
  
  res.json({
    success: true,
    data: requisition
  });
});

// Convert requisition to PO
router.post('/requisitions/:id/convert', (req, res) => {
  const { vendorId } = req.body;
  const requisition = requisitions.find(r => r.id === req.params.id);
  
  if (!requisition) {
    return res.status(404).json({
      success: false,
      error: 'Requisition not found'
    });
  }
  
  if (requisition.status !== 'Approved') {
    return res.status(400).json({
      success: false,
      error: 'Only approved requisitions can be converted to PO'
    });
  }
  
  if (!vendorId) {
    return res.status(400).json({
      success: false,
      error: 'Vendor ID is required'
    });
  }
  
  const items = requisition.items.map(item => ({
    ...item,
    unitPrice: item.estimatedPrice
  }));
  
  const newPO = {
    id: uuidv4(),
    poNumber: `PO-2024-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
    vendorId,
    date: new Date().toISOString().split('T')[0],
    status: 'Draft',
    total: requisition.total,
    items,
    requisitionId: requisition.id,
    createdAt: new Date().toISOString()
  };
  
  purchaseOrders.push(newPO);
  requisition.status = 'Converted';
  
  res.status(201).json({
    success: true,
    data: newPO
  });
});

module.exports = router;
