import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const getNotificationsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const getNotificationsRouteSchema = z.object({
  query: getNotificationsSchema,
});

export const readNotificationRouteSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid notification ID format'),
  }),
});
