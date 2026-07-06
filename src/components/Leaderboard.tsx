import { useState } from 'react';
import { Attendee } from '../types';
import { Trophy, Gift, Award, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

interface LeaderboardProps {
  attendees: Attendee[];
  currentAttendee: Attendee | null;
  onAddNotification: (title: string, msg: string) => void;
}

interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  image: string;
  sponsor: string;
}

export default function Leaderboard({ attendees, currentAttendee, onAddNotification }: LeaderboardProps) {
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);
  
  // Sort attendees by points descending
  const sortedAttendees = [...attendees].sort((a, b) => b.points - a.points);

  // Gamification rewards list
  const REWARDS: RewardItem[] = [
    {
      id: 'rw1',
      title: 'Kit de Merch Oficial del Evento',
      description: 'Gorra, polera y stickers holográficos exclusivos en el stand de registro.',
      pointsCost: 200,
      image: '👕',
      sponsor: 'Stripe'
    },
    {
      id: 'rw2',
      title: 'Acceso a la Cafetería de Especialidad VIP',
      description: 'Café ilimitado y bocadillos gourmet preparados por baristas certificados.',
      pointsCost: 350,
      image: '☕',
      sponsor: 'Google Cloud'
    },
    {
      id: 'rw3',
      title: 'Entrada Exclusiva al Cocktail de Fundadores',
      description: 'Cena de networking privada con VCs y fundadores de Startups el día final.',
      pointsCost: 600,
      image: '🍸',
      sponsor: 'Privy'
    }
  ];

  const handleRedeem = (reward: RewardItem) => {
    if (!currentAttendee) return;
    if (currentAttendee.points < reward.pointsCost) return;
    
    setRedeemedRewards((prev) => [...prev, reward.id]);
    onAddNotification(
      '🎁 Recompensa Canjeada',
      `Canjeaste exitosamente: "${reward.title}". Tu ticket QR de reclamo se envió a ${currentAttendee.email}.`
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      {/* Left Column - Leaderboard Table */}
      <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-800/50">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" /> Clasificación Global de Asistentes
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">Participa en eventos y completa actividades para clasificar en las mejores posiciones.</p>
          </div>
          <span className="bg-amber-500/15 text-amber-400 text-xs px-2.5 py-1 border border-amber-500/10 rounded-full font-bold flex items-center gap-1 self-start sm:self-center shrink-0">
            <Zap className="w-3.5 h-3.5 fill-amber-400" /> Live Rank
          </span>
        </div>

        <div className="space-y-2 pt-2">
          {sortedAttendees.map((at, index) => {
            const isCurrentUser = currentAttendee && at.id === currentAttendee.id;
            const rank = index + 1;

            return (
              <div 
                key={at.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCurrentUser 
                    ? 'bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5' 
                    : 'bg-zinc-950 border-zinc-850 hover:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    rank === 1 ? 'bg-amber-500 text-zinc-950 shadow-md' :
                    rank === 2 ? 'bg-slate-400 text-zinc-950' :
                    rank === 3 ? 'bg-amber-700 text-zinc-950' :
                    'bg-zinc-900 text-zinc-400 border border-zinc-800'
                  }`}>
                    {rank}
                  </div>

                  {/* Name, email, and wallet */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-zinc-200">
                        {at.name}
                      </span>
                      {isCurrentUser && (
                        <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">Tú</span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      {at.walletAddress.substring(0, 6)}...{at.walletAddress.substring(at.walletAddress.length - 4)} • {at.walletType}
                    </div>
                  </div>
                </div>

                {/* Badge count and points */}
                <div className="flex items-center gap-4 text-right">
                  <div className="text-xs">
                    <span className="text-zinc-400 font-medium block">
                      {at.badges.length} {at.badges.length === 1 ? 'Insignia' : 'Insignias'}
                    </span>
                    <span className="text-[9px] text-zinc-500 block uppercase font-bold">NFTs</span>
                  </div>
                  <div className="bg-zinc-900 px-3 py-1.5 border border-zinc-800 rounded-lg text-right min-w-[70px]">
                    <span className="text-xs font-extrabold text-indigo-400 block">{at.points}</span>
                    <span className="text-[8px] text-zinc-500 uppercase block font-bold">XP pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column - Rewards Store */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <div className="pb-3 border-b border-zinc-800/50 space-y-1">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-400 shrink-0" /> Recompensas Desbloqueables
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">Canjea tus puntos acumulados por beneficios físicos y digitales.</p>
        </div>

        <div className="space-y-3.5 pt-2">
          {REWARDS.map((reward) => {
            const isRedeemed = redeemedRewards.includes(reward.id);
            const userPoints = currentAttendee?.points || 0;
            const hasEnoughPoints = userPoints >= reward.pointsCost;
            const progressPercentage = Math.min(100, (userPoints / reward.pointsCost) * 100);

            return (
              <div 
                key={reward.id}
                className={`p-4 bg-zinc-950 border rounded-xl space-y-3 transition-all ${
                  isRedeemed 
                    ? 'border-emerald-500/30 opacity-75' 
                    : hasEnoughPoints 
                      ? 'border-indigo-500/30' 
                      : 'border-zinc-850'
                }`}
              >
                <div className="flex items-start gap-3 justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 shrink-0">{reward.image}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-zinc-200 leading-tight">
                        {reward.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 mt-1 leading-snug">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px]">
                  <div>
                    <span className="text-zinc-500 font-bold block">PATROCINADO POR:</span>
                    <span className="text-indigo-400 font-semibold">{reward.sponsor}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-zinc-500 block font-bold">COSTO:</span>
                    <span className="text-zinc-200 font-extrabold">{reward.pointsCost} XP</span>
                  </div>
                </div>

                {/* Points Progress bar for current user */}
                {currentAttendee && !isRedeemed && (
                  <div className="space-y-1">
                    <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${hasEnoughPoints ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-zinc-500 font-medium">
                      <span>{userPoints} / {reward.pointsCost} XP</span>
                      <span>{hasEnoughPoints ? '¡Listo para canjear!' : `Faltan ${reward.pointsCost - userPoints} XP`}</span>
                    </div>
                  </div>
                )}

                {/* Redeem button */}
                {!currentAttendee ? (
                  <p className="text-[10px] text-zinc-500 text-center italic pt-1">Inicia sesión para reclamar</p>
                ) : isRedeemed ? (
                  <div className="w-full py-1.5 bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Reclamado Exitosamente
                  </div>
                ) : (
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!hasEnoughPoints}
                    className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                      hasEnoughPoints 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer' 
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-850 cursor-not-allowed'
                    }`}
                  >
                    Canjear Recompensa <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
