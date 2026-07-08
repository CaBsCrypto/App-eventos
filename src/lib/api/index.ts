/**
 * Punto de entrada de la capa de datos EventProtocol.
 *
 * Uso:  import { api } from '@/src/lib/api';  api.events.list();
 *
 * Cada dominio agrupa los endpoints del backend Express (server-app.ts).
 * Endpoints del handoff aún no implementados en backend (organizers/follow,
 * discover, leaderboard, PATCH /me, badges/mint catálogo) se añadirán como
 * módulos nuevos aquí conforme el backend los exponga.
 */
export { http, ApiError } from './client';
export { eventsApi } from './events';
export { attendeesApi, type OnboardInput } from './attendees';
export { notificationsApi } from './notifications';
export { sponsorsApi } from './sponsors';

import { eventsApi } from './events';
import { attendeesApi } from './attendees';
import { notificationsApi } from './notifications';
import { sponsorsApi } from './sponsors';

export const api = {
  events: eventsApi,
  attendees: attendeesApi,
  notifications: notificationsApi,
  sponsors: sponsorsApi,
};
