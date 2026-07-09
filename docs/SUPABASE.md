# Persistencia con Supabase

La app funciona con `db-store.json` por defecto. Para persistencia durable
(no se pierde entre deploys, concurrente), conecta Supabase — **sin cambiar
código**: solo credenciales.

## Setup (5 pasos)

1. Crea un proyecto en https://supabase.com (free tier sirve).
2. En **SQL Editor**, pega y ejecuta `supabase/schema.sql`.
3. En **Project Settings → API**, copia:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (⚠️ SECRETA, solo backend) → `SUPABASE_SERVICE_KEY`
4. Crea `.env` en la raíz (o configura las vars en Vercel):
   ```
   SUPABASE_URL="https://xxxx.supabase.co"
   SUPABASE_SERVICE_KEY="eyJhbGci..."
   ```
5. Arranca (`npm run dev`). Al primer arranque, el server **siembra**
   automáticamente el estado actual en Supabase (tabla `kv_store`, key `db`).

Si las variables no están, todo sigue con el JSON local — cero fricción.

## Cómo funciona

- La app mantiene el `DatabaseSchema` completo en memoria (cache) y escribe
  "write-through". Supabase guarda ese documento en una fila JSONB.
- Es un drop-in del KV actual: **no se reescribió ningún handler**, así que la
  migración es de bajo riesgo y reversible (quita las vars y vuelve al JSON).
- Código: `server-supabase.ts` (cliente + load/save) y las funciones
  `syncDatabaseFromKV` / `saveDatabase` en `server-app.ts` que lo prefieren
  cuando `isSupabaseEnabled()`.

## Paso 2 (futuro): tablas relacionales

El documento JSONB da persistencia real ya. Cuando se quiera **leaderboard por
SQL** y **realtime** nativos, `supabase/schema.sql` incluye (comentadas) las
tablas relacionales `events/attendees/notifications/sponsors`. Migrar implica
reescribir los handlers para consultar esas tablas — es un paso incremental,
no bloquea nada de lo actual.

## Vercel

Añade `SUPABASE_URL` y `SUPABASE_SERVICE_KEY` en Project Settings → Environment
Variables. `vercel.json` y `api/index.ts` ya sirven el mismo `server-app`.
