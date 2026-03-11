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

Necesitas una base PostgreSQL en la nube (ej. Supabase). La conexión usa **solo** estas variables (sin URL ni connection string):

- **Host**: el que te da tu proveedor (ej. `aws-1-us-east-1.pooler.supabase.com`)
- **Puerto**: el que indique (ej. `5432` o `6543`)
- **Base de datos**: normalmente `postgres`
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
| `PGHOST`      | host de la base (ej. el que da Supabase) |
| `PGPORT`      | puerto (ej. `5432` o `6543`) |
| `PGDATABASE`  | `postgres` |
| `PGUSER`      | usuario de la base |
| `PGPASSWORD`  | contraseña de la base |
| `CORS_ORIGIN` | URL del frontend (ver paso 3; ej. `https://tu-frontend.vercel.app`) |

No uses `DATABASE_URL`; el backend solo lee `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` y `PGPASSWORD`.

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
![1773109694729](image/DEPLOYMENT_VERCEL/1773109694729.png)![1773109696598](image/DEPLOYMENT_VERCEL/1773109696598.png)![1773109698906](image/DEPLOYMENT_VERCEL/1773109698906.png)![1773109701454](image/DEPLOYMENT_VERCEL/1773109701454.png)![1773109711243](image/DEPLOYMENT_VERCEL/1773109711243.png)![1773109712161](image/DEPLOYMENT_VERCEL/1773109712161.png)![1773109712377](image/DEPLOYMENT_VERCEL/1773109712377.png)![1773109712543](image/DEPLOYMENT_VERCEL/1773109712543.png)![1773109712726](image/DEPLOYMENT_VERCEL/1773109712726.png)![1773109712897](image/DEPLOYMENT_VERCEL/1773109712897.png)![1773109713062](image/DEPLOYMENT_VERCEL/1773109713062.png)![1773109713375](image/DEPLOYMENT_VERCEL/1773109713375.png)![1773109713509](image/DEPLOYMENT_VERCEL/1773109713509.png)![1773109720703](image/DEPLOYMENT_VERCEL/1773109720703.png)![1773109984644](image/DEPLOYMENT_VERCEL/1773109984644.png)![1773109985809](image/DEPLOYMENT_VERCEL/1773109985809.png)![1773109986157](image/DEPLOYMENT_VERCEL/1773109986157.png)![1773109986644](image/DEPLOYMENT_VERCEL/1773109986644.png)![1773109989237](image/DEPLOYMENT_VERCEL/1773109989237.png)![1773109989420](image/DEPLOYMENT_VERCEL/1773109989420.png)![1773109989603](image/DEPLOYMENT_VERCEL/1773109989603.png)![1773109989770](image/DEPLOYMENT_VERCEL/1773109989770.png)![1773109993699](image/DEPLOYMENT_VERCEL/1773109993699.png)![1773110003759](image/DEPLOYMENT_VERCEL/1773110003759.png)![1773110004159](image/DEPLOYMENT_VERCEL/1773110004159.png)![1773110004343](image/DEPLOYMENT_VERCEL/1773110004343.png)![1773110004809](image/DEPLOYMENT_VERCEL/1773110004809.png)![1773110004959](image/DEPLOYMENT_VERCEL/1773110004959.png)![1773110005246](image/DEPLOYMENT_VERCEL/1773110005246.png)![1773110005374](image/DEPLOYMENT_VERCEL/1773110005374.png)![1773110005664](image/DEPLOYMENT_VERCEL/1773110005664.png)![1773110005814](image/DEPLOYMENT_VERCEL/1773110005814.png)![1773110006140](image/DEPLOYMENT_VERCEL/1773110006140.png)![1773110006323](image/DEPLOYMENT_VERCEL/1773110006323.png)![1773110006473](image/DEPLOYMENT_VERCEL/1773110006473.png)![1773110006640](image/DEPLOYMENT_VERCEL/1773110006640.png)![1773110006783](image/DEPLOYMENT_VERCEL/1773110006783.png)![1773110006943](image/DEPLOYMENT_VERCEL/1773110006943.png)![1773110007072](image/DEPLOYMENT_VERCEL/1773110007072.png)![1773110007223](image/DEPLOYMENT_VERCEL/1773110007223.png)![1773110007356](image/DEPLOYMENT_VERCEL/1773110007356.png)![1773110007472](image/DEPLOYMENT_VERCEL/1773110007472.png)![1773110007610](image/DEPLOYMENT_VERCEL/1773110007610.png)![1773110007739](image/DEPLOYMENT_VERCEL/1773110007739.png)![1773110007850](image/DEPLOYMENT_VERCEL/1773110007850.png)![1773110008107](image/DEPLOYMENT_VERCEL/1773110008107.png)![1773110007988](image/DEPLOYMENT_VERCEL/1773110007988.png)![1773110008239](image/DEPLOYMENT_VERCEL/1773110008239.png)![1773110008390](image/DEPLOYMENT_VERCEL/1773110008390.png)![1773110008572](image/DEPLOYMENT_VERCEL/1773110008572.png)![1773110008804](image/DEPLOYMENT_VERCEL/1773110008804.png)![1773110544648](image/DEPLOYMENT_VERCEL/1773110544648.png)![1773110544469](image/DEPLOYMENT_VERCEL/1773110544469.png)![1773110544980](image/DEPLOYMENT_VERCEL/1773110544980.png)![1773110545264](image/DEPLOYMENT_VERCEL/1773110545264.png)![1773110545415](image/DEPLOYMENT_VERCEL/1773110545415.png)![1773110545531](image/DEPLOYMENT_VERCEL/1773110545531.png)![1773110545697](image/DEPLOYMENT_VERCEL/1773110545697.png)![1773110545799](image/DEPLOYMENT_VERCEL/1773110545799.png)![1773110545938](image/DEPLOYMENT_VERCEL/1773110545938.png)![1773110546080](image/DEPLOYMENT_VERCEL/1773110546080.png)![1773110546215](image/DEPLOYMENT_VERCEL/1773110546215.png)![1773110546510](image/DEPLOYMENT_VERCEL/1773110546510.png)![1773110546380](image/DEPLOYMENT_VERCEL/1773110546380.png)![1773110546648](image/DEPLOYMENT_VERCEL/1773110546648.png)![1773110546777](image/DEPLOYMENT_VERCEL/1773110546777.png)![1773110546923](image/DEPLOYMENT_VERCEL/1773110546923.png)![1773110547096](image/DEPLOYMENT_VERCEL/1773110547096.png)![1773110547279](image/DEPLOYMENT_VERCEL/1773110547279.png)![1773110547429](image/DEPLOYMENT_VERCEL/1773110547429.png)![1773110547598](image/DEPLOYMENT_VERCEL/1773110547598.png)