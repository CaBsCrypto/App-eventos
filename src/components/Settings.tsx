import React, { useState } from 'react';
import { useApp } from '../state/AppProvider';
import type { ProfileHandles } from '../types';

const cardStyle: React.CSSProperties = { background: 'var(--ep-card)', border: '1px solid var(--ep-border)', boxShadow: 'var(--ep-card-shadow)' };
const inputCls = 'w-full px-3.5 py-2.5 rounded-[10px] text-[13px] text-zinc-100 focus:outline-none transition-colors';
const inputStyle: React.CSSProperties = { background: 'var(--ep-inset)', border: '1px solid var(--ep-border-2)' };
const labelCls = 'text-[11px] uppercase tracking-wider font-bold';
const labelStyle: React.CSSProperties = { color: 'var(--ep-faint)' };
const h2Cls = 'font-display font-extrabold text-base text-white mt-7';

const SOCIAL_INPUTS: { key: keyof ProfileHandles; prefix: string }[] = [
  { key: 'github', prefix: 'github.com/' },
  { key: 'linkedin', prefix: 'linkedin.com/in/' },
  { key: 'x', prefix: 'x.com/' },
  { key: 'instagram', prefix: 'instagram.com/' },
];

function initials(name: string) {
  return (name || 'CR').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function Settings() {
  const { profile, updateProfile, saveProfile, toast, accent, setAccent } = useApp();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [twoFA, setTwoFA] = useState(false);
  const [passkey, setPasskey] = useState(false);
  const [linked, setLinked] = useState<Record<string, boolean>>({ Google: true, Apple: false, Zoom: false, Solana: false, Ethereum: true });
  const [otherDevices, setOtherDevices] = useState(true);

  const save = async () => {
    const ok = await saveProfile();
    setSaved(true);
    toast(
      ok ? 'Perfil actualizado' : 'Guardado local',
      ok ? 'Tus datos se guardaron en el servidor.' : 'Inicia sesión para persistir en el servidor.',
    );
    setTimeout(() => setSaved(false), 2000);
  };
  const copyWallet = () => {
    navigator.clipboard?.writeText(profile.wallet).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const addEmail = () => {
    if (extraEmails.length >= 2) { toast('Límite', 'Máximo 3 correos en la demo.'); return; }
    const addr = extraEmails.length === 0 ? 'camila.trabajo@ejemplo.cl' : 'cami.dev@ejemplo.cl';
    setExtraEmails((p) => [...p, addr]);
    toast('Correo agregado', `${addr} recibirá invitaciones.`);
  };

  const security = [
    { key: 'twoFA', icon: '🛡', title: 'Autenticación de dos factores', desc: twoFA ? '2FA activa con app de autenticación.' : 'Capa adicional de seguridad para tu cuenta.', label: twoFA ? '✓ 2FA activa' : 'Activar 2FA', on: twoFA, toggle: () => { setTwoFA((v) => !v); toast('Seguridad', twoFA ? '2FA desactivada.' : '2FA activada.'); } },
    { key: 'passkey', icon: '🗝', title: 'Claves de acceso', desc: passkey ? '1 passkey registrada en este dispositivo.' : 'Inicia sesión sin contraseña, con tu huella o Face ID.', label: passkey ? '✓ Passkey agregada' : 'Agregar passkey', on: passkey, toggle: () => { setPasskey((v) => !v); toast('Seguridad', passkey ? 'Passkey eliminada.' : 'Passkey registrada.'); } },
  ];

  const linkedAccounts = [
    { key: 'Google', icon: '🇬', sub: 'Login y calendario' },
    { key: 'Apple', icon: '', sub: 'Login con Apple' },
    { key: 'Zoom', icon: '📹', sub: 'Eventos virtuales' },
    { key: 'Solana', icon: '◎', sub: 'Wallet externa' },
    { key: 'Ethereum', icon: '⟠', sub: 'Wallet externa' },
  ];

  const devices = [
    { icon: '💻', name: 'MacBook Pro · Chrome', meta: 'Santiago, Chile · ahora', current: true },
    ...(otherDevices ? [
      { icon: '📱', name: 'iPhone 15 · Safari', meta: 'Santiago, Chile · hace 2 h', current: false },
      { icon: '🖥', name: 'Windows · Edge', meta: 'Valparaíso, Chile · ayer', current: false },
    ] : []),
  ];

  return (
    <div className="space-y-2 animate-fade-in max-w-3xl">
      <h1 className="font-display font-black text-2xl tracking-tight text-white">Ajustes de perfil</h1>
      <p className="text-[13px]" style={{ color: 'var(--ep-faint)' }}>Estos datos se muestran en tu perfil público y en los leaderboards.</p>

      {/* Avatar */}
      <div className="flex items-center gap-4 my-5 flex-wrap">
        <div className="w-[88px] h-[88px] rounded-full grid place-items-center text-[26px] font-extrabold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#6366f1)', border: '2px solid var(--ep-border-2)' }}>{initials(profile.name)}</div>
        <div className="text-[12px] max-w-xs" style={{ color: 'var(--ep-faint)' }}>Haz clic en el círculo (o arrastra una imagen) para subir tu foto de perfil. Si no subes foto, usamos tus iniciales.</div>
      </div>

      {/* Form principal */}
      <div className="p-5 rounded-[16px] space-y-4" style={cardStyle}>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Field label="Nombre" value={profile.name} onChange={(v) => updateProfile({ name: v })} />
          <Field label="Usuario" value={profile.user} onChange={(v) => updateProfile({ user: v })} />
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <Field label="Email" value={profile.email} onChange={(v) => updateProfile({ email: v })} />
          <Field label="Ciudad" value={profile.city} onChange={(v) => updateProfile({ city: v })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} style={labelStyle}>Bio</label>
          <textarea rows={3} value={profile.bio} onChange={(e) => updateProfile({ bio: e.target.value })} className={inputCls + ' resize-none'} style={inputStyle} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} style={labelStyle}>Enlaces sociales</label>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {SOCIAL_INPUTS.map((si) => (
              <div key={si.key} className="flex items-center rounded-[10px] overflow-hidden" style={inputStyle}>
                <span className="text-[11px] px-2.5 py-2.5 shrink-0" style={{ color: 'var(--ep-faint)', borderRight: '1px solid var(--ep-border)' }}>{si.prefix}</span>
                <input value={profile.handles[si.key] || ''} onChange={(e) => updateProfile({ handles: { ...profile.handles, [si.key]: e.target.value } })} placeholder="usuario" className="flex-1 min-w-0 bg-transparent px-2.5 py-2.5 text-[13px] text-zinc-100 focus:outline-none" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls} style={labelStyle}>Wallet vinculada</label>
          <div className="flex gap-2">
            <input readOnly value={profile.wallet} className={inputCls + ' font-mono flex-1'} style={inputStyle} />
            <button onClick={copyWallet} className="px-4 rounded-[10px] text-[12px] font-bold text-white cursor-pointer shrink-0" style={{ background: 'var(--ep-accent)' }}>{copied ? '✓' : 'Copiar'}</button>
          </div>
          <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>Generada con Privy al registrarte. Tus POAPs e insignias viven aquí.</div>
        </div>
        <button onClick={save} className="w-full py-3 rounded-[11px] font-bold text-[13px] text-white cursor-pointer transition-all" style={{ background: 'var(--ep-accent-grad)' }}>{saved ? '✓ Guardado' : 'Guardar cambios'}</button>
      </div>

      {/* Personalización — color de acento */}
      <h2 className={h2Cls}>Personalización</h2>
      <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Elige el color de acento de la interfaz. Se aplica al instante.</p>
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        {[
          { hex: '#6366f1', name: 'Índigo' },
          { hex: '#8b5cf6', name: 'Violeta' },
          { hex: '#0ea5e9', name: 'Cian' },
          { hex: '#10b981', name: 'Esmeralda' },
          { hex: '#f97316', name: 'Naranja' },
          { hex: '#e84142', name: 'Rojo' },
        ].map((c) => {
          const active = accent.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.hex}
              type="button"
              title={c.name}
              onClick={() => { setAccent(c.hex); toast('Tema actualizado', `Acento ${c.name} aplicado.`); }}
              className="w-9 h-9 rounded-full cursor-pointer transition-all hover:scale-110 grid place-items-center"
              style={{ background: c.hex, boxShadow: active ? `0 0 0 3px var(--ep-bg), 0 0 0 5px ${c.hex}` : 'none' }}
            >
              {active && <span className="text-white text-xs font-black">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Correos */}
      <div className="flex items-start justify-between gap-2.5 mt-7">
        <div>
          <h2 className="font-display font-extrabold text-base text-white">Correos</h2>
          <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Correos adicionales para recibir invitaciones a eventos.</p>
        </div>
        <button onClick={addEmail} className="text-[12px] font-bold px-4 py-2 rounded-[10px] cursor-pointer text-zinc-300 hover:text-indigo-400 shrink-0" style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border-2)' }}>＋ Agregar correo</button>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {[{ addr: profile.email, primary: true, removable: false, note: 'Correo principal de tu cuenta.' },
          ...extraEmails.map((addr) => ({ addr, primary: false, removable: true, note: 'Recibe invitaciones enviadas a esta dirección.' }))].map((em) => (
          <div key={em.addr} className="flex items-center gap-3 p-3.5 rounded-[12px]" style={cardStyle}>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold flex items-center gap-2 flex-wrap text-white">{em.addr}
                {em.primary && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: '#a5b4fc', background: 'rgba(165,180,252,0.1)', border: '1px solid rgba(165,180,252,0.3)' }}>Principal</span>}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>{em.note}</div>
            </div>
            {em.removable && <button onClick={() => { setExtraEmails((p) => p.filter((a) => a !== em.addr)); toast('Correo eliminado', em.addr); }} className="text-zinc-500 hover:text-rose-400 cursor-pointer">✕</button>}
          </div>
        ))}
      </div>

      {/* Teléfono */}
      <h2 className={h2Cls}>Teléfono</h2>
      <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Para iniciar sesión y recibir avisos de tus eventos por SMS o WhatsApp.</p>
      <div className="flex gap-2 mt-3 flex-wrap">
        <input value={profile.phone || ''} onChange={(e) => updateProfile({ phone: e.target.value })} placeholder="+56 9 …" className={inputCls} style={{ ...inputStyle, maxWidth: 260 }} />
        <button onClick={() => toast('Teléfono', 'Te enviamos un código para verificar el cambio.')} className="text-[12px] font-bold px-4 py-2 rounded-[10px] cursor-pointer text-zinc-300 hover:text-indigo-400" style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border-2)' }}>Actualizar</button>
      </div>

      {/* Seguridad */}
      <h2 className={h2Cls}>Contraseña y seguridad</h2>
      <div className="flex flex-col gap-2 mt-3">
        {security.map((sr) => (
          <div key={sr.key} className="flex items-center gap-3 p-3.5 rounded-[12px]" style={cardStyle}>
            <div className="w-9 h-9 rounded-[10px] grid place-items-center text-[16px] shrink-0" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>{sr.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white">{sr.title}</div>
              <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>{sr.desc}</div>
            </div>
            <button onClick={sr.toggle} className="text-[12px] font-bold px-3.5 py-1.5 rounded-[10px] cursor-pointer whitespace-nowrap" style={sr.on
              ? { color: 'var(--ep-green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)' }
              : { color: '#fff', background: 'var(--ep-accent)' }}>{sr.label}</button>
          </div>
        ))}
      </div>

      {/* Cuentas vinculadas */}
      <h2 className={h2Cls}>Cuentas vinculadas</h2>
      <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Vincula cuentas para iniciar sesión y automatizar tus flujos.</p>
      <div className="grid gap-2.5 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
        {linkedAccounts.map((la) => {
          const on = linked[la.key];
          return (
            <button key={la.key} onClick={() => { setLinked((p) => ({ ...p, [la.key]: !on })); toast('Cuentas', on ? `${la.key} desvinculado.` : `${la.key} vinculado.`); }} className="flex items-center gap-2.5 p-3 rounded-[12px] cursor-pointer transition-all hover:-translate-y-0.5" style={cardStyle}>
              <span className="text-[16px]">{la.icon || '🔗'}</span>
              <span className="flex-1 text-left min-w-0">
                <span className="block text-[12.5px] font-bold text-white">{la.key}</span>
                <span className="block text-[10px]" style={{ color: 'var(--ep-faint)' }}>{la.sub}</span>
              </span>
              <span className="text-[12px] font-bold" style={{ color: on ? 'var(--ep-green)' : 'var(--ep-faint)' }}>{on ? '✓' : '＋'}</span>
            </button>
          );
        })}
      </div>

      {/* Dispositivos */}
      <div className="flex items-start justify-between gap-2.5 mt-7">
        <div>
          <h2 className="font-display font-extrabold text-base text-white">Dispositivos activos</h2>
          <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Sesiones iniciadas con tu cuenta.</p>
        </div>
        {otherDevices && <button onClick={() => { setOtherDevices(false); toast('Sesiones', 'Se cerraron las otras 2 sesiones.'); }} className="text-[12px] font-bold px-4 py-2 rounded-[10px] cursor-pointer text-zinc-300 hover:text-indigo-400 shrink-0" style={{ background: 'var(--ep-card)', border: '1px solid var(--ep-border-2)' }}>Cerrar otras sesiones</button>}
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {devices.map((dv) => (
          <div key={dv.name} className="flex items-center gap-3 p-3.5 rounded-[12px]" style={cardStyle}>
            <div className="w-9 h-9 rounded-[10px] grid place-items-center text-[16px] shrink-0" style={{ background: 'var(--ep-inset)', border: '1px solid var(--ep-border)' }}>{dv.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold flex items-center gap-2 flex-wrap text-white">{dv.name}
                {dv.current && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: 'var(--ep-green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)' }}>Este dispositivo</span>}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--ep-faint)' }}>{dv.meta}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Eliminar cuenta */}
      <h2 className={h2Cls}>Eliminar cuenta</h2>
      <p className="text-[12px]" style={{ color: 'var(--ep-faint)' }}>Se eliminan tus datos de perfil. Tus POAPs e insignias permanecen en tu wallet, que es tuya.</p>
      <button onClick={() => toast('Eliminar cuenta', 'En la demo no se elimina nada. Confirma en producción.')} className="mt-3 px-5 py-2.5 rounded-[10px] text-[13px] font-bold cursor-pointer" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)' }}>Eliminar mi cuenta</button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className={labelCls} style={labelStyle}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={inputStyle} />
    </div>
  );
}
