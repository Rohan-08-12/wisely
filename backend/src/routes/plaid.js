const express = require('express');
const PlaidController = require('../controllers/PlaidController');

const router = express.Router();

// POST /api/plaid/link-token
router.post('/link-token', PlaidController.createLinkToken);

// POST /api/plaid/exchange
router.post('/exchange', PlaidController.exchangePublicToken);

// POST /api/plaid/sync (dev only)
router.post('/sync', PlaidController.syncTransactions);

// POST /api/plaid/webhook
router.post('/webhook', PlaidController.handleWebhook);

module.exports = router;

