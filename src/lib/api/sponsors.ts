/** Dominio: sponsors (tracking de impresiones/clics). */
import { http } from './client';

export const sponsorsApi = {
  /** POST /api/sponsors/:id/click */
  trackClick: (sponsorId: string) => http.post<void>(`/api/sponsors/${sponsorId}/click`),
};
