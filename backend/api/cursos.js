import { applyCors, handleOptions } from './_cors.js'
import { getPool } from './_db.js'

export default async function handler(req, res) {
  applyCors(req, res)
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }

  try {
    const pool = getPool()
    const r = await pool.query(
      'SELECT id, nombre, duracion, descripcion, categoria, imagen FROM cursos ORDER BY categoria, id'
    )
    res.status(200).json(
      r.rows.map((fila) => ({
        id: fila.id,
        nombre: fila.nombre,
        duracion: fila.duracion,
        descripcion: fila.descripcion,
        categoria: fila.categoria || 'General',
        imagen: fila.imagen || null,
      }))
    )
  } catch (err) {
    res.status(503).json({ error: 'Error al cargar cursos', detalle: err.message || String(err) })
  }
}

