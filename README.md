# Plataforma de certificados — Tec Master

Proyecto de cursos con certificados (frontend React + backend Express + PostgreSQL), preparado para desplegar en **Vercel** con frontend y API en **dos proyectos separados**.

## Estructura del repositorio

| Carpeta     | Contenido                          | Uso en Vercel        |
|------------|-------------------------------------|------------------------|
| **frontend/** | App React (Vite), páginas y estilos | Un proyecto → Root: `frontend` |
| **backend/**  | API Express (Node), servidor y DB   | Otro proyecto → Root: `backend`  |

- **Frontend**: solo construye y sirve la SPA; necesita la variable `VITE_API_URL` con la URL del backend.
- **Backend**: sirve la API bajo `/api` como función serverless; necesita variables de PostgreSQL y `CORS_ORIGIN` (URL del frontend).

## Cómo desplegar

Sigue la guía **[DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md)** para:

1. Crear la base de datos (ej. Supabase).
2. Crear el proyecto de Vercel para el **backend** (Root: `backend`) y configurar variables de entorno.
3. Crear el proyecto de Vercel para el **frontend** (Root: `frontend`) y configurar `VITE_API_URL`.

## Desarrollo local

- **Backend**: `cd backend && npm install && npm run dev` (requiere PostgreSQL y `backend/servidor/.env`).
- **Frontend**: `cd frontend && npm install && npm run dev` (por defecto usa `http://localhost:3001` como API si no hay `VITE_API_URL`).
