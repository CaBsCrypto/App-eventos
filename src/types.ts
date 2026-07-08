export type EventCategory = 'Conference' | 'Hacker House' | 'Workshop' | 'Meetup';
export type SponsorTier = 'Platinum' | 'Gold' | 'Silver';
export type ActivityType = 'CheckIn' | 'Keynote' | 'Workshop' | 'Hackathon' | 'Feedback' | 'SponsorVisit';
export type WalletType = 'Privy' | 'MetaMask' | 'Phantom' | 'Coinbase' | 'Demo';

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  tier: SponsorTier;
  link: string;
  impressions: number;
  clicks: number;
}

export interface Feedback {
  id: string;
  attendeeName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  points: number;
  type: ActivityType;
  required: boolean;
  sponsorId?: string; // Optional sponsor link
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  expectedAttendance: number;
  actualAttendance: number;
  image: string;
  sponsors: Sponsor[];
  activities: Activity[];
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  ticketPrice?: string;
  timezone?: string;
  shortCode?: string;
}

export interface DynamicMetadata {
  level: number;
  activitiesCompleted: number;
  completionTime: string;
  txHash: string;
  chain?: string;
  contractAddress?: string;
  blockNumber?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  image: string;
  unlockedAt?: string;
  nftId?: string; // Simulated ERC-721 token ID
  dynamicMetadata?: DynamicMetadata;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  walletType: WalletType;
  joinedAt: string;
  points: number;
  completedActivities: string[]; // List of activity IDs
  badges: Badge[];
  checkedIn: boolean;
  calendarSynced: boolean;
  registeredEvents?: string[]; // Optional list of event IDs the attendee has registered for
  registeredActivities?: string[]; // Optional list of activity IDs the attendee has registered for
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface OfflineAction {
  id: string;
  type: 'CHECK_IN' | 'COMPLETE_ACTIVITY' | 'SUBMIT_FEEDBACK' | 'REGISTER_EVENT';
  payload: any;
  timestamp: string;
}

/*
  ============================================================================
  Tipos del nuevo diseño EventProtocol (handoff "LatAm Protocol Prototipo v3").
  Aditivos: modelan las pantallas nuevas (Landing/Descubrir/Perfil/Ajustes) y
  el vocabulario del prototipo (misiones, organizadores, XP). Se alinean con
  los tipos base de arriba (Event/Activity/Badge/Attendee) para no duplicar.
  ============================================================================
*/

/** Vista raíz del prototipo: pública vs. app interna. */
export type AppView = 'landing' | 'app';

/** Pantalla activa dentro de la app interna (state.screen). */
export type AppScreen =
  | 'discover'
  | 'events'
  | 'invite'
  | 'create'
  | 'leaderboard'
  | 'badges'
  | 'history'
  | 'settings';

/** Misión de evento (equivalente de diseño a `Activity`, con XP). */
export interface Mission {
  id: string;
  title: string;
  points: number;
  typeLabel: string;
  icon: string;
  required: boolean;
}

/** Insignia del diseño: general de plataforma o creada por el organizador. */
export interface BadgeMeta {
  id: string;
  emoji: string;
  name: string;
  type: 'general' | 'event';
  org?: string;
  unlocked: boolean;
  level: number;
  desc: string;
}

/** Organizador seguible (pantalla Descubrir). */
export interface Organizer {
  id: string;
  name: string;
  logo: string;
  desc: string;
  meta: string;
  followed: boolean;
}

/** Fila del leaderboard por XP. */
export interface LeaderboardRow {
  rank: number;
  name: string;
  initials: string;
  meta: string;
  points: number;
  isYou: boolean;
}

/** Enlaces sociales del perfil (GitHub/LinkedIn/X/Instagram). */
export interface ProfileHandles {
  github?: string;
  linkedin?: string;
  x?: string;
  instagram?: string;
}

/** Perfil extendido (Perfil/Historial + Ajustes). Sobre `Attendee`. */
export interface Profile {
  name: string;
  user: string;
  email: string;
  city: string;
  bio: string;
  wallet: string;
  phone?: string;
  handles: ProfileHandles;
  xp: number;
}
