import { Wifi, WifiOff, Bell, Zap, RefreshCw, Smartphone } from 'lucide-react';
import { OfflineAction, NotificationItem } from '../types';

interface OfflineIndicatorProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  queue: OfflineAction[];
  onSyncQueue: () => Promise<void>;
  isSyncing: boolean;
  onSimulatePush: (presetTitle: string, presetMessage: string) => void;
}

export default function OfflineIndicator({
  isOffline,
  onToggleOffline,
  queue,
  onSyncQueue,
  isSyncing,
  onSimulatePush
}: OfflineIndicatorProps) {
  
  // Custom presets for push alerts simulation
  const PUSH_PRESETS = [
    {
      title: '🚨 Charla de Patrocinador',
      message: 'El workshop de Google Cloud "Insignias Dinámicas" está comenzando en el escenario principal. ¡Asiste y reclama +200 XP!'
    },
    {
      title: '🏆 Actualización del Leaderboard',
      message: '¡Carlos Pérez acaba de superar tu puntaje! Completa actividades de sponsors para recuperar tu puesto.'
    },
    {
      title: '🏅 Transacción NFT Confirmada',
      message: 'Tu insignia "Genesis Pioneer" se actualizó con éxito en la red de pruebas Polygon. ¡Nuevo nivel desbloqueado!'
    }
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-violet-400" /> Simulador de Entorno (Móvil & Red)
        </h3>
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">iOS & Android Sandbox</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Offline Mode block */}
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-zinc-300">Modo Offline</span>
            <button 
              onClick={onToggleOffline}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isOffline 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" /> Sin Conexión (Simulado)
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" /> En línea (Conectado)
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Simula la pérdida de señal en recintos tech (sótanos o recintos masivos). Registros y check-ins se guardarán en caché local.
          </p>

          {queue.length > 0 && (
            <div className="pt-2 space-y-2 border-t border-zinc-900">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 font-bold">ACCIONES EN COLA: {queue.length}</span>
                <button
                  onClick={onSyncQueue}
                  disabled={isOffline || isSyncing}
                  className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar
                </button>
              </div>
              <div className="max-h-[80px] overflow-y-auto space-y-1">
                {queue.map((act) => (
                  <div key={act.id} className="text-[9px] font-mono text-amber-400 bg-amber-950/20 border border-amber-900/30 px-2.5 py-1 rounded">
                    {act.type}: {act.payload?.activityId || 'Registro'} (En espera)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Push notifications block */}
        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-xl space-y-3">
          <span className="text-xs font-extrabold text-zinc-300 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-violet-400" /> Notificaciones Push IRL
          </span>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Envía avisos personalizados a los dispositivos de los asistentes en tiempo real para guiarlos en el recinto tecnológico.
          </p>

          <div className="space-y-1.5">
            {PUSH_PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => onSimulatePush(p.title, p.message)}
                className="w-full text-left text-[10px] bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-750 p-2 rounded-lg text-zinc-300 flex items-center justify-between font-medium group transition-all cursor-pointer"
              >
                <span>Simular: {p.title.substring(2)}</span>
                <Zap className="w-3.5 h-3.5 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
