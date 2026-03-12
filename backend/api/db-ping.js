/**
 * Endpoint de diagnóstico mínimo (sin Express).
 * Prueba: GET /api/db-ping
 */
import pg from 'pg'
const { Pool } = pg

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms))
}

export default async function handler(req, res) {
  const host = process.env.DB_HOST || process.env.PGHOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10)
  const database = process.env.DB_NAME || process.env.PGDATABASE || 'postgres'
  const user = process.env.DB_USER || process.env.PGUSER || 'postgres'
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || ''

  const isLocal = !process.env.VERCEL && (!host || host === 'localhost')

  const pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    connectionTimeoutMillis: 6000,
    statement_timeout: 6000,
    query_timeout: 6000,
    max: 1,
    idleTimeoutMillis: 1000,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  })

  try {
    await Promise.race([pool.query('SELECT 1 AS ok'), timeout(6500)])
    res.status(200).json({ ok: true })
  } catch (err) {
    res.status(503).json({ ok: false, detalle: err.message || String(err) })
  } finally {
    await pool.end().catch(() => {})
  }
}

