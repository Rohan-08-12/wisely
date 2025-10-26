const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TransactionsController {
  // GET /api/transactions
  static async getTransactions(req, res, next) {
    try {
      const { from, to, category, limit = 50, cursor } = req.query;

      // Check if user has any goals (transactions only visible after goals are created)
      const goalCount = await prisma.goal.count({
        where: { userId: req.user.id }
      });

      if (goalCount === 0) {
        return res.status(403).json({
          error: {
            code: 'NO_GOALS',
            message: 'Transactions are only visible after creating at least one goal'
          }
        });
      }

      const where = {
        userId: req.user.id
      };

      // Add date filters
      if (from || to) {
        where.date = {};
        if (from) where.date.gte = new Date(from);
        if (to) where.date.lte = new Date(to);
      }

      // Add category filter
      if (category) {
        where.category = category;
      }

      // Add cursor for pagination
      if (cursor) {
        where.id = { lt: parseInt(cursor) };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: parseInt(limit),
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

      const nextCursor = transactions.length === parseInt(limit) 
        ? transactions[transactions.length - 1].id 
        : null;

      res.json({
        items: transactions,
        nextCursor
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/transactions/:id
  static async getTransaction(req, res, next) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: req.user.id
        }
      });

      if (!transaction) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Transaction not found'
          }
        });
      }

      res.json(transaction);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionsController;
