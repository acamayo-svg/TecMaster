# Despliegue — Plataforma Tec Master

Frontend en Vercel, base de datos en Supabase. El **backend** puede ir en Vercel (1 función) o, si se cuelga con la BD, en **Railway o Render** (servidor siempre encendido).
![1773371264321](image/DESPLIEGUE/1773371264321.png)
## Resumen

- **Frontend**: Vercel, raíz `frontend/`. Build: `npm run build`, output `dist`.
- **Backend**: puede ser **Vercel** (1 función serverless) o **Railway / Render** (servidor Node fijo). Supabase para PostgreSQL.
- **CORS**: el backend acepta el origen de cada petición (producción y previews de Vercel), así que no deberías ver errores de CORS por URL de preview.

---

## Opción A: Backend en Railway o Render (recomendado si en Vercel se cuelga)

Si en Vercel el backend tarda mucho, da timeout o no deja registrar/iniciar sesión, suele ser por **cold start** y la **primera conexión a la BD** en una función serverless. En **Railway** o **Render** el backend corre como **servidor siempre encendido**: no hay cold start y la conexión a Supabase se mantiene, así que registro y login responden bien.

### Railway (tier gratis limitado; luego bajo costo)

1. Entra en [railway.app](https://railway.app), inicia sesión con GitHub.
2. **New Project** → **Deploy from GitHub repo** → elige tu repo.
3. En el servicio, **Settings** → **Root Directory**: `backend`.
4. **Variables**: añade `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (datos de Supabase). Opcional: `CORS_ORIGIN` = URL del frontend.
5. **Deploy**. Railway asigna un puerto; usa `PORT` automáticamente (el backend ya usa `process.env.PORT`).
6. En **Settings** → **Networking** → **Generate Domain**. Copia la URL (ej. `https://tu-proyecto.up.railway.app`).
7. En el **frontend en Vercel**, en Variables de entorno pon `VITE_API_URL` = esa URL (sin barra final) y haz **Redeploy**.

### Render (tier gratis con límites)

1. Entra en [render.com](https://render.com), inicia sesión con GitHub.
2. **New** → **Web Service** → conecta el repo.
3. **Root Directory**: `backend`. **Build Command**: `npm install`. **Start Command**: `npm start`.
4. **Environment**: añade `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Opcional: `CORS_ORIGIN`.
5. **Create Web Service**. Render te da una URL (ej. `https://tu-servicio.onrender.com`).
6. En el **frontend en Vercel**, pon `VITE_API_URL` = esa URL (sin barra final) y **Redeploy**.

En ambas plataformas el backend usa `npm start` → `node servidor/servidor.js` y lee las variables de Supabase. No hay límite de “funciones” ni cold start por request.

---

## Opción B: Backend en Vercel (1 función)

Si quieres todo en Vercel:

1. Proyecto en Vercel, **Root Directory**: `backend`.
2. Variables de entorno: `DB_*` (o `PG*`) de Supabase y opcionalmente `CORS_ORIGIN`.
3. La única función es `api/[[...path]].js` (Express). CORS está configurado para aceptar el origen de la petición (incluidas URLs de preview).
4. Si la primera petición (login, registro) tarda mucho o da timeout, es por cold start + conexión a BD; en ese caso usa **Opción A** (Railway/Render) para el backend.

---

## Frontend en Vercel

1. Otro proyecto en Vercel, **Root Directory**: `frontend`.
2. **Build**: `npm run build`. **Output**: `dist`.
3. **Variable de entorno**: `VITE_API_URL` = URL del backend (Railway, Render o Vercel), **sin barra final**.
4. Después de cambiar `VITE_API_URL`, haz **Redeploy** para que el build use la nueva URL.

---

## Si hay 404, CORS o lentitud

- **404**: Comprueba que `VITE_API_URL` sea la URL correcta del backend y sin barra final.
- **CORS**: El backend ya acepta el origen de la petición; si usas preview de Vercel (`*-xxx.vercel.app`), debería funcionar. Si no, en Railway/Render añade `CORS_ORIGIN` o deja que siga reflejando el origen.
- **Lentitud / timeouts en Vercel**: Despliega el backend en Railway o Render (Opción A).
