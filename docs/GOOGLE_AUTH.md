# Login con Google (Supabase Auth)

El botón "Continuar con Google" ya está en el código (WalletModal), **gated**:
aparece solo cuando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están en el
build. Sin configurar, la app funciona igual con email/demo.

Flujo: botón → Supabase OAuth → Google → vuelve a la app → se crea/recupera el
attendee por email (endpoint `/api/attendees/onboard`, idempotente).

## Setup (una vez)

### 1. Google Cloud — crear credenciales OAuth
1. https://console.cloud.google.com → crea/elige un proyecto.
2. **APIs & Services → OAuth consent screen** → External → completa nombre,
   correo de soporte, dominio. Publica (o deja en Testing y agrega tu correo
   como test user).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized redirect URI**: pega la que te da Supabase (paso 2):
     `https://<TU-PROYECTO>.supabase.co/auth/v1/callback`
4. Copia el **Client ID** y **Client Secret**.

### 2. Supabase — habilitar el provider Google
1. Dashboard → **Authentication → Providers → Google** → Enable.
2. Pega el **Client ID** y **Client Secret** de Google. Guarda.
3. **Authentication → URL Configuration**:
   - **Site URL**: `https://eventprotocol.vercel.app`
   - **Redirect URLs**: agrega `https://eventprotocol.vercel.app` (y
     `http://localhost:3000` si probás local).

### 3. Vercel — variables del frontend
En Vercel → proyecto `eventprotocol` → Settings → Environment Variables, agrega
(Production + Preview + Development):

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | tu Project URL (misma que `SUPABASE_URL`) |
| `VITE_SUPABASE_ANON_KEY` | la **publishable / anon** key (¡NO la service!) |

> ⚠️ El frontend usa la **anon/publishable** key (segura, va al navegador). La
> `service_role` es solo del backend y nunca se expone en el cliente.

### 4. Redeploy
Las `VITE_*` se leen en **build**, así que hay que redeployar después de
agregarlas. Avísame y hago `vercel deploy --prod`, o corre tú el redeploy.

## Probar
1. Abre https://eventprotocol.vercel.app → "Iniciar sesión" → "Registrarme".
2. Debe aparecer **"Continuar con Google"** arriba del formulario de correo.
3. Click → login Google → vuelve logueado con tu nombre/email reales.

## Notas
- La wallet embebida sigue siendo un placeholder (Privy real es un paso aparte).
  El login de Google da identidad (email/nombre); el attendee se deduplica por
  email, así que reingresar con el mismo Google devuelve el mismo perfil.
- Para vincular Google *además* del login (toggle en Ajustes) o Calendar/Gmail
  reales, son integraciones separadas.
