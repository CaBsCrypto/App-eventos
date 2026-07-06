import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, ArrowLeft, CheckCircle, Clock, 
  Award, Sparkles, Send, Star, AlertCircle, Share2, Eye, Trash2, Globe
} from 'lucide-react';
import { Event, Activity, Attendee, Feedback } from '../types';

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
  isOffline
}: EventDetailProps) {
  const [activeFeedbackAct, setActiveFeedbackAct] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState<boolean>(false);
  const [isSendingGmail, setIsSendingGmail] = useState<boolean>(false);
  const [showConfirmRSVP, setShowConfirmRSVP] = useState<boolean>(false);
  const [showConfirmCancelRSVP, setShowConfirmCancelRSVP] = useState<boolean>(false);

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
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/40 to-black/30 z-10" />
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-44 sm:h-80 object-cover opacity-80"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 md:p-8 z-20 space-y-2 sm:space-y-3">
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-0.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 rounded-full text-[10px] sm:text-xs font-semibold">
              {event.category}
            </span>
            {attendee?.checkedIn && (
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Checked-In
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {event.title}
          </h1>
          <p className="text-zinc-300 text-xs sm:text-sm md:text-base max-w-3xl leading-relaxed line-clamp-2 sm:line-clamp-none">
            {event.description}
          </p>
        </div>
      </div>

      {/* Double Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - details & activities checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Activity checklist block */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> Actividades del Evento
                </h2>
                <p className="text-[11px] sm:text-xs text-zinc-400">Completa las tareas para sumar XP y actualizar tu Insignia NFT dinámica.</p>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-xs sm:text-sm font-bold text-indigo-400 block">
                  {attendee ? `${completedEventActivitiesCount} de ${event.activities.length}` : '0 de ' + event.activities.length}
                </span>
                <span className="text-[9px] sm:text-[10px] text-zinc-500">completadas</span>
                {attendee && attendee.registeredEvents?.includes(event.id) && (
                  <button
                    onClick={() => setShowConfirmCancelRSVP(true)}
                    className="text-[9px] text-zinc-500 hover:text-rose-400 font-semibold underline mt-1 transition-colors cursor-pointer"
                  >
                    Anular Asistencia
                  </button>
                )}
              </div>
            </div>

            {/* Offline notification banner if any */}
            {isOffline && (
              <div className="p-3 bg-amber-950/40 border border-amber-900/50 rounded-xl flex items-center gap-2.5 text-xs text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Modo sin conexión activo. Las actividades completadas se sincronizarán localmente.</span>
              </div>
            )}

            {!attendee ? (
              <div className="p-6 sm:p-8 text-center bg-zinc-950 rounded-xl border border-zinc-850 space-y-4">
                <p className="text-xs sm:text-sm text-zinc-400">Debes ingresar al portal de onboard (Privy) para registrarte en el evento y comenzar.</p>
                <button
                  onClick={onRegister}
                  className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Registrarme al Evento
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* RSVP Banner if not registered */}
                {!attendee.registeredEvents?.includes(event.id) && (
                  !showConfirmRSVP ? (
                    <div className="p-5 bg-gradient-to-br from-zinc-950 to-zinc-900 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center justify-center sm:justify-start gap-1.5">
                          🎟️ Asistencia Requerida
                        </h3>
                        <p className="text-[11px] text-zinc-400 max-w-md leading-relaxed">
                          Aún no estás inscrito en este evento. Inscríbete ahora para registrarte en las actividades y ganar puntos XP.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowConfirmRSVP(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-lg shrink-0 transition-all cursor-pointer shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-95"
                      >
                        Confirmar Asistencia
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 bg-zinc-900 rounded-xl border border-indigo-500/30 text-center space-y-4 animate-scale-up">
                      <div className="space-y-1">
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-100">¿Confirmar tu asistencia?</h3>
                        <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed">
                          ¿Estás seguro de que deseas inscribirte en <strong>{event.title}</strong>? Podrás participar y registrarte en todas sus actividades.
                        </p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setShowConfirmRSVP(false)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                        >
                          No, cancelar
                        </button>
                        <button
                          onClick={async () => {
                            await onRegisterEvent(event.id);
                            setShowConfirmRSVP(false);
                          }}
                          className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-500/15"
                        >
                          Sí, confirmar registro
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* Confirm Cancel RSVP inline alert */}
                {showConfirmCancelRSVP && (
                  <div className="p-4 bg-zinc-950 border border-rose-500/30 rounded-xl text-center space-y-3 animate-scale-up">
                    <p className="text-[11px] text-zinc-300">
                      ¿Seguro que deseas anular tu asistencia? Se reiniciará tu progreso de actividades en este evento.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setShowConfirmCancelRSVP(false)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-[9px] rounded-md transition-all cursor-pointer"
                      >
                        No, mantener
                      </button>
                      <button
                        onClick={async () => {
                          await onUnregisterEvent(event.id);
                          setShowConfirmCancelRSVP(false);
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[9px] rounded-md transition-all cursor-pointer"
                      >
                        Sí, anular registro
                      </button>
                    </div>
                  </div>
                )}

                {/* The activities list itself */}
                <div className="space-y-3">
                  {event.activities.map((act) => {
                    const completed = isActivityCompleted(act.id);
                    const isFeedbackOpen = activeFeedbackAct === act.id;
                    const isRegisteredForAct = attendee?.registeredActivities?.includes(act.id) || false;
                    const isEventRegistered = attendee?.registeredEvents?.includes(event.id) || false;

                    const handleActClick = () => {
                      if (!isEventRegistered) {
                        onAddNotification(
                          '🎟️ Asistencia Requerida', 
                          'Por favor confirma tu asistencia al evento primero en el botón "Confirmar Asistencia" de arriba.'
                        );
                        return;
                      }
                      if (!completed) {
                        if (isRegisteredForAct) {
                          onCompleteActivity(act.id);
                        } else {
                          onRegisterActivity(act.id);
                        }
                      }
                    };

                    return (
                      <div 
                        key={act.id}
                        className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${
                          completed 
                            ? 'bg-emerald-950/10 border-emerald-900/40' 
                            : isRegisteredForAct
                            ? 'bg-indigo-950/5 border-indigo-900/40 shadow-sm'
                            : isEventRegistered
                            ? 'bg-zinc-950 border-zinc-850 opacity-90'
                            : 'bg-zinc-950/60 border-zinc-900/60 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3 justify-between">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={handleActClick}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center shrink-0 text-xs font-extrabold transition-all ${
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
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className={`text-xs sm:text-sm font-semibold ${completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                                  {act.title}
                                </h4>
                                {act.required && (
                                  <span className="bg-rose-500/10 text-rose-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Obligatorio</span>
                                )}
                                <span className="bg-indigo-500/10 text-indigo-400 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  +{act.points} XP
                                </span>
                                {completed ? (
                                  <span className="bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                                    ✔ Completado
                                  </span>
                                ) : isRegisteredForAct ? (
                                  <span className="bg-indigo-500/10 text-indigo-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    📝 Inscrito
                                  </span>
                                ) : isEventRegistered ? (
                                  <span className="bg-zinc-800 text-zinc-400 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                    ⏳ No Inscrito
                                  </span>
                                ) : (
                                  <span className="bg-zinc-900/50 text-zinc-500 text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-zinc-850">
                                    🔒 Requiere Asistencia
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">{act.description}</p>
                            </div>
                          </div>

                          {/* Leave Feedback trigger, Complete button, or Register button */}
                          <div className="flex items-center gap-2">
                            {completed ? (
                              <button
                                onClick={() => setActiveFeedbackAct(isFeedbackOpen ? null : act.id)}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 p-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
                              >
                                <Star className="w-3.5 h-3.5 fill-indigo-400" /> <span className="hidden xs:inline">Valorar</span>
                              </button>
                            ) : isRegisteredForAct ? (
                              <button
                                onClick={() => onCompleteActivity(act.id)}
                                className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 hover:border-indigo-350 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 self-start"
                              >
                                ✓ Validar
                              </button>
                            ) : (
                              <button
                                onClick={handleActClick}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 self-start ${
                                  isEventRegistered 
                                    ? 'bg-zinc-900 hover:bg-zinc-800 text-indigo-400 hover:text-indigo-300 border border-zinc-800' 
                                    : 'bg-zinc-950 text-zinc-500 border border-zinc-900'
                                }`}
                              >
                                ✍️ Inscribirme
                              </button>
                            )}

                            {onDeleteActivity && (
                              <button
                                onClick={() => onDeleteActivity(event.id, act.id)}
                                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 border border-zinc-850 hover:border-zinc-800 rounded-lg transition-colors cursor-pointer self-start"
                                title="Eliminar actividad"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Feedback Rating Expandable Form */}
                        {isFeedbackOpen && (
                          <form onSubmit={(e) => submitFeedback(e, act.id)} className="mt-4 pt-4 border-t border-zinc-900 space-y-3 animate-slide-down">
                            <p className="text-xs font-medium text-zinc-300">Valora tu experiencia:</p>
                            <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((stars) => (
                                <button
                                  key={stars}
                                  type="button"
                                  onClick={() => setRating(stars)}
                                  className="p-1 focus:outline-none cursor-pointer"
                                >
                                  <Star className={`w-5 h-5 ${stars <= rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}`} />
                                </button>
                              ))}
                              <span className="text-xs text-zinc-400 font-semibold ml-2">({rating} de 5)</span>
                            </div>
                            
                            <div className="relative">
                              <textarea
                                placeholder="Escribe un comentario..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
                              />
                            </div>

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
                                {submittingFeedback ? 'Enviando...' : 'Enviar Valoración'} <Send className="w-3 h-3" />
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Metadatas, Sponsors & Google Integration links */}
        <div className="space-y-6">
          
          {/* Details Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 text-sm text-zinc-300">
            <h3 className="font-bold text-zinc-100">Información General</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">Fecha y Hora</div>
                  {event.startDate ? (
                    <div className="text-zinc-400 space-y-1 mt-1">
                      <div>
                        <span className="text-zinc-500 font-medium">Inicio:</span>{' '}
                        <span className="text-indigo-300 font-semibold">{event.startDate}</span>{' '}
                        <span className="text-zinc-400">• {event.startTime}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 font-medium">Fin:</span>{' '}
                        <span className="text-indigo-300 font-semibold">{event.endDate}</span>{' '}
                        <span className="text-zinc-400">• {event.endTime}</span>
                      </div>
                      {event.timezone && (
                        <div className="text-[11px] text-indigo-400 font-bold flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-zinc-800/50">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Zona Horaria: {event.timezone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="text-zinc-400">{event.date}</div>
                      <div className="text-zinc-400">{event.time}</div>
                      {event.timezone && (
                        <div className="text-[11px] text-indigo-400 font-bold flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-zinc-800/50">
                          <Globe className="w-3.5 h-3.5" />
                          <span>Zona Horaria: {event.timezone}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">Lugar del Evento</div>
                  <div className="text-zinc-400">{event.location}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-zinc-200">Aforo Esperado</div>
                  <div className="text-zinc-400">{event.expectedAttendance} personas</div>
                </div>
              </div>
            </div>

            {/* Google Sync Actions inside Sidebar */}
            {attendee && (
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-400 mb-1 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" /> Sincronizaciones Google
                </div>
                
                <button
                  onClick={handleCalendarSync}
                  disabled={isSyncingCalendar}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-red-400" /> 
                  {isSyncingCalendar ? 'Sincronizando...' : 'Añadir a Google Calendar'}
                </button>

                <button
                  onClick={handleGmailInvite}
                  disabled={isSendingGmail}
                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  {isSendingGmail ? 'Enviando invitación...' : 'Enviar Invitación por Gmail'}
                </button>
              </div>
            )}
          </div>

          {/* Sponsors Section (Non-intrusive) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-100 text-sm">Sponsors Oficiales</h3>
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Patrocinio</span>
            </div>

            <div className="space-y-2.5">
              {event.sponsors && event.sponsors.length > 0 ? (
                event.sponsors.map((sp) => (
                  <div 
                    key={sp.id}
                    onClick={() => handleSponsorClick(sp.id, sp.link)}
                    className="flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-850 border border-zinc-850 hover:border-zinc-800 rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg shadow-sm">
                        {sp.logo}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition-colors">{sp.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1">
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
    </div>
  );
}
