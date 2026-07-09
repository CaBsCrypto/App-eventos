/**
 * Capa de persistencia Supabase (opcional).
 *
 * Estrategia: la app usa un cache en memoria (DatabaseSchema completo) y
 * escribe "write-through". Aquí Supabase guarda ese documento en una única
 * fila JSONB (tabla `kv_store`, key='db'). Es un drop-in del KV actual que da
 * persistencia durable y gestionada, sin reescribir los handlers.
 *
 * Se activa SOLO si están SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno;
 * si no, todo sigue con el archivo JSON / KV como hasta ahora.
 *
 * Migración futura a tablas relacionales (events/attendees/…): ver
 * supabase/schema.sql (sección comentada) — permitirá queries de leaderboard
 * y realtime nativos. Este documento JSONB es el paso 1 (persistencia real).
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const KV_KEY = 'db';

let client: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return Boolean(URL && SERVICE_KEY);
}

function getClient(): SupabaseClient | null {
  if (!isSupabaseEnabled()) return null;
  if (!client) client = createClient(URL as string, SERVICE_KEY as string, { auth: { persistSession: false } });
  return client;
}

/** Lee el documento de estado desde Supabase. Devuelve null si no hay/está vacío. */
export async function loadFromSupabase<T>(): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const { data, error } = await c.from('kv_store').select('data').eq('key', KV_KEY).maybeSingle();
    if (error) {
      console.error('[supabase] load error:', error.message);
      return null;
    }
    return (data?.data as T) ?? null;
  } catch (e) {
    console.error('[supabase] load exception:', e);
    return null;
  }
}

/** Persiste el documento de estado completo (upsert por key). */
export async function saveToSupabase<T>(state: T): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    const { error } = await c.from('kv_store').upsert({ key: KV_KEY, data: state, updated_at: new Date().toISOString() });
    if (error) console.error('[supabase] save error:', error.message);
  } catch (e) {
    console.error('[supabase] save exception:', e);
  }
}
