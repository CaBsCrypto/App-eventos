/** Dominio: eventos. Mapea los endpoints `/api/events*` del backend. */
import { http } from './client';
import type { Event } from '../../types';

export const eventsApi = {
  /** GET /api/events */
  list: () => http.get<Event[]>('/api/events'),

  /** GET /api/events/by-code/:code — resuelve invitaciones (shortCode o id). */
  byCode: (code: string) => http.get<Event>(`/api/events/by-code/${encodeURIComponent(code)}`),

  /** POST /api/events — crea un evento (panel organizador). */
  create: (event: Partial<Event>) => http.post<Event>('/api/events', event),

  /** DELETE /api/events/:eventId/activities/:activityId */
  deleteActivity: (eventId: string, activityId: string) =>
    http.delete<Event>(`/api/events/${eventId}/activities/${activityId}`),

  /** POST /api/events/:id/activities/:actId/feedback */
  submitFeedback: (
    eventId: string,
    activityId: string,
    payload: { attendeeName: string; rating: number; comment: string },
  ) => http.post<Event>(`/api/events/${eventId}/activities/${activityId}/feedback`, payload),
};
