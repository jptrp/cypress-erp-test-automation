require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Import modules
const financeModule = require('./src/modules/finance');
const inventoryModule = require('./src/modules/inventory');
const salesModule = require('./src/modules/sales');
const purchasingModule = require('./src/modules/purchasing');
const featureFlagsMiddleware = require('./src/middleware/featureFlags');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Feature flags middleware
app.use(featureFlagsMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API root
app.get('/api', (req, res) => {
  res.json({
    message: 'ERP System API',
    version: '1.0.0',
    modules: ['finance', 'inventory', 'sales', 'purchasing'],
    endpoints: {
      finance: '/api/finance',
      inventory: '/api/inventory',
      sales: '/api/sales',
      purchasing: '/api/purchasing'
    }
  });
});

// Module routes
app.use('/api/finance', financeModule);
app.use('/api/inventory', inventoryModule);
app.use('/api/sales', salesModule);
app.use('/api/purchasing', purchasingModule);

// Feature flags endpoint
app.get('/api/feature-flags', (req, res) => {
  res.json({
    enabled: process.env.FEATURE_FLAGS_ENABLED === 'true',
    flags: req.featureFlags || {}
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ERP Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Feature Flags: ${process.env.FEATURE_FLAGS_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;
