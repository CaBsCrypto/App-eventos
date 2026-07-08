/** Dominio: leaderboard (ranking real por XP). */
import { http } from './client';

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  initials: string;
  points: number;
  badges: number;
}

export const leaderboardApi = {
  /** GET /api/leaderboard — ranking por XP (fuente de verdad). */
  list: () => http.get<LeaderboardEntry[]>('/api/leaderboard'),
};
