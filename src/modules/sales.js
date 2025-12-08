const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data store
let customers = [
  { id: '1', code: 'CUST001', name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0100', status: 'Active' },
  { id: '2', code: 'CUST002', name: 'TechStart Inc', email: 'info@techstart.com', phone: '555-0200', status: 'Active' },
  { id: '3', code: 'CUST003', name: 'Global Solutions', email: 'sales@global.com', phone: '555-0300', status: 'Active' }
];

let orders = [
  {
    id: '1',
    orderNumber: 'SO-2024-001',
    customerId: '1',
    date: '2024-12-01',
    status: 'Completed',
    total: 3600,
    items: [
      { itemId: '1', itemName: 'Laptop Computer', quantity: 3, unitPrice: 1200 }
    ]
  }
];

let quotes = [];

// Get all customers
router.get('/customers', (req, res) => {
  const { status, search } = req.query;
  let filtered = customers;
  
  if (status) {
    filtered = filtered.filter(c => c.status === status);
  }
  
  if (search) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single customer
router.get('/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === req.params.id);
  
  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }
  
  res.json({
    success: true,
    data: customer
  });
});

// Create customer
router.post('/customers', (req, res) => {
  const { code, name, email, phone, status = 'Active' } = req.body;
  
  if (!code || !name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: code, name, email'
    });
  }
  
  const newCustomer = {
    id: uuidv4(),
    code,
    name,
    email,
    phone: phone || '',
    status,
    createdAt: new Date().toISOString()
  };
  
  customers.push(newCustomer);
  
  res.status(201).json({
    success: true,
    data: newCustomer
  });
});

// Update customer
router.put('/customers/:id', (req, res) => {
  const index = customers.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }
  
  customers[index] = {
    ...customers[index],
    ...req.body,
    id: req.params.id
  };
  
  res.json({
    success: true,
    data: customers[index]
  });
});

// Get all orders
router.get('/orders', (req, res) => {
  const { customerId, status } = req.query;
  let filtered = orders;
  
  if (customerId) {
    filtered = filtered.filter(o => o.customerId === customerId);
  }
  
  if (status) {
    filtered = filtered.filter(o => o.status === status);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single order
router.get('/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  res.json({
    success: true,
    data: order
  });
});

// Create order
router.post('/orders', (req, res) => {
  const { customerId, date, items } = req.body;
  
  if (!customerId || !date || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: customerId, date, items'
    });
  }
  
  const total = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  
  const newOrder = {
    id: uuidv4(),
    orderNumber: `SO-2024-${String(orders.length + 1).padStart(3, '0')}`,
    customerId,
    date,
    status: 'Pending',
    total,
    items,
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  
  res.status(201).json({
    success: true,
    data: newOrder
  });
});

// Update order status
router.patch('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find(o => o.id === req.params.id);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  if (!['Pending', 'Confirmed', 'Shipped', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status'
    });
  }
  
  order.status = status;
  order.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: order
  });
});

// Get all quotes
router.get('/quotes', (req, res) => {
  const { customerId } = req.query;
  let filtered = quotes;
  
  if (customerId) {
    filtered = filtered.filter(q => q.customerId === customerId);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Create quote
router.post('/quotes', (req, res) => {
  const { customerId, validUntil, items } = req.body;
  
  if (!customerId || !validUntil || !items) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  const total = items.reduce((sum, item) => 
    sum + (item.quantity * item.unitPrice), 0
  );
  
  const newQuote = {
    id: uuidv4(),
    quoteNumber: `QT-2024-${String(quotes.length + 1).padStart(3, '0')}`,
    customerId,
    date: new Date().toISOString().split('T')[0],
    validUntil,
    status: 'Draft',
    total,
    items,
    createdAt: new Date().toISOString()
  };
  
  quotes.push(newQuote);
  
  res.status(201).json({
    success: true,
    data: newQuote
  });
});

// Convert quote to order
router.post('/quotes/:id/convert', (req, res) => {
  const quote = quotes.find(q => q.id === req.params.id);
  
  if (!quote) {
    return res.status(404).json({
      success: false,
      error: 'Quote not found'
    });
  }
  
  const newOrder = {
    id: uuidv4(),
    orderNumber: `SO-2024-${String(orders.length + 1).padStart(3, '0')}`,
    customerId: quote.customerId,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    total: quote.total,
    items: quote.items,
    quoteId: quote.id,
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  quote.status = 'Converted';
  
  res.status(201).json({
    success: true,
    data: newOrder
  });
});

module.exports = router;
