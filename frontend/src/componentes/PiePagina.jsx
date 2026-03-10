import { Link } from 'react-router-dom'
import '../estilos/PiePagina.css'

export default function PiePagina() {
  return (
    <footer className="pie-pagina">
      <div className="pie-pagina__contenedor">
        <div className="pie-pagina__marca">
          <Link to="/" className="pie-pagina__logo">
            <span className="pie-pagina__logo-wrap">
              <img src="/Logo.jpg" alt="Tec Master Certificado" className="pie-pagina__logo-img" />
              <span className="pie-pagina__logo-scan" aria-hidden="true" />
            </span>
          </Link>
          <p className="pie-pagina__descripcion">
            Cursos de tecnología con certificado verificable.
          </p>
        </div>
        <nav className="pie-pagina__enlaces">
          <Link to="/">Inicio</Link>
          <Link to="/empresas">Verificar certificados</Link>
          <Link to="/iniciar-sesion">Iniciar sesión</Link>
          <Link to="/registro">Registro</Link>
        </nav>
        <p className="pie-pagina__copyright">
          © {new Date().getFullYear()} Tec Master. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
