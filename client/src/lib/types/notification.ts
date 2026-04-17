export interface Notification {
  id: number;
  documentId: string;
  title: string;
  message: string;
  type: 'enrollment' | 'completion' | 'quiz' | 'system' | 'message';
  isRead: boolean;
  link?: string;
  createdAt: string;
  updatedAt: string;
}
