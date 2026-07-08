import React, { useState } from 'react';
import { useApp } from '../state/AppProvider';

interface HistRow {
  title: string;
  meta: string;
  month: string;
  state: string;
  ok: boolean;
  stats: { num: string; label: string; amber?: boolean; green?: boolean }[];
}

const ASISTIDOS: HistRow[] = [
  { title: 'ETH LatAm Buenos Aires', meta: '14 Jun 2026 · Palermo, Buenos Aires', month: 'JUN', state: 'POAP ✓', ok: true, stats: [{ num: '+320', label: 'XP', amber: true }, { num: '4/5', label: 'misiones' }] },
  { title: 'Workshop: DeFi para Builders', meta: '30 May 2026 · Providencia, Santiago', month: 'MAY', state: 'POAP ✓', ok: true, stats: [{ num: '+180', label: 'XP', amber: true }, { num: '3/3', label: 'misiones' }] },
  { title: 'Meetup Web3 Valparaíso', meta: '18 Abr 2026 · Cerro Alegre, Valparaíso', month: 'ABR', state: 'POAP ✓', ok: true, stats: [{ num: '+95', label: 'XP', amber: true }, { num: '2/4', label: 'misiones' }] },
  { title: 'Hackathon Base LatAm', meta: '7 Mar 2026 · Las Condes, Santiago', month: 'MAR', state: 'Sin check-in', ok: false, stats: [{ num: '+0', label: 'XP', amber: true }, { num: '0/6', label: 'misiones' }] },
  { title: 'Onboarding Web3 101', meta: '21 Feb 2026 · Online', month: 'FEB', state: 'Asistido', ok: true, stats: [{ num: '+60', label: 'XP', amber: true }, { num: '1/1', label: 'misiones' }] },
];

const CREADOS: HistRow[] = [
  { title: 'Demo Day Builders SCL', meta: '9 May 2026 · Barrio Italia, Santiago', month: 'MAY', state: 'Finalizado', ok: true, stats: [{ num: '92', label: 'asistentes' }, { num: '81%', label: 'check-in', green: true }] },
  { title: 'Hacker House Santiago', meta: '24 Jul 2026 · Barrio Italia, Santiago', month: 'JUL', state: 'Próximo', ok: false, stats: [{ num: '128', label: 'RSVP' }, { num: '—', label: 'check-in', green: true }] },
];

const SOCIALS: { key: keyof import('../types').ProfileHandles; icon: string; label: string; base: string }[] = [
  { key: 'github', icon: '⌥', label: 'GitHub', base: 'github.com/' },
  { key: 'linkedin', icon: 'in', label: 'LinkedIn', base: 'linkedin.com/in/' },
  { key: 'x', icon: '𝕏', label: 'X', base: 'x.com/' },
  { key: 'instagram', icon: '◎', label: 'Instagram', base: 'instagram.com/' },
];

const cardStyle: React.CSSProperties = { background: 'var(--ep-card)', border: '1px solid var(--ep-border)', boxShadow: 'var(--ep-card-shadow)' };

