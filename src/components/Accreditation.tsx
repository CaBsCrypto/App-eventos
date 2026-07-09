import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, CheckCircle2, X, RefreshCw, UserCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useApp } from '../state/AppProvider';

interface AccreditedRow { attendeeId: string; name: string; email: string; at: string; }
type Result = { kind: 'ok' | 'again' | 'error'; text: string } | null;

/**
 * Panel de acreditación del organizador: valida el ingreso escaneando el QR
 * del asistente (token firmado) o buscándolo por nombre/email. Muestra la
 * lista de acreditados en vivo.
 */
export default function Accreditation({ eventId, eventTitle, onClose }: { eventId: string; eventTitle: string; onClose: () => void }) {
  const { attendees, toast } = useApp();
  const [tab, setTab] = useState<'scan' | 'search'>('scan');
  const [accredited, setAccredited] = useState<AccreditedRow[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [query, setQuery] = useState('');
  const [camError, setCamError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);

  const registered = useMemo(
    () => attendees.filter((a) => (a.registeredEvents || []).includes(eventId)),
    [attendees, eventId],
  );
  const accreditedIds = useMemo(() => new Set(accredited.map((a) => a.attendeeId)), [accredited]);

  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm(query.trim());
  const searchResults = q
    ? registered.filter((a) => norm(a.name).includes(q) || norm(a.email).includes(q))
    : registered;

  const loadAccredited = async () => {
    try {
      setAccredited(await api.events.accredited(eventId));
    } catch (e) {
      console.error('Error cargando acreditados:', e);
    }
  };
  useEffect(() => { loadAccredited(); /* eslint-disable-next-line */ }, [eventId]);

  const accredit = async (payload: { token?: string; attendeeId?: string }) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const r = await api.events.checkin(eventId, payload);
      setResult(r.already
        ? { kind: 'again', text: `${r.attendee.name} ya estaba acreditado/a` }
        : { kind: 'ok', text: `¡${r.attendee.name} acreditado/a!` });
      await loadAccredited();
    } catch (e: any) {
      setResult({ kind: 'error', text: e?.message || 'No se pudo acreditar' });
    } finally {
      setTimeout(() => { busyRef.current = false; }, 900);
    }
  };

  // --- Cámara (solo en la pestaña Escanear) ---
  useEffect(() => {
    if (tab !== 'scan') return;
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;
    setCamError('');
    // Defensivo: si la cámara no está disponible (preview/desktop sin permiso),
    // no debe crashear el panel — se muestra el aviso y queda la búsqueda.
    try {
      if (!document.getElementById('acc-qr-reader')) return;
      scanner = new Html5Qrcode('acc-qr-reader', { verbose: false } as any);
      scannerRef.current = scanner;
      Promise.resolve(
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => { accredit({ token: decoded }); },
          () => { /* frames sin QR: ignorar */ },
        ),
      ).catch((e: any) => {
        if (!cancelled) setCamError(e?.message || 'No se pudo abrir la cámara. Usá la búsqueda por nombre/email.');
      });
    } catch (e: any) {
      setCamError(e?.message || 'Cámara no disponible. Usá la búsqueda por nombre/email.');
    }
    return () => {
      cancelled = true;
      try { scanner?.stop().then(() => scanner?.clear()).catch(() => {}); } catch { /* noop */ }
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full h-full sm:h-auto sm:max-w-lg sm:max-h-[90vh] overflow-y-auto custom-scrollbar bg-zinc-900 sm:border border-zinc-800 sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-850 flex items-center justify-between gap-3 sticky top-0 bg-zinc-900 z-10">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-indigo-400" /> Acreditar ingreso</h3>
            <p className="text-[11px] text-zinc-500 truncate">{eventTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white bg-zinc-950 hover:bg-zinc-800 rounded-full w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-3">
          {([['scan', 'Escanear QR', Camera], ['search', 'Buscar', Search]] as const).map(([k, label, Icon]) => (
            <button key={k} onClick={() => { setResult(null); setTab(k); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${tab === k ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' : 'text-zinc-400 border-zinc-800 hover:bg-white/5'}`}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* Resultado del último escaneo/acreditación */}
        {result && (
          <div className={`mx-3 mb-2 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            result.kind === 'ok' ? 'bg-emerald-950/50 border border-emerald-800/50 text-emerald-300'
            : result.kind === 'again' ? 'bg-amber-950/40 border border-amber-800/40 text-amber-300'
            : 'bg-rose-950/50 border border-rose-900/50 text-rose-300'}`}>
            {result.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : '⚠️'} {result.text}
          </div>
        )}

        {/* Contenido */}
        <div className="px-3 pb-3 flex-1">
          {tab === 'scan' ? (
            <div className="space-y-2">
              <div id="acc-qr-reader" className="w-full rounded-xl overflow-hidden bg-black min-h-[240px]" />
              {camError ? (
                <p className="text-[11px] text-rose-400 px-1">{camError}</p>
              ) : (
                <p className="text-[11px] text-zinc-500 text-center">Apunta la cámara al QR de la credencial del asistente.</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl">
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nombre o email del asistente…" className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none" />
              </div>
              <div className="space-y-1.5 max-h-[46vh] overflow-y-auto custom-scrollbar">
                {searchResults.length === 0 ? (
                  <p className="text-[12px] text-zinc-500 text-center py-6">{registered.length === 0 ? 'Aún no hay asistentes registrados en este evento.' : 'Sin coincidencias.'}</p>
                ) : searchResults.map((a) => {
                  const done = accreditedIds.has(a.id);
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="w-8 h-8 rounded-full grid place-items-center text-[11px] font-extrabold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)' }}>
                        {(a.name || '??').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold text-zinc-100 truncate">{a.name}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{a.email}</div>
                      </div>
                      {done ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" /> Acreditado</span>
                      ) : (
                        <button onClick={() => accredit({ attendeeId: a.id })} className="text-[11px] font-bold px-3 py-1.5 rounded-full text-white cursor-pointer shrink-0" style={{ background: 'var(--ep-accent)' }}>Acreditar</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Lista de acreditados */}
        <div className="border-t border-zinc-850 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-500">Acreditados ({accredited.length}/{registered.length})</span>
            <button onClick={loadAccredited} className="text-zinc-500 hover:text-indigo-400 cursor-pointer" title="Actualizar"><RefreshCw className="w-3.5 h-3.5" /></button>
          </div>
          {accredited.length === 0 ? (
            <p className="text-[11px] text-zinc-600 text-center py-2">Nadie acreditado todavía.</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
              {accredited.map((a) => (
                <div key={a.attendeeId} className="flex items-center justify-between gap-2 text-[11px] px-2 py-1.5 bg-zinc-950 rounded-lg">
                  <span className="text-zinc-300 truncate flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> {a.name}</span>
                  <span className="text-zinc-600 font-mono shrink-0">{new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
