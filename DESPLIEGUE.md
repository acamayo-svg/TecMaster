# Despliegue en Vercel + Supabase — Plataforma Tec Master

Todo está pensado para **producción**: frontend y API en Vercel, base de datos en Supabase. No se usa configuración local (.env en el repo).

## Resumen

- **Frontend**: proyecto Vercel, raíz `frontend/`. Build: `npm run build`, output `dist`.
- **Backend**: proyecto Vercel, raíz `backend/`. **Una sola función serverless** (`api/[[...path]].js`) que ejecuta toda la app Express, para no superar el límite del plan Hobby (12 funciones). Base de datos PostgreSQL en Supabase.

## 1. Backend (API) en Vercel

1. En Vercel, crea un proyecto y conecta el repositorio de GitHub.
2. **Root Directory**: `backend`.
3. **Build Command**: vacío o `npm run build` si lo tienes. **Output Directory**: por defecto.
4. **Variables de entorno** (en Vercel → Settings → Environment Variables). Usa los datos de Supabase (Connection string / Database settings):

   | Variable       | Dónde sacarlo (Supabase) |
   |----------------|---------------------------|
   | `DB_HOST`      | Host de la base (ej. `db.xxx.supabase.co`) |
   | `DB_PORT`      | `5432` |
   | `DB_NAME`      | `postgres` (o el nombre de tu proyecto) |
   | `DB_USER`      | Usuario de la base |
   | `DB_PASSWORD`  | Contraseña de la base |
   | `CORS_ORIGIN`  | URL del frontend en Vercel, **sin barra final** (ej. `https://tu-frontend.vercel.app`) |

   También sirven: `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`.

5. Deploy. Anota la URL del backend (ej. `https://tu-backend.vercel.app`).

## 2. Frontend en Vercel

1. Otro proyecto en Vercel, mismo repositorio.
2. **Root Directory**: `frontend`.
3. **Build Command**: `npm run build`. **Output Directory**: `dist`.
4. **Variable de entorno** en Vercel:

   | Variable        | Valor |
   |-----------------|--------|
   | `VITE_API_URL`  | URL del backend (ej. `https://tu-backend.vercel.app`) **Sin barra final.** |

5. Guardar y hacer **Redeploy** para que el build use la variable.

## 3. Comportamiento en producción

- El frontend solo llama a la API si `VITE_API_URL` está definida en el build de Vercel.
- CORS: el backend usa `CORS_ORIGIN` (o refleja el `Origin`) y cabeceras en `backend/vercel.json`.
- El progreso del curso se guarda en Supabase vía `PATCH /api/inscripciones`. La conexión desde Vercel a Supabase usa SSL por defecto en el código.

## 4. Si hay 404, CORS o lentitud

- **404**: Revisa que `VITE_API_URL` sea la URL correcta del proyecto backend y sin barra final.
- **CORS**: `CORS_ORIGIN` en el backend debe ser exactamente la URL del frontend (con `https://`).
- **Lentitud / timeouts**: Revisa en Supabase que la base permita conexiones desde internet y que los datos de conexión en Vercel sean los correctos.

## 5. Límite de 12 funciones (plan Hobby) y otras plataformas

En Vercel **plan Hobby** (gratis) solo puedes tener **12 funciones serverless** por despliegue. Este proyecto quedó con **1 función** (`api/[[...path]].js`) que atiende todas las rutas con Express, así que no deberías volver a ver ese error.

Si en el futuro quisieras usar otra plataforma gratuita o de bajo costo:

- **Netlify**: permite funciones serverless (Netlify Functions) con un tier gratis generoso. Puedes desplegar el mismo backend como una sola función en `netlify/functions/api.js` y el frontend en el mismo proyecto o en otro.
- **Railway** / **Render**: ofrecen planes gratuitos o de pocos dólares para **un servidor Node que corre todo el tiempo** (no serverless). Ahí desplegarías solo `backend/servidor/servidor.js` como servidor Express y no tendrías límite de “funciones”.
- **Supabase** (donde ya tienes la BD) no sustituye el backend completo: solo la base de datos y opcionalmente Edge Functions; la API de Express seguiría en Vercel, Netlify o Railway.

Con la configuración actual (1 función en Vercel + Supabase) puedes seguir en el plan Hobby sin pagar.
