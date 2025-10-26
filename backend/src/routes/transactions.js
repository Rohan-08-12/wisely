const express = require('express');
const TransactionsController = require('../controllers/TransactionsController');

const router = express.Router();

// GET /api/transactions
router.get('/', TransactionsController.getTransactions);

// GET /api/transactions/:id
router.get('/:id', TransactionsController.getTransaction);

module.exports = router;

