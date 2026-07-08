# Guía de integración — EventProtocol (diseño nuevo ↔ repo actual)

Este documento acopla el **prototipo de diseño hi-fi** (`design_handoff_eventprotocol`,
"LatAm Protocol Prototipo v3") con el **repo React existente**. Es el mapa maestro
para portar pantalla por pantalla.

## Arquitectura por capas (nueva)

```
src/
├─ lib/api/          Capa de datos. Cliente HTTP tipado + un módulo por dominio.
│   ├─ client.ts       fetch + errores (ApiError) + JSON.
│   ├─ events.ts       /api/events*
│   ├─ attendees.ts    /api/attendees*  (auth/perfil/wallet)
│   ├─ notifications.ts
│   ├─ sponsors.ts
│   └─ index.ts        export `api` unificado
├─ state/            Capa de estado por dominio (Context).
│   ├─ AppProvider.tsx  toda la lógica (auth, data, nav, offline, ui) + mutaciones
│   └─ hooks.ts         useAuth / useData / useNav / useOffline / useUI
├─ components/       Presentacional (existentes + nuevos).
├─ types.ts          Tipos base + tipos del handoff (Mission, Organizer, Profile…)
├─ index.css         Design tokens (índigo-noche) + fuentes + animaciones
└─ App.tsx           Shell presentacional que consume el provider
```

Regla: **las pantallas nunca llaman `fetch`**. Van a `useData()/useAuth()/…`, que
delegan en `src/lib/api`. Toda la red vive en una sola capa.

## Design tokens (ya aplicados en `index.css`)

- Tema índigo-noche: la escala Tailwind `zinc/indigo/violet` está re-mapeada a los
  colores del handoff, así que los componentes existentes ya adoptan el tema.
- Fuentes: `font-display` = Outfit (títulos), `font-sans` = Inter, `font-mono` = JetBrains Mono.
- Tokens semánticos `--ep-*` (y `--ep-accent` configurable) para pantallas nuevas.
- Animaciones del prototipo: `animate-slide-up`, `animate-pulse-dot`, `animate-xp-float`,
  `animate-confetti`, `.ep-skeleton` (shimmer).

## Mapeo pantalla → estado → endpoint

| # | Pantalla (handoff)     | `screen`      | Estado / hook            | Endpoints backend                          | Estado actual |
|---|------------------------|---------------|--------------------------|--------------------------------------------|---------------|
| 1 | Landing (pública)      | `view=landing`| useNav / useUI           | — (estática)                               | ✅ hecha |
| 2 | Descubrir              | `discover`    | useApp.follows           | `GET /discover`, `POST /organizers/:id/follow` | ✅ (follows client-side) |
| 3 | Eventos                | `events`      | useData.events           | `GET /api/events`                          | ✅ funciona |
| 4 | Invitación             | `invite`      | useNav.selectedEvent     | `GET /api/events/by-code/:code`, `register-event` | ✅ (en EventDetail) |
| 5 | Crear evento           | `create`      | useData / AdminPanel     | `POST /api/events`                         | ✅ (falta badge designer) |
| 6 | Leaderboard            | `leaderboard` | useData.attendees        | (deriva de attendees) / `GET /leaderboard` | ✅ funciona |
| 7 | Insignias (3D)         | `badges`      | useAuth.currentAttendee  | `GET /me/badges`, `POST /badges/mint`      | 🟡 falta 3D (badge-3d.js) |
| 8 | Perfil / Historial     | `history`     | useApp.profile           | `GET /me`, `PATCH /me`                      | ✅ (perfil demo) |
| 9 | Ajustes                | `settings`    | useApp.profile/update    | `PATCH /me`                                | ✅ (perfil demo) |

✅ funciona · 🟡 parcial · ⬜ pendiente

## Contrato de datos (formas que el front consume)

Definidas en `src/types.ts`. Las base (`Event`, `Activity`, `Badge`, `Attendee`) ya
existen; las del handoff (`Mission`, `BadgeMeta`, `Organizer`, `LeaderboardRow`,
`Profile`, `ProfileHandles`) se añadieron para las pantallas nuevas.

Equivalencias de vocabulario prototipo → repo:
- **Mission** (XP) ≈ `Activity` (points). Portar reutilizando `Activity`.
- **User/Profile** se modela sobre `Attendee` + campos extra (city, bio, handles…).
- **Badge** del handoff = `BadgeMeta` (general | event); el repo usa `Badge` (NFT).

## Endpoints del handoff aún NO implementados en backend

Añadir en `server-app.ts` y su módulo en `src/lib/api/`:
`GET /discover`, `GET /organizers`, `POST /organizers/:id/follow`,
`GET /leaderboard`, `GET /me`, `PATCH /me`, `GET /me/badges`, `POST /badges/mint`.

## Assets del prototipo (portar, no copiar el runtime)

- `badge-3d.js` → componente React aislado (o `@react-three/fiber`) para el medallón 3D.
- `image-slot.js` → reemplazar por el uploader del proyecto (foto perfil / portada).
- `support.js` → **no portar** (runtime del prototipo).
- Iconos emoji → sustituir por `lucide-react` (ya instalado).

## Próximos incrementos sugeridos

1. **Shell/nav**: extender la navegación a las 8 pantallas + `landing` (bottom-bar móvil
   de 5 accesos, modales full-screen <720px).
2. **Landing** pública (`view=landing`) con hero, features (modales) y tarjeta on-chain.
3. **Descubrir** + seguir organizadores (requiere endpoints nuevos).
4. **Perfil/Historial** y **Ajustes** (Profile + `PATCH /me`).
5. **Badge designer** en Crear + **insignias 3D**.
6. **Misiones/XP**: animación `+XP` flotante + micro-confetti al completar.
