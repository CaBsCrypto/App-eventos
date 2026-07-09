/** Dominio: eventos. Mapea los endpoints `/api/events*` del backend. */
import { http } from './client';
import type { Event, Attendee } from '../../types';

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

  // --- Acreditación por QR ---

  /** POST /api/events/:id/credential — token firmado para el QR del asistente. */
  credential: (eventId: string, attendeeId: string) =>
    http.post<{ token: string }>(`/api/events/${eventId}/credential`, { attendeeId }),

  /** POST /api/events/:id/checkin — acredita por token (QR) o attendeeId (manual). */
  checkin: (eventId: string, payload: { token?: string; attendeeId?: string }) =>
    http.post<{ attendee: { id: string; name: string; email: string }; at: string; already: boolean }>(
      `/api/events/${eventId}/checkin`,
      payload,
    ),

  /** GET /api/events/:id/accredited — lista de acreditados del evento. */
  accredited: (eventId: string) =>
    http.get<{ attendeeId: string; name: string; email: string; at: string }[]>(
      `/api/events/${eventId}/accredited`,
    ),

  /** POST /api/events/:id/redeem — canje por frase secreta (acredita + acuña). */
  redeem: (eventId: string, payload: { attendeeId: string; phrase: string }) =>
    http.post<{ attendee: Attendee; redeemed: boolean }>(`/api/events/${eventId}/redeem`, payload),
};
