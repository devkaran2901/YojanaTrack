import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getNotificationsRouteSchema, readNotificationRouteSchema } from './notifications.schema';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', validate(getNotificationsRouteSchema), NotificationsController.getNotifications);
notificationsRouter.get('/unread-count', NotificationsController.getUnreadCount);
notificationsRouter.patch('/read-all', NotificationsController.markAllAsRead);
notificationsRouter.patch('/:id/read', validate(readNotificationRouteSchema), NotificationsController.markAsRead);
