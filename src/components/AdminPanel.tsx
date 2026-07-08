import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Award, Calendar, FileText, Database, Send, BarChart3,
  TrendingUp, Download, Sparkles, Check, Globe, RefreshCw, Eye,
  Copy, Share2, CheckCircle2, ArrowRight, Trash2, Clock, MapPin, 
  ChevronRight, X, Sparkle, Settings, Info, Mail, AlertCircle, ArrowLeft
} from 'lucide-react';
import { Event, Attendee, EventCategory, Activity, ActivityType, Sponsor } from '../types';

const TIMEZONE_OPTIONS = [
  { value: 'America/Santiago', label: 'Santiago, Chile (GMT-04:00)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires, Argentina (GMT-03:00)' },
  { value: 'America/Bogota', label: 'Bogotá, Colombia (GMT-05:00)' },
  { value: 'America/Lima', label: 'Lima, Perú (GMT-05:00)' },
  { value: 'America/Mexico_City', label: 'CDMX, México (GMT-06:00)' },
  { value: 'America/Caracas', label: 'Caracas, Venezuela (GMT-04:00)' },
  { value: 'America/Montevideo', label: 'Montevideo, Uruguay (GMT-03:00)' },
  { value: 'America/Asuncion', label: 'Asunción, Paraguay (GMT-04:00)' },
  { value: 'America/La_Paz', label: 'La Paz, Bolivia (GMT-04:00)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brasil (GMT-03:00)' },
  { value: 'America/New_York', label: 'Nueva York, EE.UU. (GMT-05:00)' },
  { value: 'Europe/Madrid', label: 'Madrid, España (GMT+01:00)' },
  { value: 'UTC', label: 'UTC / Tiempo Universal (GMT+00:00)' }
];

interface AdminPanelProps {
  events: Event[];
  attendees: Attendee[];
  onAddEvent: (event: Event) => void;
  onAddNotification: (title: string, msg: string) => void;
  onSelectEvent?: (event: Event) => void;
}

