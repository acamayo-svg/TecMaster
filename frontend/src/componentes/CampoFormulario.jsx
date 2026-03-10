import '../estilos/CampoFormulario.css'

export default function CampoFormulario({
  etiqueta,
  id,
  tipo = 'text',
  nombre,
  valor,
  onChange,
  placeholder,
  requerido = false,
  deshabilitado = false,
  error,
  textoAyuda,
  opciones, // para select: [{ valor, etiqueta }, ...]
  filas, // para textarea
  ...resto
}) {
  const idReal = id || nombre
  const tieneError = Boolean(error)

  return (
    <div className={`campo-formulario ${tieneError ? 'campo-formulario--error' : ''}`}>
      {etiqueta && (
        <label htmlFor={idReal} className="campo-formulario__etiqueta">
          {etiqueta}
          {requerido && <span className="campo-formulario__requerido">*</span>}
        </label>
      )}
      {opciones ? (
        <select
          id={idReal}
          name={nombre}
          value={valor ?? ''}
          onChange={onChange}
          required={requerido}
          disabled={deshabilitado}
          className="campo-formulario__input"
          {...resto}
        >
          <option value="">Seleccionar...</option>
          {opciones.map((op) => (
            <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
          ))}
        </select>
      ) : filas ? (
        <textarea
          id={idReal}
          name={nombre}
          value={valor ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={requerido}
          disabled={deshabilitado}
          rows={filas}
          className="campo-formulario__input campo-formulario__input--textarea"
          {...resto}
        />
      ) : (
        <input
          id={idReal}
          type={tipo}
          name={nombre}
          value={valor ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={requerido}
          disabled={deshabilitado}
          className="campo-formulario__input"
          {...resto}
        />
      )}
      {textoAyuda && <p className="campo-formulario__ayuda">{textoAyuda}</p>}
      {error && <p className="campo-formulario__error">{error}</p>}
    </div>
  )
}
