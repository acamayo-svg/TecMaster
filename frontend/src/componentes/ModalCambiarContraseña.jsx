import { useState } from 'react'
import { apiCambiarContraseña } from '../utilidades/api'
import Boton from './Boton'
import '../estilos/ModalCambiarContraseña.css'

export default function ModalCambiarContraseña({ cerrar, onExito }) {
  const [contraseñaActual, establecerContraseñaActual] = useState('')
  const [contraseñaNueva, establecerContraseñaNueva] = useState('')
  const [repetirNueva, establecerRepetirNueva] = useState('')
  const [error, establecerError] = useState('')
  const [enviando, establecerEnviando] = useState(false)

  const enviar = async (e) => {
    e.preventDefault()
    establecerError('')
    if (!contraseñaActual.trim()) {
      establecerError('Escribe tu contraseña actual.')
      return
    }
    if (contraseñaNueva.length < 6) {
      establecerError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (contraseñaNueva !== repetirNueva) {
      establecerError('La nueva contraseña y la repetición no coinciden.')
      return
    }
    establecerEnviando(true)
    try {
      await apiCambiarContraseña(contraseñaActual, contraseñaNueva)
      onExito?.()
      cerrar()
    } catch (err) {
      establecerError(err.message || 'Error al cambiar contraseña.')
    } finally {
      establecerEnviando(false)
    }
  }

  return (
    <div className="modal-contraseña" role="dialog" aria-modal="true" aria-labelledby="modal-contraseña-titulo">
      <div className="modal-contraseña__fondo" onClick={cerrar} aria-hidden="true" />
      <div className="modal-contraseña__ventana">
        <div className="modal-contraseña__cabecera">
          <h2 id="modal-contraseña-titulo" className="modal-contraseña__titulo">Cambiar contraseña</h2>
          <button type="button" className="modal-contraseña__cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
        </div>
        <form className="modal-contraseña__formulario" onSubmit={enviar}>
          {error && (
            <p className="modal-contraseña__error" role="alert">{error}</p>
          )}
          <label className="modal-contraseña__etiqueta">
            Contraseña actual
            <input
              type="password"
              className="modal-contraseña__input"
              value={contraseñaActual}
              onChange={(e) => establecerContraseñaActual(e.target.value)}
              autoComplete="current-password"
              disabled={enviando}
            />
          </label>
          <label className="modal-contraseña__etiqueta">
            Nueva contraseña
            <input
              type="password"
              className="modal-contraseña__input"
              value={contraseñaNueva}
              onChange={(e) => establecerContraseñaNueva(e.target.value)}
              autoComplete="new-password"
              disabled={enviando}
              minLength={6}
            />
          </label>
          <label className="modal-contraseña__etiqueta">
            Repetir nueva contraseña
            <input
              type="password"
              className="modal-contraseña__input"
              value={repetirNueva}
              onChange={(e) => establecerRepetirNueva(e.target.value)}
              autoComplete="new-password"
              disabled={enviando}
            />
          </label>
          <div className="modal-contraseña__acciones">
            <Boton type="button" variante="secundario" onClick={cerrar} deshabilitado={enviando}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario" deshabilitado={enviando}>
              {enviando ? 'Guardando…' : 'Cambiar contraseña'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  )
}
