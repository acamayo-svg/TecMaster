import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { applyCors, handleOptions } from '../_cors.js'
import { getPool } from '../_db.js'

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 2_000_000) reject(new Error('Payload demasiado grande'))
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

function tokenAleatorio() {
  return crypto.randomBytes(24).toString('hex')
}

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const { correo, contraseña } = await readJson(req)
    if (!correo || !contraseña) {
      res.status(400).json({ error: 'Faltan correo o contraseña.' })
      return
    }

    const pool = getPool()
    const r = await pool.query(
      'SELECT id, nombre, correo, contraseña_hash, foto_perfil FROM usuarios WHERE LOWER(correo) = LOWER($1)',
      [String(correo)]
    )
    const u = r.rows?.[0]
    if (!u) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
      return
    }
    const coincide = await bcrypt.compare(String(contraseña), u.contraseña_hash)
    if (!coincide) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos.' })
      return
    }

    const token = tokenAleatorio()
    const up = await pool.query(
      'UPDATE usuarios SET token = $1 WHERE id = $2 RETURNING id, nombre, correo, token, foto_perfil',
      [token, u.id]
    )
    const out = up.rows?.[0]
    res.status(200).json({
      id: out.id,
      nombre: out.nombre,
      correo: out.correo,
      token: out.token,
      fotoPerfil: out.foto_perfil || null,
    })
  } catch (err) {
    res.status(503).json({ error: 'Error al iniciar sesión', detalle: err.message || String(err) })
  }
}

