import React, { useState, useEffect } from 'react';
import { 
  Compass, Trophy, Award, Database, Bell, Wallet, LogOut, 
  Sparkles, CheckCircle2, Shield, Info, HelpCircle, ArrowUpRight,
  Plus
} from 'lucide-react';
import { Event, Attendee, NotificationItem, OfflineAction, Sponsor } from './types';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import WalletModal from './components/WalletModal';
import BadgeDisplay from './components/BadgeDisplay';
import Leaderboard from './components/Leaderboard';
import AdminPanel from './components/AdminPanel';
import OfflineIndicator from './components/OfflineIndicator';

export default function App() {
  // DB States
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  // App States
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [activeView, setActiveView] = useState<'events' | 'leaderboard' | 'badges' | 'admin'>('events');
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState<boolean>(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [attendanceFilter, setAttendanceFilter] = useState<string>('All'); // expected attendance filters

  // Offline Mode States
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // In-App Toast alerts (Push notifications simulator)
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string }[]>([]);

  // Fetch initial data
  const fetchData = async () => {
    if (isOffline) return;
    try {
      const [eventsRes, attendeesRes, notifRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/attendees'),
        fetch('/api/notifications')
      ]);

      if (eventsRes.ok && attendeesRes.ok && notifRes.ok) {
        const eventsData = await eventsRes.json();
        const attendeesData = await attendeesRes.json();
        const notifData = await notifRes.json();
        
        setEvents(eventsData);
        setAttendees(attendeesData);
        setNotifications(notifData);

        // Update the current logged-in attendee state if they exist in the database
        const savedAttendee = localStorage.getItem('tech_badge_attendee');
        if (savedAttendee) {
          const parsed = JSON.parse(savedAttendee);
          const fresh = attendeesData.find((a: Attendee) => a.id === parsed.id);
          if (fresh) {
            setCurrentAttendee(fresh);
            localStorage.setItem('tech_badge_attendee', JSON.stringify(fresh));
          } else {
            setCurrentAttendee(parsed);
          }
        }

        // Keep selectedEvent in sync so details update instantly
        setSelectedEvent(prev => {
          if (!prev) return null;
          return eventsData.find((e: Event) => e.id === prev.id) || prev;
        });
      }
    } catch (e) {
      console.error('Error fetching data from server:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOffline]);

  // Handle URL invitation links on mount
  useEffect(() => {
    const checkInvites = async () => {
      const params = new URLSearchParams(window.location.search);
      
      // 1. Try search parameters (?event=id)
      const eventId = params.get('event');
      if (eventId) {
        try {
          const res = await fetch(`/api/events/by-code/${eventId}`);
          if (res.ok) {
            const matched = await res.json();
            setSelectedEvent(matched);
            setActiveView('events');
            return;
          }
        } catch (err) {
          console.error('Error fetching event by id:', err);
        }
      }

      // 2. Try invite code search parameters (?invite=code or ?i=code)
      const inviteCode = params.get('invite') || params.get('i');
      if (inviteCode) {
        try {
          const res = await fetch(`/api/events/by-code/${inviteCode}`);
          if (res.ok) {
            const matched = await res.json();
            setSelectedEvent(matched);
            setActiveView('events');
            return;
          }
        } catch (err) {
          console.error('Error fetching event by invite code:', err);
        }
      }

      // 3. Try path-based invites (/invite/:code or /i/:code)
      const path = window.location.pathname;
      const pathMatch = path.match(/^\/(invite|i)\/([a-zA-Z0-9_-]+)/);
      if (pathMatch) {
        const code = pathMatch[2];
        try {
          const res = await fetch(`/api/events/by-code/${code}`);
          if (res.ok) {
            const matched = await res.json();
            setSelectedEvent(matched);
            setActiveView('events');
          }
        } catch (err) {
          console.error('Error fetching event by path invite code:', err);
        }
      }
    };

    checkInvites();
  }, []);

  // Synchronize browser URL with app state (Luma-like URL routing)
  useEffect(() => {
    if (activeView === 'events') {
      if (selectedEvent) {
        const path = `/invite/${selectedEvent.shortCode || selectedEvent.id}`;
        if (window.location.pathname !== path) {
          window.history.pushState(null, '', path);
        }
      } else {
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/invite') && !window.location.pathname.startsWith('/i/')) {
          window.history.pushState(null, '', '/');
        }
      }
    } else {
      const path = `/${activeView}`;
      if (window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
  }, [activeView, selectedEvent]);

  // Handle browser back/forward buttons (POPState)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '/events') {
        setSelectedEvent(null);
        setActiveView('events');
      } else if (path === '/leaderboard') {
        setSelectedEvent(null);
        setActiveView('leaderboard');
      } else if (path === '/badges') {
        setSelectedEvent(null);
        setActiveView('badges');
      } else if (path === '/admin') {
        setSelectedEvent(null);
        setActiveView('admin');
      } else {
        const pathMatch = path.match(/^\/(invite|i)\/([a-zA-Z0-9_-]+)/);
        if (pathMatch) {
          const code = pathMatch[2];
          fetch(`/api/events/by-code/${code}`)
            .then(res => {
              if (res.ok) return res.json();
              throw new Error('Not found');
            })
            .then(matched => {
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
  }, []);

  // Scroll to top on navigation/view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    const mainEl = document.getElementById('main-scroll-container');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeView, selectedEvent]);

  // Handle Privy Onboarding Complete with Auto RSVP for invited events
  const handleOnboardComplete = async (newAttendee: Attendee) => {
    setCurrentAttendee(newAttendee);
    localStorage.setItem('tech_badge_attendee', JSON.stringify(newAttendee));
    
    if (selectedEvent) {
      try {
        const response = await fetch(`/api/attendees/${newAttendee.id}/register-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: selectedEvent.id })
        });
        if (response.ok) {
          const updated: Attendee = await response.json();
          setCurrentAttendee(updated);
          localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
          triggerToast(
            '🎟️ Inscripción Automática Exitosa',
            `¡Te has inscrito automáticamente en "${selectedEvent.title}"! Tu billetera Privy está lista.`
          );
        } else {
          triggerToast(
            '🚀 Onboarding Completado',
            `¡Bienvenido/a ${newAttendee.name}! Tu billetera Privy está lista.`
          );
        }
      } catch (err) {
        console.error('Error auto-registering for event:', err);
        triggerToast(
          '🚀 Onboarding Completado',
          `¡Bienvenido/a ${newAttendee.name}! Tu billetera Privy está lista.`
        );
      }
    } else {
      triggerToast(
        '🚀 Onboarding Completado',
        `¡Bienvenido/a ${newAttendee.name}! Tu billetera Privy está lista y recibiste tu primera insignia NFT.`
      );
    }
    
    fetchData(); // reload lists
  };

  // Onboard random demo participant (friend simulation)
  const handleOnboardDemo = async () => {
    try {
      const randomId = Math.floor(100 + Math.random() * 900);
      const name = `Invitado Demo #${randomId}`;
      const email = `demo_${Date.now()}_${randomId}@latamprotocol.com`;
      const walletAddress = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      const response = await fetch('/api/attendees/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          walletAddress,
          walletType: 'Privy (Demo)'
        })
      });
      if (response.ok) {
        const attendee = await response.json();
        await handleOnboardComplete(attendee);
      }
    } catch (err) {
      console.error('Error in demo onboarding:', err);
    }
  };

  // Sign out / Disconnect Wallet
  const handleDisconnect = () => {
    setCurrentAttendee(null);
    localStorage.removeItem('tech_badge_attendee');
    triggerToast('🔑 Privy Desconectado', 'Has cerrado tu sesión de billetera embebida de forma segura.');
  };

  // Submit in-app notifications
  const handleAddNotification = async (title: string, msg: string) => {
    triggerToast(title, msg);
    
    // In-Memory notification addition for fast offline fallback
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      title,
      message: msg,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);

    if (!isOffline) {
      // Sync events / attendee state as well
      fetchData();
    }
  };

  // Complete an Activity flow
  const handleCompleteActivity = async (activityId: string) => {
    if (!currentAttendee || !selectedEvent) return;

    if (isOffline) {
      // Offline caching mode
      const newAction: OfflineAction = {
        id: `off_${Date.now()}`,
        type: 'COMPLETE_ACTIVITY',
        payload: { activityId, eventId: selectedEvent.id },
        timestamp: new Date().toISOString()
      };
      setOfflineQueue(prev => [...prev, newAction]);
      
      // Update local state temporarily for zero-friction feel
      const updatedAttendee = {
        ...currentAttendee,
        completedActivities: [...currentAttendee.completedActivities, activityId],
        points: currentAttendee.points + 100 // mock completion points
      };
      setCurrentAttendee(updatedAttendee);
      localStorage.setItem('tech_badge_attendee', JSON.stringify(updatedAttendee));

      triggerToast(
        '💾 Guardado Localmente (Offline)',
        'Sin conexión a internet. Los puntos y actividades se sincronizarán al restablecer la red.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/attendees/${currentAttendee.id}/activities/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId,
          eventId: selectedEvent.id
        })
      });

      if (response.ok) {
        const updated: Attendee = await response.json();
        setCurrentAttendee(updated);
        localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
        
        triggerToast(
          '🎯 Actividad Registrada',
          '¡Has obtenido puntos XP! Tu Insignia NFT dinámica ha actualizado su metadata en Polygon Scan.'
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error completing activity:', err);
    }
  };

  // Register attendee to a specific event
  const handleRegisterEvent = async (eventId: string) => {
    if (!currentAttendee) return;

    if (isOffline) {
      // Offline mode registration
      const updatedAttendee = {
        ...currentAttendee,
        registeredEvents: [...(currentAttendee.registeredEvents || []), eventId]
      };
      setCurrentAttendee(updatedAttendee);
      localStorage.setItem('tech_badge_attendee', JSON.stringify(updatedAttendee));

      triggerToast(
        '💾 Guardado Localmente (Offline)',
        'Te has inscrito al evento de forma local. Se sincronizará en la base de datos al recuperar conexión.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/attendees/${currentAttendee.id}/register-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        const updated: Attendee = await response.json();
        setCurrentAttendee(updated);
        localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
        
        triggerToast(
          '🎟️ Inscripción Exitosa',
          '¡Ya formas parte del evento! Has desbloqueado la agenda y las actividades.'
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error registering for event:', err);
    }
  };

  // Unregister attendee from a specific event
  const handleUnregisterEvent = async (eventId: string) => {
    if (!currentAttendee) return;

    if (isOffline) {
      const updatedAttendee = {
        ...currentAttendee,
        registeredEvents: (currentAttendee.registeredEvents || []).filter(id => id !== eventId)
      };
      setCurrentAttendee(updatedAttendee);
      localStorage.setItem('tech_badge_attendee', JSON.stringify(updatedAttendee));

      triggerToast(
        '💾 Guardado Localmente (Offline)',
        'Se canceló el registro del evento localmente.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/attendees/${currentAttendee.id}/unregister-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      if (response.ok) {
        const updated: Attendee = await response.json();
        setCurrentAttendee(updated);
        localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
        
        triggerToast(
          '🎟️ Registro Cancelado',
          'Has cancelado tu inscripción al evento.'
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error unregistering from event:', err);
    }
  };

  // Save minted POAP Badge details
  const handleMintPOAP = async (
    eventId: string,
    txHash: string,
    chainName: string,
    blockNumber: number,
    contractAddress: string,
    tokenId: string
  ) => {
    if (!currentAttendee) return;
    try {
      const response = await fetch(`/api/attendees/${currentAttendee.id}/mint-poap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          txHash,
          chainName,
          blockNumber,
          contractAddress,
          tokenId
        })
      });

      if (response.ok) {
        const updated: Attendee = await response.json();
        setCurrentAttendee(updated);
        localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
        
        triggerToast(
          '🏅 POAP Acuñado',
          '¡Tu prueba de asistencia se ha registrado con éxito on-chain!'
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error recording minted POAP:', err);
    }
  };

  // Register attendee to a specific activity
  const handleRegisterActivity = async (activityId: string) => {
    if (!currentAttendee) return;

    if (isOffline) {
      const updatedAttendee = {
        ...currentAttendee,
        registeredActivities: [...(currentAttendee.registeredActivities || []), activityId]
      };
      setCurrentAttendee(updatedAttendee);
      localStorage.setItem('tech_badge_attendee', JSON.stringify(updatedAttendee));

      triggerToast(
        '💾 Guardado Localmente (Offline)',
        'Inscripción de actividad guardada localmente.'
      );
      return;
    }

    try {
      const response = await fetch(`/api/attendees/${currentAttendee.id}/register-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId })
      });

      if (response.ok) {
        const updated: Attendee = await response.json();
        setCurrentAttendee(updated);
        localStorage.setItem('tech_badge_attendee', JSON.stringify(updated));
        
        triggerToast(
          '✍️ Inscripción de Actividad',
          'Te has inscrito correctamente en la actividad. ¡Comienza cuando gustes!'
        );
        fetchData();
      }
    } catch (err) {
      console.error('Error registering for activity:', err);
    }
  };

  // Delete an activity from an event
  const handleDeleteActivity = async (eventId: string, activityId: string) => {
    if (isOffline) {
      triggerToast('🔌 Modo Sin Conexión', 'No se pueden eliminar actividades en modo sin conexión.');
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}/activities/${activityId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        triggerToast('🗑️ Actividad Eliminada', 'La actividad ha sido removida del evento.');
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
    }
  };

  // Sync Offline Queue
  const handleSyncQueue = async () => {
    if (isOffline || offlineQueue.length === 0) return;
    setIsSyncing(true);
    
    try {
      // Loop and call API for each cached item
      for (const action of offlineQueue) {
        if (action.type === 'COMPLETE_ACTIVITY') {
          await fetch(`/api/attendees/${currentAttendee?.id}/activities/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activityId: action.payload.activityId,
              eventId: action.payload.eventId
            })
          });
        }
      }
      
      setOfflineQueue([]);
      triggerToast(
        '🔄 Sincronización Exitosa',
        '¡Tu historial acumulado sin conexión ha sido enlazado a la base de datos central!'
      );
      fetchData();
    } catch (e) {
      console.error('Error syncing queue:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle offline simulator
  const handleToggleOffline = () => {
    setIsOffline(prev => !prev);
    if (!isOffline) {
      triggerToast('🔌 Modo Sin Conexión Activado', 'La app funcionará de forma local sin requerir llamadas de red.');
    } else {
      triggerToast('🌐 Conexión Restablecida', 'Conexión recuperada. Listo para sincronizar base de datos.');
    }
  };

  // Trigger Slide-In Toast Alert
  const triggerToast = (title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message }]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Filters logic
  const filteredEvents = events.filter(evt => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || evt.category === categoryFilter;
    
    let matchesAttendance = true;
    if (attendanceFilter === 'Small') {
      matchesAttendance = evt.expectedAttendance <= 100;
    } else if (attendanceFilter === 'Medium') {
      matchesAttendance = evt.expectedAttendance > 100 && evt.expectedAttendance <= 200;
    } else if (attendanceFilter === 'Large') {
      matchesAttendance = evt.expectedAttendance > 200;
    }

    return matchesSearch && matchesCategory && matchesAttendance;
  });

  // Track Sponsor Impression Clicks
  const handleSponsorDirectClick = async (sponsor: Sponsor) => {
    try {
      await fetch(`/api/sponsors/${sponsor.id}/click`, { method: 'POST' });
    } catch (e) {}
    window.open(sponsor.link, '_blank');
  };

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
                onClick={() => { setActiveView('admin'); }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border text-xs font-bold hover:scale-[1.02] ${
                  activeView === 'admin' 
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
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotificationDropdown && (
                <div 
                  className="absolute right-[-100px] xs:right-[-50px] sm:right-0 mt-2 w-[295px] sm:w-85 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl z-50 text-xs animate-scale-up" 
                  id="notifications-dropdown"
                  style={{ transformOrigin: 'top right' }}
                >
                  <div className="flex justify-between items-center border-b border-zinc-850 pb-2.5 mb-2.5">
                    <span className="font-bold text-zinc-200">Alertas Recientes</span>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({...n, read: true})));
                        fetch('/api/notifications/clear', { method: 'POST' });
                      }}
                      className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold cursor-pointer"
                    >
                      Marcar leídas
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-zinc-500 text-center py-4">No hay alertas recientes.</p>
                    ) : (
                      notifications.map(n => (
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

            {/* Privy Wallet Portal Button */}
            {currentAttendee ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Balance display */}
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-bold leading-none">Mi Nivel</span>
                  <span className="text-xs font-black text-indigo-400">{currentAttendee.points} XP</span>
                </div>

                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl text-xs font-semibold max-w-[125px] sm:max-w-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="font-mono text-zinc-300 truncate">
                    {currentAttendee.walletAddress.substring(0, 4)}...{currentAttendee.walletAddress.substring(currentAttendee.walletAddress.length - 4)}
                  </span>
                  <button
                    onClick={handleDisconnect}
                    className="p-1 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 rounded transition-colors cursor-pointer shrink-0"
                    title="Desconectar Privy"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
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
          onClick={() => { setActiveView('admin'); }}
          className={`flex flex-col items-center gap-1.5 transition-all cursor-pointer ${activeView === 'admin' ? 'text-indigo-400 scale-105 font-black' : 'hover:text-zinc-200'}`}
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
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
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
                    onClick={async () => {
                      try {
                        const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
                        const response = await fetch('/api/attendees/onboard', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: 'Joaquín Estéban (Demo)',
                            email: 'demo@latamprotocol.com',
                            walletAddress,
                            walletType: 'Privy'
                          })
                        });
                        if (response.ok) {
                          const attendee = await response.json();
                          handleOnboardComplete(attendee);
                        }
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Probar Demo <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  </button>
                </div>
              )}
            </div>

            {/* Non-intrusive Top Banner Sponsorship (Google Cloud & Vercel) */}
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
                
                {/* Category filter */}
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

                {/* Expected attendance size filter */}
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

        {/* VIEW 2: LEADERBOARDS & STORE */}
        {activeView === 'leaderboard' && (
          <Leaderboard 
            attendees={attendees}
            currentAttendee={currentAttendee}
            onAddNotification={handleAddNotification}
          />
        )}

        {/* VIEW 3: INSIGNIAS WALLET METADATA */}
        {activeView === 'badges' && (
          <BadgeDisplay 
            badges={currentAttendee ? currentAttendee.badges : []}
            userName={currentAttendee ? currentAttendee.name : ''}
          />
        )}

        {/* VIEW 4: ADMIN PANEL / CREAR EVENTO */}
        {activeView === 'admin' && (
          !currentAttendee ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-6 animate-scale-up mt-8">
              <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center border border-indigo-500/20 mx-auto">
                <Plus className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">Crea tu Propio Evento Tecnológico</h2>
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
                  onClick={async () => {
                    try {
                      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
                      const response = await fetch('/api/attendees/onboard', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: 'Joaquín Estéban (Demo)',
                          email: 'demo@latamprotocol.com',
                          walletAddress,
                          walletType: 'Privy'
                        })
                      });
                      if (response.ok) {
                        const attendee = await response.json();
                        handleOnboardComplete(attendee);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
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
              onAddEvent={(newEvent) => setEvents(prev => [...prev, newEvent])}
              onAddNotification={handleAddNotification}
              onSelectEvent={(event) => {
                setSelectedEvent(event);
                setActiveView('events');
              }}
            />
          )
        )}

        {/* 3. SIMULATORS TRAY PANEL */}
        {((activeView === 'admin') || (activeView === 'events' && selectedEvent)) && (
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
          onOnboardComplete={handleOnboardComplete}
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
            {/* Top accent glow line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-600"></div>
            
            <div className="font-extrabold text-xs text-zinc-100 flex items-center justify-between">
              <span>{t.title}</span>
              <button 
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
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
