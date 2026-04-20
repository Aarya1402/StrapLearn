import axios from 'axios';
import type { Notification } from './types/notification';

export async function getNotifications(): Promise<Notification[]> {
  try {
    const res = await axios.get(`/api/notifications?sort=createdAt:desc&populate=*`);
    const { data } = res.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw new Error('Failed to fetch notifications');
  }
}

export async function markAsRead(documentId: string) {
  try {
    const res = await axios.put(`/api/notifications/${documentId}`, {
      data: { isRead: true }
    });
    return res.data;
  } catch (error) {
    throw new Error('Failed to mark notification as read');
  }
}
