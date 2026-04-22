import { MongoClient } from 'mongodb'

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
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
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
