/**
 * AppProvider — capa de estado de EventProtocol, organizada por dominio.
 *
 * Centraliza lo que antes vivía disperso en `App.tsx`:
 *   · auth     → sesión (wallet embebida Privy), onboard/disconnect
 *   · data     → catálogos (events, attendees, notifications) + refetch
 *   · nav      → view/screen/selección de evento (navegación del prototipo)
 *   · offline  → simulador offline + cola de sincronización
 *   · ui       → toasts, tema/acento
 *
 * Toda la red pasa por la capa `src/lib/api`. Los componentes consumen esto
 * vía los hooks de dominio (useAuth, useData, useNav, useOffline, useUI).
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, ApiError } from '../lib/api';
import type {
  Attendee,
  Event,
  NotificationItem,
  OfflineAction,
  Sponsor,
  AppView,
  AppScreen,
  Profile,
} from '../types';

/** Perfil por defecto (demo) hasta que el backend exponga GET /me. */
const DEFAULT_PROFILE: Profile = {
  name: 'Camila Reyes',
  user: '@camireyes',
  email: 'camila@ejemplo.cl',
  city: 'Santiago, Chile',
  bio: 'Frontend dev construyendo en Web3. Fan de los hackathons y el café de especialidad.',
  wallet: '0x7f3a9c41b2d8e6f0a3c5d7e9b1f4a6c8d0e2f4c29b',
  phone: '',
  handles: { github: 'camilareyes', linkedin: '', x: '', instagram: '' },
  xp: 0,
};

const STORAGE_KEY = 'tech_badge_attendee';

export interface Toast {
  id: string;
  title: string;
  message: string;
}

interface AppContextValue {
  // --- data ---
  events: Event[];
  attendees: Attendee[];
  notifications: NotificationItem[];
  refetch: () => Promise<void>;

  // --- auth / sesión ---
  currentAttendee: Attendee | null;
  /** Finaliza el onboarding con un attendee ya creado (WalletModal). */
  completeOnboard: (attendee: Attendee) => Promise<void>;
  /** Crea el attendee vía API y finaliza el onboarding (flujo demo/email). */
  onboard: (input: { name: string; email: string; walletAddress: string; walletType: string }) => Promise<Attendee | null>;
  onboardDemo: () => Promise<void>;
  disconnect: () => void;
  setCurrentAttendee: (a: Attendee | null) => void;

  // --- navegación ---
  view: AppView;
  setView: (v: AppView) => void;
  screen: AppScreen;
  setScreen: (s: AppScreen) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (e: Event | null) => void;

  // --- descubrir / seguir ---
  follows: string[];
  toggleFollow: (organizerId: string, organizerName?: string) => void;
  isFollowing: (organizerId: string) => boolean;

  // --- perfil (Historial / Ajustes) ---
  profile: Profile;
  updateProfile: (partial: Partial<Profile>) => void;

  // --- offline ---
  isOffline: boolean;
  toggleOffline: () => void;
  offlineQueue: OfflineAction[];
  enqueueOffline: (action: OfflineAction) => void;
  syncQueue: () => Promise<void>;
  isSyncing: boolean;

  // --- ui ---
  toasts: Toast[];
  toast: (title: string, message: string) => void;
  dismissToast: (id: string) => void;
  accent: string;
  setAccent: (hex: string) => void;
  xpBurst: { id: number; points: number } | null;

