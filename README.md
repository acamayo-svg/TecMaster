# Plataforma de Certificados

Plataforma para emitir y verificar certificados de cursos: registro, inicio de sesión, dashboard de usuario, inscripción a cursos, aprobación y generación de certificados, y consulta para empresas. Incluye **frontend (React)** y **backend (Node + Express)** con base de datos en archivo JSON.

## Estructura del proyecto (español)

```
src/                 Frontend React
  componentes/       Encabezado, PiePagina, Boton, CampoFormulario, Tarjeta
  contexto/         AuthContext
  estilos/          CSS por componente o página
  paginas/          Inicio, IniciarSesion, Registro, AreaUsuario, etc.
  utilidades/       api.js (llamadas al backend), datosEjemplo (ya no usado en flujo real)
servidor/            Backend Node + Express + PostgreSQL
  baseDeDatos.js    Conexión a PostgreSQL (usuarios, inscripciones, certificados)
  cursos.js         Catálogo de cursos
  servidor.js       API REST
  esquema.sql       Script opcional para crear tablas en pgAdmin
  .env              Configuración de conexión (PGHOST, PGDATABASE, PGUSER, PGPASSWORD)
```

## Cómo ejecutar

**Importante:** hay que levantar el **servidor** y el **frontend**. Ver **[COMO-EJECUTAR.md](./COMO-EJECUTAR.md)** para los pasos detallados.

Resumen:

1. En la raíz: `npm install` y luego `npm run dev` (frontend en http://localhost:5173).
2. En otra terminal, en `servidor`: `npm install` y `npm run iniciar` (API en http://localhost:3001).

## Rutas

- `/` — Inicio
- `/iniciar-sesion` — Inicio de sesión
- `/registro` — Registro de usuario
- `/area-usuario` — Área del usuario (cursos y certificados)
- `/inscripcion-curso` — Formulario de inscripción a curso
- `/curso/:idCurso` — Detalle del curso (aprobar y generar certificado)
- `/certificado/:idCertificado` — Vista del certificado
- `/empresas` — Sección para empresas (verificación)
- `/empresas/consultar` — Formulario para consultar certificado por código

## Formularios

- **Registro:** nombre, correo, contraseña, repetir contraseña
- **Iniciar sesión:** correo, contraseña
- **Inscripción a curso:** selector de curso
- **Consultar certificado (empresas):** código de verificación

Los datos son de ejemplo (sin backend). Para verificar un certificado de prueba usa el código: `CERT-2024-001-X7K9`.
