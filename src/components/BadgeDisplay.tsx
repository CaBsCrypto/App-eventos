import { useState } from 'react';
import { Badge } from '../types';
import { Shield, Sparkles, Database, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import Badge3D from './Badge3D';

interface BadgeDisplayProps {
  badges: Badge[];
  userName: string;
}

export default function BadgeDisplay({ badges, userName }: BadgeDisplayProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshMetadata = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> Tus Insignias Dynamic NFTs
          </h2>
          <p className="text-xs text-zinc-400">Colecciona insignias que evolucionan dinámicamente con tus logros IRL.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-xs text-zinc-400 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-400" /> Billetera Verificada
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-xl space-y-2">
          <div className="text-4xl text-zinc-600">🏅</div>
          <p className="text-sm font-semibold text-zinc-400">Aún no has reclamado Insignias</p>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">Ingresa con tu correo, regístrate en eventos y realiza check-in para generar tus primeros NFTs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className="relative p-4 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 rounded-xl text-center cursor-pointer group transition-all"
            >
              {/* Badge Circular Art */}
              <div className="relative mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-600/30 to-zinc-900 border-2 border-indigo-500/30 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/5 group-hover:scale-105 group-hover:border-indigo-400/50 transition-all duration-300">
                {badge.image}
                
                {/* Dynamic Level badge tag */}
                {badge.dynamicMetadata && (
                  <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-zinc-950 text-white">
                    Nivel {badge.dynamicMetadata.level}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <h4 className="text-xs font-extrabold text-zinc-200 truncate group-hover:text-indigo-400 transition-colors">
                  {badge.title}
                </h4>
                <p className="text-[10px] text-zinc-500 line-clamp-1">
                  {badge.nftId || 'MINTING...'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badge NFT Explorer Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="badge-explorer-modal">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl transition-all">
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-950 px-6 py-5 border-b border-zinc-850 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" /> Detalle del Activo ERC-721
                </h3>
                <p className="text-[10px] text-zinc-500">Prueba de Asistencia y Participación</p>
              </div>
              <button 
                onClick={() => setSelectedBadge(null)}
                className="text-zinc-500 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-full w-7 h-7 flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              
              {/* Medallón 3D girable (Three.js) */}
              <div className="text-center space-y-2">
                <Badge3D emoji={selectedBadge.image} accent="#6366f1" height={200} />
                <div className="text-[10px] text-zinc-500">Arrastra el medallón para girarlo</div>
                <div className="pt-2">
                  <h4 className="text-lg font-extrabold text-white">{selectedBadge.title}</h4>
                  <p className="text-xs text-zinc-400 px-4">{selectedBadge.description}</p>
                </div>
              </div>

              {/* Dynamic Metadata stats */}
              {selectedBadge.dynamicMetadata && (
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-1.5">
                      <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isRefreshing ? 'animate-spin' : ''}`} /> Metadatos Dinámicos
                    </span>
                    <button 
                      onClick={handleRefreshMetadata}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                    >
                      Actualizar
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Nivel del NFT</div>
                      <div className="text-zinc-200 font-extrabold text-sm mt-0.5">Lv. {selectedBadge.dynamicMetadata.level}</div>
                    </div>
                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                      <div className="text-zinc-500 text-[9px] uppercase tracking-wider font-bold">Tareas Realizadas</div>
                      <div className="text-zinc-200 font-extrabold text-sm mt-0.5">{selectedBadge.dynamicMetadata.activitiesCompleted} Actividades</div>
                    </div>
                  </div>

                  {/* Level progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500 font-semibold">Progreso hacia nivel {selectedBadge.dynamicMetadata.level + 1}</span>
                      <span className="text-indigo-400 font-bold">{(selectedBadge.dynamicMetadata.activitiesCompleted * 20) % 100}%</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-500" 
                        style={{ width: `${Math.max(15, (selectedBadge.dynamicMetadata.activitiesCompleted * 20) % 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* On-Chain Verification Ledger */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Detalles en Cadena (On-Chain)</span>
                
                {(() => {
                  const chainName = selectedBadge.dynamicMetadata?.chain || 'Polygon PoS';
                  const isStellar = chainName.toLowerCase().includes('stellar');
                  const isAvax = chainName.toLowerCase().includes('avalanche');
                  const explorerBase = isStellar 
                    ? 'https://stellar.expert/explorer/public/tx/' 
                    : isAvax 
                      ? 'https://snowtrace.io/tx/' 
                      : 'https://polygonscan.com/tx/';
                  
                  return (
                    <>
                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-2 font-mono text-[10px] text-zinc-400">
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Blockchain:</span>
                          <span className="text-zinc-200 font-bold">{chainName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">ID del Token:</span>
                          <span className="text-zinc-300 font-bold">{selectedBadge.nftId || 'No acuñado'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Propietario:</span>
                          <span className="text-zinc-300 truncate max-w-[180px]" title={userName}>{userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Estatus:</span>
                          <span className="text-emerald-500 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Acuñado (Verified)
                          </span>
                        </div>
                        {selectedBadge.dynamicMetadata?.txHash && (
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Hash TX:</span>
                            <span className="text-indigo-400 truncate max-w-[150px]" title={selectedBadge.dynamicMetadata.txHash}>
                              {selectedBadge.dynamicMetadata.txHash}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-600">Estándar:</span>
                          <span className="text-zinc-300">{isStellar ? 'Stellar Asset' : 'ERC-721 Dynamic NFT'}</span>
                        </div>
                      </div>

                      {/* Footer with external link explorer link */}
                      <div className="bg-zinc-950 -mx-6 -mb-6 mt-5 px-6 py-4 border-t border-zinc-850 text-center">
                        <a 
                          href={`${explorerBase}${selectedBadge.dynamicMetadata?.txHash || ''}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          Verificar en Block Explorer <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
