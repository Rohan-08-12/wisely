const express = require('express');
const { body, validationResult } = require('express-validator');
const GoalsController = require('../controllers/GoalsController');

const router = express.Router();

// Validation middleware
const validateGoal = [
  body('title').isLength({ min: 1, max: 100 }),
  body('type').isIn(['LIMIT', 'SAVINGS']),
  body('category').optional().isLength({ min: 1 }),
  body('period').optional().isIn(['WEEK', 'MONTH']),
  body('maxSpend').optional().isFloat({ min: 0 }),
  body('targetAmount').optional().isFloat({ min: 0 })
];

// GET /api/goals
router.get('/', GoalsController.getGoals);

// POST /api/goals
router.post('/', validateGoal, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  GoalsController.createGoal(req, res, next);
});

// GET /api/goals/:id
router.get('/:id', GoalsController.getGoal);

// PATCH /api/goals/:id
router.patch('/:id', validateGoal, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  GoalsController.updateGoal(req, res, next);
});

// DELETE /api/goals/:id
router.delete('/:id', GoalsController.deleteGoal);

module.exports = router;

