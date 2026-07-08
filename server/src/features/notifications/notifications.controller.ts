import { Request, Response, NextFunction } from 'express';
import { Notification } from '../../models/Notification';

export class NotificationsController {
  static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('schemeId', 'title slug')
          .lean(),
        Notification.countDocuments({ userId }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const count = await Notification.countDocuments({ userId, isRead: false });

      res.status(200).json({
        success: true,
        data: { count },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const notificationId = req.params.id;

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      ).populate('schemeId', 'title slug').lean();

      if (!notification) {
        throw { statusCode: 404, message: 'Notification not found' };
      }

      res.status(200).json({
        success: true,
        data: notification,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      await Notification.updateMany({ userId, isRead: false }, { isRead: true });

      res.status(200).json({
        success: true,
        data: { success: true },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
