import pg from 'pg'
const { Pool } = pg

let pool = null

export function getPool() {
  if (pool) return pool

  const host = process.env.DB_HOST || process.env.PGHOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10)
  const database = process.env.DB_NAME || process.env.PGDATABASE || 'postgres'
  const user = process.env.DB_USER || process.env.PGUSER || 'postgres'
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || ''
  const isLocal = !process.env.VERCEL && (!host || host === 'localhost')

  pool = new Pool({
    host,
    port,
    database,
    user,
    password,
    connectionTimeoutMillis: 6000,
    statement_timeout: 6000,
    query_timeout: 6000,
    max: 1,
    idleTimeoutMillis: 10_000,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  })

  return pool
}

