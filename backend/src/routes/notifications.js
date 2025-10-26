const express = require('express');
const NotificationsController = require('../controllers/NotificationsController');

const router = express.Router();

// GET /api/notifications
router.get('/', NotificationsController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', NotificationsController.markAsRead);

module.exports = router;

