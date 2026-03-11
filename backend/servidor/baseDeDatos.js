import pg from 'pg'
import {
  calcularHashGenesis,
  calcularHashInscripcion,
  calcularHashCursoCompletado,
  calcularHashCertificado,
} from './cadenaCertificados.js'

const { Pool } = pg

const host = process.env.PGHOST || 'localhost'
const port = parseInt(process.env.PGPORT || '5432', 10)
const database = process.env.PGDATABASE || 'certificados'
const user = process.env.PGUSER || 'postgres'
const password = process.env.PGPASSWORD || 'postgres'

const pool = new Pool({
  host,
  port,
  database,
  user,
  password,
  connectionTimeoutMillis: 15000,
  ssl: host === 'localhost' ? false : { rejectUnauthorized: false },
})

// Crear tablas si no existen (al iniciar)
export async function inicializarTablas() {
  const cliente = await pool.connect()
  try {
    await cliente.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(64) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        correo VARCHAR(255) NOT NULL UNIQUE,
        contraseña_hash VARCHAR(255) NOT NULL,
        token VARCHAR(128),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS cursos (
        id VARCHAR(32) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        duracion VARCHAR(64) NOT NULL,
        descripcion TEXT,
        categoria VARCHAR(64) DEFAULT 'General'
      );
      CREATE TABLE IF NOT EXISTS inscripciones (
        id VARCHAR(64) PRIMARY KEY,
        id_usuario VARCHAR(64) NOT NULL,
        id_curso VARCHAR(32) NOT NULL,
        nombre_curso VARCHAR(255) NOT NULL,
        estado VARCHAR(32) NOT NULL DEFAULT 'inscrito',
        progreso INTEGER NOT NULL DEFAULT 0,
        id_certificado VARCHAR(64),
        fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
        fecha_aprobacion DATE,
        UNIQUE(id_usuario, id_curso)
      );
      CREATE TABLE IF NOT EXISTS certificados (
        id VARCHAR(64) PRIMARY KEY,
        id_inscripcion VARCHAR(64) NOT NULL,
        id_usuario VARCHAR(64) NOT NULL,
        nombre_curso VARCHAR(255) NOT NULL,
        codigo_verificacion VARCHAR(64) NOT NULL UNIQUE,
        fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE
      );
      CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios(LOWER(correo));
      CREATE INDEX IF NOT EXISTS idx_usuarios_token ON usuarios(token);
      CREATE INDEX IF NOT EXISTS idx_inscripciones_usuario ON inscripciones(id_usuario);
      CREATE INDEX IF NOT EXISTS idx_certificados_usuario ON certificados(id_usuario);
      CREATE INDEX IF NOT EXISTS idx_certificados_codigo ON certificados(UPPER(codigo_verificacion));
    `)
    try {
      await cliente.query(`ALTER TABLE cursos ADD COLUMN categoria VARCHAR(64) DEFAULT 'General';`)
    } catch (_) { /* la columna ya existe */ }
    try {
      await cliente.query(`ALTER TABLE cursos ADD COLUMN imagen TEXT;`)
    } catch (_) { /* la columna ya existe */ }
    try {
      await cliente.query(`ALTER TABLE usuarios ADD COLUMN foto_perfil TEXT;`)
    } catch (_) { /* la columna ya existe */ }
    try {
      await cliente.query(`ALTER TABLE inscripciones ADD COLUMN hash_genesis VARCHAR(64);`)
    } catch (_) { /* ya existe */ }
    try {
      await cliente.query(`ALTER TABLE inscripciones ADD COLUMN hash_inscripcion VARCHAR(64);`)
    } catch (_) { /* ya existe */ }
    try {
      await cliente.query(`ALTER TABLE inscripciones ADD COLUMN hash_curso_completado VARCHAR(64);`)
    } catch (_) { /* ya existe */ }
    try {
      await cliente.query(`ALTER TABLE certificados ADD COLUMN hash_certificado VARCHAR(64);`)
    } catch (_) { /* ya existe */ }
    const countCursos = await cliente.query('SELECT COUNT(*)::int AS n FROM cursos')
    if (countCursos.rows[0].n === 0) {
      await cliente.query(`
        INSERT INTO cursos (id, nombre, duracion, descripcion, categoria, imagen) VALUES
        ('1', 'Desarrollo web con React', '24 horas', 'Construye interfaces modernas con React, hooks y buenas prácticas.', 'Desarrollo', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'),
        ('2', 'JavaScript y Node.js', '30 horas', 'ES6+, async/await, APIs y backend con Node.js.', 'Desarrollo', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600'),
        ('3', 'Ethical Hacking y pentesting', '40 horas', 'Fundamentos de ciberseguridad, pruebas de penetración y hardening.', 'Ciberseguridad', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600'),
        ('4', 'Seguridad ofensiva', '35 horas', 'Análisis de vulnerabilidades, explotación y reportes de seguridad.', 'Ciberseguridad', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600'),
        ('5', 'Soporte técnico y help desk', '20 horas', 'Atención al usuario, diagnóstico y resolución de incidencias.', 'Soporte técnico', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600'),
        ('6', 'Administración de sistemas', '28 horas', 'Windows/Linux, usuarios, permisos y mantenimiento.', 'Soporte técnico', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600'),
        ('7', 'Redes y TCP/IP', '32 horas', 'Protocolos, direccionamiento, subredes y troubleshooting.', 'Redes', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600'),
        ('8', 'Infraestructura y cloud', '26 horas', 'Servidores, virtualización e introducción a la nube.', 'Redes', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600')
      `)
    }
  } finally {
    cliente.release()
  }
}

function filaACurso(fila) {
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    duracion: fila.duracion,
    descripcion: fila.descripcion,
    categoria: fila.categoria || 'General',
    imagen: fila.imagen || null,
  }
}

export async function obtenerCursosDisponibles() {
  const res = await pool.query(
    'SELECT id, nombre, duracion, descripcion, categoria, imagen FROM cursos ORDER BY categoria, id'
  )
  return res.rows.map(filaACurso)
}

export async function obtenerCursoPorId(id) {
  const res = await pool.query(
    'SELECT id, nombre, duracion, descripcion, categoria, imagen FROM cursos WHERE id = $1',
    [id]
  )
  return filaACurso(res.rows[0]) || null
}

function filaAUsuario(fila) {
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    contraseñaHash: fila.contraseña_hash,
    token: fila.token,
    fotoPerfil: fila.foto_perfil || null,
  }
}

function filaAInscripcion(fila) {
  if (!fila) return null
  return {
    id: fila.id,
    idUsuario: fila.id_usuario,
    idCurso: fila.id_curso,
    nombreCurso: fila.nombre_curso,
    estado: fila.estado,
    progreso: fila.progreso ?? 0,
    idCertificado: fila.id_certificado,
    fechaInscripcion: fila.fecha_inscripcion,
    fechaAprobacion: fila.fecha_aprobacion,
    imagenCurso: fila.imagen_curso || null,
    hashGenesis: fila.hash_genesis || null,
    hashInscripcion: fila.hash_inscripcion || null,
    hashCursoCompletado: fila.hash_curso_completado || null,
  }
}

function filaACertificado(fila) {
  if (!fila) return null
  return {
    id: fila.id,
    idInscripcion: fila.id_inscripcion,
    idUsuario: fila.id_usuario,
    nombreCurso: fila.nombre_curso,
    codigoVerificacion: fila.codigo_verificacion,
    fechaEmision: fila.fecha_emision,
    hashCertificado: fila.hash_certificado || null,
  }
}

export async function obtenerUsuarioPorCorreo(correo) {
  const res = await pool.query(
    'SELECT id, nombre, correo, contraseña_hash, token, foto_perfil FROM usuarios WHERE LOWER(correo) = LOWER($1)',
    [correo]
  )
  return filaAUsuario(res.rows[0]) || null
}

export async function obtenerUsuarioPorToken(token) {
  const res = await pool.query(
    'SELECT id, nombre, correo, token, foto_perfil FROM usuarios WHERE token = $1',
    [token]
  )
  const fila = res.rows[0]
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    token: fila.token,
    fotoPerfil: fila.foto_perfil || null,
  }
}

export async function crearUsuario({ id, nombre, correo, contraseñaHash, token }) {
  const idNormalizado = String(id).trim()
  await pool.query(
    `INSERT INTO usuarios (id, nombre, correo, contraseña_hash, token)
     VALUES ($1, $2, $3, $4, $5)`,
    [idNormalizado, nombre.trim(), correo.trim().toLowerCase(), contraseñaHash, token]
  )
  return {
    id: idNormalizado,
    nombre: nombre.trim(),
    correo: correo.trim().toLowerCase(),
    token,
    fotoPerfil: null,
  }
}

export async function actualizarTokenUsuario(idUsuario, token) {
  const res = await pool.query(
    'UPDATE usuarios SET token = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
    [token, idUsuario]
  )
  const fila = res.rows[0]
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    token: fila.token,
    fotoPerfil: fila.foto_perfil || null,
  }
}

export async function obtenerInscripcionesPorUsuario(idUsuario) {
  const res = await pool.query(
    `SELECT i.id, i.id_usuario, i.id_curso, i.nombre_curso, i.estado, i.progreso,
            i.id_certificado, i.fecha_inscripcion, i.fecha_aprobacion,
            i.hash_genesis, i.hash_inscripcion, i.hash_curso_completado,
            c.imagen AS imagen_curso
     FROM inscripciones i
     LEFT JOIN cursos c ON c.id = i.id_curso
     WHERE i.id_usuario = $1 ORDER BY i.fecha_inscripcion DESC`,
    [idUsuario]
  )
  return res.rows.map(filaAInscripcion)
}

export async function obtenerInscripcion(idUsuario, idCurso) {
  const res = await pool.query(
    `SELECT i.id, i.id_usuario, i.id_curso, i.nombre_curso, i.estado, i.progreso,
            i.id_certificado, i.fecha_inscripcion, i.fecha_aprobacion,
            i.hash_genesis, i.hash_inscripcion, i.hash_curso_completado,
            c.imagen AS imagen_curso
     FROM inscripciones i
     LEFT JOIN cursos c ON c.id = i.id_curso
     WHERE i.id_usuario = $1 AND i.id_curso = $2`,
    [idUsuario, idCurso]
  )
  return filaAInscripcion(res.rows[0]) || null
}

export async function crearInscripcion({ idUsuario, idCurso, nombreCurso, nombreCompleto }) {
  const id = `insc-${Date.now()}`
  const fechaInscripcion = new Date().toISOString().slice(0, 10)
  const hashGenesis = calcularHashGenesis(nombreCompleto, idUsuario, idCurso, fechaInscripcion)
  const hashInscripcion = calcularHashInscripcion(id, fechaInscripcion, hashGenesis)
  await pool.query(
    `INSERT INTO inscripciones (id, id_usuario, id_curso, nombre_curso, estado, progreso, fecha_inscripcion, hash_genesis, hash_inscripcion)
     VALUES ($1, $2, $3, $4, 'inscrito', 0, $5, $6, $7)`,
    [id, idUsuario, idCurso, nombreCurso, fechaInscripcion, hashGenesis, hashInscripcion]
  )
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
  const cliente = await pool.connect()
  try {
    const insRes = await cliente.query(
      `SELECT id, id_curso, nombre_curso, hash_inscripcion, fecha_inscripcion FROM inscripciones WHERE id = $1 AND id_usuario = $2`,
      [idInscripcion, idUsuario]
    )
    const ins = insRes.rows[0]
    if (!ins) return null

    const fechaAprobacion = new Date().toISOString().slice(0, 10)
    const tieneCadena = !!ins.hash_inscripcion
    let hashCursoCompletado = null
    let hashCertificado = null
    if (tieneCadena) {
      hashCursoCompletado = calcularHashCursoCompletado(idInscripcion, fechaAprobacion, ins.hash_inscripcion)
    }

    const countRes = await cliente.query('SELECT COUNT(*)::int AS n FROM certificados')
    const numCert = countRes.rows[0].n + 1
    const codigoVerificacion = `CERT-${new Date().getFullYear()}-${String(numCert).padStart(3, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    const idCertificado = `cert-${ins.id_curso}-${Date.now()}`
    if (hashCursoCompletado) {
      hashCertificado = calcularHashCertificado(idCertificado, codigoVerificacion, fechaAprobacion, hashCursoCompletado)
    }

    await cliente.query(
      `UPDATE inscripciones SET estado = 'aprobado', progreso = 100, id_certificado = $1, fecha_aprobacion = $2, hash_curso_completado = $3 WHERE id = $4`,
      [idCertificado, fechaAprobacion, hashCursoCompletado, idInscripcion]
    )
    await cliente.query(
      `INSERT INTO certificados (id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [idCertificado, idInscripcion, idUsuario, ins.nombre_curso, codigoVerificacion, fechaAprobacion, hashCertificado]
    )

    const insActualizada = await cliente.query(
      `SELECT id, id_usuario, id_curso, nombre_curso, estado, progreso, id_certificado, fecha_inscripcion, fecha_aprobacion, hash_genesis, hash_inscripcion, hash_curso_completado FROM inscripciones WHERE id = $1`,
      [idInscripcion]
    )
    const certRes = await cliente.query(
      `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado FROM certificados WHERE id = $1`,
      [idCertificado]
    )
    return {
      inscripcion: filaAInscripcion(insActualizada.rows[0]),
      certificado: filaACertificado(certRes.rows[0]),
    }
  } finally {
    cliente.release()
  }
}

export async function obtenerCertificadosPorUsuario(idUsuario) {
  const res = await pool.query(
    `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
     FROM certificados WHERE id_usuario = $1 ORDER BY fecha_emision DESC`,
    [idUsuario]
  )
  return res.rows.map(filaACertificado)
}

export async function obtenerCertificadoPorId(id) {
  const res = await pool.query(
    `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
     FROM certificados WHERE id = $1`,
    [id]
  )
  return filaACertificado(res.rows[0]) || null
}

export async function obtenerCertificadoPorCodigo(codigo) {
  const normalizado = (codigo || '').toString().trim().toUpperCase()
  const res = await pool.query(
    `SELECT id, id_inscripcion, id_usuario, nombre_curso, codigo_verificacion, fecha_emision, hash_certificado
     FROM certificados WHERE UPPER(codigo_verificacion) = $1`,
    [normalizado]
  )
  return filaACertificado(res.rows[0]) || null
}

/** Inscripción con todos los hashes para validar la cadena del certificado */
export async function obtenerInscripcionConHashes(idInscripcion) {
  const res = await pool.query(
    `SELECT id, id_usuario, id_curso, nombre_curso, fecha_inscripcion, fecha_aprobacion, hash_genesis, hash_inscripcion, hash_curso_completado
     FROM inscripciones WHERE id = $1`,
    [idInscripcion]
  )
  return filaAInscripcion(res.rows[0]) || null
}

export async function obtenerNombreCompletoUsuario(idUsuario) {
  const res = await pool.query('SELECT nombre FROM usuarios WHERE id = $1', [idUsuario])
  return res.rows[0] ? res.rows[0].nombre : null
}

export async function actualizarFotoPerfil(idUsuario, fotoPerfil) {
  const res = await pool.query(
    'UPDATE usuarios SET foto_perfil = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
    [fotoPerfil || null, idUsuario]
  )
  const fila = res.rows[0]
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    token: fila.token,
    fotoPerfil: fila.foto_perfil || null,
  }
}

export async function actualizarNombreUsuario(idUsuario, nombre) {
  if (!nombre || String(nombre).trim().length === 0) return null
  const res = await pool.query(
    'UPDATE usuarios SET nombre = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
    [nombre.trim(), idUsuario]
  )
  const fila = res.rows[0]
  if (!fila) return null
  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    token: fila.token,
    fotoPerfil: fila.foto_perfil || null,
  }
}

export async function obtenerUsuarioPorIdParaContraseña(idUsuario) {
  const res = await pool.query(
    'SELECT id, contraseña_hash FROM usuarios WHERE id = $1',
    [idUsuario]
  )
  return res.rows[0] || null
}

export async function actualizarContraseña(idUsuario, nuevaContraseñaHash) {
  await pool.query(
    'UPDATE usuarios SET contraseña_hash = $1 WHERE id = $2',
    [nuevaContraseñaHash, idUsuario]
  )
  return true
}

export async function actualizarProgresoInscripcion(idInscripcion, idUsuario, progreso) {
  const num = Math.min(100, Math.max(0, parseInt(progreso, 10) || 0))
  const res = await pool.query(
    'UPDATE inscripciones SET progreso = $1 WHERE id = $2 AND id_usuario = $3 RETURNING id',
    [num, idInscripcion, idUsuario]
  )
  return res.rowCount > 0
}
