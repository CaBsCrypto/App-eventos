# Acreditación de asistentes

Dos vías, ambas disparan el mismo minteo de insignia (`mintEventBadge`,
best-effort: real on-chain si Avalanche está configurado, si no simulado).

## 1. Credencial QR
Cada asistente registrado tiene un QR con un **token firmado (HMAC)** en su
invitación. El organizador escanea (o busca por nombre/email) desde el panel
**"Acreditar asistentes"**. Ver `Accreditation.tsx` y `POST /api/events/:id/checkin`.

## 2. Frase secreta
Alternativa sin cámara/QR — pensada para eventos sin señal o sin escáner a
mano. El organizador la define al crear el evento (**Crear → Diseña la
insignia del evento → Frase secreta**, opcional). La anuncia en vivo; el
asistente la ingresa en su invitación ("¿Tenés la frase secreta del evento?").

- Backend: `POST /api/events/:id/redeem` `{ attendeeId, phrase }` — valida
  case-insensitive/trim, idempotente, rechaza si no hay frase configurada o
  el asistente no está registrado.
- **Seguridad**: `secretPhrase` nunca viaja en las respuestas públicas del API
  (`GET /events`, `GET /events/by-code/:code`, ni siquiera en la respuesta del
  `POST /events` de creación) — se valida únicamente server-side. Ver
  `redactEvent()` en `server-app.ts`.
- Frontend: `EventDetail.tsx`, sección debajo de la credencial QR (solo visible
  si el asistente está registrado y aún no acreditado).

## Estado on-chain
Si `AVALANCHE_MINTER_PRIVATE_KEY` + `AVALANCHE_BADGE_CONTRACT` están
configurados, la insignia se acuña de verdad en Avalanche Fuji a la wallet del
asistente (paga el gas la wallet del proyecto). Sin esa config, degrada a un
registro simulado — nunca bloquea la acreditación en sí.
