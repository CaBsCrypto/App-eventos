/**
 * Logros automáticos — se desbloquean según el estado del asistente.
 * Derivados en el cliente desde `Attendee` (no requieren backend nuevo).
 */
import type { Attendee } from '../types';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  /** Progreso actual y objetivo, para la barra. */
  progress: (a: Attendee | null) => { current: number; goal: number };
}

const len = (arr?: unknown[]) => (arr ? arr.length : 0);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-rsvp', icon: '🎫', title: 'Primer RSVP',
    desc: 'Regístrate en tu primer evento.',
    progress: (a) => ({ current: Math.min(1, len(a?.registeredEvents)), goal: 1 }),
  },
  {
    id: 'first-mission', icon: '✅', title: 'Primera misión',
    desc: 'Completa tu primera misión en un evento.',
    progress: (a) => ({ current: Math.min(1, len(a?.completedActivities)), goal: 1 }),
  },
  {
    id: 'five-missions', icon: '🎯', title: 'Cazador de misiones',
    desc: 'Completa 5 misiones.',
    progress: (a) => ({ current: len(a?.completedActivities), goal: 5 }),
  },
  {
    id: 'first-badge', icon: '🏅', title: 'Coleccionista',
    desc: 'Consigue tu primera insignia NFT.',
    progress: (a) => ({ current: Math.min(1, len(a?.badges)), goal: 1 }),
  },
  {
    id: 'xp-500', icon: '⭐', title: 'Nivel experto',
    desc: 'Acumula 500 XP.',
    progress: (a) => ({ current: a?.points ?? 0, goal: 500 }),
  },
  {
    id: 'xp-1000', icon: '🔥', title: 'Leyenda',
    desc: 'Acumula 1000 XP.',
    progress: (a) => ({ current: a?.points ?? 0, goal: 1000 }),
  },
  {
    id: 'explorer', icon: '🌐', title: 'Explorador',
    desc: 'Sigue a 3 organizadores.',
    progress: (a) => ({ current: len(a?.follows), goal: 3 }),
  },
  {
    id: 'social', icon: '🤝', title: 'Conectado',
    desc: 'Regístrate en 3 eventos.',
    progress: (a) => ({ current: len(a?.registeredEvents), goal: 3 }),
  },
];

export function isUnlocked(a: Attendee | null, ach: Achievement): boolean {
  const { current, goal } = ach.progress(a);
  return current >= goal;
}
