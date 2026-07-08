import { Event, Attendee, Badge, Sponsor } from './types.js';

export const INITIAL_SPONSORS: Sponsor[] = [
  {
    id: 'sp1',
    name: 'Google Cloud',
    logo: '⚡',
    tier: 'Platinum',
    link: 'https://cloud.google.com',
    impressions: 1240,
    clicks: 145
  },
  {
    id: 'sp2',
    name: 'Stripe',
    logo: '💳',
    tier: 'Platinum',
    link: 'https://stripe.com',
    impressions: 980,
    clicks: 88
  },
  {
    id: 'sp3',
    name: 'Privy',
    logo: '🔑',
    tier: 'Gold',
    link: 'https://privy.io',
    impressions: 850,
    clicks: 112
  },
  {
    id: 'sp4',
    name: 'Vercel',
    logo: '▲',
    tier: 'Gold',
    link: 'https://vercel.com',
    impressions: 720,
    clicks: 54
  },
  {
    id: 'sp5',
    name: 'Insignia Protocol',
    logo: '🏅',
    tier: 'Silver',
    link: 'https://latamprotocol.io',
    impressions: 540,
    clicks: 42
  }
];

export const INITIAL_EVENTS: Event[] = [
  {
    id: 'evt1',
    shortCode: 'house',
    title: 'Hacker House LatAm 2026',
    description: 'A 3-day co-living hackathon for developers building the future of decentralized tech. Connect with global sponsors, build prototypes, and pitch to leading VCs.',
    date: '2026-07-15',
    time: '09:00 AM - 08:00 PM',
    location: 'Buenos Aires, Argentina & Online',
    category: 'Hacker House',
    expectedAttendance: 250,
    actualAttendance: 184,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    sponsors: [INITIAL_SPONSORS[0], INITIAL_SPONSORS[1], INITIAL_SPONSORS[2]],
    activities: [
      {
        id: 'act1_1',
        title: 'Welcome & Onboarding Check-In',
        description: 'Scan your QR code at the reception desk to complete your profile, receive your welcome kit, and activate your embedded wallet.',
        points: 100,
        type: 'CheckIn',
        required: true
      },
      {
        id: 'act1_2',
        title: 'Opening Ceremony & Sponsor Briefings',
        description: 'Learn about the hackathon tracks, prizes, API keys, and workshops hosted by Google Cloud and Stripe.',
        points: 150,
        type: 'Keynote',
        required: true
      },
      {
        id: 'act1_3',
        title: 'Workshop: Insignias Dinámicas con Privy',
        description: 'Deep dive into seedless wallets, Privy Auth, and generating NFT credentials dynamically on-chain.',
        points: 200,
        type: 'Workshop',
        required: false,
        sponsorId: 'sp3'
      },
      {
        id: 'act1_4',
        title: 'Project Submission & Pitch Desk',
        description: 'Submit your completed project repository and present a 3-minute pitch to the judging panel.',
        points: 400,
        type: 'Hackathon',
        required: true
      },
      {
        id: 'act1_5',
        title: 'Sponsor Booth Rally: Google Cloud API',
        description: 'Visit the Google Cloud booth, deploy a simple template, and scan the booth code for an exclusive badge.',
        points: 120,
        type: 'SponsorVisit',
        required: false,
        sponsorId: 'sp1'
      },
      {
        id: 'act1_6',
        title: 'Event Feedback & Core Survey',
        description: 'Share your thoughts about the Hacker House organization, venue, and sponsors to claim your Master Badge.',
        points: 80,
        type: 'Feedback',
        required: true
      }
    ]
  },
  {
    id: 'evt2',
    shortCode: 'auth',
    title: 'Zero-Friction Web3 Auth Workshop',
    description: 'An interactive hands-on workshop focused on seedless onboarding, smart accounts, and embedded wallets using Privy.',
    date: '2026-07-22',
    time: '02:00 PM - 05:00 PM',
    location: 'Bogotá, Colombia (Virtual & Physical)',
    category: 'Workshop',
    expectedAttendance: 120,
    actualAttendance: 95,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    sponsors: [INITIAL_SPONSORS[2], INITIAL_SPONSORS[3]],
    activities: [
      {
        id: 'act2_1',
        title: 'Workshop Entrance Check-In',
        description: 'Confirm your registered ticket details at the main door to enter.',
        points: 50,
        type: 'CheckIn',
        required: true
      },
      {
        id: 'act2_2',
        title: 'Hands-on Coding Session',
        description: 'Integrate Privy React SDK, handle social authentication, and trigger on-chain operations with embedded wallets.',
        points: 250,
        type: 'Workshop',
        required: true,
        sponsorId: 'sp3'
      },
      {
        id: 'act2_3',
        title: 'Session Rating & Feedback',
        description: 'Let us know how we can improve our developer tutorials.',
        points: 50,
        type: 'Feedback',
        required: true
      }
    ]
  },
  {
    id: 'evt3',
    shortCode: 'founder',
    title: 'AI & Web3 Founder Meetup',
    description: 'A high-level networking event for startup founders, investors, and engineers working at the intersection of AI models and decentralized protocols.',
    date: '2026-08-05',
    time: '07:00 PM - 10:00 PM',
    location: 'Mexico City, Mexico',
    category: 'Meetup',
    expectedAttendance: 80,
    actualAttendance: 72,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    sponsors: [INITIAL_SPONSORS[0], INITIAL_SPONSORS[3], INITIAL_SPONSORS[4]],
    activities: [
      {
        id: 'act3_1',
        title: 'Networking Check-In',
        description: 'Grab a name badge, claim your welcome drink, and register your wallet address.',
        points: 50,
        type: 'CheckIn',
        required: true
      },
      {
        id: 'act3_2',
        title: 'Panel Discussion: The Future of Autonomous Agents',
        description: 'A 45-minute discussion on the role of decentralized compute and AI agents in the digital economy.',
        points: 100,
        type: 'Keynote',
        required: true
      },
      {
        id: 'act3_3',
        title: 'Vercel Fast Deploy Pitch',
        description: 'Watch 5 founders demo their AI products deployed on Vercel Edge Networks in 1-minute lightning rounds.',
        points: 100,
        type: 'Workshop',
        required: false,
        sponsorId: 'sp4'
      }
    ]
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'bd1',
    title: 'Genesis Pioneer',
    description: 'Unlocked for setting up an embedded wallet and completing the welcome check-in activity.',
    image: '🏅'
  },
  {
    id: 'bd2',
    title: 'Code Alchemist',
    description: 'Unlocked for participating in high-intensity workshops and submitting hackathon code repos.',
    image: '🧙‍♂️'
  },
  {
    id: 'bd3',
    title: 'Sponsor Enthusiast',
    description: 'Unlocked for visiting sponsor developer booths and completing sponsor challenges.',
    image: '⚡'
  },
  {
    id: 'bd4',
    title: 'Community Feedback Voice',
    description: 'Unlocked for submitting feedback reviews and ratings for activities.',
    image: '🗣️'
  },
  {
    id: 'bd5',
    title: 'Elite Alpha Champion',
    description: 'Unlocked for reaching the top 3 on the global points leaderboard.',
    image: '🏆'
  }
];

