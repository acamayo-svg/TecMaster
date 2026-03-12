import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  inicializarTablas,
  obtenerUsuarioPorCorreo,
  obtenerUsuarioPorToken,
  crearUsuario,
  actualizarTokenUsuario,
  actualizarFotoPerfil,
  actualizarNombreUsuario,
  obtenerUsuarioPorIdParaContraseña,
  actualizarContraseña,
  actualizarProgresoInscripcion,
  obtenerCursosDisponibles,
  obtenerCursoPorId,
  obtenerInscripcionesPorUsuario,
  obtenerInscripcion,
  crearInscripcion,
  aprobarInscripcion,
  obtenerCertificadosPorUsuario,
  obtenerCertificadoPorId,
  obtenerCertificadoPorCodigo,
  obtenerNombreCompletoUsuario,
  obtenerInscripcionConHashes,
} from './baseDeDatos.js'
import { validarCadenaCertificado, obtenerDetalleCadena } from './cadenaCertificados.js'

const app = express()
const PUERTO = process.env.PORT || 3001
const ORIGEN_CORS = process.env.CORS_ORIGIN || 'http://localhost:5173'

app.use(cors({ origin: ORIGEN_CORS, credentials: true }))
app.use(express.json())

// Endpoints sin BD: responden al instante (evitan 504 en Vercel)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, mensaje: 'API Tec Master' })
})
app.get('/api', (req, res) => {
  res.json({ ok: true, mensaje: 'API Tec Master' })
})
app.get('/', (req, res) => {
  res.json({ ok: true, mensaje: 'API Tec Master' })
})

// BD: inicializar solo cuando una ruta la necesite (no en middleware global)
let dbReady = null
async function ensureDb() {
  if (dbReady === true) return
  if (dbReady && dbReady.catch) {
    await dbReady
    return
  }
  dbReady = inicializarTablas()
    .then(() => { dbReady = true })
    .catch((err) => { dbReady = null; throw err })
  await dbReady
}

async function requireDb(req, res, next) {
  try {
    await ensureDb()
    next()
  } catch (err) {
    console.error('Error al conectar con PostgreSQL:', err.message)
    if (!res.headersSent) res.status(503).json({ mensaje: 'Base de datos no disponible.' })
  }
}

// Solo las rutas que siguen usan la BD; /, /api, /api/health no pasan por aquí
app.use(requireDb)

function tokenAleatorio() {
  return crypto.randomBytes(24).toString('hex')
}

function middlewareAuth(req, res, next) {
  ;(async () => {
    try {
      const cabecera = req.headers.authorization
      const token = cabecera && cabecera.startsWith('Bearer ') ? cabecera.slice(7) : null
      if (!token) {
        return res.status(401).json({ error: 'No autorizado. Inicia sesión.' })
      }
      const usuario = await obtenerUsuarioPorToken(token)
      if (!usuario) {
        return res.status(401).json({ error: 'Sesión inválida. Vuelve a iniciar sesión.' })
      }
      req.usuario = usuario
      next()
    } catch (err) {
      next(err)
    }
  })()
}

// Lista de cursos disponibles desde la base de datos (público)
app.get('/api/cursos', async (req, res) => {
  try {
    const cursos = await obtenerCursosDisponibles()
    res.json(cursos)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar cursos.' })
  }
})

// Registro
app.post('/api/usuarios/registro', async (req, res) => {
  try {
    const { nombre, correo, contraseña, cedula } = req.body || {}
    if (!nombre || !correo || !contraseña || !cedula) {
      return res.status(400).json({ error: 'Faltan nombre, correo, contraseña o identificación.' })
    }

    const cedulaNormalizada = String(cedula).trim()
    if (!cedulaNormalizada) {
      return res.status(400).json({ error: 'La identificación no puede estar vacía.' })
    }
    if (cedulaNormalizada.length > 64) {
      return res.status(400).json({ error: 'La identificación es demasiado larga (máx. 64 caracteres).' })
    }

    if (contraseña.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
    }
    const existente = await obtenerUsuarioPorCorreo(correo)
    if (existente) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
    }

    const existenteId = await obtenerUsuarioPorIdParaContraseña(cedulaNormalizada)
    if (existenteId) {
      return res.status(409).json({ error: 'Ya existe una cuenta con esa identificación.' })
    }

    const contraseñaHash = await bcrypt.hash(contraseña, 10)
    const token = tokenAleatorio()
    const usuario = await crearUsuario({ id: cedulaNormalizada, nombre, correo, contraseñaHash, token })
    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      token: usuario.token,
      fotoPerfil: usuario.fotoPerfil ?? null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar.' })
  }
})

