import { Link } from 'react-router-dom'
import Tarjeta from '../componentes/Tarjeta'
import Boton from '../componentes/Boton'
import '../estilos/VerificacionEmpresas.css'

export default function VerificacionEmpresas() {
  return (
    <div className="verificacion-empresas">
      <section className="verificacion-empresas__hero">
        <h1 className="verificacion-empresas__titulo">Verificación de certificados</h1>
        <p className="verificacion-empresas__subtitulo">
          Para empresas y reclutadores. Introduce el código del certificado para comprobar su autenticidad.
        </p>
      </section>

      <Tarjeta className="verificacion-empresas__tarjeta">
        <h2 className="verificacion-empresas__tarjeta-titulo">Consultar un certificado</h2>
        <p className="verificacion-empresas__tarjeta-texto">
          El candidato puede compartir el código de verificación que aparece en su certificado (por ejemplo: CERT-2024-001-X7K9).
        </p>
        <Link to="/empresas/consultar">
          <Boton variante="primario" tamano="grande">Ir a consultar</Boton>
        </Link>
      </Tarjeta>

      <section className="verificacion-empresas__info">
        <h2 className="verificacion-empresas__info-titulo">¿Por qué verificar?</h2>
        <ul className="verificacion-empresas__lista">
          <li>Confirmar que el certificado es auténtico y fue emitido por nosotros.</li>
          <li>Comprobar el nombre del titular y el curso completado.</li>
          <li>Resultado al instante, sin trámites.</li>
        </ul>
      </section>
    </div>
  )
}
