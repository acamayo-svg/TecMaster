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
    const { nombre, correo, contraseña, cedula } = await readJson(req)
    if (!nombre || !correo || !contraseña || !cedula) {
      res.status(400).json({ error: 'Faltan nombre, correo, contraseña o identificación.' })
      return
    }
    if (String(contraseña).length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' })
      return
    }

    const idNormalizado = String(cedula).trim()
    if (!idNormalizado) {
      res.status(400).json({ error: 'La identificación no puede estar vacía.' })
      return
    }

    const pool = getPool()

    const existente = await pool.query(
      'SELECT 1 FROM usuarios WHERE LOWER(correo) = LOWER($1) LIMIT 1',
      [String(correo)]
    )
    if (existente.rows.length > 0) {
      res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' })
      return
    }

    const existenteId = await pool.query('SELECT 1 FROM usuarios WHERE id = $1 LIMIT 1', [idNormalizado])
    if (existenteId.rows.length > 0) {
      res.status(409).json({ error: 'Ya existe una cuenta con esa identificación.' })
      return
    }

    const contraseñaHash = await bcrypt.hash(String(contraseña), 10)
    const token = tokenAleatorio()

    await pool.query(
      `INSERT INTO usuarios (id, nombre, correo, contraseña_hash, token)
       VALUES ($1, $2, $3, $4, $5)`,
      [idNormalizado, String(nombre).trim(), String(correo).trim().toLowerCase(), contraseñaHash, token]
    )

    res.status(201).json({
      id: idNormalizado,
      nombre: String(nombre).trim(),
      correo: String(correo).trim().toLowerCase(),
      token,
      fotoPerfil: null,
    })
  } catch (err) {
    res.status(503).json({ error: 'Error al registrar', detalle: err.message || String(err) })
  }
}

