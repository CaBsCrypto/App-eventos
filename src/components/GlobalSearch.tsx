import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { useApp } from '../state/AppProvider';
import { ORGANIZERS, ALL_CITIES } from '../data/discover';

/**
 * Búsqueda global (command-palette). Busca en eventos reales del backend,
 * organizadores y ciudades del catálogo. Se abre con el icono de la nav o
 * con Ctrl/Cmd+K.
 */
export default function GlobalSearch({ onClose }: { onClose: () => void }) {
  const { events, setSelectedEvent, setScreen, toggleFollow, isFollowing } = useApp();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Normaliza a minúsculas y quita acentos (combinando marks U+0300–U+036F).
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const query = norm(q.trim());

  const eventResults = useMemo(() => {
    if (!query) return events.slice(0, 4);
    return events.filter((e) =>
      norm(e.title).includes(query) || norm(e.location).includes(query) || norm(e.category).includes(query),
    ).slice(0, 6);
  }, [events, query]);

  const orgResults = useMemo(() => {
    if (!query) return [];
    return ORGANIZERS.filter((o) => norm(o.name).includes(query) || norm(o.desc).includes(query)).slice(0, 5);
  }, [query]);

  const cityResults = useMemo(() => {
    if (!query) return [];
    return ALL_CITIES.filter((c) => norm(c.n).includes(query) || norm(c.region).includes(query)).slice(0, 5);
  }, [query]);

  const empty = query && eventResults.length === 0 && orgResults.length === 0 && cityResults.length === 0;

  const openEvent = (id: string) => {
    const ev = events.find((e) => e.id === id);
    if (ev) { setSelectedEvent(ev); setScreen('events'); }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[85] flex items-start justify-center p-4 pt-[10vh] sm:pt-[12vh]"
      style={{ background: 'rgba(6,6,20,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-xl rounded-[16px] overflow-hidden animate-slide-up" style={{ background: 'var(--ep-glass)', border: '1px solid var(--ep-glass-border)', boxShadow: 'var(--ep-card-shadow)' }}>
        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: 'var(--ep-border)' }}>
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar eventos, organizadores o ciudades…"
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded text-zinc-500 border" style={{ borderColor: 'var(--ep-border)' }}>ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {empty && (
            <div className="text-center py-10 text-[13px]" style={{ color: 'var(--ep-faint)' }}>
              Sin resultados para “{q}”.
            </div>
          )}

          {eventResults.length > 0 && (
            <Section title={query ? 'Eventos' : 'Eventos destacados'}>
              {eventResults.map((e) => (
                <Row key={e.id} onClick={() => openEvent(e.id)} icon={<Calendar className="w-4 h-4" style={{ color: 'var(--ep-accent)' }} />}
                  title={e.title} sub={`${e.location} · ${e.category}`} right={`${e.actualAttendance ?? 0} reg.`} />
              ))}
            </Section>
          )}

          {orgResults.length > 0 && (
            <Section title="Organizadores">
              {orgResults.map((o) => {
                const followed = isFollowing(o.id);
                return (
                  <Row key={o.id} onClick={() => { setScreen('discover'); onClose(); }} emoji={o.logo}
                    title={o.name} sub={o.meta}
                    right={
                      <button
                        onClick={(ev) => { ev.stopPropagation(); toggleFollow(o.id, o.name); }}
                        className="text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer whitespace-nowrap"
                        style={followed
                          ? { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.45)', color: 'var(--ep-green)' }
                          : { background: 'var(--ep-accent)', color: '#fff' }}
                      >{followed ? '✓' : 'Seguir'}</button>
                    } />
                );
              })}
            </Section>
          )}

          {cityResults.length > 0 && (
            <Section title="Ciudades">
              {cityResults.map((c) => (
                <Row key={c.n} onClick={() => { setScreen('discover'); onClose(); }} emoji={c.g}
                  title={c.n} sub={`${c.region} · ${c.c} eventos`} right={<MapPin className="w-3.5 h-3.5 text-zinc-500" />} />
              ))}
            </Section>
          )}

          {!query && (
            <div className="px-3 py-2 text-[11px]" style={{ color: 'var(--ep-faint)' }}>
              Escribe para buscar en eventos, organizadores y ciudades.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="mb-1">
      <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--ep-faint)' }}>{title}</div>
      {children}
    </div>
  );
};

const Row: React.FC<{
  onClick: () => void; icon?: React.ReactNode; emoji?: string; title: string; sub: string; right?: React.ReactNode;
}> = ({ onClick, icon, emoji, title, sub, right }) => {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left cursor-pointer hover:bg-white/5 transition-colors">
      <div className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0 text-base" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>
        {emoji || icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-zinc-100 truncate">{title}</div>
        <div className="text-[11px] truncate" style={{ color: 'var(--ep-faint)' }}>{sub}</div>
      </div>
      {right && <div className="shrink-0 flex items-center gap-1 text-[11px]" style={{ color: 'var(--ep-sub)' }}>{typeof right === 'string' ? <span className="flex items-center gap-1"><Users className="w-3 h-3" />{right}</span> : right}</div>}
    </button>
  );
};