// Iniciar sesión
app.post('/api/usuarios/iniciar-sesion', async (req, res) => {
  try {
    const { correo, contraseña } = req.body || {}
    if (!correo || !contraseña) {
      return res.status(400).json({ error: 'Faltan correo o contraseña.' })
    }
    const usuario = await obtenerUsuarioPorCorreo(correo)
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }
    const coincide = await bcrypt.compare(contraseña, usuario.contraseñaHash)
    if (!coincide) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
    }
    const token = tokenAleatorio()
    const actualizado = await actualizarTokenUsuario(usuario.id, token)
    res.json({
      id: actualizado.id,
      nombre: actualizado.nombre,
      correo: actualizado.correo,
      token: actualizado.token,
      fotoPerfil: actualizado.fotoPerfil ?? null,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al iniciar sesión.' })
  }
})

// Mis inscripciones (cursos del usuario, con imagen del curso)
app.get('/api/mi-perfil/cursos', middlewareAuth, async (req, res) => {
  try {
    const inscripciones = await obtenerInscripcionesPorUsuario(req.usuario.id)
    res.json(inscripciones)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar cursos.' })
  }
})

// Actualizar perfil (foto y/o nombre)
app.patch('/api/mi-perfil', middlewareAuth, async (req, res) => {
  try {
    const { fotoPerfil, nombre } = req.body || {}
    const idUsuario = req.usuario.id
    let actualizado = null
    if (fotoPerfil !== undefined) {
      actualizado = await actualizarFotoPerfil(idUsuario, fotoPerfil)
      if (!actualizado) {
        return res.status(500).json({ error: 'Error al actualizar foto.' })
      }
    }
    if (nombre !== undefined) {
      actualizado = await actualizarNombreUsuario(idUsuario, nombre)
      if (!actualizado) {
        return res.status(500).json({ error: 'Error al actualizar nombre.' })
      }
    }
    if (!actualizado) {
      return res.status(400).json({ error: 'Indica fotoPerfil o nombre para actualizar.' })
    }
    res.json({ usuario: actualizado })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar perfil.' })
  }
})

// Cambiar contraseña
app.post('/api/mi-perfil/cambiar-contrasena', middlewareAuth, async (req, res) => {
  try {
    const { contraseñaActual, contraseñaNueva } = req.body || {}
    if (!contraseñaActual || !contraseñaNueva) {
      return res.status(400).json({ error: 'Faltan contraseña actual o nueva.' })
    }
    if (contraseñaNueva.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' })
    }
    const usuario = await obtenerUsuarioPorIdParaContraseña(req.usuario.id)
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' })
    }
    const coincide = await bcrypt.compare(contraseñaActual, usuario.contraseña_hash)
    if (!coincide) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta.' })
    }
    const nuevaHash = await bcrypt.hash(contraseñaNueva, 10)
    await actualizarContraseña(req.usuario.id, nuevaHash)
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cambiar contraseña.' })
  }
})

// Actualizar progreso de una inscripción (solo el dueño)
app.patch('/api/inscripciones/:id', middlewareAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { progreso } = req.body || {}
    const actualizado = await actualizarProgresoInscripcion(id, req.usuario.id, progreso)
    if (!actualizado) {
      return res.status(404).json({ error: 'Inscripción no encontrada o no tienes permiso.' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al actualizar progreso.' })
  }
})

// Inscribirme a un curso
app.post('/api/cursos/inscribir', middlewareAuth, async (req, res) => {
  try {
    const { idCurso } = req.body || {}
    if (!idCurso) {
      return res.status(400).json({ error: 'Falta idCurso.' })
    }
    const curso = await obtenerCursoPorId(idCurso)
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado.' })
    }
    const yaInscrito = await obtenerInscripcion(req.usuario.id, idCurso)
    if (yaInscrito) {
      return res.status(409).json({ error: 'Ya estás inscrito en este curso.' })
    }
    const inscripcion = await crearInscripcion({
      idUsuario: req.usuario.id,
      idCurso: curso.id,
      nombreCurso: curso.nombre,
      nombreCompleto: req.usuario.nombre,
    })
    res.status(201).json(inscripcion)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al inscribirse.' })
  }
})

