# ¿De qué “servidor” hablamos y dónde se configura?

## 1. Qué es el “servidor” en este proyecto

**“Servidor”** aquí es la **carpeta `servidor`** de tu proyecto: el programa en Node.js (backend) que levantas con `npm run iniciar`.  
Ese programa **no es** un servidor en la nube ni una máquina remota: corre **en tu mismo PC** y escucha en `http://localhost:3001`.

La **conexión** de la que hablamos es la que hace **ese programa** (la carpeta `servidor`) hacia **PostgreSQL**, que también está en tu PC (el que usas con pgAdmin).

Resumen:
- **PostgreSQL** = la base de datos (la abres con pgAdmin).
- **Carpeta `servidor`** = el backend que usa esa base de datos.
- **Archivo `.env`** = va **dentro de la carpeta `servidor`** y le dice a ese backend cómo conectarse a PostgreSQL.

---

## 2. Dónde haces cada cosa

### En pgAdmin (PostgreSQL)

1. Abre **pgAdmin** y conéctate a tu PostgreSQL (por ejemplo “PostgreSQL 17” o “PostgreSQL 18”).
2. Clic derecho en **“Bases de datos”** → **“Crear”** → **“Base de datos”**.
3. En “Base de datos” pon el nombre: **`certificados`**.
4. Guardar.

Ahí ya tienes la base de datos. No configuras “servidor” en pgAdmin para este proyecto; solo creas la base.

### En tu proyecto (carpeta `servidor`)

1. Abre la carpeta del proyecto en el explorador de archivos.
2. Entra en la carpeta **`servidor`** (la misma donde están `servidor.js`, `baseDeDatos.js`, etc.).
3. Ahí crea un archivo llamado **`.env`** (con el punto delante).

   Crea un archivo nuevo llamado exactamente **`.env`** en la carpeta **`servidor`**.

4. Abre **`.env`** con un editor de texto y pon algo como:

```text
PGHOST=localhost
PGPORT=5432
PGDATABASE=certificados
PGUSER=postgres
PGPASSWORD=la_contraseña_que_pusiste_al_instalar_PostgreSQL
```

- **PGDATABASE**: debe ser el mismo nombre que diste a la base en pgAdmin (`certificados`).
- **PGUSER** y **PGPASSWORD**: el usuario y contraseña con los que entras a PostgreSQL en pgAdmin (suele ser `postgres` y la contraseña que elegiste al instalar).

5. Guarda el archivo **`.env`** dentro de la carpeta **`servidor`**.

Cuando ejecutes en la terminal `cd servidor` y luego `npm run iniciar`, el programa leerá ese **`.env`** y usará esos datos para conectarse a PostgreSQL. No tienes que configurar la conexión en ningún otro sitio para este proyecto.

---

## Resumen

| Dónde          | Qué haces |
|----------------|-----------|
| **pgAdmin**    | Crear la base de datos `certificados`. |
| **Carpeta `servidor`** | Crear el archivo `.env` con PGHOST, PGDATABASE, PGUSER, PGPASSWORD (y opcionalmente PGPORT). |

“Servidor” = carpeta **`servidor`** del proyecto (el backend). La conexión se configura en el archivo **`.env`** dentro de esa misma carpeta.

---

## Si al registrarte sale "Failed to fetch" o "Connection refused"

Eso significa que **el backend no está corriendo**. La web (React) intenta llamar a `http://localhost:3001` y no hay nada escuchando ahí.

**Solución:** abre una terminal, entra en la carpeta **`servidor`**, ejecuta **`npm run iniciar`** y **no cierres esa terminal**. Mientras muestre "Servidor en http://localhost:3001", el registro y el login funcionarán.