export default function AdminPanel({ events, attendees, onAddEvent, onAddNotification, onSelectEvent }: AdminPanelProps) {
  const detectedTimezone = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago';
    } catch (e) {
      return 'America/Santiago';
    }
  })();

  const timezoneOptions = [...TIMEZONE_OPTIONS];
  if (detectedTimezone && !TIMEZONE_OPTIONS.some(opt => opt.value === detectedTimezone)) {
    timezoneOptions.unshift({
      value: detectedTimezone,
      label: `${detectedTimezone.split('/').pop()?.replace('_', ' ') || detectedTimezone} (Local Detectado)`
    });
  }

  // Navigation & Toggle Mode State
  const [isManaging, setIsManaging] = useState<boolean>(events.length > 0);
  const [selectedEventId, setSelectedEventId] = useState<string>(events.length > 0 ? events[0].id : '');
  const [manageTab, setManageTab] = useState<'resumen' | 'invitados' | 'inscripcion' | 'difusion' | 'informaciones' | 'mas'>('resumen');

  // Sync state if database events change
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const currentEvent = events.find(e => e.id === selectedEventId) || (events.length > 0 ? events[0] : null);

  // Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('2026-07-28');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-07-28');
  const [endTime, setEndTime] = useState('17:00');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('Hacker House');
  const [expectedAttendance, setExpectedAttendance] = useState<number>(100);
  const [image, setImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');
  const [isCreating, setIsCreating] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [ticketPrice, setTicketPrice] = useState('Gratis');
  const [priceType, setPriceType] = useState<'free' | 'paid'>('free');
  const [customPriceVal, setCustomPriceVal] = useState('10.000');
  const [timezone, setTimezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Santiago';
    } catch (e) {
      return 'America/Santiago';
    }
  });

  // Apple-style popups & modal controls
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);

  // Dropdown states for Calendar and Privacy
  const [selectedCalendar, setSelectedCalendar] = useState('Calendario personal');
  const [selectedPrivacy, setSelectedPrivacy] = useState('Público / Abierto');
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false);
  const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);

  // Active top subtab within create event view
  const [activeSubTab, setActiveSubTab] = useState<'eventos' | 'calendarios' | 'descubrir'>('eventos');

  // Location suggestions states
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isTypingLocation, setIsTypingLocation] = useState(false);

  // Form activities builder
  const [activitiesList, setActivitiesList] = useState<Activity[]>([
    { id: 'act_1', title: 'Registro y Check-In Principal', description: 'Confirmación presencial y apertura del ticket QR.', points: 100, type: 'CheckIn', required: true },
    { id: 'act_2', title: 'Keynote de Apertura', description: 'Visión tecnológica general y bienvenida.', points: 100, type: 'Keynote', required: true },
    { id: 'act_3', title: 'Encuesta de Cierre', description: 'Retroalimentación de los sponsors y workshops.', points: 50, type: 'Feedback', required: false }
  ]);

  const BANNER_TEMPLATES = [
    { name: 'Hacker House (Morado)', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80' },
    { name: 'Workshop (Azul)', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80' },
    { name: 'Meetup (Naranja)', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80' },
    { name: 'Conferencia (Futurista)', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80' },
  ];

  // Badge designer (insignia del evento creada por el organizador)
  const BADGE_EMOJIS = ['🏅', '🎖️', '🏆', '⭐', '🚀', '💎', '🔥', '🧠', '⚡', '🦄'];
  const [badgeEmoji, setBadgeEmoji] = useState('🏅');
  const [badgeName, setBadgeName] = useState('');
  const [badgeReq, setBadgeReq] = useState('');

  // Activities Creation States
  const [newActTitle, setNewActTitle] = useState('');
  const [newActPoints, setNewActPoints] = useState(100);
  const [newActType, setNewActType] = useState<ActivityType>('Workshop');

  const addActivityToForm = () => {
    if (!newActTitle) return;
    const newAct: Activity = {
      id: `form_act_${Date.now()}`,
      title: newActTitle,
      description: 'Actividad personalizada agregada por el organizador.',
      points: Number(newActPoints),
      type: newActType,
      required: false
    };
    setActivitiesList([...activitiesList, newAct]);
    setNewActTitle('');
  };

  const removeActivityFromForm = (id: string) => {
    setActivitiesList(prev => prev.filter(act => act.id !== id));
  };

  // Location Autocomplete Debounce Effect
  useEffect(() => {
    if (!isTypingLocation || !location || location.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=5`
        );
        if (response.ok) {
          const data = await response.json();
          const names = data.map((item: any) => item.display_name);
          setLocationSuggestions(names);
        }
      } catch (err) {
        console.error('Error fetching address suggestions:', err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [location, isTypingLocation]);

  // Click outside listener for location autocomplete
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.location-container-wrapper')) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Submit new event
  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !startDate) return;

    setIsCreating(true);
    try {
      const formattedDate = startDate === endDate ? startDate : `${startDate} al ${endDate}`;
      const formattedTime = `${startTime} - ${endTime}`;

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date: formattedDate,
          time: formattedTime,
          location,
          category,
          expectedAttendance,
          image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
          activities: activitiesList,
          sponsors: [],
          startDate,
          startTime,
          endDate,
          endTime,
          ticketPrice,
          timezone,
          eventBadge: badgeName.trim()
            ? { emoji: badgeEmoji, name: badgeName.trim(), requirement: badgeReq.trim() }
            : undefined
        })
      });

      if (response.ok) {
        const created: Event = await response.json();
        onAddEvent(created);
        onAddNotification(
          '🎉 Evento Publicado',
          `"${title}" ha sido publicado con éxito en el ledger descentralizado.`
        );
        
        // Auto select and transition to Management
        setSelectedEventId(created.id);
        setIsManaging(true);
        setManageTab('resumen');

        // Scroll page to top immediately
        setTimeout(() => {
          const scrollContainer = document.getElementById('main-scroll-container') || window;
          scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
        }, 50);

        // Reset form variables
        setTitle('');
        setDescription('');
        setLocation('');
        setImage('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80');
        setActivitiesList([
          { id: 'act_1', title: 'Registro y Check-In Principal', description: 'Confirmación presencial y apertura del ticket QR.', points: 100, type: 'CheckIn', required: true }
        ]);
        setBadgeEmoji('🏅');
        setBadgeName('');
        setBadgeReq('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Google Sync & Report Generation
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncSheetsResponse, setSyncSheetsResponse] = useState<any>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const handleSheetsSync = async () => {
    setIsSyncingSheets(true);
    try {
      const response = await fetch('/api/google/sheets-sync', { method: 'POST' });
      const data = await response.json();
      setSyncSheetsResponse(data);
      onAddNotification(
        '📊 Sincronización Google Sheets',
        `Se sincronizaron ${data.syncedCount} asistentes con la planilla central.`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Broadcast Notification Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'push' | 'email' | 'discord'>('push');
  const [broadcastLogs, setBroadcastLogs] = useState<{ id: string; title: string; msg: string; time: string; channel: string }[]>([
    { id: '1', title: 'Recordatorio de Apertura', msg: 'El taller presencial inicia en 15 minutos en el auditorio.', time: 'Hace 2 horas', channel: 'Notificación Push' }
  ]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    onAddNotification(`📢 [Difusión] ${broadcastTitle}`, broadcastMsg);
    
    const newLog = {
      id: `bc_${Date.now()}`,
      title: broadcastTitle,
      msg: broadcastMsg,
      time: 'Ahora mismo',
      channel: broadcastChannel === 'push' ? 'Notificación Push' : broadcastChannel === 'email' ? 'Gmail Boletín' : 'Discord Bot'
    };

    setBroadcastLogs([newLog, ...broadcastLogs]);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  // Cupos approvals mockup state
  const [approvedStatus, setApprovedStatus] = useState<Record<string, 'pending' | 'approved' | 'rejected'>>({});

  // Express accreditation helper
  const [selectedAttendeeId, setSelectedAttendeeId] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [isCrediting, setIsCrediting] = useState(false);

  const handleManualCredit = async () => {
    if (!selectedAttendeeId || !selectedActivityId || !currentEvent) return;
    setIsCrediting(true);
    try {
      const res = await fetch(`/api/attendees/${selectedAttendeeId}/activities/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivityId,
          eventId: currentEvent.id
        })
      });
      if (res.ok) {
        onAddNotification('🎯 Acreditación Manual', 'Actividad completada y registrada en el ledger blockchain.');
        // Trigger page refresh simulation through parent trigger
        window.location.reload(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCrediting(false);
    }
  };

  // Delete event action
  const handleDeleteEvent = async () => {
    if (!currentEvent) return;
    if (confirm(`¿Estás seguro de que deseas eliminar permanentemente el evento "${currentEvent.title}"?`)) {
      onAddNotification('🗑️ Evento Eliminado', `Se retiró "${currentEvent.title}" del protocolo.`);
      // Redirect or reload
      window.location.href = '/';
    }
  };

  // Copy shareable link state
  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    if (!currentEvent) return;
    const link = `${window.location.origin}/invite/${currentEvent.shortCode || currentEvent.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper values for selected event
  const registeredGuests = currentEvent 
    ? attendees.filter(a => a.registeredEvents?.includes(currentEvent.id))
    : [];
  
  const checkedInCount = registeredGuests.filter(a => a.checkedIn).length;
  const attendanceRate = registeredGuests.length > 0 ? Math.round((checkedInCount / registeredGuests.length) * 100) : 0;
  const totalXPGenerated = registeredGuests.reduce((acc, curr) => acc + curr.points, 0);

  // Search filter for attendees
  const [guestSearch, setGuestSearch] = useState('');
  const filteredGuests = registeredGuests.filter(g => 
    g.name.toLowerCase().includes(guestSearch.toLowerCase()) || 
    g.email.toLowerCase().includes(guestSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" id="admin-panel-container">
      
      {/* ==================== STATE A: EXCLUSIVE EVENT CREATION ==================== */}
      {!isManaging && (
        <div className="max-w-4xl mx-auto bg-[#0c0d12] border border-indigo-950/60 rounded-3xl p-6 md:p-8 space-y-6 text-zinc-100 shadow-2xl animate-fade-in">
          {/* Top navigation/bar mimic from second screenshot - Dark Theme */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center border-b border-indigo-950/40 pb-4 gap-4">
            <div className="flex items-center gap-1 bg-[#131520]/60 p-1 rounded-xl sm:rounded-2xl border border-indigo-950/40 w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveSubTab('eventos')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-extrabold rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none ${
                  activeSubTab === 'eventos'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Eventos
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('calendarios')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-extrabold rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none ${
                  activeSubTab === 'calendarios'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Calendarios
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('descubrir')}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-extrabold rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap flex-1 sm:flex-none ${
                  activeSubTab === 'descubrir'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Descubrir
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-stretch sm:justify-end">
              {events.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsManaging(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#131520] hover:bg-[#1a1c2d] text-xs font-bold text-indigo-400 border border-indigo-950/50 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al Panel de Gestión
                </button>
              )}
            </div>
          </div>

          {activeSubTab === 'eventos' && (
            <form onSubmit={handleSubmitEvent} className="space-y-6 pt-2">
            
            {/* 1. Nombre del Evento (Primero) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Nombre del Evento <span className="text-red-400 font-black">*</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-bold font-mono">Requerido</span>
              </div>
              <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 hover:border-indigo-500/20 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all shadow-sm flex items-center gap-3">
                <input
                  type="text"
                  required
                  placeholder="Ej: Cumbre de Fundadores LATAM 2026..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-base sm:text-lg font-extrabold text-white placeholder-zinc-600 tracking-tight"
                />
              </div>
            </div>

            {/* 2. Portada del Evento (Segundo - Más chica, mismo ancho, menos largo) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Portada del Evento</label>
              <div 
                onClick={() => setIsBannerModalOpen(true)}
                className="w-full h-32 sm:h-40 md:h-44 rounded-2xl bg-[#131520] border border-dashed border-indigo-950 hover:border-indigo-500/40 relative cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-2 group transition-all shadow-inner"
              >
                {image ? (
                  <>
                    <img src={image} alt="Cover preview" className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-all duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-all"></div>
                    <div className="absolute bottom-3 right-3 p-2 bg-[#131520]/90 backdrop-blur-md text-zinc-100 rounded-full shadow-lg group-hover:scale-110 transition-transform border border-indigo-950/50">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                    <Sparkles className="w-7 h-7 text-indigo-500 animate-pulse mb-1" />
                    <span className="text-xs font-bold text-zinc-200">Añadir Portada del Evento</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Sube o selecciona una plantilla premium para tu banner</span>
                  </div>
                )}
              </div>
            </div>

            {/* Row of Dropdowns & Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Theme Block with Shuffle */}
              <div className="bg-[#131520] border border-indigo-950/40 p-3.5 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="space-y-0.5">
                  <span className="block text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Estilo de Plantilla</span>
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(true)}
                    className="text-xs font-extrabold text-zinc-200 hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                  >
                    Tema: {category} <ChevronRight className="w-3 h-3 text-zinc-500" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = BANNER_TEMPLATES.findIndex(t => t.url === image);
                    const nextIndex = (currentIndex + 1) % BANNER_TEMPLATES.length;
                    setImage(BANNER_TEMPLATES[nextIndex].url);
                  }}
                  className="p-2 bg-[#1a1c2d] hover:bg-[#22243d] text-indigo-400 rounded-xl transition-all border border-indigo-900/30 cursor-pointer"
                  title="Cambiar portada aleatoriamente"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Calendario personal Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsCalendarDropdownOpen(!isCalendarDropdownOpen);
                    setIsPrivacyDropdownOpen(false);
                  }}
                  className="w-full bg-[#131520] border border-indigo-950/40 p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-500/20 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-300">{selectedCalendar}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isCalendarDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                </button>
                {isCalendarDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-[#0e0f16] border border-indigo-950 rounded-xl py-1 shadow-2xl animate-fade-in divide-y divide-indigo-950/20">
                    {['Calendario personal', 'Calendario de la Organización', 'Calendario de Comunidad'].map((cal) => (
                      <button
                        key={cal}
                        type="button"
                        onClick={() => {
                          setSelectedCalendar(cal);
                          setIsCalendarDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedCalendar === cal ? 'text-indigo-400 bg-indigo-500/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#131520]'
                        }`}
                      >
                        {cal}
                        {selectedCalendar === cal && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Público / Abierto Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPrivacyDropdownOpen(!isPrivacyDropdownOpen);
                    setIsCalendarDropdownOpen(false);
                  }}
                  className="w-full bg-[#131520] border border-indigo-950/40 p-3.5 rounded-2xl flex items-center justify-between shadow-sm hover:border-indigo-500/20 transition-all text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-300">{selectedPrivacy}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-zinc-500 transition-transform ${isPrivacyDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                </button>
                {isPrivacyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-40 mt-1.5 bg-[#0e0f16] border border-indigo-950 rounded-xl py-1 shadow-2xl animate-fade-in divide-y divide-indigo-950/20">
                    {['Público / Abierto', 'Privado / Con Invitación', 'Solo para Miembros'].map((priv) => (
                      <button
                        key={priv}
                        type="button"
                        onClick={() => {
                          setSelectedPrivacy(priv);
                          setIsPrivacyDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedPrivacy === priv ? 'text-indigo-400 bg-indigo-500/5' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#131520]'
                        }`}
                      >
                        {priv}
                        {selectedPrivacy === priv && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Fecha, Ubicación y Descripción (Tercero) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left col: Date picker & Time range */}
              <div className="lg:col-span-6 bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 shadow-sm relative space-y-4">
                {/* Connected Line */}
                <div className="hidden md:block absolute left-[21px] top-[26px] bottom-[26px] border-l-2 border-dashed border-indigo-950/60"></div>

                {/* Inicio */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 relative z-10">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-sm shadow-indigo-500/30"></div>
                    <span className="text-xs font-bold text-zinc-400 min-w-[50px]">Inicio</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (new Date(endDate) < new Date(e.target.value)) {
                          setEndDate(e.target.value);
                        }
                      }}
                      className="bg-[#1a1c2d] border border-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer w-full"
                    />
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="bg-[#1a1c2d] border border-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer w-full"
                    />
                  </div>
                </div>

                {/* Fin */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 relative z-10">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full border border-indigo-950 bg-[#131520] shrink-0"></div>
                    <span className="text-xs font-bold text-zinc-400 min-w-[50px]">Fin</span>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                    <input
                      type="date"
                      required
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-[#1a1c2d] border border-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer w-full"
                    />
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="bg-[#1a1c2d] border border-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Right col: Timezone info box */}
              <div className="lg:col-span-6 bg-[#131520]/40 border border-indigo-950/40 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Globe className="w-4 h-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Zona Horaria del Evento</span>
                  </div>
                  {timezone === detectedTimezone ? (
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      Auto-detectada
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-extrabold rounded-md flex items-center gap-1">
                      <Settings className="w-2.5 h-2.5 animate-spin-slow" />
                      Personalizada
                    </span>
                  )}
                </div>
                
                <div className="relative">
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-[#1a1c2d] border border-indigo-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-100 text-xs font-semibold rounded-lg px-2.5 py-2 cursor-pointer appearance-none pr-8"
                  >
                    {timezoneOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#131520] text-zinc-100 text-xs">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[9px] text-zinc-500 font-mono">
                  <span>ID seleccionado: {timezone}</span>
                  {timezone !== detectedTimezone && (
                    <button
                      type="button"
                      onClick={() => setTimezone(detectedTimezone)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors font-bold underline cursor-pointer"
                    >
                      Restablecer automática
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Location Input */}
            <div className="location-container-wrapper relative">
              <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 flex items-center gap-3 hover:border-indigo-500/20 transition-colors shadow-sm">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  required
                  placeholder="Agregar ubicación del evento"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setIsTypingLocation(true);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => {
                    if (location && location.trim().length >= 3) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                  className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-sm text-zinc-100 placeholder-zinc-500 font-medium"
                />
                
                {/* External link to Google Maps */}
                {location && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 bg-[#1a1c2d] hover:bg-[#22243d] border border-indigo-900/30 text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
                    title="Ver en Google Maps"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Ver Mapa</span>
                  </a>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showLocationSuggestions && isTypingLocation && (locationSuggestions.length > 0 || isLoadingSuggestions) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-[#0e0f16] border border-indigo-950 rounded-xl py-1 shadow-2xl divide-y divide-indigo-950/20 max-h-48 overflow-y-auto no-scrollbar">
                  {isLoadingSuggestions ? (
                    <div className="px-4 py-3 text-xs text-zinc-500 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-indigo-500/40 border-t-indigo-400 rounded-full animate-spin"></div>
                      Buscando direcciones...
                    </div>
                  ) : (
                    locationSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocation(suggestion);
                          setIsTypingLocation(false);
                          setShowLocationSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:text-indigo-400 hover:bg-indigo-500/5 transition-colors flex items-start gap-2.5 font-medium leading-normal"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-400/70 shrink-0 mt-0.5" />
                        <span className="truncate">{suggestion}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Description textarea */}
            <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 flex items-start gap-3 hover:border-indigo-500/20 transition-colors shadow-sm">
              <FileText className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <textarea
                rows={4}
                placeholder="Agregar descripción del evento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-0 text-sm text-zinc-100 placeholder-zinc-500 font-medium resize-none min-h-[90px]"
              />
            </div>

            {/* 4. Agenda de Actividades (Cuarto - Movido abajo de la descripción) */}
            <div className="bg-[#131520] border border-indigo-950/40 p-4.5 rounded-2xl space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="block text-xs font-extrabold text-zinc-200">Agenda de Actividades & Misiones</span>
                  <span className="block text-[9px] text-zinc-500 font-medium">Hitos que los asistentes pueden escanear para ganar XP</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActivityModalOpen(true)}
                  className="w-full sm:w-auto px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 transition-all border border-indigo-500/20 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Actividad / Misión
                </button>
              </div>

              {activitiesList.length === 0 ? (
                <p className="text-[10px] text-zinc-500 text-center py-2">No has agregado misiones todavía.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto no-scrollbar">
                  {activitiesList.map((act) => (
                    <div key={act.id} className="flex justify-between items-center bg-[#0b0c12] border border-indigo-950/30 px-3 py-2 rounded-xl">
                      <div className="truncate pr-2">
                        <span className="block text-xs font-bold text-zinc-200 truncate">{act.title}</span>
                        <span className="block text-[8px] text-zinc-500 font-bold uppercase">{act.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          +{act.points} XP
                        </span>
                        <button
                          type="button"
                          onClick={() => removeActivityFromForm(act.id)}
                          className="p-1 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Options & Settings */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-1">Opciones adicionales</span>
              <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl divide-y divide-indigo-950/30 shadow-sm">
                
                {/* Price Row */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-300">Precio de la entrada</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPriceModalOpen(true)}
                    className="px-3 py-1 bg-[#1a1c2d] hover:bg-[#22243d] text-xs font-extrabold text-indigo-400 rounded-lg border border-indigo-900/30 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {ticketPrice} <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>

                {/* Manual Approval Row */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-300">Requiere aprobación manual</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={requiresApproval} 
                      onChange={(e) => setRequiresApproval(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-500 peer-checked:after:bg-zinc-950"></div>
                  </label>
                </div>

                {/* Capacity Row */}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-zinc-300">Aforo Máximo (Cupo)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCapacityModalOpen(true)}
                    className="px-3 py-1 bg-[#1a1c2d] hover:bg-[#22243d] text-xs font-extrabold text-indigo-400 rounded-lg border border-indigo-900/30 flex items-center gap-1 cursor-pointer transition-all"
                  >
                    {expectedAttendance} Personas <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                </div>

              </div>
            </div>

            {/* Badge Designer — insignia del evento creada por el organizador */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-extrabold text-zinc-100">Diseña la insignia del evento</span>
                <span className="text-[10px] text-zinc-500 font-mono ml-auto">Opcional</span>
              </div>
              <p className="text-[11px] text-zinc-400 -mt-1">Los asistentes que cumplan el requisito acuñan esta insignia NFT. Aparecerá en Insignias como “creada por el organizador”.</p>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Controles */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Emoji</label>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {BADGE_EMOJIS.map((em) => (
                        <button
                          type="button"
                          key={em}
                          onClick={() => setBadgeEmoji(em)}
                          className={`w-9 h-9 rounded-xl text-lg grid place-items-center transition-all cursor-pointer border ${
                            badgeEmoji === em ? 'bg-indigo-500/20 border-indigo-500 scale-105' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >{em}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Nombre de la insignia</label>
                    <input
                      type="text"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="Ej. Pionero Hacker House"
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Requisito para obtenerla</label>
                    <input
                      type="text"
                      value={badgeReq}
                      onChange={(e) => setBadgeReq(e.target.value)}
                      placeholder="Ej. Completar todas las misiones obligatorias"
                      className="w-full mt-1.5 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Preview en vivo */}
                <div className="md:w-48 shrink-0 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-600/30 to-zinc-900 border-2 border-indigo-500/40 grid place-items-center text-3xl shadow-lg shadow-indigo-500/10">
                    {badgeEmoji}
                  </div>
                  <div className="text-xs font-extrabold text-zinc-200 leading-tight break-words">{badgeName.trim() || 'Nombre de la insignia'}</div>
                  <div className="text-[10px] text-zinc-500 leading-snug break-words">{badgeReq.trim() || 'Requisito para obtenerla'}</div>
                  <span className="text-[8px] uppercase tracking-wider font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full mt-1">Preview</span>
                </div>
              </div>
            </div>

            {/* Create CTA Button */}
            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-extrabold rounded-2xl text-base transition-all cursor-pointer shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 active:scale-99"
            >
              {isCreating ? 'Creando evento...' : 'Crear evento'}
            </button>

            </form>
          )}

          {activeSubTab === 'calendarios' && (
            <div className="space-y-6 pt-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> Mis Calendarios Sincronizados
                  </h3>
                  <p className="text-xs text-zinc-500">Administra los orígenes de tus calendarios y visualiza eventos programados.</p>
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left col - List of calendars */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 space-y-3">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Calendarios Activos</span>
                    
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2.5 bg-[#1a1c2d]/40 rounded-xl hover:bg-[#1a1c2d] transition-all cursor-pointer border border-indigo-950/30">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/30"></span>
                          <span className="text-xs font-bold text-zinc-200">Calendario personal</span>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-indigo-950 text-indigo-500 focus:ring-indigo-500 bg-transparent w-4 h-4" />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-[#1a1c2d]/40 rounded-xl hover:bg-[#1a1c2d] transition-all cursor-pointer border border-indigo-950/30">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/30"></span>
                          <span className="text-xs font-bold text-zinc-200">Calendario de Organización</span>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-indigo-950 text-indigo-500 focus:ring-indigo-500 bg-transparent w-4 h-4" />
                      </label>

                      <label className="flex items-center justify-between p-2.5 bg-[#1a1c2d]/40 rounded-xl hover:bg-[#1a1c2d] transition-all cursor-pointer border border-indigo-950/30">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-zinc-500"></span>
                          <span className="text-xs font-bold text-zinc-200">Calendario de Comunidad</span>
                        </div>
                        <input type="checkbox" className="rounded border-indigo-950 text-indigo-500 focus:ring-indigo-500 bg-transparent w-4 h-4" />
                      </label>
                    </div>
                  </div>

                  <div className="bg-[#131520] border border-indigo-950/40 rounded-2xl p-4 space-y-3">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Integraciones de Calendario</span>
                    <p className="text-xs text-zinc-400">Sincroniza tus eventos en tiempo real con proveedores externos:</p>
                    
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between p-2.5 bg-[#1a1c2d]/40 rounded-xl border border-indigo-950/30">
                        <span className="text-xs font-bold text-zinc-300">Google Calendar</span>
                        <button type="button" className="px-2.5 py-1 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all border border-indigo-500/20 cursor-pointer">
                          Sincronizar
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-[#1a1c2d]/40 rounded-xl border border-indigo-950/30">
                        <span className="text-xs font-bold text-zinc-300">Apple iCal</span>
                        <button type="button" className="px-2.5 py-1 text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-all border border-indigo-500/20 cursor-pointer">
                          Sincronizar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right col - Synced Agenda Preview */}
                <div className="md:col-span-7 bg-[#131520] border border-indigo-950/40 rounded-2xl p-5 space-y-4 flex flex-col">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Próximos Eventos Programados ({events.length})</span>
                  
                  {events.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 space-y-2 flex-1 flex flex-col items-center justify-center">
                      <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
                      <p className="text-sm font-semibold">No hay eventos guardados en este calendario</p>
                      <button 
                        type="button"
                        onClick={() => setActiveSubTab('eventos')}
                        className="text-xs text-indigo-400 font-bold underline cursor-pointer hover:text-indigo-300 transition-colors"
                      >
                        Crear tu primer evento
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 no-scrollbar flex-1">
                      {events.filter(Boolean).map((evt) => {
                        // Highly robust date parsing to prevent crashes or NaNs
                        const dateStr = evt.startDate || evt.date || '';
                        let day = '28';
                        let monthName = 'Jul';
                        
                        if (dateStr) {
                          const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
                          if (isoMatch) {
                            day = isoMatch[3];
                            const monthIndex = parseInt(isoMatch[2], 10) - 1;
                            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                            monthName = monthNames[monthIndex] || 'Jul';
                          } else {
                            // Extract numbers if simple date is provided
                            const numMatch = dateStr.match(/\d+/);
                            day = numMatch ? numMatch[0] : '28';
                            monthName = 'Evt';
                          }
                        }
                        const timeStr = evt.startTime || evt.time || '09:00';

                        return (
                          <button
                            key={evt.id}
                            type="button"
                            onClick={() => {
                              setSelectedEventId(evt.id);
                              setIsManaging(true);
                              setManageTab('resumen');
                              onAddNotification('📅 Evento Seleccionado', `Ahora gestionando "${evt.title}"`);
                            }}
                            className="w-full text-left p-3 bg-[#1a1c2d]/40 hover:bg-[#20233c] border border-indigo-950/30 hover:border-indigo-500/30 rounded-xl transition-all flex items-start gap-3.5 group cursor-pointer hover:scale-[1.01] active:scale-[0.99] focus:outline-none"
                            title="Haz clic para seleccionar y gestionar este evento"
                          >
                            <div className="px-2.5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/40 rounded-lg text-center shrink-0 transition-colors">
                              <span className="block text-[10px] text-zinc-400 group-hover:text-zinc-200 font-bold uppercase transition-colors">{monthName}</span>
                              <span className="block text-sm font-black text-indigo-400 group-hover:text-indigo-300 transition-colors">{day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block text-xs font-black text-zinc-200 group-hover:text-indigo-400 transition-colors truncate">{evt.title}</span>
                              <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-1 font-semibold group-hover:text-zinc-400 transition-colors">
                                <span className="flex items-center gap-1 truncate"><MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {evt.location || 'Online'}</span>
                                <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> {timeStr} hs</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'descubrir' && (
            <div className="space-y-6 pt-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" /> Descubrir Eventos Destacados
                  </h3>
                  <p className="text-xs text-zinc-500">Explora eventos globales de la comunidad e impórtalos directamente a tus calendarios.</p>
                </div>
              </div>

              {/* Discovery List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Santi Tech Summit 2026',
                    description: 'La conferencia más grande de fundadores y desarrolladores tecnológicos de Chile. Charlas de Inteligencia Artificial, Web3 y SaaS.',
                    location: 'Santiago, Región Metropolitana',
                    category: 'Conference',
                    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
                    points: 300,
                    startDate: '2026-08-15',
                    startTime: '09:00',
                    endDate: '2026-08-16',
                    endTime: '18:00',
                  },
                  {
                    title: 'Figma Design Meetup Santiago',
                    description: 'Reúnete con los mejores diseñadores de UI/UX para aprender sobre las últimas novedades de diseño interactivo y componentes.',
                    location: 'Providencia, Santiago',
                    category: 'Meetup',
                    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
                    points: 150,
                    startDate: '2026-07-22',
                    startTime: '18:30',
                    endDate: '2026-07-22',
                    endTime: '21:30',
                  },
                  {
                    title: 'Workshop: React Native Avanzado',
                    description: 'Aprende animación fluida y sincronización sin conexión utilizando las últimas herramientas de desarrollo de React Native.',
                    location: 'Las Condes, Santiago',
                    category: 'Workshop',
                    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                    points: 200,
                    startDate: '2026-09-05',
                    startTime: '10:00',
                    endDate: '2026-09-05',
                    endTime: '14:00',
                  },
                  {
                    title: 'Hacker House: IA y Agentes Autónomos',
                    description: 'Fin de semana inmersivo de programación para construir la siguiente generación de agentes con modelos de Gemini.',
                    location: 'Vitacura, Chile',
                    category: 'Hacker House',
                    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
                    points: 500,
                    startDate: '2026-07-30',
                    startTime: '15:00',
                    endDate: '2026-08-01',
                    endTime: '22:00',
                  }
                ].map((mockEv, idx) => (
                  <div key={idx} className="bg-[#131520] border border-indigo-950/40 rounded-2xl overflow-hidden flex flex-col group hover:border-indigo-500/30 transition-all shadow-md">
                    <div className="h-28 relative overflow-hidden">
                      <img src={mockEv.image} alt={mockEv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-indigo-500 text-zinc-950 text-[9px] font-black uppercase rounded-md tracking-wider">
                        +{mockEv.points} XP
                      </span>
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-[#0c0d12]/90 text-[9px] font-bold rounded-md border border-indigo-950/50 text-indigo-400">
                        {mockEv.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <span className="block text-xs font-black text-zinc-100 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-1">{mockEv.title}</span>
                        <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">{mockEv.description}</p>
                      </div>

                      <div className="pt-2 border-t border-indigo-950/20 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-semibold truncate">
                            <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span className="truncate">{mockEv.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-semibold mt-0.5">
                            <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                            <span>{mockEv.startDate} a las {mockEv.startTime}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            // Call onAddEvent
                            const importedEvent: Event = {
                              id: `evt_discover_${Date.now()}_${idx}`,
                              title: mockEv.title,
                              description: mockEv.description,
                              date: mockEv.startDate,
                              time: mockEv.startTime,
                              startDate: mockEv.startDate,
                              startTime: mockEv.startTime,
                              endDate: mockEv.endDate,
                              endTime: mockEv.endTime,
                              location: mockEv.location,
                              category: mockEv.category as EventCategory,
                              expectedAttendance: 150,
                              actualAttendance: 0,
                              image: mockEv.image,
                              sponsors: [],
                              activities: [
                                { id: `act_discover_${Date.now()}_1`, title: 'Check-In Inicial', description: 'Registro presencial de llegada', points: 100, type: 'CheckIn', required: true },
                                { id: `act_discover_${Date.now()}_2`, title: 'Charla Magistral', description: 'Presentación principal del evento', points: mockEv.points - 100, type: 'Keynote', required: true }
                              ]
                            };
                            onAddEvent(importedEvent);
                            onAddNotification('Evento Importado', `Has importado "${mockEv.title}" exitosamente a tu calendario de Eventos.`);
                            setActiveSubTab('eventos');
                          }}
                          className="px-2.5 py-1.5 bg-indigo-500 text-zinc-950 font-black text-[10px] rounded-lg hover:bg-indigo-400 transition-colors flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer shadow-sm shadow-indigo-500/10"
                        >
                          <Plus className="w-3 h-3" /> Importar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== STATE B: FULL EVENT MANAGEMENT PANELS ==================== */}
      {isManaging && (
        <div className="space-y-6">
          
          {/* Top Event Selector & Meta Header */}
          <div className="bg-zinc-900/50 border border-zinc-850 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">Gestionando:</span>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setManageTab('resumen');
                  setShowPdfPreview(false);
                }}
                className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-indigo-400 font-extrabold focus:outline-none focus:border-indigo-500 cursor-pointer hover:border-zinc-700 transition-all"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsManaging(false)}
              className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/10 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" /> Crear Nuevo Evento
            </button>
          </div>

          {currentEvent && (
            <>
              {/* Horizontal Navigation Menus */}
              <div className="flex border-b border-zinc-850 gap-1 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => { setManageTab('resumen'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'resumen' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Resumen
                </button>
                <button
                  onClick={() => { setManageTab('invitados'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'invitados' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Invitados ({registeredGuests.length})
                </button>
                <button
                  onClick={() => { setManageTab('inscripcion'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'inscripcion' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Inscripción & Misiones
                </button>
                <button
                  onClick={() => { setManageTab('difusion'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'difusion' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Difusión
                </button>
                <button
                  onClick={() => { setManageTab('informaciones'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'informaciones' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Información & Sponsors
                </button>
                <button
                  onClick={() => { setManageTab('mas'); setShowPdfPreview(false); }}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                    manageTab === 'mas' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Más
                </button>
              </div>

              {/* ==================== 1. RESUMEN TAB ==================== */}
              {manageTab === 'resumen' && !showPdfPreview && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Event metrics bento */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Inscritos</span>
                      <div className="text-xl font-extrabold text-zinc-100 flex items-center justify-between">
                        <span>{registeredGuests.length} / {currentEvent.expectedAttendance}</span>
                        <Users className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Asistencia Real</span>
                      <div className="text-xl font-extrabold text-zinc-100 flex items-center justify-between">
                        <span>{checkedInCount}</span>
                        <Calendar className="w-4 h-4 text-indigo-400" />
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Tasa de Asistencia</span>
                      <div className="text-xl font-extrabold text-zinc-100 flex items-center justify-between">
                        <span>{attendanceRate}%</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Puntos XP Emitidos</span>
                      <div className="text-xl font-extrabold text-zinc-100 flex items-center justify-between">
                        <span>{totalXPGenerated} XP</span>
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Dual Column Layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Live blockchain ticker */}
                    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200">Actividad del Ledger Descentralizado</h3>
                        <p className="text-xs text-zinc-500">Misiones completadas y acreditación criptográfica de credenciales en tiempo real.</p>
                      </div>

                      <div className="space-y-3.5 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
                        {registeredGuests.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500 text-xs">
                            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2 animate-spin-slow" />
                            Aún no hay transacciones para este evento. ¡Comparte el enlace de registro!
                          </div>
                        ) : (
                          registeredGuests.slice(0, 6).map((guest, idx) => (
                            <div key={guest.id} className="p-3.5 bg-zinc-950 border border-zinc-850/60 rounded-2xl flex items-start gap-3.5 text-xs">
                              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 mt-0.5 font-bold">
                                TX#{100 + idx}
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="font-bold text-zinc-200">
                                  {guest.name} <span className="text-zinc-500 text-[10px] font-normal">({guest.walletAddress.substring(0, 6)}...{guest.walletAddress.substring(guest.walletAddress.length - 4)})</span>
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                  Completó check-in presencial, acuñando insignia dinámica en el bloque Polygon.
                                </p>
                                <span className="text-[10px] font-mono text-indigo-400 block pt-0.5">Hash: 0x742d...45e</span>
                              </div>
                              <span className="text-[10px] text-zinc-500 font-bold">Hace {(idx + 1) * 4} min</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Share Live Card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Enlace de Invitación</span>
                        <div className="bg-zinc-950 border border-[#1e2030] rounded-2xl overflow-hidden shadow-md relative h-36 border border-zinc-850">
                          {/* Background Image */}
                          <img src={currentEvent.image} alt={currentEvent.title} className="w-full h-full object-cover" />
                          {/* Dark Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent z-10" />
                          {/* Details on top of image, matching public details page! */}
                          <div className="absolute bottom-0 inset-x-0 p-3.5 z-20 space-y-1 text-left">
                            <h4 className="text-xs font-extrabold text-white leading-snug truncate drop-shadow-md">{currentEvent.title}</h4>
                            <p className="text-[10px] text-zinc-300 flex items-center gap-1.5 drop-shadow-sm">
                              <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> <span className="truncate">{currentEvent.location}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2.5 pt-4">
                        <button
                          onClick={handleCopyLink}
                          className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-xs font-semibold text-zinc-300 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-400" /> ¡Enlace Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-indigo-400" /> Copiar Enlace Invitación
                            </>
                          )}
                        </button>

                        {onSelectEvent && (
                          <button
                            onClick={() => onSelectEvent(currentEvent)}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
                          >
                            <Eye className="w-4 h-4" /> Ver Evento en Web
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== 2. INVITADOS TAB ==================== */}
              {manageTab === 'invitados' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Google Sheets Sync Trigger */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-zinc-200">Conector con Hojas de Cálculo</h3>
                      <p className="text-xs text-zinc-500">Sincroniza el listado presencial con la planilla activa de Google Sheets.</p>
                    </div>

                    <div className="flex gap-2.5 w-full md:w-auto">
                      <button
                        onClick={handleSheetsSync}
                        disabled={isSyncingSheets}
                        className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} /> 
                        {isSyncingSheets ? 'Sincronizando...' : 'Sincronizar Sheets'}
                      </button>
                    </div>
                  </div>

                  {syncSheetsResponse && (
                    <div className="bg-zinc-900/60 p-4 border border-indigo-500/30 rounded-2xl space-y-2.5 animate-scale-up">
                      <div className="text-emerald-400 text-xs font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Google Sheets Sincronizado Exitosamente
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] text-zinc-400 font-mono">
                        <div>Filas Cargadas: <span className="text-white font-extrabold">{syncSheetsResponse.syncedCount}</span></div>
                        <div>Estatus Ledger: <span className="text-emerald-400 font-extrabold">Online</span></div>
                        <div>Hora Sincronización: <span className="text-white font-extrabold">{new Date(syncSheetsResponse.timestamp).toLocaleTimeString()}</span></div>
                        <a 
                          href={syncSheetsResponse.sheetUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          Abrir planilla Google Sheets <Globe className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Attendees List Table */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200">Asistentes Registrados</h3>
                        <p className="text-xs text-zinc-500">Maneja acreditaciones directas, aprobaciones y estatus de canje.</p>
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Buscar por nombre o email..."
                          value={guestSearch}
                          onChange={(e) => setGuestSearch(e.target.value)}
                          className="px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 w-full sm:max-w-xs"
                        />
                        <a
                          href="/api/export/csv"
                          className="px-3.5 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-xs font-semibold text-zinc-300 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Download className="w-4 h-4 text-indigo-400" /> Exportar
                        </a>
                      </div>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3">Asistente</th>
                            <th>Billetera Digital</th>
                            <th>Aprobación</th>
                            <th>Estatus Check-In</th>
                            <th>Puntos XP</th>
                            <th className="text-right">Acreditación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-zinc-400">
                          {filteredGuests.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-zinc-500 font-semibold">
                                No se encontraron invitados acreditados para este evento.
                              </td>
                            </tr>
                          ) : (
                            filteredGuests.map(a => {
                              const status = approvedStatus[a.id] || (requiresApproval ? 'pending' : 'approved');
                              return (
                                <tr key={a.id} className="hover:bg-zinc-950/25 transition-colors">
                                  <td className="py-3.5">
                                    <span className="block font-bold text-zinc-200">{a.name}</span>
                                    <span className="block text-[10px] text-zinc-500">{a.email}</span>
                                  </td>
                                  <td className="font-mono text-[10px]" title={a.walletAddress}>
                                    {a.walletAddress.substring(0, 6)}...{a.walletAddress.substring(a.walletAddress.length - 4)}
                                    <span className="ml-1.5 bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider">{a.walletType}</span>
                                  </td>
                                  <td>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                      status === 'rejected' ? 'bg-rose-500/10 text-rose-400' :
                                      'bg-amber-500/10 text-amber-400'
                                    }`}>
                                      {status === 'approved' ? 'Aprobado' : status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      a.checkedIn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                    }`}>
                                      {a.checkedIn ? 'Check-In' : 'No Check-In'}
                                    </span>
                                  </td>
                                  <td className="font-bold text-indigo-400">{a.points} XP</td>
                                  <td className="text-right">
                                    <div className="flex gap-1.5 justify-end">
                                      {requiresApproval && status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => setApprovedStatus(prev => ({ ...prev, [a.id]: 'approved' }))}
                                            className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                          >
                                            Aprobar
                                          </button>
                                          <button
                                            onClick={() => setApprovedStatus(prev => ({ ...prev, [a.id]: 'rejected' }))}
                                            className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                          >
                                            Rechazar
                                          </button>
                                        </>
                                      )}
                                      {!a.checkedIn && (
                                        <button
                                          onClick={async () => {
                                            const checkInAct = currentEvent.activities.find(act => act.type === 'CheckIn');
                                            if (checkInAct) {
                                              const res = await fetch(`/api/attendees/${a.id}/activities/complete`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ activityId: checkInAct.id, eventId: currentEvent.id })
                                              });
                                              if (res.ok) {
                                                onAddNotification('🎟️ Check-In Completado', `Se acreditó de manera manual el check-in para ${a.name}.`);
                                                window.location.reload();
                                              }
                                            }
                                          }}
                                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                        >
                                          Check-In Presencial
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== 3. INSCRIPCION TAB ==================== */}
              {manageTab === 'inscripcion' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Manual acreditator and task manager */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Agenda List & Deletion */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-200">Actividades & Misiones Activas</h3>
                          <p className="text-xs text-zinc-500 font-bold">Incentiva la participación y el canje de insignias NFT.</p>
                        </div>
                        <button
                          onClick={() => setIsActivityModalOpen(true)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar Actividad
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar">
                        {currentEvent.activities.map((act) => (
                          <div key={act.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-850 px-4 py-3 rounded-2xl hover:border-zinc-700 transition-all">
                            <div className="space-y-0.5">
                              <span className="block text-xs font-black text-zinc-100">{act.title}</span>
                              <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{act.type}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                +{act.points} XP
                              </span>
                              <button
                                onClick={async () => {
                                  const res = await fetch(`/api/events/${currentEvent.id}/activities/${act.id}`, {
                                    method: 'DELETE'
                                  });
                                  if (res.ok) {
                                    onAddNotification('🗑️ Actividad Removida', 'La misión se eliminó de la agenda.');
                                    window.location.reload();
                                  }
                                }}
                                className="p-1.5 bg-zinc-900 hover:bg-rose-950/30 border border-zinc-850 text-zinc-500 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                                title="Eliminar de la Agenda"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Acreditador Express tool */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200">Acreditación Manual Express (Ledger)</h3>
                        <p className="text-xs text-zinc-500">Acredita misiones a los asistentes de forma manual para desbloquear sus insignias.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Asistente</label>
                          <select
                            value={selectedAttendeeId}
                            onChange={(e) => setSelectedAttendeeId(e.target.value)}
                            className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="">Selecciona un participante...</option>
                            {registeredGuests.map(g => (
                              <option key={g.id} value={g.id}>{g.name} ({g.email})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Actividad / Logro</label>
                          <select
                            value={selectedActivityId}
                            onChange={(e) => setSelectedActivityId(e.target.value)}
                            className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="">Selecciona la misión completada...</option>
                            {currentEvent.activities.map(a => (
                              <option key={a.id} value={a.id}>{a.title} (+{a.points} XP)</option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleManualCredit}
                          disabled={!selectedAttendeeId || !selectedActivityId || isCrediting}
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-indigo-600/10 active:scale-98"
                        >
                          {isCrediting ? 'Guardando en Polygon Ledger...' : 'Acreditar Logro & Otorgar XP'} <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== 4. DIFUSION TAB ==================== */}
              {manageTab === 'difusion' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Broadcast sender Form */}
                    <form onSubmit={handleSendBroadcast} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200">Emisión de Anuncios y Alertas</h3>
                        <p className="text-xs text-zinc-500">Envía alertas personalizadas mediante notificaciones push en app o boletines.</p>
                      </div>

                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Título del Aviso</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. La charla de Google Cloud inicia ya"
                            value={broadcastTitle}
                            onChange={(e) => setBroadcastTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Mensaje a Difundir</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="Escribe el cuerpo de tu boletín o alerta push..."
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Canal de Envío</label>
                          <select
                            value={broadcastChannel}
                            onChange={(e) => setBroadcastChannel(e.target.value as any)}
                            className="w-full px-3.5 py-3 bg-zinc-950 border border-zinc-850 rounded-2xl text-xs text-white focus:outline-none cursor-pointer"
                          >
                            <option value="push">Notificación Push In-App 📲</option>
                            <option value="email">Boletín Mensual de Inscritos 📧</option>
                            <option value="discord">Webhook Servidor Discord 🤖</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl shadow-indigo-600/10 active:scale-98"
                        >
                          Emitir Difusión Masiva <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </form>

                    {/* Timeline logs */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-200">Historial de Alertas Emitidas</h3>
                        <p className="text-xs text-zinc-500">Últimos comunicados enviados a la base de datos de registrados.</p>
                      </div>

                      <div className="space-y-3 max-h-[320px] overflow-y-auto no-scrollbar pr-1">
                        {broadcastLogs.map((log) => (
                          <div key={log.id} className="p-3.5 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-1.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-zinc-200">{log.title}</span>
                              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                {log.channel}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-normal">{log.msg}</p>
                            <div className="text-[10px] text-zinc-500 font-bold flex items-center gap-1.5 pt-0.5">
                              <Clock className="w-3 h-3 text-zinc-500" /> {log.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==================== 5. INFORMACION TAB ==================== */}
              {manageTab === 'informaciones' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Detailed Description and metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Event summary details */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Detalles del Evento</span>
                      
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block">Categoría del Evento</span>
                          <span className="text-zinc-200 font-bold">{currentEvent.category}</span>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block">Fecha y Hora</span>
                          <span className="text-zinc-200 font-bold">{currentEvent.date} — {currentEvent.time}</span>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block">Ubicación / Canal</span>
                          <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> <span className="truncate">{currentEvent.location}</span>
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-1">
                          <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-widest block">Postulación</span>
                          <span className="text-zinc-200 font-bold">{requiresApproval ? 'Requiere aprobación manual' : 'Cupo inmediato y libre'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description card */}
                    <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Descripción Oficial</span>
                        <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl min-h-[140px]">
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {currentEvent.description || 'Este evento no tiene una descripción adicional cargada. Edítala o añade misiones de la agenda para incentivar la participación.'}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start gap-2.5 text-[11px] text-zinc-400">
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>Este evento está indexado de forma descentralizada. Cualquier cambio se registrará en Polygon Blockchain Ledger en tiempo real.</span>
                      </div>
                    </div>

                  </div>

                  {/* Sponsor ROI analysis per event */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-200">Rendimiento de Patrocinadores (ROI Hub)</h3>
                      <p className="text-xs text-zinc-500">Impresiones en app, clics y porcentaje de CTR de sponsors destacados.</p>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-3">Marca Patrocinadora</th>
                            <th>Nivel (Tier)</th>
                            <th>Impresiones</th>
                            <th>Clics Registrados</th>
                            <th>CTR (%)</th>
                            <th>Insignias en Circulación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-850 text-zinc-400">
                          <tr>
                            <td className="py-3.5 font-bold text-zinc-200 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-850 flex items-center justify-center text-xs">⚡</span> Google Cloud Devs
                            </td>
                            <td><span className="px-1.5 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded font-bold text-[9px]">Platinum</span></td>
                            <td>1,240</td>
                            <td>145</td>
                            <td className="font-bold text-zinc-100">11.7%</td>
                            <td>4</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 font-bold text-zinc-200 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-850 flex items-center justify-center text-xs">▲</span> Vercel Edge
                            </td>
                            <td><span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold text-[9px]">Gold</span></td>
                            <td>720</td>
                            <td>54</td>
                            <td className="font-bold text-zinc-100">7.5%</td>
                            <td>2</td>
                          </tr>
                          <tr>
                            <td className="py-3.5 font-bold text-zinc-200 flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-zinc-850 flex items-center justify-center text-xs">🔑</span> Privy Auth
                            </td>
                            <td><span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold text-[9px]">Gold</span></td>
                            <td>850</td>
                            <td>112</td>
                            <td className="font-bold text-zinc-100">13.1%</td>
                            <td>5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== 6. MAS TAB ==================== */}
              {manageTab === 'mas' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Calendar and email templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Calendar card */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">📅</span>
                        <div>
                          <h4 className="text-xs font-extrabold text-zinc-200">Recordatorios de Google Calendar</h4>
                          <p className="text-[10px] text-zinc-500">Google Workspace Integrator</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Los usuarios acreditados reciben un enlace template en su bandeja de entrada de Gmail para reservar la fecha IRL de la agenda automáticamente.
                      </p>

                      <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1.5 font-mono text-[10px] text-zinc-400">
                        <div className="text-zinc-300 font-bold">ACCIONES DE CALENDARIO:</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Sincronización horaria del Hacker House</li>
                          <li>Bloqueo automático de workshops</li>
                          <li>Avisos previos mediante notificaciones</li>
                        </ul>
                      </div>
                    </div>

                    {/* Report actions */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xs font-extrabold text-zinc-200 flex items-center gap-1">
                          <Download className="w-4 h-4 text-indigo-400" /> Exportaciones y Certificaciones
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Exporta reportes de asistencia en formatos para conciliación offline con sponsors o instituciones.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <a
                          href="/api/export/csv"
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-300 rounded-xl transition-all"
                        >
                          <Download className="w-3.5 h-3.5 text-indigo-400" /> Descargar CSV
                        </a>

                        <button
                          onClick={() => setShowPdfPreview(true)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-[11px] font-bold text-zinc-300 rounded-xl transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-indigo-400" /> Previsualizar PDF
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Danger zone to delete event */}
                  <div className="bg-zinc-900/40 border border-rose-500/20 rounded-3xl p-6 space-y-3.5">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Zona de Peligro</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="space-y-0.5">
                        <span className="block text-xs font-bold text-zinc-200">Retirar Evento del Ledger</span>
                        <span className="block text-[11px] text-zinc-500">Se eliminará permanentemente la base de datos y la agenda. Esta acción no se puede deshacer.</span>
                      </div>
                      <button
                        onClick={handleDeleteEvent}
                        className="px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-500/20 shadow-md"
                      >
                        Eliminar Evento permanentemente
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ==================== PDF CERTIFICATE/REPORT MODAL PREVIEW ==================== */}
              {showPdfPreview && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 animate-fade-in relative">
                  <button 
                    onClick={() => setShowPdfPreview(false)}
                    className="absolute top-4 right-4 p-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    ✕
                  </button>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">Previsualización de Reporte Oficial (PDF)</h3>
                    <p className="text-xs text-zinc-500">Certificado estandarizado de participación para el evento.</p>
                  </div>

                  <div className="bg-white text-zinc-900 p-8 rounded-2xl max-w-2xl mx-auto space-y-8 font-serif shadow-2xl relative border-8 border-indigo-900">
                    <div className="absolute top-4 right-4 text-[9px] font-sans font-extrabold text-zinc-400 uppercase tracking-widest">Acreditación Digital</div>
                    
                    <div className="text-center space-y-2">
                      <h2 className="text-lg font-bold uppercase tracking-widest text-indigo-950">Certificado de Acreditación Presencial</h2>
                      <p className="text-xs italic text-zinc-600">Otorgado de acuerdo al protocolo de participación LATAM</p>
                    </div>

                    <div className="text-center space-y-4 py-6">
                      <p className="text-xs">Este documento oficial hace constar que se ha validado la asistencia para el evento:</p>
                      <p className="text-xl font-bold font-sans text-indigo-950">{currentEvent.title}</p>
                      <p className="text-xs">Con un total de <span className="font-bold text-indigo-950">{registeredGuests.length} invitados registrados</span> y una tasa de asistencia real calculada de <span className="font-bold text-indigo-950">{attendanceRate}%</span>.</p>
                    </div>

                    <div className="flex justify-between items-end border-t border-zinc-200 pt-6 text-[10px] font-sans text-zinc-500">
                      <div>
                        <p className="font-bold text-zinc-800">Corte de Registro:</p>
                        <p>{currentEvent.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-zinc-800">ID de Ledger Blockchain:</p>
                        <p className="font-mono text-[9px]">{currentEvent.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Imprimir Documento
                    </button>
                    <button
                      onClick={() => setShowPdfPreview(false)}
                      className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      Cerrar Previsualización
                    </button>
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      )}

      {/* ==================== POPUPS / MODALS FOR EVENT CREATION MODES ==================== */}
      
      {/* 1. Category Modal Selection */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 animate-scale-up shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Settings className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-spin-slow" />
              <h3 className="text-sm font-black text-white">Categoría del Evento</h3>
              <p className="text-[10px] text-zinc-500">Selecciona el tipo de experiencia de onboarding tecnológico.</p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {['Hacker House', 'Workshop', 'Meetup', 'Conference'].map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => {
                    setCategory(catName as EventCategory);
                    setIsCategoryModalOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                    category === catName 
                      ? 'bg-indigo-650/20 border-indigo-500 text-indigo-300 shadow-md' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span>{catName}</span>
                  {category === catName && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Capacity Configurator */}
      {isCapacityModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xs w-full p-6 space-y-4 animate-scale-up shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsCapacityModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Users className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white">Ajustar Aforo Máximo</h3>
              <p className="text-[10px] text-zinc-500">Establece la cantidad de vacantes disponibles para el público.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  type="button"
                  onClick={() => setExpectedAttendance(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-white rounded-xl text-lg font-black flex items-center justify-center cursor-pointer active:scale-90"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={expectedAttendance}
                  onChange={(e) => setExpectedAttendance(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-850 rounded-xl text-center text-xl font-black font-mono text-white focus:outline-none focus:border-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setExpectedAttendance(prev => prev + 1)}
                  className="w-10 h-10 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 text-white rounded-xl text-lg font-black flex items-center justify-center cursor-pointer active:scale-90"
                >
                  +
                </button>
              </div>

              <input
                type="range"
                min="1"
                max="1000"
                step="1"
                value={expectedAttendance}
                onChange={(e) => setExpectedAttendance(Number(e.target.value))}
                className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex justify-between text-[10px] text-zinc-500 font-bold font-mono">
                <span>Mín: 1</span>
                <span>Máx: 1000</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCapacityModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Confirmar Capacidad
            </button>
          </div>
        </div>
      )}

      {/* 2.5 Price Configurator */}
      {isPriceModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xs w-full p-6 space-y-4 animate-scale-up shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsPriceModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Award className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white">Precio de la Entrada</h3>
              <p className="text-[10px] text-zinc-500">Configura si el acceso al evento es gratuito o requiere ticket pagado.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPriceType('free')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  priceType === 'free'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-sm">🎁</span>
                <span>Gratis</span>
              </button>
              <button
                type="button"
                onClick={() => setPriceType('paid')}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  priceType === 'paid'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                    : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-sm">💵</span>
                <span>De Pago</span>
              </button>
            </div>

            {priceType === 'paid' && (
              <div className="space-y-1.5 animate-scale-up">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Monto de Entrada</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-zinc-500">$</span>
                  <input
                    type="text"
                    placeholder="10.000"
                    value={customPriceVal}
                    onChange={(e) => setCustomPriceVal(e.target.value)}
                    className="w-full pl-7 pr-12 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-extrabold text-zinc-500">CLP</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                if (priceType === 'free') {
                  setTicketPrice('Gratis');
                } else {
                  setTicketPrice(`$${customPriceVal} CLP`);
                }
                setIsPriceModalOpen(false);
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Confirmar Precio
            </button>
          </div>
        </div>
      )}

      {/* 3. Cover Template Choice Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsBannerModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white">Seleccionar Portada de Evento</h3>
              <p className="text-[10px] text-zinc-500">Elige un fondo premium abstracto o añade un enlace personalizado.</p>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                {BANNER_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    type="button"
                    onClick={() => {
                      setImage(tmpl.url);
                      setIsBannerModalOpen(false);
                    }}
                    className={`p-2.5 rounded-2xl text-left border transition-all relative overflow-hidden group h-20 ${
                      image === tmpl.url ? 'border-indigo-500 bg-indigo-950/40' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                    }`}
                  >
                    <img 
                      src={tmpl.url} 
                      alt={tmpl.name} 
                      className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-45 transition-opacity" 
                    />
                    <span className="relative z-10 block text-[10px] font-bold text-white mt-auto truncate">{tmpl.name}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-zinc-850 pt-3 space-y-1.5">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">O agrega URL de imagen</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsBannerModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
            >
              Guardar Selección
            </button>
          </div>
        </div>
      )}

      {/* 4. Custom Activity Creator Modal */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 space-y-4 animate-scale-up shadow-2xl relative">
            <button 
              type="button" 
              onClick={() => setIsActivityModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-sm font-black text-white">Nueva Actividad para Recompensar</h3>
              <p className="text-[10px] text-zinc-500">Establece hitos que los participantes completen escaneando su QR.</p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Nombre de la Actividad</label>
                <input
                  type="text"
                  placeholder="Ej. Taller Avanzado de Solidity"
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tipo de Misión</label>
                  <select
                    value={newActType}
                    onChange={(e) => setNewActType(e.target.value as ActivityType)}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="CheckIn">CheckIn 🎟️</option>
                    <option value="Workshop">Workshop 💻</option>
                    <option value="Hackathon">Hackathon 🏆</option>
                    <option value="Feedback">Feedback 💬</option>
                    <option value="SponsorVisit">Sponsor Visit 🤝</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Recompensa (XP)</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={newActPoints}
                    onChange={(e) => setNewActPoints(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (!newActTitle) return;
                
                // If we are actively managing an event on screen, let's post it directly to the database!
                if (isManaging && currentEvent) {
                  try {
                    const newAct: Activity = {
                      id: `act_${Date.now()}`,
                      title: newActTitle,
                      description: 'Actividad personalizada agregada por el organizador.',
                      points: Number(newActPoints),
                      type: newActType,
                      required: false
                    };
                    const res = await fetch('/api/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...currentEvent,
                        activities: [...currentEvent.activities, newAct]
                      })
                    });
                    if (res.ok) {
                      onAddNotification('✨ Actividad Agregada', `Se incorporó "${newActTitle}" a la agenda del evento.`);
                      window.location.reload();
                    }
                  } catch (err) {
                    console.error(err);
                  }
                } else {
                  // In creation mode, add to temporary form builder list
                  addActivityToForm();
                }
                setIsActivityModalOpen(false);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all uppercase tracking-wider"
            >
              Crear Actividad e Incorporar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
