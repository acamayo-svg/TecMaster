import '../estilos/Logo.css'


export default function Logo({ className = '', animado = true }) {
  return (
    <span className={`logo-glitch ${animado ? 'logo-glitch--animado' : ''} ${className}`.trim()}>
      <span className="logo-glitch__scanlines" aria-hidden="true" />
      <span className="logo-glitch__text logo-glitch__text--main">Tec Master</span>
      <span className="logo-glitch__text logo-glitch__text--r" aria-hidden="true">Tec Master</span>
      <span className="logo-glitch__text logo-glitch__text--b" aria-hidden="true">Tec Master</span>
    </span>
  )
}
