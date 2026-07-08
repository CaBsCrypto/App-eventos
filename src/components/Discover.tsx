import React, { useState } from 'react';
import { useApp } from '../state/AppProvider';

/** Catálogo del prototipo (client-side hasta que exista GET /discover). */
const CATEGORIES = [
  { icon: '💻', name: 'Tecnología', count: '3 mil eventos' },
  { icon: '🤖', name: 'IA', count: '2,4 mil eventos' },
  { icon: '₿', name: 'Cripto', count: '1,8 mil eventos' },
  { icon: '🎨', name: 'Arte y cultura', count: '980 eventos' },
  { icon: '🌱', name: 'Clima', count: '618 eventos' },
  { icon: '🏃', name: 'Fitness', count: '540 eventos' },
  { icon: '🧘', name: 'Bienestar', count: '460 eventos' },
  { icon: '🍜', name: 'Comida y bebida', count: '386 eventos' },
];

const ORGANIZERS = [
  { id: 'ETH Andes', logo: '🏔', name: 'ETH Andes', desc: 'La comunidad Ethereum de la cordillera: meetups y hackathons de Santiago a Medellín.', meta: '24 eventos · 8,2k seguidores' },
  { id: 'Web3 Chicas', logo: '💜', name: 'Web3 Chicas', desc: 'Mujeres construyendo en Web3. Workshops, mentorías y networking en toda LatAm.', meta: '18 eventos · 5,6k seguidoras' },
  { id: 'Builders BA', logo: '🛠', name: 'Builders BA', desc: 'Hackers de Buenos Aires: demo days mensuales y hacker houses de fin de semana.', meta: '31 eventos · 4,9k seguidores' },
  { id: 'DAO del Sur', logo: '🌎', name: 'DAO del Sur', desc: 'Gobernanza y coordinación descentralizada, del Río Bravo a la Patagonia.', meta: '12 eventos · 3,1k seguidores' },
  { id: 'NFT Bogotá', logo: '🖼', name: 'NFT Bogotá', desc: 'Arte digital y cultura cripto en Colombia: galerías, drops y charlas.', meta: '15 eventos · 2,7k seguidores' },
  { id: 'Café Cripto CDMX', logo: '☕', name: 'Café Cripto CDMX', desc: 'Desayunos técnicos cada jueves en Roma Norte. Sin pitch, solo código.', meta: '42 eventos · 2,2k seguidores' },
];

const REGIONS: Record<string, { n: string; c: number; g: string }[]> = {
  'América del Sur': [{ n: 'Santiago', c: 14, g: '🏔' }, { n: 'Buenos Aires', c: 11, g: '🏛' }, { n: 'São Paulo', c: 18, g: '🌆' }, { n: 'Bogotá', c: 9, g: '⛰' }, { n: 'Medellín', c: 6, g: '🌸' }, { n: 'Lima', c: 5, g: '🏺' }],
  'América del Norte': [{ n: 'CDMX', c: 16, g: '🌮' }, { n: 'Guadalajara', c: 7, g: '🎻' }, { n: 'Miami', c: 12, g: '🌴' }, { n: 'Nueva York', c: 22, g: '🗽' }],
  'Europa': [{ n: 'Lisboa', c: 13, g: '🚋' }, { n: 'Berlín', c: 17, g: '🐻' }, { n: 'Barcelona', c: 10, g: '🏖' }],
  'África': [{ n: 'Lagos', c: 8, g: '🌍' }, { n: 'Nairobi', c: 5, g: '🦁' }, { n: 'Ciudad del Cabo', c: 6, g: '🏔' }],
  'Asia y el Pacífico': [{ n: 'Singapur', c: 19, g: '🏙' }, { n: 'Tokio', c: 15, g: '🗼' }, { n: 'Bangalore', c: 11, g: '🛕' }],
};

