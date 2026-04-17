import type { Notification } from './types/notification';


export async function getNotifications(): Promise<Notification[]> {
  const res = await fetch(`/api/notifications?sort=createdAt:desc&populate=*`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  const { data } = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function markAsRead(documentId: string) {
  const res = await fetch(`/api/notifications/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: { isRead: true } }),
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}