// Aprobar curso y generar certificado
app.post('/api/cursos/:idCurso/aprobar', middlewareAuth, async (req, res) => {
  try {
    const { idCurso } = req.params
    const inscripciones = await obtenerInscripcionesPorUsuario(req.usuario.id)
    const inscripcion = inscripciones.find((i) => i.idCurso === idCurso)
    if (!inscripcion) {
      return res.status(404).json({ error: 'No estás inscrito en este curso.' })
    }
    if (inscripcion.estado === 'aprobado') {
      const certificado = await obtenerCertificadoPorId(inscripcion.idCertificado)
      return res.json({ inscripcion, certificado })
    }
    const resultado = await aprobarInscripcion(inscripcion.id, req.usuario.id)
    if (!resultado) {
      return res.status(500).json({ error: 'Error al aprobar.' })
    }
    res.json(resultado)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al aprobar.' })
  }
})

// Mis certificados
app.get('/api/mi-perfil/certificados', middlewareAuth, async (req, res) => {
  try {
    const certificados = await obtenerCertificadosPorUsuario(req.usuario.id)
    res.json(certificados)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar certificados.' })
  }
})

// Ver certificado por id (para el titular)
app.get('/api/certificados/:id', middlewareAuth, async (req, res) => {
  try {
    const cert = await obtenerCertificadoPorId(req.params.id)
    if (!cert) {
      return res.status(404).json({ error: 'Certificado no encontrado.' })
    }
    if (cert.idUsuario !== req.usuario.id) {
      return res.status(403).json({ error: 'No tienes acceso a este certificado.' })
    }
    const nombreCompleto = await obtenerNombreCompletoUsuario(cert.idUsuario)
    let cadenaValida = false
    if (cert.hashCertificado) {
      const inscripcion = await obtenerInscripcionConHashes(cert.idInscripcion)
      const resultado = validarCadenaCertificado(inscripcion, cert, nombreCompleto)
      cadenaValida = resultado.valido
    }
    res.json({ ...cert, nombreCompleto, valido: true, cadenaValida })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al cargar certificado.' })
  }
})

// Verificar certificado por código (público, para empresas)
app.get('/api/certificados/verificar/:codigo', async (req, res) => {
  try {
    const cert = await obtenerCertificadoPorCodigo(req.params.codigo)
    if (!cert) {
      return res.json({ valido: false })
    }
    const nombreCompleto = await obtenerNombreCompletoUsuario(cert.idUsuario)
    let cadenaValida = false
    let cadena = []
    let hashCertificado = cert.hashCertificado ?? null
    if (cert.hashCertificado) {
      const inscripcion = await obtenerInscripcionConHashes(cert.idInscripcion)
      const resultado = validarCadenaCertificado(inscripcion, cert, nombreCompleto)
      cadenaValida = resultado.valido
      cadena = obtenerDetalleCadena(inscripcion, cert, nombreCompleto)
    }
    res.json({
      valido: true,
      id: cert.id,
      nombreCompleto,
      nombreCurso: cert.nombreCurso,
      fechaEmision: cert.fechaEmision,
      codigoVerificacion: cert.codigoVerificacion,
      hashCertificado,
      cadenaValida,
      cadena,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al verificar.' })
  }
})

// Iniciar: crear tablas si no existen y levantar servidor
async function iniciar() {
  try {
    await inicializarTablas()
    console.log('Tablas de PostgreSQL listas.')
  } catch (err) {
    console.error('Error al conectar o crear tablas en PostgreSQL:', err.message)
    console.error('Comprueba que PostgreSQL esté en marcha y que la base de datos exista.')
    process.exit(1)
  }
  app.listen(PUERTO, () => {
    console.log(`Servidor en puerto ${PUERTO}`)
  })
}

// En Vercel no hacemos listen; la app se usa como serverless
if (!process.env.VERCEL) {
  iniciar()
}

export default app
