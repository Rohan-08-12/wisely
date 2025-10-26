const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class NotificationsController {
  // GET /api/notifications
  static async getNotifications(req, res, next) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/notifications/:id/read
  static async markAsRead(req, res, next) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: parseInt(req.params.id),
          userId: req.user.id
        }
      });

      if (!notification) {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found'
          }
        });
      }

      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: 'READ' }
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationsController;
