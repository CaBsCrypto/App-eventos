/**
 * Catálogo de Descubrir (client-side, fiel al prototipo).
 * Compartido por la pantalla Descubrir y la búsqueda global. Migrable a
 * `GET /discover` cuando exista backend real.
 */
export interface DiscoverCategory { icon: string; name: string; count: string; }
export interface DiscoverOrganizer { id: string; logo: string; name: string; desc: string; meta: string; }
export interface DiscoverCity { n: string; c: number; g: string; }
export interface DiscoverCatalogItem { id: string; title: string; org: string; city: string; tag: string; dateShort: string; attendees: number; }

export const CATEGORIES: DiscoverCategory[] = [
  { icon: '💻', name: 'Tecnología', count: '3 mil eventos' },
  { icon: '🤖', name: 'IA', count: '2,4 mil eventos' },
  { icon: '₿', name: 'Cripto', count: '1,8 mil eventos' },
  { icon: '🎨', name: 'Arte y cultura', count: '980 eventos' },
  { icon: '🌱', name: 'Clima', count: '618 eventos' },
  { icon: '🏃', name: 'Fitness', count: '540 eventos' },
  { icon: '🧘', name: 'Bienestar', count: '460 eventos' },
  { icon: '🍜', name: 'Comida y bebida', count: '386 eventos' },
];

export const ORGANIZERS: DiscoverOrganizer[] = [
  { id: 'ETH Andes', logo: '🏔', name: 'ETH Andes', desc: 'La comunidad Ethereum de la cordillera: meetups y hackathons de Santiago a Medellín.', meta: '24 eventos · 8,2k seguidores' },
  { id: 'Web3 Chicas', logo: '💜', name: 'Web3 Chicas', desc: 'Mujeres construyendo en Web3. Workshops, mentorías y networking en toda LatAm.', meta: '18 eventos · 5,6k seguidoras' },
  { id: 'Builders BA', logo: '🛠', name: 'Builders BA', desc: 'Hackers de Buenos Aires: demo days mensuales y hacker houses de fin de semana.', meta: '31 eventos · 4,9k seguidores' },
  { id: 'DAO del Sur', logo: '🌎', name: 'DAO del Sur', desc: 'Gobernanza y coordinación descentralizada, del Río Bravo a la Patagonia.', meta: '12 eventos · 3,1k seguidores' },
  { id: 'NFT Bogotá', logo: '🖼', name: 'NFT Bogotá', desc: 'Arte digital y cultura cripto en Colombia: galerías, drops y charlas.', meta: '15 eventos · 2,7k seguidores' },
  { id: 'Café Cripto CDMX', logo: '☕', name: 'Café Cripto CDMX', desc: 'Desayunos técnicos cada jueves en Roma Norte. Sin pitch, solo código.', meta: '42 eventos · 2,2k seguidores' },
];

export const REGIONS: Record<string, DiscoverCity[]> = {
  'América del Sur': [{ n: 'Santiago', c: 14, g: '🏔' }, { n: 'Buenos Aires', c: 11, g: '🏛' }, { n: 'São Paulo', c: 18, g: '🌆' }, { n: 'Bogotá', c: 9, g: '⛰' }, { n: 'Medellín', c: 6, g: '🌸' }, { n: 'Lima', c: 5, g: '🏺' }],
  'América del Norte': [{ n: 'CDMX', c: 16, g: '🌮' }, { n: 'Guadalajara', c: 7, g: '🎻' }, { n: 'Miami', c: 12, g: '🌴' }, { n: 'Nueva York', c: 22, g: '🗽' }],
  'Europa': [{ n: 'Lisboa', c: 13, g: '🚋' }, { n: 'Berlín', c: 17, g: '🐻' }, { n: 'Barcelona', c: 10, g: '🏖' }],
  'África': [{ n: 'Lagos', c: 8, g: '🌍' }, { n: 'Nairobi', c: 5, g: '🦁' }, { n: 'Ciudad del Cabo', c: 6, g: '🏔' }],
  'Asia y el Pacífico': [{ n: 'Singapur', c: 19, g: '🏙' }, { n: 'Tokio', c: 15, g: '🗼' }, { n: 'Bangalore', c: 11, g: '🛕' }],
};

export const CATALOG: DiscoverCatalogItem[] = [
  { id: 'e1', title: 'Hacker House Santiago', org: 'EventProtocol', city: 'Santiago', tag: 'Tecnología', dateShort: '24 Jul', attendees: 128 },
  { id: 'e2', title: 'Workshop: Rollups Multichain', org: 'EventProtocol', city: 'Santiago', tag: 'Cripto', dateShort: '8 Ago', attendees: 64 },
  { id: 'e3', title: 'Meetup Builders CDMX', org: 'EventProtocol', city: 'CDMX', tag: 'Tecnología', dateShort: '20 Ago', attendees: 92 },
  { id: 'e4', title: 'ETH Andes: Nodo Santiago', org: 'ETH Andes', city: 'Santiago', tag: 'Cripto', dateShort: '12 Ago', attendees: 74 },
  { id: 'e5', title: 'Web3 Chicas: Mentorías Q3', org: 'Web3 Chicas', city: 'Online', tag: 'Tecnología', dateShort: '15 Ago', attendees: 210 },
  { id: 'e6', title: 'Demo Day Builders BA', org: 'Builders BA', city: 'Buenos Aires', tag: 'IA', dateShort: '28 Ago', attendees: 156 },
  { id: 'e7', title: 'Asamblea DAO del Sur', org: 'DAO del Sur', city: 'Online', tag: 'Cripto', dateShort: '6 Sep', attendees: 89 },
  { id: 'e8', title: 'Drop Night: Arte Andino', org: 'NFT Bogotá', city: 'Bogotá', tag: 'Arte y cultura', dateShort: '10 Sep', attendees: 67 },
  { id: 'e9', title: 'Café Cripto: ZK para humanos', org: 'Café Cripto CDMX', city: 'CDMX', tag: 'IA', dateShort: '13 Ago', attendees: 38 },
];

/** Lista plana de ciudades (para búsqueda global). */
export const ALL_CITIES = Object.entries(REGIONS).flatMap(([region, cities]) =>
  cities.map((c) => ({ ...c, region })),
);
