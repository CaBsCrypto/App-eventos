import React, { useState, useEffect } from 'react';
import {
  Compass, Trophy, Award, Bell, Wallet, LogOut,
  Sparkles, Shield, ArrowUpRight, Plus, Globe
} from 'lucide-react';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import WalletModal from './components/WalletModal';
import BadgeDisplay from './components/BadgeDisplay';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import OfflineIndicator from './components/OfflineIndicator';
import Landing from './components/Landing';
import Discover from './components/Discover';
import History from './components/History';
import Settings from './components/Settings';
import { api } from './lib/api';
import { useApp } from './state/AppProvider';

export default function App() {
  // === Capa de estado (dominios) — ver src/state/AppProvider ===
  const {
    events, attendees, notifications, refetch,
    currentAttendee,
    completeOnboard: handleOnboardComplete,
    onboard,
    onboardDemo: handleOnboardDemo,
    disconnect: handleDisconnect,
    addNotification: handleAddNotification,
    clearNotifications,
    completeActivity: handleCompleteActivity,
    registerEvent: handleRegisterEvent,
    unregisterEvent: handleUnregisterEvent,
    registerActivity: handleRegisterActivity,
    deleteActivity: handleDeleteActivity,
    mintPoap: handleMintPOAP,
    trackSponsorClick: handleSponsorDirectClick,
    view, setView,
    profile,
    selectedEvent, setSelectedEvent,
    screen: activeView, setScreen: setActiveView,
    isOffline, toggleOffline: handleToggleOffline,
    offlineQueue, syncQueue: handleSyncQueue, isSyncing,
    toasts, dismissToast,
  } = useApp();

  // === Estado local de UI (no pertenece a ningún dominio) ===
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [walletCopied, setWalletCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('All');

  // Onboarding rápido "Joaquín (Demo)" reutilizado por varios CTA.
  const onboardJoaquin = () =>
    onboard({
      name: 'Joaquín Estéban (Demo)',
      email: 'demo@latamprotocol.com',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      walletType: 'Privy',
    });

  // Resolución de invitaciones por URL al montar (?event / ?invite / /invite/:code).
  useEffect(() => {
    const checkInvites = async () => {
      const params = new URLSearchParams(window.location.search);
      const code =
        params.get('event') ||
        params.get('invite') ||
        params.get('i') ||
        (window.location.pathname.match(/^\/(invite|i)\/([a-zA-Z0-9_-]+)/)?.[2] ?? null);
      if (!code) return;
      try {
        const matched = await api.events.byCode(code);
        setSelectedEvent(matched);
        setView('app');
        setActiveView('events');
      } catch (err) {
        console.error('Error al resolver invitación:', err);
      }
    };
    checkInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sincroniza la URL del navegador con el estado (routing tipo Luma).
  useEffect(() => {
    if (activeView === 'events') {
      if (selectedEvent) {
        const path = `/invite/${selectedEvent.shortCode || selectedEvent.id}`;
        if (window.location.pathname !== path) window.history.pushState(null, '', path);
      } else if (
        window.location.pathname !== '/' &&
        !window.location.pathname.startsWith('/invite') &&
        !window.location.pathname.startsWith('/i/')
      ) {
        window.history.pushState(null, '', '/');
      }
    } else {
      const path = `/${activeView}`;
      if (window.location.pathname !== path) window.history.pushState(null, '', path);
    }
  }, [activeView, selectedEvent]);

  // Botones atrás/adelante del navegador.
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/events') {
        setSelectedEvent(null);
        setActiveView('events');
      } else if (path === '/discover') {
        setSelectedEvent(null);
        setActiveView('discover');
      } else if (path === '/leaderboard') {
        setSelectedEvent(null);
        setActiveView('leaderboard');
      } else if (path === '/badges') {
        setSelectedEvent(null);
        setActiveView('badges');
      } else if (path === '/create') {
        setSelectedEvent(null);
        setActiveView('create');
      } else if (path === '/history') {
        setSelectedEvent(null);
        setActiveView('history');
      } else if (path === '/settings') {
        setSelectedEvent(null);
        setActiveView('settings');
      } else {
        const pathMatch = path.match(/^\/(invite|i)\/([a-zA-Z0-9_-]+)/);
        if (pathMatch) {
          api.events
            .byCode(pathMatch[2])
            .then((matched) => {
              setSelectedEvent(matched);
              setActiveView('events');
            })
            .catch(() => {
              setSelectedEvent(null);
              setActiveView('events');
            });
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll al tope en cada navegación.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('main-scroll-container')?.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeView, selectedEvent]);

  // Filtros de la lista de eventos.
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || evt.category === categoryFilter;
    let matchesAttendance = true;
    if (attendanceFilter === 'Small') matchesAttendance = evt.expectedAttendance <= 100;
    else if (attendanceFilter === 'Medium')
      matchesAttendance = evt.expectedAttendance > 100 && evt.expectedAttendance <= 200;
    else if (attendanceFilter === 'Large') matchesAttendance = evt.expectedAttendance > 200;
    return matchesSearch && matchesCategory && matchesAttendance;
  });

  // Vista pública (landing). Los hooks de arriba corren siempre; el early
  // return sólo cambia lo que se pinta.
  if (view === 'landing') {
    return (
      <div className="fixed inset-0 text-zinc-100 font-sans antialiased overflow-hidden" style={{ background: 'var(--ep-landing-bg)' }}>
        <Landing />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex flex-col font-sans antialiased overflow-hidden" id="app-root-container">

      {/* 1. TOP HEADER / BRAND NAVIGATION */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-4 h-16 md:px-8 flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Logo & Navigation Tabs */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => { setSelectedEvent(null); setActiveView('events'); }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
                P
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-zinc-100 group-hover:text-indigo-400 transition-colors">LATAM Protocol</span>
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:block leading-none">by Privy & Luma</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
              <button
                onClick={() => { setSelectedEvent(null); setActiveView('events'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeView === 'events'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold'
                    : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Eventos
              </button>
              <button
                onClick={() => { setSelectedEvent(null); setActiveView('discover'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeView === 'discover'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold'
                    : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Descubrir
              </button>
              <button
                onClick={() => { setActiveView('leaderboard'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeView === 'leaderboard'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold'
                    : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" /> Leaderboard
              </button>
              <button
                onClick={() => { setActiveView('badges'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border ${
                  activeView === 'badges'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-bold'
                    : 'text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Mis Insignias
              </button>
              <button
                onClick={() => { setActiveView('create'); }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border text-xs font-bold hover:scale-[1.02] ${
                  activeView === 'create'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25'
                    : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30 hover:bg-indigo-600/20 hover:text-white hover:border-indigo-400'
                }`}
              >
                <Plus className="w-3.5 h-3.5 animate-pulse text-indigo-400" /> Crear Evento
              </button>
            </nav>
          </div>

          {/* Right actions: Notifications dropdown & Privy Onboard Trigger */}
          <div className="flex items-center gap-3">

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="w-9 h-9 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                )}
              </button>

              {showNotificationDropdown && (
                <div
                  className="absolute right-[-100px] xs:right-[-50px] sm:right-0 mt-2 w-[295px] sm:w-85 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 text-xs animate-scale-up"
                  id="notifications-dropdown"
                  style={{ transformOrigin: 'top right' }}
                >
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5 mb-2.5">
                    <span className="font-bold text-zinc-200">Alertas Recientes</span>
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                    >
                      Marcar leídas
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-500 text-center py-4">No hay alertas recientes.</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-zinc-200 text-[11px] leading-tight break-words flex-1">{n.title}</span>
                            <span className="text-[8px] text-zinc-500 font-normal shrink-0 mt-0.5">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-relaxed break-words">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* XP pill + avatar dropdown (cuenta) */}
            {currentAttendee ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 rounded-full">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">XP</span>
                  <span className="text-xs font-black text-amber-400">{profile.xp || currentAttendee.points}</span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowAccountMenu((v) => !v)}
                    title="Mi cuenta"
                    className="w-9 h-9 rounded-full grid place-items-center text-xs font-extrabold text-white cursor-pointer transition-all hover:ring-2 hover:ring-indigo-500/40"
                    style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}
                  >
                    {(profile.name || 'CR').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </button>

                  {showAccountMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-up" style={{ transformOrigin: 'top right' }}>
                        <div className="flex items-center gap-2.5 p-3.5 border-b border-zinc-850">
                          <div className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-extrabold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>
                            {(profile.name || 'CR').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-zinc-100 truncate">{profile.name}</div>
                            <div className="text-[11px] font-mono text-zinc-500 truncate">⛓ {currentAttendee.walletAddress.slice(0, 6)}…{currentAttendee.walletAddress.slice(-4)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3.5 py-2 border-b border-zinc-850 text-[11px]">
                          <span className="text-zinc-500">XP total</span>
                          <span className="font-black text-amber-400">{profile.xp || currentAttendee.points}</span>
                          <span className="w-1 h-1 rounded-full bg-zinc-700 mx-1" />
                          <span className="text-zinc-500">Insignias</span>
                          <span className="font-black text-indigo-400">{currentAttendee.badges.length}</span>
                        </div>
                        {[
                          { label: '🗂 Historial · asistidos y creados', act: () => { setActiveView('history'); } },
                          { label: '🏅 Mis insignias', act: () => { setActiveView('badges'); } },
                          { label: '⚙ Ajustes de perfil', act: () => { setActiveView('settings'); } },
                          { label: walletCopied ? '✓ Wallet copiada' : '📋 Copiar wallet', act: () => { navigator.clipboard?.writeText(currentAttendee.walletAddress).catch(() => {}); setWalletCopied(true); setTimeout(() => setWalletCopied(false), 1500); } },
                        ].map((item) => (
                          <button key={item.label} onClick={() => { item.act(); setShowAccountMenu(false); }} className="w-full text-left px-3.5 py-2.5 text-[12.5px] text-zinc-300 hover:bg-indigo-500/10 hover:text-white transition-colors cursor-pointer">
                            {item.label}
                          </button>
                        ))}
                        <div className="border-t border-zinc-850">
                          <button onClick={() => { handleDisconnect(); setShowAccountMenu(false); }} className="w-full text-left px-3.5 py-2.5 text-[12.5px] text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" /> Cerrar sesión
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-xl flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                <Wallet className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Registrarme</span><span className="xs:hidden">Entrar</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Tab Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 backdrop-blur-md border-t border-white/10 pb-safe shadow-2xl flex justify-around py-3 text-[10px] font-bold text-zinc-400">
        <button
          onClick={() => { setSelectedEvent(null); setActiveView('events'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'events' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
        >
          <Compass className="w-5 h-5" />
          <span>Eventos</span>
        </button>
        <button
          onClick={() => { setSelectedEvent(null); setActiveView('discover'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'discover' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
        >
          <Globe className="w-5 h-5" />
          <span>Descubrir</span>
        </button>
        <button
          onClick={() => { setActiveView('leaderboard'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'leaderboard' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
        >
          <Trophy className="w-5 h-5" />
          <span>Leaderboard</span>
        </button>
        <button
          onClick={() => { setActiveView('badges'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'badges' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
        >
          <Award className="w-5 h-5" />
          <span>Mis Insignias</span>
        </button>
        <button
          onClick={() => { setActiveView('create'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'create' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
        >
          <Plus className="w-5 h-5" />
          <span>Crear</span>
        </button>
      </div>

      {/* 2. MAIN LAYOUT STAGE */}
      <main className="flex-1 overflow-y-auto no-scrollbar max-w-7xl w-full mx-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6" id="main-scroll-container">

        {/* VIEW 1: EVENTS LIST & EXPLORER */}
        {activeView === 'events' && !selectedEvent && (
          <div className="space-y-6">

            {/* Immersive Tech Hero */}
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 p-6 md:p-10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
              <div className="space-y-3.5 max-w-2xl w-full">
                <span className="text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full tracking-widest flex items-center gap-1.5 max-w-full whitespace-normal">
                  <Sparkles className="w-3.5 h-3.5 fill-indigo-400 animate-pulse shrink-0" /> Onboarding y Acreditación Digital
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
                  Acredítate y reclama tus <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Insignias NFT</span>
                </h1>
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                  Crea eventos masivos o corporativos. Completa misiones IRL, califica workshops presenciales de sponsors, escala el Leaderboard y reclama premios exclusivos usando tu billetera Privy sin semillas.
                </p>
              </div>

              {!currentAttendee && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => setShowWalletModal(true)}
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Comenzar Onboarding <ArrowUpRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onboardJoaquin}
                    className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Probar Demo <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </button>
                </div>
              )}
            </div>

            {/* Non-intrusive Top Banner Sponsorship */}
            <div className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-zinc-400">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Patrocinadores Destacados:</span>
              </div>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => handleSponsorDirectClick({ id: 'sp1', name: 'Google Cloud', logo: '⚡', tier: 'Platinum', link: 'https://cloud.google.com', impressions: 0, clicks: 0 })}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">⚡</span> <span className="font-bold">Google Cloud Devs</span>
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={() => handleSponsorDirectClick({ id: 'sp4', name: 'Vercel', logo: '▲', tier: 'Gold', link: 'https://vercel.com', impressions: 0, clicks: 0 })}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">▲</span> <span className="font-bold">Vercel Edge</span>
                </button>
                <span className="text-zinc-700">|</span>
                <button
                  onClick={() => handleSponsorDirectClick({ id: 'sp3', name: 'Privy', logo: '🔑', tier: 'Gold', link: 'https://privy.io', impressions: 0, clicks: 0 })}
                  className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="text-base">🔑</span> <span className="font-bold">Privy Auth</span>
                </button>
              </div>
            </div>

            {/* Filter controls & Search */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3.5 justify-between">
              <input
                type="text"
                placeholder="Buscar eventos o ciudades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-violet-500 w-full sm:max-w-xs"
              />

              <div className="flex gap-2 items-center flex-wrap">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mr-1">Filtrar por:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="All">Todas las Categorías</option>
                  <option value="Hacker House">Hacker Houses</option>
                  <option value="Workshop">Workshops</option>
                  <option value="Meetup">Meetups</option>
                </select>
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
                >
                  <option value="All">Cualquier Aforo</option>
                  <option value="Small">Pequeño (≤ 100)</option>
                  <option value="Medium">Mediano (101 - 200)</option>
                  <option value="Large">Masivo (&gt; 200)</option>
                </select>
              </div>
            </div>

            {/* Event grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={setSelectedEvent}
                  isRegistered={currentAttendee?.registeredEvents?.includes(event.id) || false}
                />
              ))}

              {filteredEvents.length === 0 && (
                <div className="col-span-full py-12 text-center bg-zinc-900 rounded-2xl border border-zinc-850">
                  <p className="text-zinc-400 font-semibold">No se encontraron eventos con los filtros seleccionados.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setAttendanceFilter('All'); }}
                    className="text-xs text-violet-400 hover:underline mt-2 font-bold cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* VIEW 1.5: SINGLE EVENT DETAILS */}
        {activeView === 'events' && selectedEvent && (
          <EventDetail
            event={selectedEvent}
            attendee={currentAttendee}
            onBack={() => setSelectedEvent(null)}
            onRegister={() => setShowWalletModal(true)}
            onOnboardDemo={handleOnboardDemo}
            onCompleteActivity={handleCompleteActivity}
            onAddNotification={handleAddNotification}
            onRegisterEvent={handleRegisterEvent}
            onUnregisterEvent={handleUnregisterEvent}
            onRegisterActivity={handleRegisterActivity}
            onDeleteActivity={handleDeleteActivity}
            onMintPOAP={handleMintPOAP}
            isOffline={isOffline}
          />
        )}

        {/* VIEW: DESCUBRIR */}
        {activeView === 'discover' && <Discover />}

        {/* VIEW 2: LEADERBOARDS & STORE */}
        {activeView === 'leaderboard' && (
          <Leaderboard
            attendees={attendees}
            currentAttendee={currentAttendee}
            onAddNotification={handleAddNotification}
          />
        )}

        {/* VIEW: PERFIL / HISTORIAL */}
        {activeView === 'history' && <History />}

        {/* VIEW: AJUSTES */}
        {activeView === 'settings' && <Settings />}

        {/* VIEW 3: INSIGNIAS WALLET METADATA */}
        {activeView === 'badges' && (
          <BadgeDisplay
            badges={currentAttendee ? currentAttendee.badges : []}
            userName={currentAttendee ? currentAttendee.name : ''}
          />
        )}

        {/* VIEW 4: ADMIN PANEL / CREAR EVENTO */}
        {activeView === 'create' && (
          !currentAttendee ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-6 animate-scale-up mt-8">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20 mx-auto">
                <Plus className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight font-display">Crea tu Propio Evento Tecnológico</h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                  Configura la agenda, genera enlaces de invitación automáticos y premia a tus asistentes con insignias NFT dinámicas en Polygon.
                </p>
              </div>
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-850 text-left space-y-2 text-xs text-zinc-300">
                <p className="font-bold text-indigo-400 flex items-center gap-1.5">🔑 Portal de Creador Privy</p>
                <p className="text-[11px] text-zinc-400">
                  Cualquier persona de la comunidad puede crear un evento. Al iniciar sesión, se creará tu billetera digital embebida para que firmes los contratos del ledger del evento.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.01] active:scale-95"
                >
                  Conectar Privy & Entrar
                </button>
                <button
                  onClick={onboardJoaquin}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer border border-zinc-750 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-1.5"
                >
                  Probar Demo <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                </button>
              </div>
            </div>
          ) : (
            <AdminPanel
              events={events}
              attendees={attendees}
              onAddEvent={() => refetch()}
              onAddNotification={handleAddNotification}
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setActiveView('events');
              }}
            />
          )
        )}

        {/* 3. SIMULATORS TRAY PANEL */}
        {((activeView === 'create') || (activeView === 'events' && selectedEvent)) && (
          <OfflineIndicator
            isOffline={isOffline}
            onToggleOffline={handleToggleOffline}
            queue={offlineQueue}
            onSyncQueue={handleSyncQueue}
            isSyncing={isSyncing}
            onSimulatePush={(title, msg) => handleAddNotification(title, msg)}
          />
        )}

      </main>

      {/* 4. ONBOARDING MODAL OVERLAY */}
      {showWalletModal && (
        <WalletModal
          onOnboardComplete={(attendee) => { handleOnboardComplete(attendee); setShowWalletModal(false); }}
          onClose={() => setShowWalletModal(false)}
        />
      )}

      {/* 5. SLIDE-IN TOAST ALERTS CONTAINER */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm pointer-events-none" id="toasts-portal">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-zinc-900/95 backdrop-blur-md border border-violet-500/30 p-4 rounded-xl shadow-2xl space-y-1.5 flex flex-col transition-all animate-slide-left relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            <div className="font-extrabold text-xs text-zinc-100 flex items-center justify-between">
              <span>{t.title}</span>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">{t.message}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-900 pt-6 pb-24 md:py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Tech Event Onboarding and Participation Protocol (LATAM). All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://latamprotocol.io" target="_blank" rel="noreferrer" className="hover:text-zinc-300">LATAM Protocol</a>
            <span>•</span>
            <a href="https://luma.com" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Luma Events</a>
            <span>•</span>
            <a href="https://privy.io" target="_blank" rel="noreferrer" className="hover:text-zinc-300">Privy Sandbox</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