  // --- acciones de dominio (mutaciones) ---
  completeActivity: (activityId: string) => Promise<void>;
  registerEvent: (eventId: string) => Promise<void>;
  unregisterEvent: (eventId: string) => Promise<void>;
  registerActivity: (activityId: string) => Promise<void>;
  deleteActivity: (eventId: string, activityId: string) => Promise<void>;
  mintPoap: (
    eventId: string,
    txHash: string,
    chainName: string,
    blockNumber: number,
    contractAddress: string,
    tokenId: string,
  ) => Promise<void>;
  trackSponsorClick: (sponsor: Sponsor) => Promise<void>;
  clearNotifications: () => void;
  addNotification: (title: string, message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // data
  const [events, setEvents] = useState<Event[]>([]);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // auth
  const [currentAttendee, setCurrentAttendee] = useState<Attendee | null>(null);

  // navegación (arranca en la landing pública del prototipo)
  const [view, setView] = useState<AppView>('landing');
  const [screen, setScreen] = useState<AppScreen>('events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // organizadores seguidos (Descubrir). Cliente-side + persistencia local
  // hasta que el backend exponga POST /organizers/:id/follow.
  const [follows, setFollows] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('ep_follows') || '[]');
    } catch {
      return [];
    }
  });

  // offline
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // perfil
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const updateProfile = useCallback((partial: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  // ui
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [accent, setAccent] = useState('#6366f1');
  const [xpBurst, setXpBurst] = useState<{ id: number; points: number } | null>(null);

  const fireXpBurst = useCallback((points: number) => {
    const id = Date.now();
    setXpBurst({ id, points });
    setTimeout(() => setXpBurst((cur) => (cur && cur.id === id ? null : cur)), 1500);
  }, []);

  // Aplica el acento al árbol como variable CSS (--ep-accent).
  useEffect(() => {
    document.documentElement.style.setProperty('--ep-accent', accent);
  }, [accent]);

  // Sincroniza los datos dinámicos del perfil con la sesión activa (wallet/XP).
  useEffect(() => {
    if (currentAttendee) {
      setProfile((prev) => ({
        ...prev,
        wallet: currentAttendee.walletAddress || prev.wallet,
        xp: currentAttendee.points ?? prev.xp,
      }));
    }
  }, [currentAttendee]);

  const toast = useCallback((title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleFollow = useCallback(
    (organizerId: string, organizerName?: string) => {
      setFollows((prev) => {
        const next = prev.includes(organizerId)
          ? prev.filter((f) => f !== organizerId)
          : [...prev, organizerId];
        localStorage.setItem('ep_follows', JSON.stringify(next));
        return next;
      });
      const name = organizerName ?? organizerId;
      if (follows.includes(organizerId)) toast('Dejaste de seguir', `Ya no sigues a ${name}.`);
      else toast('Ahora sigues', `${name} · sus eventos aparecerán en Eventos.`);
    },
    [follows, toast],
  );

  const isFollowing = useCallback((organizerId: string) => follows.includes(organizerId), [follows]);

  const persistAttendee = useCallback((a: Attendee) => {
    setCurrentAttendee(a);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
  }, []);

  const refetch = useCallback(async () => {
    if (isOffline) return;
    try {
      const [ev, at, nf] = await Promise.all([
        api.events.list(),
        api.attendees.list(),
        api.notifications.list(),
      ]);
      setEvents(ev);
      setAttendees(at);
      setNotifications(nf);

      // Re-sincroniza la sesión guardada con el dato fresco del backend.
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Attendee;
        const fresh = at.find((a) => a.id === parsed.id);
        if (fresh) persistAttendee(fresh);
        else setCurrentAttendee(parsed);
      }

      // Mantiene selectedEvent sincronizado.
      setSelectedEvent((prev) => (prev ? ev.find((e) => e.id === prev.id) || prev : null));
    } catch (e) {
      console.error('Error al cargar datos:', e);
    }
  }, [isOffline, persistAttendee]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // --- auth ---
  const completeOnboard = useCallback(
    async (attendee: Attendee) => {
      persistAttendee(attendee);

      // Auto-RSVP si venían de una invitación concreta.
      if (selectedEvent) {
        try {
          const updated = await api.attendees.registerEvent(attendee.id, selectedEvent.id);
          persistAttendee(updated);
          toast('🎟️ Inscripción automática', `Te inscribiste en "${selectedEvent.title}".`);
        } catch {
          toast('🚀 Onboarding completado', `¡Bienvenido/a ${attendee.name}!`);
        }
      } else {
        toast('🚀 Onboarding completado', `¡Bienvenido/a ${attendee.name}! Tu wallet Privy está lista.`);
      }
      await refetch();
    },
    [selectedEvent, persistAttendee, refetch, toast],
  );

  const onboard = useCallback(
    async (input: { name: string; email: string; walletAddress: string; walletType: string }) => {
      try {
        const attendee = await api.attendees.onboard(input);
        await completeOnboard(attendee);
        return attendee;
      } catch (e) {
        console.error('Error en onboarding:', e);
        toast('⚠️ Error', e instanceof ApiError ? e.message : 'No se pudo completar el onboarding.');
        return null;
      }
    },
    [completeOnboard, toast],
  );

  const onboardDemo = useCallback(async () => {
    const randomId = Math.floor(100 + Math.random() * 900);
    await onboard({
      name: `Invitado Demo #${randomId}`,
      email: `demo_${Date.now()}_${randomId}@latamprotocol.com`,
      walletAddress: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      walletType: 'Privy (Demo)',
    });
  }, [onboard]);

  const disconnect = useCallback(() => {
    setCurrentAttendee(null);
    localStorage.removeItem(STORAGE_KEY);
    toast('🔑 Privy desconectado', 'Cerraste tu sesión de wallet embebida.');
  }, [toast]);

  // --- notificaciones ---
  const addNotification = useCallback(
    (title: string, message: string) => {
      toast(title, message);
      setNotifications((prev) => [
        { id: `notif_${Date.now()}`, title, message, timestamp: new Date().toISOString(), read: false },
        ...prev,
      ]);
      if (!isOffline) refetch();
    },
    [toast, isOffline, refetch],
  );

  const clearNotifications = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    api.notifications.clear().catch(() => {});
  }, []);

  // --- offline ---
  const enqueueOffline = useCallback((action: OfflineAction) => {
    setOfflineQueue((prev) => [...prev, action]);
  }, []);

  const toggleOffline = useCallback(() => {
    setIsOffline((prev) => {
      const next = !prev;
      if (next) toast('🔌 Modo sin conexión', 'La app funciona local, sin llamadas de red.');
      else toast('🌐 Conexión restablecida', 'Listo para sincronizar la base de datos.');
      return next;
    });
  }, [toast]);

  const syncQueue = useCallback(async () => {
    if (isOffline || offlineQueue.length === 0 || !currentAttendee) return;
    setIsSyncing(true);
    try {
      for (const action of offlineQueue) {
        if (action.type === 'COMPLETE_ACTIVITY') {
          await api.attendees.completeActivity(
            currentAttendee.id,
            action.payload.activityId,
            action.payload.eventId,
          );
        }
      }
      setOfflineQueue([]);
      toast('🔄 Sincronización exitosa', 'Tu historial offline se enlazó a la base central.');
      await refetch();
    } catch (e) {
      console.error('Error al sincronizar:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isOffline, offlineQueue, currentAttendee, toast, refetch]);

  // --- mutaciones de dominio ---
  const completeActivity = useCallback(
    async (activityId: string) => {
      if (!currentAttendee || !selectedEvent) return;
      if (isOffline) {
        enqueueOffline({
          id: `off_${Date.now()}`,
          type: 'COMPLETE_ACTIVITY',
          payload: { activityId, eventId: selectedEvent.id },
          timestamp: new Date().toISOString(),
        });
        const optimistic = {
          ...currentAttendee,
          completedActivities: [...currentAttendee.completedActivities, activityId],
          points: currentAttendee.points + 100,
        };
        persistAttendee(optimistic);
        fireXpBurst(100);
        toast('💾 Guardado localmente', 'Se sincronizará al recuperar la red.');
        return;
      }
      try {
        const before = currentAttendee.points;
        const updated = await api.attendees.completeActivity(currentAttendee.id, activityId, selectedEvent.id);
        persistAttendee(updated);
        fireXpBurst(Math.max(0, (updated.points ?? before) - before) || 100);
        toast('🎯 Actividad registrada', '¡Ganaste XP! Tu insignia NFT actualizó su metadata.');
        await refetch();
      } catch (e) {
        console.error('Error al completar actividad:', e);
      }
    },
    [currentAttendee, selectedEvent, isOffline, enqueueOffline, persistAttendee, toast, refetch, fireXpBurst],
  );

  const registerEvent = useCallback(
    async (eventId: string) => {
      if (!currentAttendee) return;
      if (isOffline) {
        persistAttendee({
          ...currentAttendee,
          registeredEvents: [...(currentAttendee.registeredEvents || []), eventId],
        });
        toast('💾 Guardado localmente', 'Inscripción guardada offline.');
        return;
      }
      try {
        const updated = await api.attendees.registerEvent(currentAttendee.id, eventId);
        persistAttendee(updated);
        toast('🎟️ Inscripción exitosa', '¡Ya formas parte del evento!');
        await refetch();
      } catch (e) {
        console.error('Error al registrar evento:', e);
      }
    },
    [currentAttendee, isOffline, persistAttendee, toast, refetch],
  );

  const unregisterEvent = useCallback(
    async (eventId: string) => {
      if (!currentAttendee) return;
      if (isOffline) {
        persistAttendee({
          ...currentAttendee,
          registeredEvents: (currentAttendee.registeredEvents || []).filter((id) => id !== eventId),
        });
        toast('💾 Guardado localmente', 'Se canceló el registro localmente.');
        return;
      }
      try {
        const updated = await api.attendees.unregisterEvent(currentAttendee.id, eventId);
        persistAttendee(updated);
        toast('🎟️ Registro cancelado', 'Cancelaste tu inscripción.');
        await refetch();
      } catch (e) {
        console.error('Error al cancelar registro:', e);
      }
    },
    [currentAttendee, isOffline, persistAttendee, toast, refetch],
  );

  const registerActivity = useCallback(
    async (activityId: string) => {
      if (!currentAttendee) return;
      if (isOffline) {
        persistAttendee({
          ...currentAttendee,
          registeredActivities: [...(currentAttendee.registeredActivities || []), activityId],
        });
        toast('💾 Guardado localmente', 'Inscripción de actividad guardada offline.');
        return;
      }
      try {
        const updated = await api.attendees.registerActivity(currentAttendee.id, activityId);
        persistAttendee(updated);
        toast('✍️ Inscripción de actividad', 'Te inscribiste en la actividad.');
        await refetch();
      } catch (e) {
        console.error('Error al registrar actividad:', e);
      }
    },
    [currentAttendee, isOffline, persistAttendee, toast, refetch],
  );

  const deleteActivity = useCallback(
    async (eventId: string, activityId: string) => {
      if (isOffline) {
        toast('🔌 Sin conexión', 'No se pueden eliminar actividades offline.');
        return;
      }
      try {
        await api.events.deleteActivity(eventId, activityId);
        toast('🗑️ Actividad eliminada', 'La actividad se removió del evento.');
        await refetch();
      } catch (e) {
        console.error('Error al eliminar actividad:', e);
      }
    },
    [isOffline, toast, refetch],
  );

  const mintPoap = useCallback(
    async (
      eventId: string,
      txHash: string,
      chainName: string,
      blockNumber: number,
      contractAddress: string,
      tokenId: string,
    ) => {
      if (!currentAttendee) return;
      try {
        const updated = await api.attendees.mintPoap(currentAttendee.id, {
          eventId,
          txHash,
          chainName,
          blockNumber,
          contractAddress,
          tokenId,
        });
        persistAttendee(updated);
        toast('🏅 POAP acuñado', '¡Tu prueba de asistencia quedó registrada on-chain!');
        await refetch();
      } catch (e) {
        console.error('Error al registrar POAP:', e);
      }
    },
    [currentAttendee, persistAttendee, toast, refetch],
  );

  const trackSponsorClick = useCallback(async (sponsor: Sponsor) => {
    try {
      await api.sponsors.trackClick(sponsor.id);
    } catch {
      /* tracking best-effort */
    }
    window.open(sponsor.link, '_blank');
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      events,
      attendees,
      notifications,
      refetch,
      currentAttendee,
      completeOnboard,
      onboard,
      onboardDemo,
      disconnect,
      setCurrentAttendee,
      view,
      setView,
      screen,
      setScreen,
      selectedEvent,
      setSelectedEvent,
      follows,
      toggleFollow,
      isFollowing,
      profile,
      updateProfile,
      isOffline,
      toggleOffline,
      offlineQueue,
      enqueueOffline,
      syncQueue,
      isSyncing,
      toasts,
      toast,
      dismissToast,
      accent,
      setAccent,
      xpBurst,
      completeActivity,
      registerEvent,
      unregisterEvent,
      registerActivity,
      deleteActivity,
      mintPoap,
      trackSponsorClick,
      clearNotifications,
      addNotification,
    }),
    [
      events, attendees, notifications, refetch, currentAttendee, completeOnboard, onboard, onboardDemo,
      disconnect, view, screen, selectedEvent, follows, toggleFollow, isFollowing,
      profile, updateProfile, isOffline, toggleOffline, offlineQueue,
      enqueueOffline, syncQueue, isSyncing, toasts, toast, dismissToast, accent, xpBurst,
      completeActivity, registerEvent, unregisterEvent, registerActivity, deleteActivity,
      mintPoap, trackSponsorClick, clearNotifications, addNotification,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook base. Los hooks de dominio (useAuth, useData…) se derivan de este. */
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>');
  return ctx;
}
