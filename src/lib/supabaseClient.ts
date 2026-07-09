/**
 * Cliente Supabase del navegador (solo para Auth / OAuth).
 *
 * Usa la PUBLISHABLE/anon key (segura para el cliente) — NUNCA la service key.
 * Se activa solo si VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY están definidos
 * en build; si no, `supabase` es null y el login con Google queda oculto.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

/** ¿Está configurado el login con Google (Supabase Auth)? */
export const isGoogleAuthEnabled = (): boolean => supabase !== null;