function initials(name: string) {
  return (name || 'CR').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function History() {
  const { profile, setScreen } = useApp();
  const [tab, setTab] = useState<'asistidos' | 'creados'>('asistidos');
  const rows = tab === 'asistidos' ? ASISTIDOS : CREADOS;

  const stats = [
    { num: String(profile.xp || 655), label: 'XP total' },
    { num: '5', label: 'Asistidos' },
    { num: '2', label: 'Creados' },
    { num: '8', label: 'Insignias' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de perfil */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-full grid place-items-center text-[20px] font-extrabold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>{initials(profile.name)}</div>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight text-white">{profile.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap text-[12px]">
              <span style={{ color: 'var(--ep-faint)' }}>{profile.user}</span>
              <span className="font-mono px-2 py-0.5 rounded-full" style={{ color: '#a5b4fc', background: 'rgba(165,180,252,0.1)', border: '1px solid rgba(165,180,252,0.3)' }}>⛓ {profile.wallet.slice(0, 6)}…{profile.wallet.slice(-4)}</span>
              <span style={{ color: 'var(--ep-faint)' }}>{profile.city} · Miembro desde Mar 2026</span>
            </div>
            <div className="text-[13px] mt-2 max-w-lg" style={{ color: 'var(--ep-sub)' }}>{profile.bio}</div>
          </div>
        </div>
        <button onClick={() => setScreen('settings')} className="text-[12px] font-bold px-4 py-2 rounded-[10px] cursor-pointer transition-all text-zinc-300 hover:text-indigo-400" style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border-2)' }}>⚙ Ajustes</button>
      </div>

      {/* Banda de stats */}
      <div className="flex flex-wrap rounded-[14px]" style={cardStyle}>
        {stats.map((s, i) => (
          <div key={s.label} className="flex-1 min-w-[110px] text-center py-4 px-3" style={{ borderRight: i < stats.length - 1 ? '1px solid var(--ep-border)' : 'none' }}>
            <div className="font-display font-black text-[22px] text-white">{s.num}</div>
            <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--ep-faint)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conecta tus redes */}
      <div>
        <div className="text-[11px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--ep-faint)' }}>Conecta tus redes</div>
        <div className="flex gap-2 flex-wrap">
          {SOCIALS.map((so) => {
            const handle = (profile.handles[so.key] || '').trim();
            const on = !!handle;
            return (
              <button
                key={so.key}
                onClick={() => setScreen('settings')}
                className="flex items-center gap-2 text-[12px] font-semibold px-4 py-2 rounded-full cursor-pointer transition-all"
                style={on
                  ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.4)', color: 'var(--ep-green)' }
                  : { background: 'var(--ep-inset)', border: '1px solid var(--ep-border-2)', color: 'var(--ep-sub)' }}
              >
                <span className="font-extrabold">{so.icon}</span>
                <span>{on ? so.base + handle : so.label}</span>
                {on && <span className="font-extrabold" style={{ color: 'var(--ep-green)' }}>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Switch Asistidos / Creados */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="inline-flex p-1 rounded-full" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>
          {(['asistidos', 'creados'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-[12px] font-bold px-4 py-1.5 rounded-full cursor-pointer capitalize transition-all"
              style={tab === t ? { background: 'var(--ep-accent)', color: '#fff' } : { color: 'var(--ep-sub)' }}
            >{t}</button>
          ))}
        </div>
        <span className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>
          {tab === 'asistidos' ? '5 eventos · 3 POAPs obtenidos' : '2 eventos · 220 asistentes en total'}
        </span>
      </div>

      {/* Filas de historial */}
      <div className="flex flex-col gap-2.5">
        {rows.map((h) => (
          <div key={h.title} className="flex items-center gap-4 p-4 rounded-[14px] flex-wrap transition-all hover:translate-x-0.5" style={cardStyle}>
            <div className="w-[52px] h-[52px] rounded-[12px] grid place-items-center font-mono text-[11px] tracking-wider shrink-0" style={{ background: 'linear-gradient(135deg,#1e1e4a,#4338ca)', color: '#c7d2fe' }}>{h.month}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-white flex items-center gap-2 flex-wrap">
                {h.title}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" style={h.ok
                  ? { color: 'var(--ep-green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)' }
                  : { color: 'var(--ep-sub)', background: 'var(--ep-inset)', border: '1px solid var(--ep-border-2)' }}>{h.state}</span>
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: 'var(--ep-faint)' }}>{h.meta}</div>
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              {h.stats.map((s) => (
                <div key={s.label} className="text-right">
                  <div className="font-display font-black text-[16px]" style={{ color: s.amber ? 'var(--ep-amber)' : s.green ? 'var(--ep-green)' : 'var(--ep-text)' }}>{s.num}</div>
                  <div className="text-[10px]" style={{ color: 'var(--ep-faint)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
