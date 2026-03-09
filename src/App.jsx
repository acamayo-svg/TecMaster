import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexto/AuthContext'
import Encabezado from './componentes/Encabezado'
import PiePagina from './componentes/PiePagina'
import Inicio from './paginas/Inicio'
import IniciarSesion from './paginas/IniciarSesion'
import Registro from './paginas/Registro'
import AreaUsuario from './paginas/AreaUsuario'
import InscripcionCurso from './paginas/InscripcionCurso'
import Curso from './paginas/Curso'
import Certificado from './paginas/Certificado'
import VerificacionEmpresas from './paginas/VerificacionEmpresas'
import ConsultarCertificado from './paginas/ConsultarCertificado'

function RutaProtegida({ children: hijos, requiereSesion = true }) {
  const { usuario } = useAuth()
  const tieneSesion = Boolean(usuario)

  if (requiereSesion && !tieneSesion) {
    return <Navigate to="/iniciar-sesion" replace />
  }
  return hijos
}

export default function App() {
  return (
    <div className="app">
      <Encabezado />
      <main className="contenido-principal">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/area-usuario"
            element={
              <RutaProtegida>
                <AreaUsuario />
              </RutaProtegida>
            }
          />
          <Route
            path="/inscripcion-curso"
            element={
              <RutaProtegida>
                <InscripcionCurso />
              </RutaProtegida>
            }
          />
          <Route
            path="/curso/:idCurso"
            element={
              <RutaProtegida>
                <Curso />
              </RutaProtegida>
            }
          />
          <Route
            path="/certificado/:idCertificado"
            element={
              <RutaProtegida>
                <Certificado />
              </RutaProtegida>
            }
          />
          <Route path="/empresas" element={<VerificacionEmpresas />} />
          <Route path="/empresas/consultar" element={<ConsultarCertificado />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <PiePagina />
    </div>
  )
}
