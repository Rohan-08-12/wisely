const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class GoalEvaluationService {
  // Evaluate all goals for a user
  static async evaluateUserGoals(userId) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        transactions: true
      }
    });

    const notifications = [];

    for (const goal of goals) {
      if (goal.type === 'LIMIT') {
        const notification = await this.evaluateLimitGoal(goal);
        if (notification) {
          notifications.push(notification);
        }
      } else if (goal.type === 'SAVINGS') {
        const notification = await this.evaluateSavingsGoal(goal);
        if (notification) {
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }

  // Evaluate LIMIT goal
  static async evaluateLimitGoal(goal) {
    if (!goal.category || !goal.period || !goal.maxSpend) {
      return null;
    }

    const now = new Date();
    let periodStart, periodEnd;

    if (goal.period === 'WEEK') {
      // Get start of current week (Monday)
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - daysToMonday);
      periodStart.setHours(0, 0, 0, 0);
      
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else if (goal.period === 'MONTH') {
      // Get start of current month
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      return null;
    }

    // Calculate spending for the period
    // Handle both Date objects and ISO strings
    const periodTransactions = goal.transactions.filter(t => {
      if (t.type !== 'DEBIT' || t.category !== goal.category) {
        return false;
      }
      const transDate = t.date instanceof Date ? t.date : new Date(t.date);
      return transDate >= periodStart && transDate <= periodEnd;
    });

    const periodSpend = periodTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Check if limit is exceeded
    if (periodSpend >= goal.maxSpend) {
      // Check if we already have a notification for this period
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId: goal.userId,
          type: 'LIMIT_HIT',
          meta: {
            path: ['goalId'],
            equals: goal.id
          },
          createdAt: {
            gte: periodStart
          }
        }
      });

      if (!existingNotification) {
        const message = `${goal.title} exceeded: $${periodSpend.toFixed(2)} spent this ${goal.period.toLowerCase()}.`;
        
        return await prisma.notification.create({
          data: {
            userId: goal.userId,
            type: 'LIMIT_HIT',
            message,
            meta: {
              goalId: goal.id,
              periodSpend,
              maxSpend: goal.maxSpend,
              periodStart: periodStart.toISOString(),
              periodEnd: periodEnd.toISOString()
            }
          }
        });
      }
    }

    return null;
  }

  // Evaluate SAVINGS goal
  static async evaluateSavingsGoal(goal) {
    if (!goal.targetAmount) {
      return null;
    }

    // Calculate current progress from transactions
    const creditTransactions = goal.transactions.filter(t => t.type === 'CREDIT');
    const currentProgress = creditTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Update goal progress
    await prisma.goal.update({
      where: { id: goal.id },
      data: { currentProgress }
    });

    // Check for milestones (25%, 50%, 75%, 100%)
    const milestones = [0.25, 0.5, 0.75, 1.0];
    const currentPercent = currentProgress / goal.targetAmount;

    for (const milestone of milestones) {
      if (currentPercent >= milestone && currentPercent < milestone + 0.01) {
        // Check if we already have a notification for this milestone
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: goal.userId,
            type: 'SAVINGS_MILESTONE',
            meta: {
              path: ['goalId', 'milestone'],
              equals: [goal.id, milestone]
            }
          }
        });

        if (!existingNotification) {
          const milestonePercent = Math.round(milestone * 100);
          const message = `${goal.title}: ${milestonePercent}% complete! $${currentProgress.toFixed(2)} of $${goal.targetAmount.toFixed(2)} saved.`;
          
          return await prisma.notification.create({
            data: {
              userId: goal.userId,
              type: 'SAVINGS_MILESTONE',
              message,
              meta: {
                goalId: goal.id,
                milestone,
                currentProgress,
                targetAmount: goal.targetAmount
              }
            }
          });
        }
      }
    }

    return null;
  }

  // Calculate goal progress
  static calculateGoalProgress(goal, transactions = []) {
    if (goal.type === 'LIMIT') {
      return this.calculateLimitProgress(goal, transactions);
    } else if (goal.type === 'SAVINGS') {
      return this.calculateSavingsProgress(goal, transactions);
    }
    return null;
  }

  // Calculate LIMIT goal progress
  static calculateLimitProgress(goal, transactions) {
    if (!goal.category || !goal.period || !goal.maxSpend) {
      return null;
    }

    const now = new Date();
    let periodStart, periodEnd;

    if (goal.period === 'WEEK') {
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      periodStart = new Date(now);
      periodStart.setDate(now.getDate() - daysToMonday);
      periodStart.setHours(0, 0, 0, 0);
      
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      periodEnd.setHours(23, 59, 59, 999);
    } else if (goal.period === 'MONTH') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      return null;
    }

    // Filter transactions - handle both Date objects and ISO strings
    const periodTransactions = transactions.filter(t => {
      if (t.type !== 'DEBIT' || t.category !== goal.category) {
        return false;
      }
      
      // Convert date to Date object if it's a string
      const transDate = t.date instanceof Date ? t.date : new Date(t.date);
      return transDate >= periodStart && transDate <= periodEnd;
    });

    const spend = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = Math.max(0, goal.maxSpend - spend);
    const percent = Math.min(100, (spend / goal.maxSpend) * 100);

    return {
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      spend: parseFloat(spend.toFixed(2)),
      remaining: parseFloat(remaining.toFixed(2)),
      percent: parseFloat(percent.toFixed(1))
    };
  }

  // Calculate SAVINGS goal progress
  static calculateSavingsProgress(goal, transactions) {
    if (!goal.targetAmount) {
      return null;
    }

    const creditTransactions = transactions.filter(t => t.type === 'CREDIT');
    const current = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
    const percent = Math.min(100, (current / goal.targetAmount) * 100);

    return {
      current: parseFloat(current.toFixed(2)),
      target: parseFloat(goal.targetAmount.toFixed(2)),
      percent: parseFloat(percent.toFixed(1))
    };
  }
}

module.exports = GoalEvaluationService;

