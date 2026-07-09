-- =============================================================================
-- EventProtocol · Esquema Supabase
-- =============================================================================
-- Paso 1 (activo ahora): almacén de estado como documento JSONB.
-- Da persistencia durable sin reescribir los handlers del server. La app lee
-- y escribe el DatabaseSchema completo en una única fila (key = 'db').
--
-- Ejecuta este bloque en el SQL Editor de tu proyecto Supabase.
-- =============================================================================

create table if not exists public.kv_store (
  key         text primary key,
  data        jsonb not null,
  updated_at  timestamptz not null default now()
);

-- El server usa la SERVICE ROLE KEY (bypassea RLS). Igual dejamos RLS activo y
-- sin políticas públicas: nadie con la anon key puede leer/escribir el estado.
alter table public.kv_store enable row level security;

-- =============================================================================
-- Paso 2 (futuro, opcional): tablas relacionales para leaderboard/realtime.
-- Descomentar y migrar los handlers cuando se quiera SQL/realtime nativo.
-- =============================================================================
-- create table if not exists public.events (
--   id text primary key,
--   title text not null,
--   description text,
--   date text, time text, location text, category text,
--   expected_attendance int default 0,
--   actual_attendance int default 0,
--   image text,
--   sponsors jsonb default '[]',
--   activities jsonb default '[]',
--   event_badge jsonb,
--   short_code text,
--   created_at timestamptz default now()
-- );
--
-- create table if not exists public.attendees (
--   id text primary key,
--   name text, email text, wallet_address text, wallet_type text,
--   points int default 0,
--   badges jsonb default '[]',
--   completed_activities jsonb default '[]',
--   registered_events jsonb default '[]',
--   registered_activities jsonb default '[]',
--   follows jsonb default '[]',
--   "user" text, city text, bio text, phone text, handles jsonb,
--   joined_at timestamptz default now()
-- );
--
-- -- Ranking por XP (leaderboard real vía SQL):
-- --   select *, rank() over (order by points desc) from public.attendees;
--
-- create table if not exists public.notifications (
--   id text primary key, title text, message text,
--   "timestamp" timestamptz default now(), read boolean default false
-- );
--
-- create table if not exists public.sponsors (
--   id text primary key, name text, logo text, tier text, link text,
--   impressions int default 0, clicks int default 0
-- );
