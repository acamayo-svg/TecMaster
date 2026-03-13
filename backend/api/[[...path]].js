/**
 * Única función serverless del backend en Vercel (plan Hobby permite máx. 12).
 * Todas las rutas /api/* pasan por Express. Vercel admite exportar la app directamente.
 */
import app from '../servidor/servidor.js'
export default app
