import { useState, useRef } from 'react'
import { apiActualizarPerfil } from '../utilidades/api'
import { useAuth } from '../contexto/AuthContext'
import Boton from './Boton'
import '../estilos/ModalCambiarFoto.css'

const TAMANO_MAXIMO_BYTES = 500 * 1024
const TAMANO_MAXIMO_PIXELES = 400

function redimensionarDataUrl(dataUrl, maxPx) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width
      let h = img.height
      if (w > maxPx || h > maxPx) {
        if (w > h) {
          h = Math.round((h * maxPx) / w)
          w = maxPx
        } else {
          w = Math.round((w * maxPx) / h)
          h = maxPx
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, w, h)
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      } catch (e) {
        resolve(dataUrl)
      }
    }
    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = dataUrl
  })
}

export default function ModalCambiarFoto({ cerrar, onExito }) {
  const { actualizarUsuarioLocal } = useAuth()
  const [archivo, establecerArchivo] = useState(null)
  const [vistaPrevia, establecerVistaPrevia] = useState(null)
  const [error, establecerError] = useState('')
  const [enviando, establecerEnviando] = useState(false)
  const inputRef = useRef(null)

  const alElegirArchivo = (e) => {
    establecerError('')
    const file = e.target.files?.[0]
    if (!file) {
      establecerArchivo(null)
      establecerVistaPrevia(null)
      return
    }
    if (!file.type.startsWith('image/')) {
      establecerError('El archivo debe ser una imagen (JPG, PNG, etc.).')
      establecerArchivo(null)
      establecerVistaPrevia(null)
      return
    }
    if (file.size > TAMANO_MAXIMO_BYTES) {
      establecerError('La imagen no debe superar 500 KB. Elige una más pequeña.')
      establecerArchivo(null)
      establecerVistaPrevia(null)
      return
    }
    establecerArchivo(file)
    const reader = new FileReader()
    reader.onload = () => establecerVistaPrevia(reader.result)
    reader.readAsDataURL(file)
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (!vistaPrevia) {
      establecerError('Elige una imagen.')
      return
    }
    establecerError('')
    establecerEnviando(true)
    try {
      const dataUrlReducido = await redimensionarDataUrl(vistaPrevia, TAMANO_MAXIMO_PIXELES)
      const { usuario } = await apiActualizarPerfil({ fotoPerfil: dataUrlReducido })
      actualizarUsuarioLocal({ fotoPerfil: usuario.fotoPerfil, nombre: usuario.nombre })
      onExito?.()
      cerrar()
    } catch (err) {
      establecerError(err.message || 'Error al subir la foto.')
    } finally {
      establecerEnviando(false)
    }
  }

  return (
    <div className="modal-foto" role="dialog" aria-modal="true" aria-labelledby="modal-foto-titulo">
      <div className="modal-foto__fondo" onClick={cerrar} aria-hidden="true" />
      <div className="modal-foto__ventana">
        <div className="modal-foto__cabecera">
          <h2 id="modal-foto-titulo" className="modal-foto__titulo">Cambiar foto de perfil</h2>
          <button type="button" className="modal-foto__cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
        </div>
        <form className="modal-foto__formulario" onSubmit={enviar}>
          {error && (
            <p className="modal-foto__error" role="alert">{error}</p>
          )}
          <div className="modal-foto__preview-wrap">
            {vistaPrevia ? (
              <img src={vistaPrevia} alt="Vista previa" className="modal-foto__preview" />
            ) : (
              <div className="modal-foto__preview-placeholder">
                Sin imagen seleccionada
              </div>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="modal-foto__input-file"
            onChange={alElegirArchivo}
            aria-label="Seleccionar imagen"
          />
          <div className="modal-foto__acciones">
            <button
              type="button"
              className="modal-foto__boton-secundario"
              onClick={() => inputRef.current?.click()}
              disabled={enviando}
            >
              Elegir imagen
            </button>
            <Boton type="submit" variante="primario" deshabilitado={!vistaPrevia || enviando}>
              {enviando ? 'Subiendo…' : 'Subir foto'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  )
}
