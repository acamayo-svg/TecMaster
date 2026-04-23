import {
  calcularHashGenesis,
  calcularHashInscripcion,
  calcularHashCursoCompletado,
  calcularHashCertificado,
} from './cadenaCertificados.js'
import { conectarMongo, obtenerDb, pingMongo } from './mongo.js'
import * as usuariosMongo from './usuariosMongo.js'

const CURSOS_SEMILLA = [
  {
    _id: '1',
    nombre: 'Desarrollo web con React',
    duracion: '24 horas',
    descripcion: 'Construye interfaces modernas con React, hooks y buenas prácticas.',
    categoria: 'Desarrollo',
    imagen: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600',
  },
  {
    _id: '2',
    nombre: 'JavaScript y Node.js',
    duracion: '30 horas',
    descripcion: 'ES6+, async/await, APIs y backend con Node.js.',
    categoria: 'Desarrollo',
    imagen: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600',
  },
  {
    _id: '3',
    nombre: 'Ethical Hacking y pentesting',
    duracion: '40 horas',
    descripcion: 'Fundamentos de ciberseguridad, pruebas de penetración y hardening.',
    categoria: 'Ciberseguridad',
    imagen: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600',
  },
  {
    _id: '4',
    nombre: 'Seguridad ofensiva',
    duracion: '35 horas',
    descripcion: 'Análisis de vulnerabilidades, explotación y reportes de seguridad.',
    categoria: 'Ciberseguridad',
    imagen: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
  },
  {
    _id: '5',
    nombre: 'Soporte técnico y help desk',
    duracion: '20 horas',
    descripcion: 'Atención al usuario, diagnóstico y resolución de incidencias.',
    categoria: 'Soporte técnico',
    imagen: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
  },
  {
    _id: '6',
    nombre: 'Administración de sistemas',
    duracion: '28 horas',
    descripcion: 'Windows/Linux, usuarios, permisos y mantenimiento.',
    categoria: 'Soporte técnico',
    imagen: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
  },
  {
    _id: '7',
    nombre: 'Redes y TCP/IP',
    duracion: '32 horas',
    descripcion: 'Protocolos, direccionamiento, subredes y troubleshooting.',
    categoria: 'Redes',
    imagen: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600',
  },
  {
    _id: '8',
    nombre: 'Infraestructura y cloud',
    duracion: '26 horas',
    descripcion: 'Servidores, virtualización e introducción a la nube.',
    categoria: 'Redes',
    imagen: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
  },
]

function docACurso(doc) {
  if (!doc) return null
  return {
    id: doc._id,
    nombre: doc.nombre,
    duracion: doc.duracion,
    descripcion: doc.descripcion,
    categoria: doc.categoria || 'General',
    imagen: doc.imagen || null,
  }
}

/** Inscripción en formato que espera el resto del backend (antes filaAInscripcion). */
function mongoInscripcionToApi(ins, imagenCurso = null) {
  if (!ins) return null
  return {
    id: ins._id,
    idUsuario: ins.idUsuario,
    idCurso: ins.idCurso,
    nombreCurso: ins.nombreCurso,
    estado: ins.estado,
    progreso: ins.progreso ?? 0,
    idCertificado: ins.idCertificado ?? null,
    fechaInscripcion: ins.fechaInscripcion,
    fechaAprobacion: ins.fechaAprobacion ?? null,
    imagenCurso: imagenCurso ?? ins.imagenCurso ?? null,
    hashGenesis: ins.hashGenesis ?? null,
    hashInscripcion: ins.hashInscripcion ?? null,
    hashCursoCompletado: ins.hashCursoCompletado ?? null,
  }
}

function docACertificado(doc) {
  if (!doc) return null
  return {
    id: doc._id,
    idInscripcion: doc.idInscripcion,
    idUsuario: doc.idUsuario,
    nombreCurso: doc.nombreCurso,
    codigoVerificacion: doc.codigoVerificacion,
    fechaEmision: doc.fechaEmision,
    hashCertificado: doc.hashCertificado ?? null,
  }
}

export async function pingDb() {
  await pingMongo()
  return true
}

