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
}

export interface DynamicMetadata {
  level: number;
  activitiesCompleted: number;
  completionTime: string;
  txHash: string;
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
