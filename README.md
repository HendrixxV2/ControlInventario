# Control de Inventario

Aplicación React/Vite con API Express, autenticación JWT y persistencia MySQL.

## Requisitos

- Node.js 18 o posterior y npm
- MySQL local

## Configuración local (PowerShell)

Desde la carpeta del proyecto:

```powershell
npm install
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

Revisa `backend\.env` y confirma host, puerto, usuario, contraseña y nombre de la base MySQL. Cambia `JWT_SECRET` por una clave aleatoria de al menos 32 caracteres antes de usar datos reales. El usuario MySQL necesita permiso para crear la base de datos y sus tablas en la primera migración.

Inicia la interfaz y la API con:

```powershell
npm run dev
```

Al iniciar, la API aplica las migraciones, crea el administrador inicial si todavía no existe y luego se conecta a MySQL. En desarrollo genera una contraseña aleatoria y la muestra una sola vez en la terminal. También puedes definir `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` en `backend\.env`. La interfaz queda en `http://localhost:5173` y la API en `http://localhost:4000`.

El backend ejecuta una revisión automática de alertas cada cinco minutos (`ALERTS_CRON_SCHEDULE=*/5 * * * *`). Puedes cambiar el intervalo usando una expresión cron válida de cinco campos en `backend\.env`. La tarea evita revisiones simultáneas y espera a que una revisión activa termine antes de cerrar la conexión MySQL.

Para ejecutar tareas por separado:

```powershell
npm run migrate
npm run seed
npm run dev:frontend
npm run dev:backend
```

`npm run build` compila la interfaz para producción. `npm test` ejecuta las pruebas del backend. En producción, configura un `JWT_SECRET` propio y `SEED_ADMIN_PASSWORD` si necesitas crear el primer administrador; no uses claves de ejemplo.
