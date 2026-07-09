# Acreditación por QR

Valida el ingreso de asistentes a un evento: cada asistente registrado tiene
una **credencial QR firmada**; el organizador la **escanea con la cámara** (o
busca a la persona por **nombre/email**) para acreditar su ingreso.

## Cómo se usa
- **Asistente**: en la invitación del evento (registrado) → card **"Tu
  credencial de ingreso"** con su QR. Lo muestra en la puerta.
- **Organizador**: en la invitación → botón **"Acreditar asistentes"** → panel con:
  - **Escanear QR** (cámara del dispositivo, `html5-qrcode`).
  - **Buscar** por nombre/email → **Acreditar** con un toque.
  - **Lista de acreditados** en vivo (nombre + hora).

## Seguridad
El QR lleva un **token HMAC** firmado por el server (`CHECKIN_SECRET`):
`base64url(eventId.attendeeId.hmac)`. El backend verifica la firma al escanear,
así que **no se puede falsificar** un QR de ingreso. El check-in manual (por
attendeeId) es de confianza del organizador.

## Endpoints
- `POST /api/events/:eventId/credential` `{ attendeeId }` → `{ token }` (requiere estar registrado al evento).
- `POST /api/events/:eventId/checkin` `{ token }` **o** `{ attendeeId }` → acredita (idempotente; rechaza token inválido/otro-evento/no-registrado).
- `GET /api/events/:eventId/accredited` → lista de acreditados.

Estado: `Attendee.checkins: { eventId, at }[]`. Persistido en Supabase/JSON.

## Config
- `CHECKIN_SECRET` (env, opcional): secreto para firmar. Fallback demo si no está.
- Cámara: requiere **HTTPS** (ya lo tenemos en Vercel) + permiso del usuario.
  Si no hay cámara/permiso, el panel cae a la búsqueda por nombre/email.

## Notas / futuro
- Con muchos check-ins simultáneos, el modelo JSONB puede tener carreras de
  escritura; el **paso 2 de Supabase** (tabla `checkins` relacional) lo haría atómico.
- No hay rol de organizador real (cualquiera con acceso al evento puede abrir el
  panel), consistente con el modelo actual sin auth de organizador.
