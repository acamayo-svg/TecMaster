/** Respuesta mínima sin cargar Express ni BD. Prueba: GET /api/health */
export default function handler(req, res) {
  res.status(200).json({ ok: true, mensaje: 'API Tec Master' })
}
