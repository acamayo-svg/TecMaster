import '../estilos/Boton.css'

export default function Boton({
  tipo = 'button',
  variante = 'primario',
  tamano = 'normal',
  children: hijos,
  className = '',
  deshabilitado = false,
  ...resto
}) {
  const clases = [
    'boton',
    `boton--${variante}`,
    `boton--${tamano}`,
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={tipo}
      className={clases}
      disabled={deshabilitado}
      {...resto}
    >
      {hijos}
    </button>
  )
}
