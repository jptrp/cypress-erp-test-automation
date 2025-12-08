const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data store
let items = [
  { id: '1', sku: 'ITM001', name: 'Laptop Computer', description: 'Business laptop', unitPrice: 1200, category: 'Electronics' },
  { id: '2', sku: 'ITM002', name: 'Office Chair', description: 'Ergonomic office chair', unitPrice: 350, category: 'Furniture' },
  { id: '3', sku: 'ITM003', name: 'Desk', description: 'Standing desk', unitPrice: 800, category: 'Furniture' }
];

let stockLevels = [
  { id: '1', itemId: '1', warehouseId: 'WH001', quantity: 50, reorderPoint: 10 },
  { id: '2', itemId: '2', warehouseId: 'WH001', quantity: 30, reorderPoint: 5 },
  { id: '3', itemId: '3', warehouseId: 'WH001', quantity: 20, reorderPoint: 5 }
];

let warehouses = [
  { id: 'WH001', code: 'WH001', name: 'Main Warehouse', location: 'New York, NY' },
  { id: 'WH002', code: 'WH002', name: 'West Coast Warehouse', location: 'Los Angeles, CA' }
];

// Get all items
router.get('/items', (req, res) => {
  const { category, search } = req.query;
  let filtered = items;
  
  if (category) {
    filtered = filtered.filter(item => item.category === category);
  }
  
  if (search) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single item
router.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === req.params.id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  res.json({
    success: true,
    data: item
  });
});

// Create item
router.post('/items', (req, res) => {
  const { sku, name, description, unitPrice, category } = req.body;
  
  if (!sku || !name || !unitPrice) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: sku, name, unitPrice'
    });
  }
  
  const newItem = {
    id: uuidv4(),
    sku,
    name,
    description: description || '',
    unitPrice: parseFloat(unitPrice),
    category: category || 'Uncategorized',
    createdAt: new Date().toISOString()
  };
  
  items.push(newItem);
  
  res.status(201).json({
    success: true,
    data: newItem
  });
});

// Update item
router.put('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  items[index] = {
    ...items[index],
    ...req.body,
    id: req.params.id
  };
  
  res.json({
    success: true,
    data: items[index]
  });
});

// Delete item
router.delete('/items/:id', (req, res) => {
  const index = items.findIndex(i => i.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found'
    });
  }
  
  items.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
});

// Get stock levels
router.get('/stock', (req, res) => {
  const { itemId, warehouseId, lowStock } = req.query;
  let filtered = stockLevels;
  
  if (itemId) {
    filtered = filtered.filter(s => s.itemId === itemId);
  }
  
  if (warehouseId) {
    filtered = filtered.filter(s => s.warehouseId === warehouseId);
  }
  
  if (lowStock === 'true') {
    filtered = filtered.filter(s => s.quantity <= s.reorderPoint);
  }
  
  // Enrich with item details
  const enriched = filtered.map(stock => {
    const item = items.find(i => i.id === stock.itemId);
    return {
      ...stock,
      itemName: item?.name,
      itemSku: item?.sku
    };
  });
  
  res.json({
    success: true,
    count: enriched.length,
    data: enriched
  });
});

// Update stock level
router.put('/stock/:id', (req, res) => {
  const index = stockLevels.findIndex(s => s.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Stock record not found'
    });
  }
  
  stockLevels[index] = {
    ...stockLevels[index],
    ...req.body,
    id: req.params.id
  };
  
  res.json({
    success: true,
    data: stockLevels[index]
  });
});

// Stock adjustment
router.post('/stock/adjust', (req, res) => {
  const { itemId, warehouseId, quantity, reason } = req.body;
  
  if (!itemId || !warehouseId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  const stock = stockLevels.find(s => s.itemId === itemId && s.warehouseId === warehouseId);
  
  if (!stock) {
    return res.status(404).json({
      success: false,
      error: 'Stock record not found'
    });
  }
  
  const oldQuantity = stock.quantity;
  stock.quantity += parseInt(quantity);
  
  res.json({
    success: true,
    message: 'Stock adjusted successfully',
    data: {
      itemId,
      warehouseId,
      oldQuantity,
      adjustment: quantity,
      newQuantity: stock.quantity,
      reason: reason || 'Manual adjustment'
    }
  });
});

// Get warehouses
router.get('/warehouses', (req, res) => {
  res.json({
    success: true,
    count: warehouses.length,
    data: warehouses
  });
});

module.exports = router;
