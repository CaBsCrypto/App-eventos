/**
 * Dominio: asistentes / perfil / auth (wallet embebida Privy).
 * Mapea `/api/attendees*`. El "usuario actual" del handoff (User/Profile) se
 * modela sobre `Attendee`; los campos de perfil extendido (city, bio, handles…)
 * se añaden progresivamente al backend.
 */
import { http } from './client';
import type { Attendee } from '../../types';

export interface OnboardInput {
  name: string;
  email: string;
  walletAddress: string;
  walletType: string;
}

export const attendeesApi = {
  /** GET /api/attendees */
  list: () => http.get<Attendee[]>('/api/attendees'),

  /** POST /api/attendees/onboard — crea/recupera el asistente (wallet embebida). */
  onboard: (input: OnboardInput) => http.post<Attendee>('/api/attendees/onboard', input),

  /** POST /api/attendees/:id/register-event */
  registerEvent: (id: string, eventId: string) =>
    http.post<Attendee>(`/api/attendees/${id}/register-event`, { eventId }),

  /** POST /api/attendees/:id/unregister-event */
  unregisterEvent: (id: string, eventId: string) =>
    http.post<Attendee>(`/api/attendees/${id}/unregister-event`, { eventId }),

  /** POST /api/attendees/:id/register-activity */
  registerActivity: (id: string, activityId: string) =>
    http.post<Attendee>(`/api/attendees/${id}/register-activity`, { activityId }),

  /** POST /api/attendees/:id/toggle-follow — persiste seguir organizador. */
  toggleFollow: (id: string, organizerId: string) =>
    http.post<Attendee>(`/api/attendees/${id}/toggle-follow`, { organizerId }),

  /** POST /api/attendees/:id/profile — persiste los campos de perfil (Ajustes). */
  updateProfile: (
    id: string,
    profile: Partial<{ name: string; user: string; email: string; city: string; bio: string; phone: string; handles: Record<string, string> }>,
  ) => http.post<Attendee>(`/api/attendees/${id}/profile`, profile),

  /** POST /api/attendees/:id/activities/complete — completa misión, otorga XP. */
  completeActivity: (id: string, activityId: string, eventId: string) =>
    http.post<Attendee>(`/api/attendees/${id}/activities/complete`, { activityId, eventId }),

  /** POST /api/attendees/:id/mint-poap — registra la insignia acuñada on-chain. */
  mintPoap: (
    id: string,
    payload: {
      eventId: string;
      txHash: string;
      chainName: string;
      blockNumber: number;
      contractAddress: string;
      tokenId: string;
    },
  ) => http.post<Attendee>(`/api/attendees/${id}/mint-poap`, payload),
};
