/** Dominio: notificaciones. Mapea `/api/notifications*`. */
import { http } from './client';
import type { NotificationItem } from '../../types';

export const notificationsApi = {
  /** GET /api/notifications */
  list: () => http.get<NotificationItem[]>('/api/notifications'),

  /** POST /api/notifications/clear — marca todas como leídas. */
  clear: () => http.post<void>('/api/notifications/clear'),
};
