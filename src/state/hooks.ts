/**
 * Hooks de dominio — vistas selectivas sobre AppProvider.
 *
 * Permiten que cada componente consuma sólo el dominio que le concierne
 * (auth, data, nav, offline, ui), manteniendo el contrato del prototipo.
 * Todos leen del mismo contexto; separarlos es una cuestión de ergonomía y
 * legibilidad, no de rendimiento.
 */
import { useApp } from './AppProvider';

/** Sesión / wallet embebida. */
export function useAuth() {
  const { currentAttendee, completeOnboard, onboard, disconnect, setCurrentAttendee } = useApp();
  return { currentAttendee, completeOnboard, onboard, disconnect, setCurrentAttendee };
}

/** Catálogos y acciones de datos + mutaciones de dominio. */
export function useData() {
  const {
    events, attendees, notifications, refetch,
    completeActivity, registerEvent, unregisterEvent, registerActivity,
    deleteActivity, mintPoap, trackSponsorClick, clearNotifications, addNotification,
  } = useApp();
  return {
    events, attendees, notifications, refetch,
    completeActivity, registerEvent, unregisterEvent, registerActivity,
    deleteActivity, mintPoap, trackSponsorClick, clearNotifications, addNotification,
  };
}

/** Navegación del prototipo (view/screen/evento seleccionado). */
export function useNav() {
  const { view, setView, screen, setScreen, selectedEvent, setSelectedEvent } = useApp();
  return { view, setView, screen, setScreen, selectedEvent, setSelectedEvent };
}

/** Simulador offline + cola de sincronización. */
export function useOffline() {
  const { isOffline, toggleOffline, offlineQueue, enqueueOffline, syncQueue, isSyncing } = useApp();
  return { isOffline, toggleOffline, offlineQueue, enqueueOffline, syncQueue, isSyncing };
}

/** UI transversal: toasts + tema/acento. */
export function useUI() {
  const { toasts, toast, dismissToast, accent, setAccent } = useApp();
  return { toasts, toast, dismissToast, accent, setAccent };
}