/** Índices y datos iniciales (antes DDL PostgreSQL). */
export async function inicializarTablas() {
  await conectarMongo()
  const db = await obtenerDb()
  const certificados = db.collection('certificados')
  const inscripciones = db.collection('inscripciones')
  const cursos = db.collection('cursos')

  try {
    await certificados.createIndex({ codigoVerificacion: 1 }, { unique: true })
  } catch (err) {
    console.warn('[Mongo] índice certificados.codigoVerificacion:', err?.message || err)
  }
  try {
    await inscripciones.createIndex({ idUsuario: 1, idCurso: 1 }, { unique: true })
  } catch (err) {
    console.warn('[Mongo] índice inscripciones usuario+curso:', err?.message || err)
  }

  const n = await cursos.countDocuments()
  if (n === 0) {
    await cursos.insertMany(CURSOS_SEMILLA)
    console.log('Cursos iniciales insertados en MongoDB.')
  }
  console.log('MongoDB listo (colecciones cursos, inscripciones, certificados, usuarios).')
}

export async function obtenerCursosDisponibles() {
  const db = await obtenerDb()
  const docs = await db
    .collection('cursos')
    .find({})
    .sort({ categoria: 1, _id: 1 })
    .toArray()
  return docs.map(docACurso)
}

export async function obtenerCursoPorId(id) {
  const db = await obtenerDb()
  const doc = await db.collection('cursos').findOne({ _id: String(id) })
  return docACurso(doc)
}

export async function obtenerUsuarioPorCorreo(correo) {
  return usuariosMongo.obtenerUsuarioPorCorreo(correo)
}

export async function obtenerUsuarioPorToken(token) {
  return usuariosMongo.obtenerUsuarioPorToken(token)
}

export async function crearUsuario(payload) {
  return usuariosMongo.crearUsuario(payload)
}

export async function actualizarTokenUsuario(idUsuario, token) {
  return usuariosMongo.actualizarTokenUsuario(idUsuario, token)
}

export async function obtenerInscripcionesPorUsuario(idUsuario) {
  const db = await obtenerDb()
  const rows = await db
    .collection('inscripciones')
    .aggregate([
      { $match: { idUsuario } },
      { $sort: { fechaInscripcion: -1 } },
      {
        $lookup: {
          from: 'cursos',
          let: { cid: '$idCurso' },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$cid'] } } }, { $project: { imagen: 1 } }],
          as: 'cursoDocs',
        },
      },
      {
        $addFields: {
          imagenCurso: { $ifNull: [{ $arrayElemAt: ['$cursoDocs.imagen', 0] }, null] },
        },
      },
      { $project: { cursoDocs: 0 } },
    ])
    .toArray()
  return rows.map((row) => mongoInscripcionToApi(row, row.imagenCurso))
}

export async function obtenerInscripcion(idUsuario, idCurso) {
  const db = await obtenerDb()
  const ins = await db.collection('inscripciones').findOne({ idUsuario, idCurso: String(idCurso) })
  if (!ins) return null
  const curso = await db.collection('cursos').findOne({ _id: String(idCurso) }, { projection: { imagen: 1 } })
  return mongoInscripcionToApi(ins, curso?.imagen || null)
}

export async function crearInscripcion({ idUsuario, idCurso, nombreCurso, nombreCompleto }) {
  const db = await obtenerDb()
  const id = `insc-${Date.now()}`
  const fechaInscripcion = new Date().toISOString().slice(0, 10)
  const hashGenesis = calcularHashGenesis(nombreCompleto, idUsuario, idCurso, fechaInscripcion)
  const hashInscripcion = calcularHashInscripcion(id, fechaInscripcion, hashGenesis)
  await db.collection('inscripciones').insertOne({
    _id: id,
    idUsuario,
    idCurso: String(idCurso),
    nombreCurso,
    estado: 'inscrito',
    progreso: 0,
    idCertificado: null,
    fechaInscripcion,
    fechaAprobacion: null,
    hashGenesis,
    hashInscripcion,
    hashCursoCompletado: null,
  })
  return {
    id,
    idUsuario,
    idCurso,
    nombreCurso,
    estado: 'inscrito',
    progreso: 0,
    idCertificado: null,
    fechaInscripcion,
  }
}

