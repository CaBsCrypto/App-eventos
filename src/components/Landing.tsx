import React, { useState } from 'react';
import { useApp } from '../state/AppProvider';

/** Feature de la landing (tarjeta clicable → modal con detalle + bullets). */
interface Feature {
  icon: string;
  title: string;
  desc: string;
  long: string;
  bullets: string[];
}

const FEATURES: Feature[] = [
  {
    icon: '✉️', title: 'RSVP con solo un email',
    desc: 'Tus asistentes entran con Privy: wallet Web3 autogenerada, sin extensiones ni frases semilla.',
    long: 'Elimina la fricción de la Web3 tradicional. El asistente ingresa su email y recibe una wallet lista para usar, gestionada por Privy. Nunca ve una frase semilla ni instala una extensión.',
    bullets: ['Wallet embebida autogenerada por Privy', 'Login con email, Google o passkey', 'Cero conocimiento cripto requerido', 'La wallet es 100% del usuario y exportable'],
  },
  {
    icon: '🎯', title: 'Misiones y XP',
    desc: 'Convierte charlas, workshops y visitas a sponsors en misiones que suman puntos de experiencia.',
    long: 'Gamifica la asistencia: cada actividad del evento se convierte en una misión que otorga XP. Ideal para dirigir el flujo de personas hacia charlas, stands de sponsors o dinámicas.',
    bullets: ['Misiones obligatorias y opcionales', 'XP configurable por misión', 'Validación por check-in o código', 'Sincroniza aunque el venue pierda WiFi'],
  },
  {
    icon: '🏅', title: 'Insignias NFT dinámicas',
    desc: 'Medallas que evolucionan con el progreso del asistente, acuñadas on-chain con metadatos verificables.',
    long: 'Las insignias no son estáticas: suben de nivel según el progreso del asistente y se acuñan en su wallet como NFTs con metadatos verificables. El organizador puede crear insignias propias del evento.',
    bullets: ['Se ven en 3D en el perfil del asistente', 'Generales de plataforma + creadas por el organizador', 'Metadatos y tx verificables on-chain', 'Suben de nivel con el progreso'],
  },
  {
    icon: '📊', title: 'Leaderboard en vivo',
    desc: 'Clasificación global por XP que motiva la participación durante todo el evento.',
    long: 'Un ranking que se actualiza en tiempo real y mantiene la energía alta durante todo el evento. Perfecto para proyectar en pantalla y premiar a los más activos al cierre.',
    bullets: ['Ranking en vivo por XP', 'Destaca tu posición actual', 'Ideal para proyectar en el venue', 'Premios automáticos al top del cierre'],
  },
  {
    icon: '🛠️', title: 'Panel de organizador',
    desc: 'Crea el evento con preview en tiempo real, sigue el check-in y exporta reportes CSV.',
    long: 'Todo el control del evento en un panel: arma la invitación con vista previa en vivo, monitorea el check-in en tiempo real y exporta la lista de acreditados cuando quieras.',
    bullets: ['Editor de evento con preview en vivo', 'Check-in y métricas en tiempo real', 'Diseñador de insignia del evento', 'Exportación de acreditados a CSV'],
  },
  {
    icon: '📡', title: 'Modo offline',
    desc: 'Si se cae el WiFi del venue, las acciones se guardan en cola y se sincronizan al reconectar.',
    long: 'Los venues llenos suelen tener mala conexión. Con el modo offline, los check-ins y misiones se guardan localmente en una cola y se sincronizan solos apenas vuelve la señal.',
    bullets: ['Cola local de acciones', 'Sincronización automática al reconectar', 'Sin pérdida de datos de asistencia', 'Indicador de estado siempre visible'],
  },
];

interface LedgerRow {
  initials: string;
  name: string;
  hash: string;
  status: string;
  ok: boolean;
}

