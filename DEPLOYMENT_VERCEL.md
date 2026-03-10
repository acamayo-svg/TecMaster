# Despliegue en Vercel: frontend y backend por separado

Este repositorio está organizado en dos carpetas para desplegar **dos proyectos en Vercel** desde el mismo repo en GitHub:

- **`frontend/`** → Proyecto 1: solo la app React (Vite)
- **`backend/`** → Proyecto 2: solo la API (Express como serverless)

---

## Estructura del repo en GitHub

```
/
├── frontend/          # App React (Vite)
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── backend/           # API Express (serverless en Vercel)
│   ├── api/
│   │   └── index.js   # Handler serverless
│   ├── servidor/
│   │   ├── servidor.js
│   │   ├── baseDeDatos.js
│   │   └── cadenaCertificados.js
│   ├── vercel.json
│   └── package.json
├── .gitignore
├── README.md
└── DEPLOYMENT_VERCEL.md
```

---

## 1. Base de datos (Supabase u otro PostgreSQL)

Necesitas una base PostgreSQL en la nube (ej. Supabase con **Transaction pooler**):

- **Host**: ej. `aws-1-us-east-1.pooler.supabase.com`
- **Puerto**: `6543` (pooler)
- **Base de datos**: `postgres`
- **Usuario** y **Contraseña**: los de tu proyecto

---

## 2. Proyecto en Vercel: Backend (API)

1. En [vercel.com](https://vercel.com) → **Add New** → **Project** → importa el **mismo repositorio** de GitHub.
2. **Nombre del proyecto**: por ejemplo `plataforma-certificados-api`.
3. **Root Directory**: haz clic en **Edit** y selecciona **`backend`**.
4. **Build**: puedes dejar **Build Command** vacío o `npm install`. **Output Directory** vacío.
5. **Deploy** y anota la URL, por ejemplo: `https://plataforma-certificados-api.vercel.app`.

### Variables de entorno del Backend

En ese proyecto → **Settings** → **Environment Variables**:

| Variable      | Valor |
|---------------|--------|
| `PGHOST`      | host de Supabase (pooler) |
| `PGPORT`      | `6543` |
| `PGDATABASE`  | `postgres` |
| `PGUSER`      | usuario de la base |
| `PGPASSWORD`  | contraseña de la base |
| `CORS_ORIGIN` | URL del frontend (ver paso 3; ej. `https://tu-frontend.vercel.app`) |

Guarda y haz **Redeploy** si ya habías desplegado.

---

## 3. Proyecto en Vercel: Frontend

1. **Add New** → **Project** → importa **el mismo repositorio** otra vez.
2. **Nombre del proyecto**: por ejemplo `plataforma-certificados`.
3. **Root Directory**: **`frontend`**.
4. **Framework**: Vite (debería detectarse).
5. **Build Command**: `npm run build` | **Output Directory**: `dist`.

### Variable de entorno del Frontend

| Variable        | Valor |
|-----------------|--------|
| `VITE_API_URL`  | URL del backend (ej. `https://plataforma-certificados-api.vercel.app`) |

**Importante:** Sin barra final. La API está en la raíz del backend, por ejemplo `https://tu-api.vercel.app/api/cursos`.

6. **Deploy**.

---

## 4. Resumen de URLs

- **Frontend**: `https://tu-frontend.vercel.app`
- **API**: `https://tu-api.vercel.app/api`  
  Ejemplos:  
  - `https://tu-api.vercel.app/api/cursos`  
  - `https://tu-api.vercel.app/api/usuarios/registro`

Asegúrate de que en el backend `CORS_ORIGIN` sea exactamente la URL del frontend (con `https://`).

---

## 5. Desarrollo local

**Backend** (desde la raíz del repo):

```bash
cd backend
# Crea backend/.env con: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD (o copia desde Supabase)
npm install
npm run dev
```

El servidor arranca en el puerto 3001 y lee las variables desde `backend/.env`. Opcional: `CORS_ORIGIN=http://localhost:5173` para que el frontend en local pueda llamar a la API.

**Frontend** (desde la raíz del repo):

```bash
cd frontend
npm install
npm run dev
```

El frontend por defecto usa `VITE_API_URL` o `http://localhost:3001`. Crea un `.env` en `frontend/` con `VITE_API_URL=http://localhost:3001` si hace falta.

---

## 6. Subir cambios a GitHub

Después de reorganizar el proyecto:

```bash
git add .
git status   # revisa que solo estén frontend/, backend/, .gitignore, README, DEPLOYMENT_VERCEL.md
git commit -m "Reorganizar repo: frontend y backend separados para Vercel"
git push origin main
```

Cada proyecto en Vercel se redesplegará solo cuando cambien archivos en su **Root Directory** (`frontend` o `backend`).