export const SAMPLE_LEADERBOARD_ATTENDEES: Attendee[] = [
  {
    id: 'at1',
    name: 'Ana Martinez',
    email: 'ana.martinez@hacker.io',
    walletAddress: '0x9a3f2b...8e4c',
    walletType: 'MetaMask',
    joinedAt: '2026-06-25',
    points: 850,
    completedActivities: ['act1_1', 'act1_2', 'act1_3', 'act1_5'],
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-25', nftId: 'NFT-7821', dynamicMetadata: { level: 2, activitiesCompleted: 4, completionTime: '2026-06-25T14:30:00Z', txHash: '0x32c...f11' } },
      { ...INITIAL_BADGES[1], unlockedAt: '2026-06-26', nftId: 'NFT-7890', dynamicMetadata: { level: 3, activitiesCompleted: 4, completionTime: '2026-06-26T16:00:00Z', txHash: '0x88b...e21' } }
    ],
    checkedIn: true,
    calendarSynced: true
  },
  {
    id: 'at2',
    name: 'Carlos Perez',
    email: 'carlos.dev@gmail.com',
    walletAddress: '0x3f5c8d...2a1b',
    walletType: 'Privy',
    joinedAt: '2026-06-28',
    points: 720,
    completedActivities: ['act1_1', 'act1_2', 'act1_5'],
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-28', nftId: 'NFT-8120', dynamicMetadata: { level: 1, activitiesCompleted: 3, completionTime: '2026-06-28T10:15:00Z', txHash: '0xac3...990' } }
    ],
    checkedIn: true,
    calendarSynced: false
  },
  {
    id: 'at3',
    name: 'Sofia Lopez',
    email: 'sofia.founder@cyber.tech',
    walletAddress: '0x7e1a4d...9d2f',
    walletType: 'Phantom',
    joinedAt: '2026-06-29',
    points: 630,
    completedActivities: ['act1_1', 'act1_3'],
    badges: [
      { ...INITIAL_BADGES[0], unlockedAt: '2026-06-29', nftId: 'NFT-8344', dynamicMetadata: { level: 1, activitiesCompleted: 2, completionTime: '2026-06-29T11:45:00Z', txHash: '0x55a...a10' } }
    ],
    checkedIn: true,
    calendarSynced: true
  },
  {
    id: 'at4',
    name: 'Diego Flores',
    email: 'diego.f@tech.co',
    walletAddress: '0x2b8e3a...4f5c',
    walletType: 'Coinbase',
    joinedAt: '2026-06-30',
    points: 450,
    completedActivities: ['act1_1'],
    badges: [],
    checkedIn: false,
    calendarSynced: false
  }
];
