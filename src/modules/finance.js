const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data store (replace with database in production)
let accounts = [
  { id: '1', code: '1000', name: 'Cash', type: 'Asset', balance: 50000 },
  { id: '2', code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 25000 },
  { id: '3', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 15000 },
  { id: '4', code: '3000', name: 'Revenue', type: 'Revenue', balance: 100000 },
  { id: '5', code: '4000', name: 'Expenses', type: 'Expense', balance: 40000 }
];

let transactions = [];

// Get all accounts
router.get('/accounts', (req, res) => {
  const { type } = req.query;
  let filtered = accounts;
  
  if (type) {
    filtered = accounts.filter(acc => acc.type === type);
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Get single account
router.get('/accounts/:id', (req, res) => {
  const account = accounts.find(acc => acc.id === req.params.id);
  
  if (!account) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  res.json({
    success: true,
    data: account
  });
});

// Create account
router.post('/accounts', (req, res) => {
  const { code, name, type, balance = 0 } = req.body;
  
  if (!code || !name || !type) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: code, name, type'
    });
  }
  
  const newAccount = {
    id: uuidv4(),
    code,
    name,
    type,
    balance: parseFloat(balance)
  };
  
  accounts.push(newAccount);
  
  res.status(201).json({
    success: true,
    data: newAccount
  });
});

// Update account
router.put('/accounts/:id', (req, res) => {
  const index = accounts.findIndex(acc => acc.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Account not found'
    });
  }
  
  accounts[index] = {
    ...accounts[index],
    ...req.body,
    id: req.params.id
  };
  
  res.json({
    success: true,
    data: accounts[index]
  });
});

// Get all transactions
router.get('/transactions', (req, res) => {
  const { accountId, startDate, endDate } = req.query;
  let filtered = transactions;
  
  if (accountId) {
    filtered = filtered.filter(t => 
      t.debitAccountId === accountId || t.creditAccountId === accountId
    );
  }
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// Create transaction
router.post('/transactions', (req, res) => {
  const { date, description, debitAccountId, creditAccountId, amount } = req.body;
  
  if (!date || !description || !debitAccountId || !creditAccountId || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields'
    });
  }
  
  const newTransaction = {
    id: uuidv4(),
    date,
    description,
    debitAccountId,
    creditAccountId,
    amount: parseFloat(amount),
    createdAt: new Date().toISOString()
  };
  
  // Update account balances
  const debitAccount = accounts.find(acc => acc.id === debitAccountId);
  const creditAccount = accounts.find(acc => acc.id === creditAccountId);
  
  if (debitAccount) debitAccount.balance += parseFloat(amount);
  if (creditAccount) creditAccount.balance -= parseFloat(amount);
  
  transactions.push(newTransaction);
  
  res.status(201).json({
    success: true,
    data: newTransaction
  });
});

// Financial reports
router.get('/reports', (req, res) => {
  const { type = 'balance-sheet' } = req.query;
  
  if (type === 'balance-sheet') {
    const assets = accounts.filter(acc => acc.type === 'Asset')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const liabilities = accounts.filter(acc => acc.type === 'Liability')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const equity = assets - liabilities;
    
    res.json({
      success: true,
      report: 'Balance Sheet',
      data: {
        assets,
        liabilities,
        equity,
        total: assets
      }
    });
  } else if (type === 'income-statement') {
    const revenue = accounts.filter(acc => acc.type === 'Revenue')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const expenses = accounts.filter(acc => acc.type === 'Expense')
      .reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = revenue - expenses;
    
    res.json({
      success: true,
      report: 'Income Statement',
      data: {
        revenue,
        expenses,
        netIncome
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Invalid report type'
    });
  }
});

module.exports = router;
