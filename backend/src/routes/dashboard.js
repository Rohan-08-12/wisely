const express = require('express');
const DashboardController = require('../controllers/DashboardController');

const router = express.Router();

// GET /api/dashboard
router.get('/', DashboardController.getDashboard);

module.exports = router;

