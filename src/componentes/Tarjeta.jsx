import '../estilos/Tarjeta.css'

export default function Tarjeta({ children: hijos, className = '', ...resto }) {
  return (
    <div className={`tarjeta ${className}`.trim()} {...resto}>
      {hijos}
    </div>
  )
}
