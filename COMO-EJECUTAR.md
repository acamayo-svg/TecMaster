# Cómo ejecutar la plataforma de certificados

Para que el registro se guarde en base de datos y el dashboard muestre tus cursos y certificados reales, hay que levantar **dos cosas**: el **servidor** (backend + PostgreSQL) y el **frontend** (React).

---

## Base de datos: PostgreSQL

El servidor usa **PostgreSQL**. Necesitas tener PostgreSQL instalado y en ejecución (por ejemplo con pgAdmin).

### Crear la base de datos

1. Abre **pgAdmin** y conéctate a tu servidor (PostgreSQL 17 o 18).
2. Clic derecho en **Bases de datos** → **Crear** → **Base de datos**.
3. Nombre: `certificados` (o el que pongas en `PGDATABASE`).
4. Guardar.

### Configurar la conexión del servidor

En la carpeta **servidor** crea un archivo **`.env`** con las variables de conexión. Ejemplo:

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=certificados
PGUSER=postgres
PGPASSWORD=tu_contraseña_de_postgres
```

Si no creas `.env`, el servidor usará por defecto: `localhost`, puerto `5432`, base `certificados`, usuario `postgres`, contraseña `postgres`.

Las tablas (`usuarios`, `inscripciones`, `certificados`) se crean **solas** la primera vez que arranques el servidor. Si prefieres crearlas a mano en pgAdmin, puedes ejecutar el script **`servidor/esquema.sql`**.

---

## Paso 1: Instalar dependencias del frontend

En la **raíz del proyecto** (donde está el `package.json` de React):

```bash
npm install
```

---

## Paso 2: Instalar dependencias del servidor

Entra en la carpeta del servidor e instala sus dependencias:

```bash
cd servidor
npm install
cd ..
```

---

## Paso 3: Iniciar el servidor (backend + base de datos)

En una terminal, desde la carpeta **servidor**:

```bash
cd servidor
npm run iniciar
```

Deberías ver: `Tablas de PostgreSQL listas.` y `Servidor en http://localhost:3001`.  
**No cierres esta terminal**; el servidor debe seguir en ejecución.

Si aparece un error de conexión a PostgreSQL, revisa que el servicio esté en marcha, que la base de datos exista y que el archivo `.env` tenga el usuario y contraseña correctos.

---

## Paso 4: Iniciar el frontend (React)

En **otra terminal**, desde la **raíz del proyecto** (no desde `servidor`):

```bash
npm run dev
```

Abre en el navegador la URL que muestre Vite (normalmente `http://localhost:5173`).

---

## Resumen rápido

| Dónde        | Comando           | Para qué                          |
|-------------|-------------------|-----------------------------------|
| Raíz        | `npm install`     | Dependencias del frontend         |
| Raíz        | `npm run dev`     | Levantar la web (React)           |
| `servidor/` | `npm install`     | Dependencias del backend          |
| `servidor/` | `npm run iniciar` | Levantar API y base de datos      |

**Orden recomendado:**  
1) `npm install` en raíz y en `servidor`.  
2) En una terminal: `cd servidor` → `npm run iniciar`.  
3) En otra terminal: `npm run dev` en la raíz.  
4) Abrir `http://localhost:5173` en el navegador.

---

## Flujo de uso

1. **Registro:** Creas cuenta en “Registrarse”. Los datos se guardan en la base de datos y se te redirige al dashboard (Mi área).
2. **Iniciar sesión:** Entras con correo y contraseña; te lleva al mismo dashboard.
3. **Dashboard (Mi área):** Ves “Mis cursos” y “Certificados obtenidos” con datos reales desde el servidor.
4. **Inscribirse a un curso:** En “Inscribirme” eliges un curso; la inscripción se guarda y aparecerá en “Mis cursos”.
5. **Aprobar curso:** Entras al curso, “Marcar como aprobado y generar certificado”; se crea el certificado en la base de datos.
6. **Ver certificado:** Desde “Certificados obtenidos” o desde el curso aprobado; el código de verificación sirve para que las empresas comprueben su validez.
7. **Empresas:** En “Verificar certificados” / “Consultar” se introduce el código y se muestra si el certificado es válido y sus datos.

Si el frontend no muestra cursos o certificados, revisa que el servidor esté corriendo en el puerto 3001 y que no haya errores en la terminal del servidor.