const CATALOG = [
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

const TAGS = ['Todas', 'Tecnología', 'Cripto', 'IA', 'Arte y cultura'];
const CITY_FILTERS = ['Todas', 'Santiago', 'Buenos Aires', 'CDMX', 'Bogotá', 'Online'];

const cardBase = 'rounded-[14px] transition-all cursor-pointer';
const cardStyle: React.CSSProperties = { background: 'var(--ep-card)', border: '1px solid var(--ep-border)', boxShadow: 'var(--ep-card-shadow)' };

export default function Discover() {
  const { toggleFollow, isFollowing, setScreen } = useApp();
  const [explore, setExplore] = useState<{ tag: string; city: string } | null>(null);

  const results = explore
    ? CATALOG.filter(
        (c) =>
          (explore.tag === 'Todas' || c.tag === explore.tag) &&
          (explore.city === 'Todas' || c.city === explore.city),
      )
    : [];

  const seg = (active: boolean): string =>
    `text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all ${
      active ? 'text-white' : 'text-zinc-400 hover:text-white'
    }`;
  const segStyle = (active: boolean): React.CSSProperties =>
    active
      ? { background: 'var(--ep-accent)', border: '1px solid var(--ep-accent)' }
      : { background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Encabezado */}
      <div>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight text-white">Descubrir</h1>
        <p className="text-sm text-zinc-400 mt-1">Explora eventos por categoría o ciudad y sigue a los organizadores que te interesan.</p>
      </div>

      {/* Categorías */}
      <section>
        <h2 className="font-display font-extrabold text-base text-white mb-3">Explora por categoría</h2>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setExplore({ tag: c.name, city: 'Todas' })}
              className={`${cardBase} flex items-center gap-3 p-4 text-left hover:-translate-y-0.5`}
              style={cardStyle}
            >
              <div className="w-10 h-10 rounded-[11px] grid place-items-center text-[18px] shrink-0" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}>{c.icon}</div>
              <div>
                <div className="font-bold text-[13px] text-white">{c.name}</div>
                <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>{c.count}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Organizadores destacados */}
      <section>
        <h2 className="font-display font-extrabold text-base text-white mb-3">Organizadores destacados</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {ORGANIZERS.map((o) => {
            const followed = isFollowing(o.id);
            return (
              <div key={o.id} className="rounded-[14px] p-[18px]" style={cardStyle}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-[12px] grid place-items-center text-[20px] shrink-0" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>{o.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-[14px] text-white truncate">{o.name}</div>
                      <button
                        onClick={() => toggleFollow(o.id, o.name)}
                        className="text-[11px] font-bold px-4 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all"
                        style={followed
                          ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.45)', color: 'var(--ep-green)' }
                          : { background: 'var(--ep-accent)', border: 'none', color: '#fff', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
                      >{followed ? '✓ Siguiendo' : 'Seguir'}</button>
                    </div>
                    <p className="text-[12px] leading-[1.55] mt-1" style={{ color: 'var(--ep-sub)' }}>{o.desc}</p>
                    <div className="text-[11px] mt-2.5" style={{ color: 'var(--ep-faint)' }}>{o.meta}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ciudades por región */}
      <section>
        <h2 className="font-display font-extrabold text-base text-white mb-3">Eventos por ciudad</h2>
        <RegionCities onPickCity={(city) => setExplore({ tag: 'Todas', city })} />
      </section>

      {/* POPUP EXPLORAR */}
      {explore && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,6,20,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setExplore(null); }}
        >
          <div className="max-w-[560px] w-full max-h-[85vh] overflow-y-auto custom-scrollbar p-6 rounded-[20px] animate-slide-up" style={{ background: 'var(--ep-glass)', border: '1px solid var(--ep-glass-border)', boxShadow: 'var(--ep-card-shadow)' }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display font-black text-[20px] text-white">
                  {explore.tag !== 'Todas' ? `Eventos de ${explore.tag}` : explore.city !== 'Todas' ? `Eventos en ${explore.city}` : 'Explorar eventos'}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: 'var(--ep-faint)' }}>
                  {results.length} {results.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                </div>
              </div>
              <button onClick={() => setExplore(null)} className="text-zinc-400 hover:text-white text-lg cursor-pointer shrink-0">✕</button>
            </div>

            {/* Filtros */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2 flex-wrap">
                {TAGS.map((t) => (
                  <button key={t} onClick={() => setExplore((e) => ({ tag: t, city: e?.city ?? 'Todas' }))} className={seg(explore.tag === t)} style={segStyle(explore.tag === t)}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {CITY_FILTERS.map((c) => (
                  <button key={c} onClick={() => setExplore((e) => ({ tag: e?.tag ?? 'Todas', city: c }))} className={seg(explore.city === c)} style={segStyle(explore.city === c)}>{c}</button>
                ))}
              </div>
            </div>

            {/* Resultados */}
            <div className="grid gap-2.5 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {results.length === 0 ? (
                <div className="col-span-full text-center py-8 text-[13px] rounded-[12px]" style={{ color: 'var(--ep-faint)', background: 'var(--ep-inset)', border: '1px dashed var(--ep-border-2)' }}>
                  No hay eventos con esos filtros.
                </div>
              ) : (
                results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setExplore(null); setScreen('events'); }}
                    className="flex flex-col items-start p-3.5 rounded-[14px] text-left cursor-pointer transition-all hover:-translate-y-0.5"
                    style={cardStyle}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ color: 'var(--ep-accent)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.4)' }}>{r.tag}</span>
                      <span className="font-mono text-[10px]" style={{ color: 'var(--ep-faint)' }}>{r.dateShort}</span>
                    </div>
                    <div className="font-bold text-[13px] text-white mt-2">{r.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'var(--ep-faint)' }}>{r.org} · {r.city}</div>
                    <div className="text-[11px] font-semibold mt-1.5" style={{ color: 'var(--ep-sub)' }}>{r.attendees} registrados</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Selector de región + grilla de ciudades. */
function RegionCities({ onPickCity }: { onPickCity: (city: string) => void }) {
  const [region, setRegion] = useState('América del Sur');
  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        {Object.keys(REGIONS).map((r) => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className="text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap transition-all"
            style={region === r
              ? { background: 'var(--ep-accent)', border: '1px solid var(--ep-accent)', color: '#fff' }
              : { background: 'var(--ep-inset)', border: '1px solid var(--ep-border)', color: 'var(--ep-sub)' }}
          >{r}</button>
        ))}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {REGIONS[region].map((c) => (
          <button
            key={c.n}
            onClick={() => onPickCity(c.n)}
            className="flex items-center gap-3 p-4 rounded-[14px] text-left cursor-pointer transition-all hover:-translate-y-0.5"
            style={cardStyle}
          >
            <div className="w-10 h-10 rounded-[11px] grid place-items-center text-[18px] shrink-0" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>{c.g}</div>
            <div>
              <div className="font-bold text-[13px] text-white">{c.n}</div>
              <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>{c.c} eventos</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
