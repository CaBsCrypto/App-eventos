import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, 
  Award, Sparkles, Send, Star, AlertCircle, Share2, Eye, Trash2, Globe,
  Copy, Check
} from 'lucide-react';
import { Event, Activity, Attendee, Feedback } from '../types';
import { mintPOAPForEvent } from '../services/blockchain/index.js';
import QRCode from 'qrcode';
import { api } from '../lib/api';
import Accreditation from './Accreditation';

interface EventDetailProps {
  event: Event;
  attendee: Attendee | null;
  onBack: () => void;
  onRegister: () => void;
  onCompleteActivity: (activityId: string) => Promise<void>;
  onAddNotification: (title: string, msg: string) => void;
  onRegisterEvent: (eventId: string) => Promise<void>;
  onUnregisterEvent: (eventId: string) => Promise<void>;
  onRegisterActivity: (activityId: string) => Promise<void>;
  onDeleteActivity?: (eventId: string, activityId: string) => Promise<void>;
  onMintPOAP: (
    eventId: string,
    txHash: string,
    chainName: string,
    blockNumber: number,
    contractAddress: string,
    tokenId: string
  ) => Promise<void>;
  isOffline: boolean;
}

export default function EventDetail({ 
  event, 
  attendee, 
  onBack, 
  onRegister,
  onCompleteActivity,
  onAddNotification,
  onRegisterEvent,
  onUnregisterEvent,
  onRegisterActivity,
  onDeleteActivity,
  onMintPOAP,
  isOffline
}: EventDetailProps) {
  // Skeleton shimmer al abrir la invitación (~620ms, como el prototipo).
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 620);
    return () => clearTimeout(t);
  }, [event.id]);

  const [activeFeedbackAct, setActiveFeedbackAct] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [isSendingGmail, setIsSendingGmail] = useState<boolean>(false);
  const [showConfirmRSVP, setShowConfirmRSVP] = useState<boolean>(false);
  const [showConfirmCancelRSVP, setShowConfirmCancelRSVP] = useState<boolean>(false);

  // Invite link & Minting states
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showAccreditation, setShowAccreditation] = useState<boolean>(false);
  const [credentialQr, setCredentialQr] = useState<string>('');

  const inviteUrl = `${window.location.origin}/invite/${event.shortCode || event.id}`;

  // Credencial QR del asistente (token firmado) cuando está registrado al evento.
  const isRegisteredToEvent = !!attendee && (attendee.registeredEvents || []).includes(event.id);
  useEffect(() => {
    if (!attendee || !isRegisteredToEvent) { setCredentialQr(''); return; }
    let active = true;
    api.events.credential(event.id, attendee.id)
      .then(({ token }) => QRCode.toDataURL(token, { margin: 1, width: 320, color: { dark: '#0f0f20', light: '#ffffff' } }))
      .then((url) => { if (active) setCredentialQr(url); })
      .catch((e) => console.error('Error credencial QR:', e));
    return () => { active = false; };
  }, [attendee, event.id, isRegisteredToEvent]);

  // Genera el QR de la invitación al abrir el modal.
  useEffect(() => {
    if (!showQR) return;
    QRCode.toDataURL(inviteUrl, { margin: 1, width: 320, color: { dark: '#0f0f20', light: '#ffffff' } })
      .then(setQrDataUrl)
      .catch((e) => console.error('Error generando QR:', e));
  }, [showQR, inviteUrl]);

  // Compartir nativo (Web Share API) con fallback a copiar.
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event.title, text: `Te invito a ${event.title}`, url: inviteUrl });
      } catch { /* usuario canceló */ }
    } else {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onAddNotification('🔗 Enlace copiado', 'Tu navegador no soporta compartir nativo; copiamos el enlace.');
    }
  };
  const [mintingStatus, setMintingStatus] = useState<'idle' | 'gas_estimation' | 'sending_tx' | 'confirming_block' | 'success' | 'failed'>('idle');
  const [mintingError, setMintingError] = useState<string>('');

  const [registeredGuests, setRegisteredGuests] = useState<Attendee[]>([]);

  // QR Scanner simulation states
  const [scanningActivityId, setScanningActivityId] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>('');

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const res = await fetch('/api/attendees');
        if (res.ok) {
          const list: Attendee[] = await res.json();
          const filtered = list.filter(a => a.registeredEvents?.includes(event.id));
          setRegisteredGuests(filtered);
        }
      } catch (err) {
        console.error('Error fetching event guests:', err);
      }
    };
    fetchGuests();
  }, [event.id, attendee]);

  const handleCopyInviteUrl = () => {
    const inviteUrl = `${window.location.origin}/invite/${event.shortCode || event.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMintPOAPClick = async () => {
    if (!attendee) return;
    setMintingStatus('gas_estimation');
    setMintingError('');
    
    try {
      // Step 1: Simulated gas estimation step
      await new Promise(resolve => setTimeout(resolve, 800));
      setMintingStatus('sending_tx');

      // Step 2: Simulated sending tx step
      await new Promise(resolve => setTimeout(resolve, 800));
      setMintingStatus('confirming_block');

      // Step 3: Invoke blockchain manager for minting
      const receipt = await mintPOAPForEvent(
        attendee.walletAddress,
        event.id,
        event.title,
        event.image
      );

      // Step 4: Persist the minted badge details in database
      await onMintPOAP(
        event.id,
        receipt.txHash,
        receipt.chainName,
        receipt.blockNumber,
        receipt.contractAddress,
        receipt.tokenId
      );

      setMintingStatus('success');

    } catch (err: any) {
      console.error('Minting failed:', err);
      setMintingError(err.message || 'Error en la transacción de Avalanche.');
      setMintingStatus('failed');
    }
  };

  // Scroll to top when opening an event detail
  useEffect(() => {
    const mainContainer = document.getElementById('main-scroll-container') || document.getElementById('app-root-container');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [event.id]);

  const eventActivityIds = event.activities.map(a => a.id);
  const completedEventActivitiesCount = attendee 
    ? (attendee.completedActivities || []).filter(id => eventActivityIds.includes(id)).length 
    : 0;

  // Register Sponsor Click Analytics
  const handleSponsorClick = async (sponsorId: string, url: string) => {
    try {
      await fetch(`/api/sponsors/${sponsorId}/click`, { method: 'POST' });
    } catch (e) {
      console.error('Error logging sponsor click:', e);
    }
    // Open in a new window/tab safely
    window.open(url, '_blank');
  };

  // Sync Calendar
  const handleCalendarSync = async () => {
    if (!attendee) return;
    setIsSyncingCalendar(true);
    try {
      const response = await fetch('/api/google/sync-calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId: attendee.id, eventId: event.id })
      });
      const data = await response.json();
      
      onAddNotification(
        '📅 Google Calendar Enlazado',
        `El evento "${event.title}" se agregó exitosamente. Se activaron confirmaciones automáticas.`
      );
      
      // Open Google Calendar template in new tab
      if (data.calendarLink) {
        window.open(data.calendarLink, '_blank');
      }
    } catch (err) {
      console.error('Error syncing calendar:', err);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // Send Gmail Confirmation Invitation
  const handleGmailInvite = async () => {
    if (!attendee) return;
    setIsSendingGmail(true);
    try {
      const response = await fetch('/api/google/gmail-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId: attendee.id, eventId: event.id })
      });
      const data = await response.json();
      
      onAddNotification(
        '📨 Correo Gmail Despachado',
        `Invitación oficial enviada exitosamente a ${attendee.email}`
      );

      // Trigger standard mailto if applicable or notify success
      if (data.gmailLink) {
        window.open(data.gmailLink, '_blank');
      }
    } catch (err) {
      console.error('Error sending gmail invite:', err);
    } finally {
      setIsSendingGmail(false);
    }
  };

  // Submit Rating Feedback for an Activity
  const submitFeedback = async (e: React.FormEvent, activityId: string) => {
    e.preventDefault();
    if (!attendee) return;
    if (!rating) return;

    setSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/events/${event.id}/activities/${activityId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment,
          attendeeName: attendee.name,
          attendeeId: attendee.id
        })
      });

      if (response.ok) {
        onAddNotification(
          '💬 Valoración Publicada',
          `Calificaste la actividad. ¡Ganaste +50 XP y avanzas en el Leaderboard!`
        );
        setActiveFeedbackAct(null);
        setComment('');
        setRating(5);
      }
    } catch (err) {
      console.error('Error submitting feedback', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const isActivityCompleted = (actId: string) => {
    return attendee?.completedActivities?.includes(actId) || false;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-40 rounded-lg ep-skeleton" />
        <div className="h-56 w-full rounded-3xl ep-skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-24 w-full rounded-2xl ep-skeleton" />
            <div className="h-40 w-full rounded-2xl ep-skeleton" />
            <div className="h-40 w-full rounded-2xl ep-skeleton" />
          </div>
          <div className="space-y-4">
            <div className="h-64 w-full rounded-2xl ep-skeleton" />
            <div className="h-32 w-full rounded-2xl ep-skeleton" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a eventos
      </button>

      {/* Main Banner Grid */}
      {/* Immersive Event Cover Banner (Fondo Elegido) */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl h-40 sm:h-56">
        {/* Background Image */}
        <img 
          src={event.image} 
          alt="Event cover"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        
        {/* Dark Gradient Overlay: fades from solid dark at the bottom to transparent at the top */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10" />

        {/* Text Content at the bottom of the image */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-20 space-y-1.5 text-left">
          {attendee?.checkedIn && (
            <span className="inline-flex px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[9px] sm:text-[10px] font-bold items-center gap-1 w-max mb-0.5">
              <CheckCircle className="w-3 h-3" /> Acreditado (Checked-In)
            </span>
          )}
          
          <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
            {event.title}
          </h1>
          
          <p className="text-zinc-300 text-[10px] sm:text-xs max-w-3xl leading-relaxed whitespace-pre-wrap drop-shadow-sm">
            {event.description}
          </p>
        </div>
      </div>
       {/* Double Column Layout (Luma-like) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ==================== LEFT COLUMN: ABOUT, ATTENDEES, & MISSIONS ==================== */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About / Descripción del Evento */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-850">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-extrabold text-sm">
                J
              </div>
              <div className="text-left">
                <span className="block text-[10px] text-zinc-500 uppercase font-black leading-none">Organizador</span>
                <span className="text-xs font-bold text-zinc-200">Joaquín Estéban</span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base sm:text-lg font-black text-white">Acerca de este evento</h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          </div>

          {/* Who is Coming (Asistentes registrados) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-400" /> Asistentes Registrados ({registeredGuests.length})
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Personas que ya confirmaron su participación en la red.</p>
            </div>

            {registeredGuests.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">Nadie se ha registrado todavía en esta instancia. ¡Sé el primero!</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {registeredGuests.map(guest => {
                  const initials = guest.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                  const isCurrentUser = guest.id === attendee?.id;
                  
                  return (
                    <div 
                      key={guest.id} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                        isCurrentUser 
                          ? 'bg-indigo-950/30 border-indigo-500/35 text-indigo-300' 
                          : 'bg-zinc-950 border-zinc-850 text-zinc-300'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[8px] font-black text-zinc-400 uppercase">
                        {initials}
                      </div>
                      <span>{guest.name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activities / Misiones (Simplified block at the bottom) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-850 pb-3">
              <div>
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" /> Misiones y Actividades
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Completa misiones presenciales para reclamar tus badges.</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-indigo-400">
                  {attendee ? `${completedEventActivitiesCount} de ${event.activities.length}` : `0 de ${event.activities.length}`}
                </span>
                <span className="text-[9px] text-zinc-500 block">completadas</span>
              </div>
            </div>

            {isOffline && (
              <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-[10px] text-amber-300">
                Modo sin conexión. Las actividades completadas se sincronizarán localmente al volver a conectarte.
              </div>
            )}

            {!attendee ? (
              <p className="text-xs text-zinc-500 italic py-4 text-center">Inicia sesión en la barra lateral derecha para habilitar las misiones de este evento.</p>
            ) : (
              <div className="space-y-2.5">
                {event.activities.map((act) => {
                  const completed = isActivityCompleted(act.id);
                  const isFeedbackOpen = activeFeedbackAct === act.id;
                  const isRegisteredForAct = attendee?.registeredActivities?.includes(act.id) || false;
                  const isEventRegistered = attendee?.registeredEvents?.includes(event.id) || false;

                  const handleActClick = () => {
                    if (!isEventRegistered) {
                      onAddNotification(
                        '🎟️ Asistencia Requerida', 
                        'Primero debes confirmar tu asistencia en la tarjeta de la derecha.'
                      );
                      return;
                    }
                    if (!completed) {
                      if (isRegisteredForAct) {
                        setScanningActivityId(act.id);
                      } else {
                        onRegisterActivity(act.id);
                      }
                    }
                  };

                  return (
                    <div 
                      key={act.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        completed 
                          ? 'bg-emerald-950/5 border-emerald-900/20' 
                          : isRegisteredForAct
                          ? 'bg-indigo-950/5 border-indigo-900/20 shadow-sm'
                          : isEventRegistered
                          ? 'bg-zinc-950 border-zinc-850 opacity-90'
                          : 'bg-zinc-950/60 border-zinc-900/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 justify-between">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={handleActClick}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 text-xs font-black transition-all ${
                              completed
                                ? 'bg-emerald-500 border-emerald-400 text-white cursor-default shadow-sm'
                                : isRegisteredForAct
                                ? 'border-indigo-500 bg-indigo-500/25 text-indigo-400 hover:bg-indigo-500 hover:text-white cursor-pointer'
                                : isEventRegistered
                                ? 'border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-400 cursor-pointer'
                                : 'border-zinc-800 text-zinc-500 cursor-pointer hover:border-indigo-500/50 hover:text-indigo-400/50'
                            }`}
                          >
                            {completed ? '✓' : isRegisteredForAct ? '✓' : '+'}
                          </button>
                          <div className="text-left">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs sm:text-sm font-bold ${completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                                {act.title}
                              </h4>
                              {act.required && (
                                <span className="bg-rose-500/10 text-rose-400 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Obligatorio</span>
                              )}
                              <span className="bg-indigo-500/10 text-indigo-400 text-[9px] px-2 py-0.5 rounded-full font-bold">
                                +{act.points} XP
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{act.description}</p>
                          </div>
                        </div>

                        {/* Interactive actions for missions */}
                        <div className="flex items-center gap-2">
                          {completed ? (
                            <button
                              onClick={() => setActiveFeedbackAct(isFeedbackOpen ? null : act.id)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 p-1 rounded-lg hover:bg-zinc-900 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 fill-indigo-400" /> <span className="hidden xs:inline">Valorar</span>
                            </button>
                          ) : isRegisteredForAct ? (
                            <button
                              onClick={() => setScanningActivityId(act.id)}
                              className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-650 text-white rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all cursor-pointer"
                            >
                              Completar
                            </button>
                          ) : (
                            <button
                              onClick={handleActClick}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all cursor-pointer ${
                                isEventRegistered 
                                  ? 'bg-zinc-900 hover:bg-zinc-800 text-indigo-400 border border-zinc-800' 
                                  : 'bg-zinc-950 text-zinc-500 border border-zinc-900'
                              }`}
                            >
                              Inscribirme
                            </button>
                          )}

                          {onDeleteActivity && (
                            <button
                              onClick={() => onDeleteActivity(event.id, act.id)}
                              className="p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Feedback rating form */}
                      {isFeedbackOpen && (
                        <form onSubmit={(e) => submitFeedback(e, act.id)} className="mt-4 pt-4 border-t border-zinc-900 space-y-3 animate-slide-down">
                          <p className="text-xs font-semibold text-zinc-300 text-left">Valora la actividad:</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((stars) => (
                              <button
                                key={stars}
                                type="button"
                                onClick={() => setRating(stars)}
                                className="p-1 cursor-pointer"
                              >
                                <Star className={`w-4 h-4 ${stars <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                              </button>
                            ))}
                            <span className="text-xs text-zinc-500 font-bold ml-1">({rating} de 5)</span>
                          </div>
                          
                          <textarea
                            placeholder="Escribe un comentario..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                          />

                          <div className="flex justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setActiveFeedbackAct(null)}
                              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-300"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={submittingFeedback}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              {submittingFeedback ? 'Enviando...' : 'Enviar'} <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ==================== RIGHT COLUMN: RSVP CARD & INFO GENERAL ==================== */}
        <div className="space-y-6">
          
          {/* Card 1: RSVP / Acceso Central (La llamada a la acción principal) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            {!attendee ? (
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Registro al Evento</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">Inicia sesión con tu billetera Privy para registrarte y participar en las actividades.</p>
                </div>
                <button
                  onClick={onRegister}
                  className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-indigo-600/10 cursor-pointer transition-all active:scale-95"
                >
                  Iniciar sesión para registrarte
                </button>
              </div>
            ) : !attendee.registeredEvents?.includes(event.id) ? (
              <div className="space-y-4 text-center">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider">Entrada Disponible</h3>
                  <p className="text-[11px] text-zinc-400 leading-normal">El registro es 100% gratuito. Confirma tu asistencia para habilitar tu ticket QR.</p>
                </div>
                
                {showConfirmRSVP ? (
                  <div className="p-3 bg-zinc-950 rounded-xl border border-indigo-500/20 text-center space-y-3 animate-scale-up">
                    <p className="text-[10px] text-zinc-400">¿Confirmar asistencia a {event.title}?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowConfirmRSVP(false)}
                        className="flex-1 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                      >
                        No
                      </button>
                      <button
                        onClick={async () => {
                          await onRegisterEvent(event.id);
                          setShowConfirmRSVP(false);
                        }}
                        className="flex-1 py-1.5 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-md"
                      >
                        Sí, confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmRSVP(true)}
                    className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    Confirmar Asistencia
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl"></div>
                  <span className="text-[9px] font-extrabold uppercase bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full tracking-wider">
                    🎟️ Entrada Confirmada
                  </span>
                  <h4 className="text-xs font-black text-white pt-1">¡Estás Inscrito!</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">Tu ticket digital está listo en la red descentralizada LatAm.</p>
                </div>
                
                <button
                  onClick={() => setShowConfirmCancelRSVP(true)}
                  className="text-[10px] text-zinc-500 hover:text-rose-400 font-semibold underline transition-colors cursor-pointer"
                >
                  Anular Registro
                </button>
              </div>
            )}
          </div>

          {/* Confirm Cancel RSVP inline card (Overlaid) */}
          {showConfirmCancelRSVP && (
            <div className="bg-zinc-900 border border-rose-500/20 rounded-3xl p-5 text-center space-y-3.5 animate-scale-up">
              <p className="text-xs text-zinc-300 leading-relaxed">
                ¿Seguro que deseas anular tu asistencia? Se reiniciará tu progreso de actividades.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setShowConfirmCancelRSVP(false)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 font-bold text-xs rounded-xl border border-zinc-850 cursor-pointer"
                >
                  No, mantener
                </button>
                <button
                  onClick={async () => {
                    await onUnregisterEvent(event.id);
                    setShowConfirmCancelRSVP(false);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Sí, anular
                </button>
              </div>
            </div>
          )}

          {/* Card 2: Información General (Date & Location & Calendars) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-lg">
            <div>
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Información General</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Ubicación y hora oficial del evento.</p>
            </div>

            <div className="space-y-4 text-left">
              {/* Date & Time */}
              <div className="flex gap-3 text-xs">
                <Calendar className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block font-bold text-zinc-200">Fecha y Hora</span>
                  <span className="block text-[11px] text-zinc-400">Inicio: {event.date} • {event.time}</span>
                  <span className="block text-[10px] text-zinc-500">Huso Horario: {event.timezone || 'America/Santiago'}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex gap-3 text-xs">
                <MapPin className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block font-bold text-zinc-200">Ubicación</span>
                  <span className="block text-[11px] text-zinc-400 leading-relaxed">{event.location}</span>
                </div>
              </div>

              {/* Attendance */}
              <div className="flex gap-3 text-xs border-b border-zinc-850 pb-4">
                <Users className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="block font-bold text-zinc-200">Aforo Esperado</span>
                  <span className="block text-[11px] text-zinc-400">{event.expectedAttendance} personas</span>
                </div>
              </div>

              {/* Calendar Sync integrations */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCalendarSync}
                  disabled={isSyncingCalendar}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-rose-400" /> 
                  {isSyncingCalendar ? 'Sincronizando...' : 'Añadir a Google Calendar'}
                </button>

                <button
                  onClick={handleGmailInvite}
                  disabled={isSendingGmail}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  {isSendingGmail ? 'Enviando...' : 'Enviar Invitación por Gmail'}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Invitar Amigos (Compartir) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3.5 shadow-lg">
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-400" /> Compartir Evento
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Copia el enlace de invitación rápida.</p>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 bg-zinc-950 px-3 py-2 border border-zinc-850 rounded-xl text-zinc-300 font-mono text-[10px] truncate flex items-center">
                {inviteUrl}
              </div>
              <button
                onClick={handleCopyInviteUrl}
                className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center shrink-0 cursor-pointer"
                title="Copiar enlace"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowQR(true)}
                className="flex-1 px-3 py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Ver QR
              </button>
              <button
                onClick={handleNativeShare}
                className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Compartir
              </button>
            </div>
          </div>

          {/* Modal QR de invitación */}
          {showQR && (
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
              onClick={(e) => { if (e.target === e.currentTarget) setShowQR(false); }}
            >
              <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="px-5 py-4 border-b border-zinc-850 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-indigo-400" /> Invitación
                  </h3>
                  <button onClick={() => setShowQR(false)} className="text-zinc-500 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-full w-7 h-7 flex items-center justify-center transition-all cursor-pointer">✕</button>
                </div>
                <div className="p-6 flex flex-col items-center gap-4">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR de invitación" className="w-52 h-52 rounded-xl bg-white p-2" />
                  ) : (
                    <div className="w-52 h-52 rounded-xl ep-skeleton" />
                  )}
                  <div className="text-center">
                    <div className="text-sm font-extrabold text-white">{event.title}</div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-1 break-all">{inviteUrl}</div>
                  </div>
                  <button
                    onClick={handleNativeShare}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Compartir invitación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Credencial de ingreso del asistente (QR firmado para acreditación) */}
          {isRegisteredToEvent && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3 shadow-lg text-center">
              <div className="text-left">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" /> Tu credencial de ingreso
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Mostrá este QR en la entrada para acreditarte.</p>
              </div>
              {credentialQr ? (
                <img src={credentialQr} alt="Credencial QR" className="w-44 h-44 mx-auto rounded-xl bg-white p-2" />
              ) : (
                <div className="w-44 h-44 mx-auto rounded-xl ep-skeleton" />
              )}
              <p className="font-mono text-[10px] text-zinc-500">{attendee?.name}</p>
            </div>
          )}

          {/* Acreditación (organizador): abrir escáner de ingresos */}
          <button
            onClick={() => setShowAccreditation(true)}
            className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/40 rounded-3xl p-5 shadow-lg text-left transition-all cursor-pointer group"
          >
            <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-400" /> Acreditar asistentes
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5 group-hover:text-zinc-400">Panel del organizador: escaneá el QR de cada asistente (o buscalo por nombre/email) para validar su ingreso.</p>
          </button>

          {/* Card 4: Proof of Attendance (POAP) Card */}
          {attendee && attendee.registeredEvents?.includes(event.id) && (() => {
            const badgeId = `poap_${event.id}`;
            const poapBadge = attendee.badges?.find(b => b.id === badgeId);

            return (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-lg text-left">
                <div>
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> Credencial POAP (Avalanche)
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Certificado de participación on-chain en la red.</p>
                </div>

                {poapBadge ? (
                  <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl space-y-3.5 font-mono text-[10px] text-zinc-400">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                      <span className="text-sm">🏅</span> 
                      <span>POAP MINTED ON-CHAIN</span>
                    </div>
                    <div className="flex justify-between border-t border-zinc-900/60 pt-2">
                      <span className="text-zinc-600">Red:</span>
                      <span className="text-zinc-300 font-bold">{poapBadge.dynamicMetadata?.chain || 'Avalanche C-Chain'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Token ID:</span>
                      <span className="text-zinc-300 font-bold truncate max-w-[130px]">{poapBadge.nftId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Bloque:</span>
                      <span className="text-zinc-300 font-semibold">{poapBadge.dynamicMetadata?.blockNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                      <span className="text-zinc-600">Hash TX:</span>
                      <span className="text-indigo-400 truncate max-w-[140px]" title={poapBadge.dynamicMetadata?.txHash}>
                        {poapBadge.dynamicMetadata?.txHash}
                      </span>
                    </div>
                    <div className="text-center pt-1">
                      <a 
                        href={`${poapBadge.dynamicMetadata?.chain?.toLowerCase().includes('stellar') 
                          ? 'https://stellar.expert/explorer/public/tx/' 
                          : poapBadge.dynamicMetadata?.chain?.toLowerCase().includes('polygon') 
                            ? 'https://polygonscan.com/tx/' 
                            : 'https://snowtrace.io/tx/'}${poapBadge.dynamicMetadata?.txHash}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Verificar en Explorer <ArrowLeft className="w-3 h-3 rotate-180" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {mintingStatus !== 'idle' && (
                      <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl space-y-2 text-[10px] font-mono text-zinc-400">
                        {mintingStatus === 'gas_estimation' && (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            Estimando gas y preparando contrato POAP...
                          </div>
                        )}
                        {mintingStatus === 'sending_tx' && (
                          <div className="flex items-center gap-2 text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                            Firmando y enviando transacción en Avalanche C-Chain...
                          </div>
                        )}
                        {mintingStatus === 'confirming_block' && (
                          <div className="flex items-center gap-2 text-indigo-400">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Transacción enviada. Confirmando bloque on-chain...
                          </div>
                        )}
                      </div>
                    )}

                    {mintingError && (
                      <div className="p-3 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-xl text-[10px]">
                        Error: {mintingError}
                      </div>
                    )}

                    <button
                      onClick={handleMintPOAPClick}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-indigo-650 hover:from-amber-400 hover:to-indigo-650 disabled:from-zinc-800 disabled:to-zinc-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
                    >
                      <Award className="w-4 h-4" /> 
                      {mintingStatus === 'idle' ? 'Acuñar POAP en Avalanche C-Chain' : 'Acuñando POAP...'}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Card 5: Sponsors Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4 shadow-lg text-left">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">Sponsors Oficiales</h3>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sponsor</span>
            </div>

            <div className="space-y-2.5">
              {event.sponsors && event.sponsors.length > 0 ? (
                event.sponsors.map((sp) => (
                  <div 
                    key={sp.id}
                    onClick={() => handleSponsorClick(sp.id, sp.link)}
                    className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg shadow-sm">
                        {sp.logo}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">{sp.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-medium">
                          <span className={`w-1.5 h-1.5 rounded-full ${sp.tier === 'Platinum' ? 'bg-teal-400' : sp.tier === 'Gold' ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                          {sp.tier} Sponsor
                        </div>
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Visitar <Eye className="w-3 h-3" />
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 text-center py-4">No hay sponsors listados para este evento.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Simulated QR Scanner Modal */}
      {scanningActivityId && (() => {
        const scanningActivity = event.activities.find(a => a.id === scanningActivityId);
        if (!scanningActivity) return null;

        const handleSimulateScan = async () => {
          setScanSuccess(true);
          setTimeout(async () => {
            await onCompleteActivity(scanningActivityId);
            onAddNotification(
              '🎯 Misión Validada', 
              `¡Has escaneado con éxito el código QR de la actividad "${scanningActivity.title}"!`
            );
            setScanningActivityId(null);
            setScanSuccess(false);
          }, 1200);
        };

        const handleManualCodeSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (manualCode.toLowerCase().trim() === scanningActivityId.toLowerCase() || manualCode.toLowerCase().trim() === 'validar' || manualCode.trim().length > 2) {
            setScanSuccess(true);
            setTimeout(async () => {
              await onCompleteActivity(scanningActivityId);
              onAddNotification(
                '🎯 Misión Validada', 
                `¡Código de validación verificado para "${scanningActivity.title}"!`
              );
              setScanningActivityId(null);
              setScanSuccess(false);
              setManualCode('');
            }, 1000);
          } else {
            onAddNotification('❌ Código Inválido', 'El código de verificación no coincide con la misión.');
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="qr-scanner-overlay">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all relative">
              
              {/* Header */}
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 text-center text-white">
                <button 
                  onClick={() => {
                    setScanningActivityId(null);
                    setScanSuccess(false);
                    setManualCode('');
                  }}
                  className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Cerrar modal"
                >
                  ✕
                </button>
                <h3 className="text-base font-bold tracking-tight">Simulador de Escáner QR IRL</h3>
                <p className="text-[11px] text-indigo-100 mt-1">Escanea códigos de eventos físicos para validar misiones</p>
              </div>

              {/* Body */}
              <div className="p-6 bg-zinc-950 text-zinc-100 space-y-5 text-center">
                
                {/* Viewfinder Mockup */}
                <div className={`relative w-60 h-60 mx-auto rounded-2xl border-2 overflow-hidden transition-all duration-300 ${scanSuccess ? 'border-emerald-500 bg-emerald-950/20' : 'border-zinc-800 bg-zinc-900'}`}>
                  
                  {/* Scanning scanlines laser */}
                  {!scanSuccess && (
                    <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 animate-bounce top-1/2 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                  )}

                  {/* Corner targets */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-indigo-400"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-indigo-400"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-indigo-400"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-indigo-400"></div>

                  {/* Center QR mockup */}
                  <div className="absolute inset-0 flex items-center justify-center m-auto w-32 h-32 bg-zinc-950/65 rounded-xl border border-zinc-800 p-3">
                    {scanSuccess ? (
                      <div className="text-emerald-400 text-5xl font-black animate-scale-up">✓</div>
                    ) : (
                      /* Minimalist abstract QR block code graphic */
                      <div className="w-full h-full opacity-65 flex flex-col gap-1 justify-center">
                        <div className="flex gap-1 justify-center">
                          <div className="w-6 h-6 bg-zinc-400 rounded-sm"></div>
                          <div className="w-6 h-3 bg-zinc-500 rounded-sm"></div>
                          <div className="w-6 h-6 bg-zinc-400 rounded-sm"></div>
                        </div>
                        <div className="flex gap-1 justify-center">
                          <div className="w-3 h-6 bg-zinc-500 rounded-sm"></div>
                          <div className="w-6 h-6 bg-zinc-400 rounded-sm"></div>
                          <div className="w-6 h-3 bg-zinc-500 rounded-sm"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scan status */}
                  <div className="absolute bottom-3 inset-x-0 mx-auto text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                    {scanSuccess ? (
                      <span className="text-emerald-400 animate-pulse">¡VALIDADO!</span>
                    ) : (
                      <span>🔴 buscando QR...</span>
                    )}
                  </div>
                </div>

                {/* Event & Mission context */}
                <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-905 text-left text-xs space-y-2">
                  <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                    🎯 Misión: <span className="text-indigo-400">{scanningActivity.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-normal">{scanningActivity.description}</p>
                  <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-850">
                    Recompensa: <strong className="text-indigo-400 font-bold">+{scanningActivity.points} XP</strong> on-chain.
                  </div>
                </div>

                {/* Simulation controls */}
                <div className="space-y-4 pt-2">
                  <button
                    onClick={handleSimulateScan}
                    disabled={scanSuccess}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600 disabled:text-white text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
                  >
                    {scanSuccess ? '✓ Código QR Capturado' : '📸 Simular Escaneo de QR (Automático)'}
                  </button>

                  <div className="relative text-center">
                    <span className="absolute inset-x-0 top-1/2 h-px bg-zinc-800"></span>
                    <span className="relative bg-zinc-950 px-3 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">o validar manualmente</span>
                  </div>

                  <form onSubmit={handleManualCodeSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingresar código del stand..."
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      disabled={scanSuccess}
                      className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-zinc-100 placeholder-zinc-650"
                    />
                    <button
                      type="submit"
                      disabled={scanSuccess || !manualCode}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 cursor-pointer disabled:opacity-50"
                    >
                      Enviar
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Panel de acreditación (organizador) */}
      {showAccreditation && (
        <Accreditation eventId={event.id} eventTitle={event.title} onClose={() => setShowAccreditation(false)} />
      )}

    </div>
  );
}
