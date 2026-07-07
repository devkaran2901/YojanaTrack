import { api } from '../../../lib/api';

export interface NotificationItem {
  _id: string;
  userId: string;
  schemeId: {
    _id: string;
    title: string;
    slug: string;
  };
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getNotifications = async (params?: { page?: number; limit?: number }): Promise<NotificationsResponse> => {
  const { data } = await api.get('/notifications', { params });
  return data.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const { data } = await api.get('/notifications/unread-count');
  return data.data;
};

export const markAsRead = async (id: string): Promise<NotificationItem> => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
};

export const markAllAsRead = async (): Promise<{ success: boolean }> => {
  const { data } = await api.patch('/notifications/read-all');
  return data.data;
};
