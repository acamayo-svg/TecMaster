import { obtenerDb } from './mongo.js'

const COLECCION = 'usuarios'

let promesaIndices = null

async function coleccionUsuarios() {
  const db = await obtenerDb()
  return db.collection(COLECCION)
}

/** Índice único por correo (relación embebida no aplica; es campo escalar indexado). */
async function asegurarIndices() {
  if (!promesaIndices) {
    promesaIndices = (async () => {
      const col = await coleccionUsuarios()
      await col.createIndex({ correo: 1 }, { unique: true })
    })()
  }
  await promesaIndices
}

function docAUsuarioInterno(doc) {
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    correo: doc.correo,
    contraseñaHash: doc.contraseñaHash,
    token: doc.token,
    fotoPerfil: doc.fotoPerfil ?? null,
    tipoDocumento: doc.tipoDocumento ?? null,
  }
}

export async function crearUsuario({
  id,
  nombre,
  correo,
  contraseñaHash,
  token,
  tipoDocumento,
}) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const idNormalizado = String(id).trim()
  const correoNorm = correo.trim().toLowerCase()
  const tipo = tipoDocumento || null

  const doc = {
    _id: idNormalizado,
    nombre: nombre.trim(),
    correo: correoNorm,
    contraseñaHash,
    token,
    fotoPerfil: null,
    tipoDocumento: tipo,
    documento: tipo ? { tipo, numero: idNormalizado } : { numero: idNormalizado },
    createdAt: new Date(),
  }

  await col.insertOne(doc)

  return {
    id: idNormalizado,
    nombre: doc.nombre,
    correo: correoNorm,
    token,
    fotoPerfil: null,
    tipoDocumento: tipo,
  }
}

export async function obtenerUsuarioPorCorreo(correo) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const doc = await col.findOne({ correo: correo.trim().toLowerCase() })
  return docAUsuarioInterno(doc)
}

export async function obtenerUsuarioPorToken(token) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const doc = await col.findOne({ token })
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    correo: doc.correo,
    token: doc.token,
    fotoPerfil: doc.fotoPerfil ?? null,
    tipoDocumento: doc.tipoDocumento ?? null,
  }
}

export async function actualizarTokenUsuario(idUsuario, token) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const id = String(idUsuario).trim()
  const r = await col.updateOne({ _id: id }, { $set: { token } })
  if (r.matchedCount === 0) return null
  const doc = await col.findOne({ _id: id })
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    correo: doc.correo,
    token: doc.token,
    fotoPerfil: doc.fotoPerfil ?? null,
    tipoDocumento: doc.tipoDocumento ?? null,
  }
}

export async function obtenerNombreCompletoUsuario(idUsuario) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const doc = await col.findOne(
    { _id: String(idUsuario).trim() },
    { projection: { nombre: 1 } }
  )
  return doc ? doc.nombre : null
}

export async function actualizarFotoPerfil(idUsuario, fotoPerfil) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const id = String(idUsuario).trim()
  const r = await col.updateOne({ _id: id }, { $set: { fotoPerfil: fotoPerfil || null } })
  if (r.matchedCount === 0) return null
  const doc = await col.findOne({ _id: id })
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    correo: doc.correo,
    token: doc.token,
    fotoPerfil: doc.fotoPerfil ?? null,
    tipoDocumento: doc.tipoDocumento ?? null,
  }
}

export async function actualizarNombreUsuario(idUsuario, nombre) {
  if (!nombre || String(nombre).trim().length === 0) return null
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const id = String(idUsuario).trim()
  const r = await col.updateOne({ _id: id }, { $set: { nombre: nombre.trim() } })
  if (r.matchedCount === 0) return null
  const doc = await col.findOne({ _id: id })
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    correo: doc.correo,
    token: doc.token,
    fotoPerfil: doc.fotoPerfil ?? null,
    tipoDocumento: doc.tipoDocumento ?? null,
  }
}

/** Misma forma que PostgreSQL para compatibilidad con servidor.js (cambiar contraseña). */
export async function obtenerUsuarioPorIdParaContraseña(idUsuario) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const doc = await col.findOne(
    { _id: String(idUsuario).trim() },
    { projection: { contraseñaHash: 1 } }
  )
  if (!doc) return null
  return {
    id: doc._id,
    contraseña_hash: doc.contraseñaHash,
  }
}

export async function actualizarContraseña(idUsuario, nuevaContraseñaHash) {
  await asegurarIndices()
  const col = await coleccionUsuarios()
  const r = await col.updateOne(
    { _id: String(idUsuario).trim() },
    { $set: { contraseñaHash: nuevaContraseñaHash } }
  )
  return r.matchedCount > 0
}
