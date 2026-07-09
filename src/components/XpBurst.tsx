import React from 'react';
import { useApp } from '../state/AppProvider';

/**
 * Overlay de recompensa al completar una misión: "+XP" flotante (xpFloat)
 * + micro-confeti índigo/violeta (confettiFall). Se dispara desde el
 * provider (xpBurst) y se auto-limpia a los ~1.5s.
 */
const CONFETTI_COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#5eead4', '#f59e0b'];

export default function XpBurst() {
  const { xpBurst } = useApp();
  if (!xpBurst) return null;

  // Distribución pseudo-aleatoria estable por índice (sin Math.random en render).
  const pieces = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dx = Math.cos(angle) * (40 + (i % 5) * 14);
    return {
      left: `calc(50% + ${dx}px)`,
      delay: `${(i % 6) * 40}ms`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + (i % 3) * 2,
    };
  });

  return (
    <div className="fixed inset-0 z-[90] pointer-events-none flex items-center justify-center" aria-hidden>
      {/* +XP flotante */}
      <div
        key={xpBurst.id}
        className="animate-xp-float font-display font-black text-4xl"
        style={{ color: 'var(--ep-amber)', textShadow: '0 4px 24px rgba(245,158,11,0.5)' }}
      >
        +{xpBurst.points} XP
      </div>
      {/* Micro-confeti */}
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-1/2 animate-confetti rounded-[2px]"
          style={{ left: p.left, width: p.size, height: p.size, background: p.color, animationDelay: p.delay }}
        />
      ))}
    </div>
  );
}
