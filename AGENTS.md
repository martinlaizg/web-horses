# AGENTS.md

## Estructura del proyecto

- `code/frontend/` contiene la aplicación Vite.
- `code/backend/` contiene el servidor Express y sus pruebas.
- `Dockerfile` construye el frontend y empaqueta el backend en una imagen
  de producción.
- `docker-compose.yml` ejecuta la aplicación en el puerto `8080`.

## Comandos

Ejecuta los comandos desde la carpeta de la aplicación correspondiente:

```bash
cd code/frontend && npm install
cd code/backend && npm install
cd code/frontend && npm run dev
cd code/frontend && npm run build
cd code/backend && npm start
cd code/backend && npm test
```

Antes de finalizar cambios, ejecuta al menos `npm run build` en `code/frontend`
y `npm test` en `code/backend`.

## Convenciones

- Mantén frontend y backend desacoplados.
- No edites los archivos generados en `code/frontend/dist`.
- Usa JavaScript y conserva el formato existente de cada archivo.
- Añade o actualiza pruebas cuando cambie la lógica de cálculo o del servidor.
- Usa mensajes de commit siguiendo Conventional Commits.
