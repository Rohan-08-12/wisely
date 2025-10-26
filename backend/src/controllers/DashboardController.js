const { PrismaClient } = require('@prisma/client');
const GoalEvaluationService = require('../services/goalEvaluationService');

const prisma = new PrismaClient();

class DashboardController {
  // GET /api/dashboard
  static async getDashboard(req, res, next) {
    try {
      // Get all user transactions (for calculating goal progress)
      const allTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id }
      });

      // Get goals with progress
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
          progress
        };
      });

      // Get recent transactions (last 5)
      const recentTransactions = await prisma.transaction.findMany({
        where: { userId: req.user.id },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          date: true,
          description: true,
          merchantName: true,
          category: true,
          amount: true,
          type: true
        }
      });

      // Get unread notifications count
      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.user.id,
          status: 'UNREAD'
        }
      });

      res.json({
        goals: goalsWithProgress,
        recentTransactions,
        notifications: {
          unread: unreadCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
