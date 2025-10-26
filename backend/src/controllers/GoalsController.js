const { PrismaClient } = require('@prisma/client');
const GoalEvaluationService = require('../services/goalEvaluationService');

const prisma = new PrismaClient();

class GoalsController {
  // GET /api/goals
  static async getGoals(req, res, next) {
    try {
      // Get all user transactions for calculating progress
      const allTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id }
      });

      const goals = await prisma.goal.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      const goalsWithProgress = goals.map(goal => {
        const progress = GoalEvaluationService.calculateGoalProgress(goal, allTransactions);
        return {
          id: goal.id,
          title: goal.title,
          type: goal.type,
          category: goal.category,
          period: goal.period,
          maxSpend: goal.maxSpend,
          targetAmount: goal.targetAmount,
          currentProgress: goal.currentProgress,
          startDate: goal.startDate,
          createdAt: goal.createdAt,
          progress
        };
      });

      res.json(goalsWithProgress);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/goals
  static async createGoal(req, res, next) {
    try {
      const { title, type, category, period, maxSpend, targetAmount } = req.body;

      // Validate goal-specific fields
      if (type === 'LIMIT') {
        if (!category || !period || !maxSpend) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'LIMIT goals require category, period, and maxSpend'
            }
          });
        }
      } else if (type === 'SAVINGS') {
        if (!targetAmount) {
          return res.status(400).json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'SAVINGS goals require targetAmount'
            }
          });
        }
      }

      const goal = await prisma.goal.create({
        data: {
          userId: req.user.id,
          title,
          type,
          category: type === 'LIMIT' ? category : null,
          period: type === 'LIMIT' ? period : null,
          maxSpend: type === 'LIMIT' ? maxSpend : null,
          targetAmount: type === 'SAVINGS' ? targetAmount : null,
          currentProgress: 0
        }
      });

      // Get all user transactions for calculating progress
      const allTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id }
      });

      const progress = GoalEvaluationService.calculateGoalProgress(goal, allTransactions);

      res.status(201).json({
        id: goal.id,
        title: goal.title,
        type: goal.type,
        category: goal.category,
        period: goal.period,
        maxSpend: goal.maxSpend,
        targetAmount: goal.targetAmount,
        currentProgress: goal.currentProgress,
        startDate: goal.startDate,
        createdAt: goal.createdAt,
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/goals/:id
  static async getGoal(req, res, next) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: req.user.id
        },
        include: {
          transactions: {
            orderBy: { date: 'desc' }
          }
        }
      });

      if (!goal) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Goal not found'
          }
        });
      }

      // Get all user transactions for calculating progress
      const allTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id }
      });

      const progress = GoalEvaluationService.calculateGoalProgress(goal, allTransactions);

      res.json({
        id: goal.id,
        title: goal.title,
        type: goal.type,
        category: goal.category,
        period: goal.period,
        maxSpend: goal.maxSpend,
        targetAmount: goal.targetAmount,
        currentProgress: goal.currentProgress,
        startDate: goal.startDate,
        createdAt: goal.createdAt,
        progress,
        transactions: goal.transactions
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/goals/:id
  static async updateGoal(req, res, next) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: req.user.id
        }
      });

      if (!goal) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Goal not found'
          }
        });
      }

      const { title, category, period, maxSpend, targetAmount } = req.body;
      const updateData = {};

      if (title !== undefined) updateData.title = title;
      if (category !== undefined) updateData.category = category;
      if (period !== undefined) updateData.period = period;
      if (maxSpend !== undefined) updateData.maxSpend = maxSpend;
      if (targetAmount !== undefined) updateData.targetAmount = targetAmount;

      const updatedGoal = await prisma.goal.update({
        where: { id: goal.id },
        data: updateData
      });

      // Get all user transactions for calculating progress
      const allTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id }
      });

      const progress = GoalEvaluationService.calculateGoalProgress(updatedGoal, allTransactions);

      res.json({
        id: updatedGoal.id,
        title: updatedGoal.title,
        type: updatedGoal.type,
        category: updatedGoal.category,
        period: updatedGoal.period,
        maxSpend: updatedGoal.maxSpend,
        targetAmount: updatedGoal.targetAmount,
        currentProgress: updatedGoal.currentProgress,
        startDate: updatedGoal.startDate,
        createdAt: updatedGoal.createdAt,
        progress
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/goals/:id
  static async deleteGoal(req, res, next) {
    try {
      const goal = await prisma.goal.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: req.user.id
        }
      });

      if (!goal) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Goal not found'
          }
        });
      }

      await prisma.goal.delete({
        where: { id: goal.id }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoalsController;