const LEDGER: LedgerRow[] = [
  { initials: 'MJ', name: 'María Jiménez', hash: '0x7f3a…c29b', status: 'check-in', ok: true },
  { initials: 'DL', name: 'Diego López', hash: '0x1b8e…f042', status: 'check-in', ok: true },
  { initials: 'AT', name: 'Ana Torres', hash: '0x9c2d…a771', status: 'RSVP', ok: false },
  { initials: 'RS', name: 'Rodrigo Sáez', hash: '0x4e6f…b310', status: 'check-in', ok: true },
];

export default function Landing() {
  const { setView, setScreen } = useApp();
  const [featureOpen, setFeatureOpen] = useState<number | null>(null);

  const enterApp = () => { setView('app'); setScreen('events'); };
  const enterCreate = () => { setView('app'); setScreen('create'); };

  const modal = featureOpen != null ? FEATURES[featureOpen] : null;

  return (
    <div className="min-h-full overflow-y-auto no-scrollbar" style={{ background: 'var(--ep-landing-bg)' }}>
      {/* NAV */}
      <nav className="max-w-[1060px] mx-auto px-5 h-16 flex items-center">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('landing')}>
          <div
            className="w-8 h-8 rounded-[9px] grid place-items-center font-display font-black text-[15px] text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}
          >E</div>
          <div className="font-display font-extrabold text-[15px] tracking-tight text-white">EventProtocol</div>
        </div>
        <div className="ml-auto">
          <button
            onClick={enterApp}
            className="font-display font-bold text-[13px] text-white/90 border border-[rgba(165,180,252,0.4)] rounded-[10px] px-4 py-2 hover:bg-white/5 transition-all cursor-pointer"
          >Iniciar sesión</button>
        </div>
      </nav>

      <div className="max-w-[1060px] mx-auto px-5 pb-16">
        {/* HERO */}
        <div
          className="relative rounded-[24px] overflow-hidden mt-6 text-center"
          style={{
            border: '1px solid rgba(165,180,252,0.35)',
            padding: '84px 32px',
            background:
              'radial-gradient(ellipse 90% 70% at 15% -10%, rgba(129,140,248,0.5), transparent 55%), radial-gradient(ellipse 70% 60% at 92% 115%, rgba(56,189,248,0.38), transparent 62%), radial-gradient(ellipse 60% 50% at 60% 120%, rgba(217,70,239,0.3), transparent 60%), linear-gradient(160deg,#1e1e4a,#252560 50%,#141433)',
            boxShadow: '0 30px 80px rgba(10,10,30,0.5)',
          }}
        >
          <div className="absolute inset-0" style={{ background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 18px)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(16,16,19,0.5), transparent 40%)' }} />
          <div className="relative flex flex-col items-center">
            <div
              className="flex items-center gap-2 rounded-full px-4 py-[7px] backdrop-blur-sm"
              style={{ background: 'rgba(15,15,32,0.5)', border: '1px solid rgba(165,180,252,0.5)' }}
            >
              <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: '#5eead4' }} />
              <span className="font-mono text-[11px] tracking-[0.22em] uppercase" style={{ color: '#a5b4fc' }}>La plataforma de eventos para tu comunidad</span>
            </div>
            <h1 className="mt-[18px] font-display font-black text-[40px] sm:text-[56px] tracking-[-0.04em] leading-[1.02] max-w-[760px] text-white">De asistentes a comunidad</h1>
            <p className="mt-[18px] text-[17px] leading-[1.6] max-w-[560px]" style={{ color: '#c7cbf0' }}>Invita, reúne y da seguimiento a tu gente. Construyamos el futuro de los eventos, juntos, desde una sola plataforma.</p>
            <div className="flex gap-3 mt-8 flex-wrap justify-center">
              <button
                onClick={enterApp}
                className="font-display font-extrabold text-[14px] text-white rounded-xl px-[26px] py-[13px] cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--ep-accent-grad)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
              >Explorar eventos →</button>
              <button
                onClick={enterCreate}
                className="font-display font-extrabold text-[14px] text-white rounded-xl px-[26px] py-[13px] cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >Crear un evento</button>
            </div>
            {/* 3 propuestas de valor */}
            <div
              className="flex mt-10 flex-wrap justify-center rounded-[14px] backdrop-blur-sm"
              style={{ background: 'rgba(15,15,32,0.4)', border: '1px solid rgba(165,180,252,0.28)' }}
            >
              {[
                ['Comunidad activa', 'antes, durante y después'],
                ['Check-in en segundos', 'solo con un email'],
                ['Insignias on-chain', 'tuyas para siempre'],
              ].map(([t, s], i) => (
                <div key={t} className="px-[22px] py-3 text-center min-w-[130px]" style={{ borderRight: i < 2 ? '1px solid rgba(165,180,252,0.22)' : 'none' }}>
                  <div className="font-display font-extrabold text-[14px] text-white">{t}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#c7cbf0' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN FEATURES — encabezado */}
        <div className="text-center mt-16">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase mb-3" style={{ color: '#a5b4fc' }}>◇ Multichain · agnóstico de red</div>
          <h2 className="font-display font-black text-[30px] tracking-[-0.03em] text-white">Todo tu evento, <span style={{ color: '#a5b4fc' }}>en un solo lugar</span></h2>
          <p className="mt-2 text-[14px]" style={{ color: 'var(--ep-faint)' }}>Invitaciones, check-in y comunidad: cada asistencia queda registrada y verificada.</p>
        </div>

        {/* TARJETA ON-CHAIN */}
        <div
          className="flex flex-wrap gap-6 mt-8 p-7 rounded-[16px]"
          style={{ background: 'var(--ep-card)', border: '1px solid rgba(165,180,252,0.28)', boxShadow: 'var(--ep-card-shadow)' }}
        >
          <div className="flex-1 min-w-[280px] flex flex-col items-start justify-center">
            <div className="flex items-center gap-2 rounded-full px-3.5 py-[5px]" style={{ background: 'rgba(165,180,252,0.12)', border: '1px solid rgba(165,180,252,0.5)' }}>
              <span className="w-[7px] h-[7px] rounded-full animate-pulse-dot" style={{ background: '#5eead4' }} />
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: '#a5b4fc' }}>Registro verificable</span>
            </div>
            <h3 className="mt-4 font-display font-black text-[28px] tracking-[-0.03em] leading-[1.1] text-white">Tus invitados quedan registrados on-chain</h3>
            <p className="mt-3 text-[14px] leading-[1.65]" style={{ color: 'var(--ep-sub)' }}>Cada RSVP y check-in se ancla a la blockchain al instante: prueba de asistencia inmutable y auditable por cualquiera. Sin planillas perdidas ni listas dudosas.</p>
            <div className="flex gap-2 flex-wrap mt-[18px]">
              {['✓ Inmutable', '✓ Auditable', '✓ Exportable'].map((c) => (
                <span key={c} className="font-mono text-[11px] px-2.5 py-1 rounded-full" style={{ color: '#a5b4fc', background: 'rgba(165,180,252,0.1)', border: '1px solid rgba(165,180,252,0.3)' }}>{c}</span>
              ))}
            </div>
          </div>
          {/* Mini-ledger */}
          <div className="flex-1 min-w-[280px] p-4 rounded-[14px]" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>
            <div className="flex justify-between items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px]" style={{ color: 'var(--ep-faint)' }}>Registro de asistencia</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ color: '#5eead4', background: 'rgba(94,234,212,0.1)' }}>bloque 18 442 901</span>
            </div>
            <div className="flex flex-col gap-2 mt-3">
              {LEDGER.map((lr) => (
                <div key={lr.hash} className="flex items-center gap-2.5 p-2.5 rounded-[10px]" style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border)' }}>
                  <div className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>{lr.initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-bold text-white truncate">{lr.name}</div>
                    <div className="font-mono text-[10px] truncate" style={{ color: 'var(--ep-faint)' }}>{lr.hash}</div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={lr.ok
                      ? { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }
                      : { color: '#a5b4fc', background: 'rgba(165,180,252,0.1)', border: '1px solid rgba(165,180,252,0.3)' }}
                  >{lr.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE FEATURES */}
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              onClick={() => setFeatureOpen(i)}
              className="text-left p-6 rounded-[16px] transition-all hover:-translate-y-[3px] cursor-pointer group"
              style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border)', boxShadow: 'var(--ep-card-shadow)' }}
            >
              <div className="w-11 h-11 rounded-[12px] grid place-items-center text-[20px]" style={{ background: 'rgba(129,140,248,0.14)', border: '1px solid rgba(129,140,248,0.4)' }}>{f.icon}</div>
              <div className="font-display font-extrabold text-[15px] mt-3.5 text-white">{f.title}</div>
              <p className="mt-1.5 text-[13px] leading-[1.6]" style={{ color: 'var(--ep-sub)' }}>{f.desc}</p>
              <div className="mt-3 text-[12px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: '#a5b4fc' }}>Ver más →</div>
            </button>
          ))}
        </div>

        {/* CTA FINAL */}
        <div
          className="p-7 mt-14 flex items-center justify-between gap-5 flex-wrap rounded-[16px]"
          style={{ border: '1px solid rgba(165,180,252,0.45)', background: 'linear-gradient(120deg, rgba(129,140,248,0.16), rgba(30,30,74,0.5) 55%)' }}
        >
          <div>
            <div className="font-display font-black text-[22px] tracking-[-0.02em] text-white">¿Listo para tu próximo evento?</div>
            <div className="text-[13px] mt-1" style={{ color: 'var(--ep-faint)' }}>Sin extensiones ni wallets complicadas: tus asistentes entran con su email.</div>
          </div>
          <button
            onClick={enterApp}
            className="font-display font-extrabold text-[13px] rounded-xl px-[26px] py-[13px] cursor-pointer whitespace-nowrap transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#1a1a3a', boxShadow: '0 6px 18px rgba(240,180,41,0.35)' }}
          >Entrar a la app →</button>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col items-center gap-1.5 pt-[18px] pb-1.5">
          <span className="font-mono text-[11px]" style={{ color: 'var(--ep-faint)' }}>EventProtocol · 2026</span>
          <span className="text-[12px]" style={{ color: '#c7cbf0' }}>© 2026 <span className="font-bold" style={{ color: '#a5b4fc' }}>Browns Studio</span> · Todos los derechos reservados</span>
        </div>
      </div>

      {/* MODAL DE FEATURE */}
      {modal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: 'rgba(6,6,20,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setFeatureOpen(null); }}
        >
          <div className="max-w-[440px] w-full p-7 rounded-[20px] animate-slide-up" style={{ background: 'var(--ep-glass)', border: '1px solid var(--ep-glass-border)', boxShadow: 'var(--ep-card-shadow)' }}>
            <div className="w-16 h-16 rounded-[16px] grid place-items-center text-[30px]" style={{ background: 'rgba(129,140,248,0.14)', border: '1px solid rgba(129,140,248,0.4)' }}>{modal.icon}</div>
            <div className="font-display font-black text-[22px] mt-3.5 text-white">{modal.title}</div>
            <p className="mt-2.5 text-[13.5px] leading-[1.65]" style={{ color: 'var(--ep-sub)' }}>{modal.long}</p>
            <div className="flex flex-col gap-2.5 mt-4">
              {modal.bullets.map((b) => (
                <div key={b} className="flex items-start gap-2.5 text-[13px] leading-[1.5]" style={{ color: 'var(--ep-sub)' }}>
                  <span className="font-extrabold shrink-0" style={{ color: '#5eead4' }}>✓</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setFeatureOpen(null)}
              className="w-full mt-5 py-3 rounded-xl font-bold text-[13px] text-white cursor-pointer transition-all"
              style={{ background: 'var(--ep-accent-grad)' }}
            >Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