export async function aprobarInscripcion(idInscripcion, idUsuario) {
  const db = await obtenerDb()
  const insCol = db.collection('inscripciones')
  const certCol = db.collection('certificados')

  const ins = await insCol.findOne({ _id: idInscripcion, idUsuario })
  if (!ins) return null

  const fechaAprobacion = new Date().toISOString().slice(0, 10)
  const tieneCadena = Boolean(ins.hashInscripcion)
  let hashCursoCompletado = null
  let hashCertificado = null
  if (tieneCadena) {
    hashCursoCompletado = calcularHashCursoCompletado(idInscripcion, fechaAprobacion, ins.hashInscripcion)
  }

  const numCert = (await certCol.countDocuments()) + 1
  const codigoVerificacion = `CERT-${new Date().getFullYear()}-${String(numCert).padStart(3, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
  const idCertificado = `cert-${ins.idCurso}-${Date.now()}`
  if (hashCursoCompletado) {
    hashCertificado = calcularHashCertificado(idCertificado, codigoVerificacion, fechaAprobacion, hashCursoCompletado)
  }

  await insCol.updateOne(
    { _id: idInscripcion },
    {
      $set: {
        estado: 'aprobado',
        progreso: 100,
        idCertificado,
        fechaAprobacion,
        hashCursoCompletado,
      },
    }
  )

  await certCol.insertOne({
    _id: idCertificado,
    idInscripcion,
    idUsuario,
    nombreCurso: ins.nombreCurso,
    codigoVerificacion,
    fechaEmision: fechaAprobacion,
    hashCertificado,
  })

  const insActualizada = await insCol.findOne({ _id: idInscripcion })
  const certDoc = await certCol.findOne({ _id: idCertificado })
  return {
    inscripcion: mongoInscripcionToApi(insActualizada, null),
    certificado: docACertificado(certDoc),
  }
}

export async function obtenerCertificadosPorUsuario(idUsuario) {
  const db = await obtenerDb()
  const docs = await db
    .collection('certificados')
    .find({ idUsuario })
    .sort({ fechaEmision: -1 })
    .toArray()
  return docs.map(docACertificado)
}

export async function obtenerCertificadoPorId(id) {
  const db = await obtenerDb()
  const doc = await db.collection('certificados').findOne({ _id: id })
  return docACertificado(doc)
}

export async function obtenerCertificadoPorCodigo(codigo) {
  const normalizado = (codigo || '').toString().trim().toUpperCase()
  const db = await obtenerDb()
  const doc = await db.collection('certificados').findOne({ codigoVerificacion: normalizado })
  return docACertificado(doc)
}

export async function obtenerInscripcionConHashes(idInscripcion) {
  const db = await obtenerDb()
  const ins = await db.collection('inscripciones').findOne({ _id: idInscripcion })
  return mongoInscripcionToApi(ins, null)
}

export async function obtenerNombreCompletoUsuario(idUsuario) {
  return usuariosMongo.obtenerNombreCompletoUsuario(idUsuario)
}

export async function actualizarFotoPerfil(idUsuario, fotoPerfil) {
  return usuariosMongo.actualizarFotoPerfil(idUsuario, fotoPerfil)
}

export async function actualizarNombreUsuario(idUsuario, nombre) {
  return usuariosMongo.actualizarNombreUsuario(idUsuario, nombre)
}

export async function obtenerUsuarioPorIdParaContraseña(idUsuario) {
  return usuariosMongo.obtenerUsuarioPorIdParaContraseña(idUsuario)
}

export async function actualizarContraseña(idUsuario, nuevaContraseñaHash) {
  return usuariosMongo.actualizarContraseña(idUsuario, nuevaContraseñaHash)
}

export async function actualizarProgresoInscripcion(idInscripcion, idUsuario, progreso) {
  const num = Math.min(100, Math.max(0, parseInt(progreso, 10) || 0))
  const db = await obtenerDb()
  const r = await db
    .collection('inscripciones')
    .updateOne({ _id: idInscripcion, idUsuario }, { $set: { progreso: num } })
  return r.matchedCount > 0
}
