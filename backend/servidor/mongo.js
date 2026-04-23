import dns from 'node:dns'
import { MongoClient, ServerApiVersion } from 'mongodb'

// Render/Vercel + Atlas: priorizar IPv4 evita fallos TLS intermitentes (alert 80) con SRV/IPv6.
if (process.env.MONGO_DNS_IPV4FIRST !== 'false') {
  try {
    dns.setDefaultResultOrder('ipv4first')
  } catch {
    /* Node antiguo sin esta API */
  }
}

// Render u otros hosts a veces usan MONGO_URI; local/.env.ejemplo usa MONGODB_URI
const uri = String(process.env.MONGODB_URI || process.env.MONGO_URI || '').trim()
const nombreDb = process.env.MONGODB_DB || 'tecmaster'

let cliente = null
let promesaConexion = null

function crearErrorSinUri() {
  return new Error(
    'Falta cadena de conexión MongoDB. Define MONGODB_URI o MONGO_URI (Atlas) en el entorno.'
  )
}

export function mongoConfigurado() {
  return Boolean(uri)
}

export async function conectarMongo() {
  if (!uri) throw crearErrorSinUri()
  if (cliente) return cliente
  if (promesaConexion) return promesaConexion

  promesaConexion = (async () => {
    const nuevoCliente = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 15000,
    })
    await nuevoCliente.connect()
    cliente = nuevoCliente
    return cliente
  })().finally(() => {
    promesaConexion = null
  })

  return promesaConexion
}

export async function obtenerDb() {
  const c = await conectarMongo()
  return c.db(nombreDb)
}

export async function pingMongo() {
  const db = await obtenerDb()
  await db.command({ ping: 1 })
  return true
}

export function obtenerNombreDbMongo() {
  return nombreDb
}
