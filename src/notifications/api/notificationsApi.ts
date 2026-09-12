import { apiClient } from '../../core/api/apiClient';
import type { NotificationResponse, PagedResponse } from '../../types/api';

export async function getNotifications(page: number) {
  return apiClient.get<PagedResponse<NotificationResponse>>(`/notifications?page=${page}&size=20`);
}

export async function markNotificationRead(id: number) {
  return apiClient.post<void>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  return apiClient.post<void>('/notifications/read-all');
}
