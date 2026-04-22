import { useEffect, useRef, useState } from 'react'
import '../estilos/CampoTipoDocumento.css'

/** Valores enviados al backend y etiquetas mostradas */
export const OPCIONES_TIPO_DOCUMENTO = [
  { valor: 'CC', etiqueta: 'Cédula de Ciudadanía' },
  { valor: 'TI', etiqueta: 'Tarjeta de Identidad' },
  { valor: 'CE', etiqueta: 'Cédula de Extranjería' },
  { valor: 'PEP', etiqueta: 'Permiso Especial de Permanencia (PEP)' },
  { valor: 'PPT', etiqueta: 'Permiso por Protección Temporal (PPT)' },
]

function IconoCuadricula() {
  return (
    <span className="campo-tipo-doc__icono" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4.5" cy="4.5" r="2" fill="currentColor" />
        <circle cx="13.5" cy="4.5" r="2" fill="currentColor" />
        <circle cx="4.5" cy="13.5" r="2" fill="currentColor" />
        <circle cx="13.5" cy="13.5" r="2" fill="currentColor" />
      </svg>
    </span>
  )
}

function IconoChevron({ abierto }) {
  return (
    <span className={`campo-tipo-doc__chevron ${abierto ? 'campo-tipo-doc__chevron--arriba' : ''}`} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/**
 * Desplegable de tipo de documento (estilo acorde al formulario del proyecto).
 * @param {{ valor: string, onChange: (valor: string) => void, requerido?: boolean, id?: string, error?: string }} props
 */
export default function CampoTipoDocumento({ valor, onChange, requerido = false, id = 'tipoDocumento', error }) {
  const [abierto, establecerAbierto] = useState(false)
  const contenedorRef = useRef(null)

  useEffect(() => {
    function cerrarSiFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        establecerAbierto(false)
      }
    }
    function tecla(e) {
      if (e.key === 'Escape') establecerAbierto(false)
    }
    document.addEventListener('mousedown', cerrarSiFuera)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('mousedown', cerrarSiFuera)
      document.removeEventListener('keydown', tecla)
    }
  }, [])

  const etiquetaSeleccionada = OPCIONES_TIPO_DOCUMENTO.find((o) => o.valor === valor)?.etiqueta
  const textoMostrado = etiquetaSeleccionada || 'Selecciona tu tipo de documento'
  const tieneError = Boolean(error)

  return (
    <div
      ref={contenedorRef}
      className={`campo-tipo-doc ${tieneError ? 'campo-tipo-doc--error' : ''}`}
    >
      <label htmlFor={id} className="campo-tipo-doc__etiqueta">
        Tipo de documento
        {requerido && <span className="campo-tipo-doc__requerido">*</span>}
      </label>
      <button
        type="button"
        id={id}
        className="campo-tipo-doc__disparador"
        onClick={() => establecerAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-haspopup="listbox"
        aria-invalid={tieneError}
      >
        <IconoCuadricula />
        <span className={etiquetaSeleccionada ? 'campo-tipo-doc__texto' : 'campo-tipo-doc__texto campo-tipo-doc__texto--placeholder'}>
          {textoMostrado}
        </span>
        <IconoChevron abierto={abierto} />
      </button>
      {abierto && (
        <ul className="campo-tipo-doc__lista" role="listbox" aria-label="Opciones de tipo de documento">
          {OPCIONES_TIPO_DOCUMENTO.map((op) => (
            <li key={op.valor} role="option" aria-selected={valor === op.valor}>
              <button
                type="button"
                className={`campo-tipo-doc__opcion ${valor === op.valor ? 'campo-tipo-doc__opcion--activa' : ''}`}
                onClick={() => {
                  onChange(op.valor)
                  establecerAbierto(false)
                }}
              >
                {op.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="campo-tipo-doc__mensaje-error">{error}</p>}
    </div>
  )
}
