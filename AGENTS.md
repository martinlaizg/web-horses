# AGENTS.md

Esta guía describe el repositorio para agentes que implementen, prueben o
documenten cambios.

## Estructura del proyecto

- `code/frontend/`: aplicación React 19 con Vite 7.
- `code/backend/`: servidor Express 5 y persistencia SQLite.
- `Dockerfile`: compilación multietapa del frontend y empaquetado del backend.
- `docker-compose.yml`: servicio en el puerto `8080` con volumen
  `orders-data`.
- `.github/workflows/docker-publish.yml`: construcción y publicación de GHCR.
- `.vscode/launch.json`: lanzamientos de VS Code para frontend, backend y
  aplicación completa.

## Arquitectura y responsabilidades

### Frontend

- Punto de entrada: `code/frontend/src/main.jsx`.
- Componente principal: `code/frontend/src/App.jsx`.
- Lógica de cálculo: `code/frontend/src/calculations.js`.
- Duplicado CommonJS: `code/frontend/src/calculations.cjs`, usado por las
  pruebas Node existentes.
- Estilos: `code/frontend/src/style.css`.
- Proxy de desarrollo: las rutas `/api` se envían a
  `http://localhost:3000` desde `code/frontend/vite.config.js`.
- Compilación: `npm run build` genera `code/frontend/dist/`.

No publiques ni edites archivos de `code/frontend/dist/`; es salida generada.

### Backend

- Punto de entrada y rutas: `code/backend/server.js`.
- Persistencia: `code/backend/database.js`.
- Base SQLite: `code/backend/data/orders.db` por defecto.
- Pruebas: `code/backend/app.test.js`.

El backend expone `GET /health`, `GET /api/orders` y `POST /api/orders`.
También sirve la compilación del frontend desde
`code/frontend/dist/`.

No modifiques ni borres datos reales de `code/backend/data/` durante pruebas
o implementaciones. Para pruebas con otra ubicación usa `DB_PATH`.

## Ejecución

Instalación:

```bash
npm --prefix code/frontend install
npm --prefix code/backend install
```

Desarrollo:

```bash
cd code/frontend && npm run dev
cd code/backend && npm start
```

Puertos predeterminados:

- Vite: `5173`.
- Express: `3000`.
- Docker Compose: `8080`.

## Comandos

Ejecuta los comandos desde la carpeta correspondiente:

```bash
cd code/frontend && npm install
cd code/backend && npm install
cd code/frontend && npm run dev
cd code/frontend && npm run build
cd code/backend && npm start
cd code/backend && npm test
```

Docker:

```bash
docker compose up --build
docker compose down
```

Antes de finalizar cualquier cambio ejecuta obligatoriamente:

```bash
cd code/frontend && npm run build
cd code/backend && npm test
git diff --check
```

## Convenciones

- Mantén frontend y backend desacoplados.
- Usa rutas relativas `/api/*` en el frontend.
- Usa JavaScript y conserva el formato existente de cada archivo.
- Usa punto y coma, indentación con tabulador y comillas dobles en
  archivos existentes.
- Mantén la lógica de cálculo compartida; no dupliques reglas en componentes
  o rutas HTTP.
- Valida los pedidos en el backend: `items` debe ser una lista y `total` debe
  ser un número no negativo.
- Añade o actualiza pruebas para cambios en cálculos o servidor.
- Respeta los límites de dependencias: React/Vite en frontend y
  Express/sqlite3 en backend.
- No incluyas secretos, datos locales ni archivos generados en los cambios.
- Usa mensajes de commit siguiendo Conventional Commits.
- Actualiza README y CONTRIBUTING cuando cambien comandos, arquitectura,
  variables de entorno o APIs públicas.

## Persistencia y variables de entorno

- `PORT`: puerto de Express; predeterminado `3000`.
- `DB_PATH`: ruta de SQLite; predeterminada
  `code/backend/data/orders.db`.
- `NODE_ENV`: modo de ejecución de Node.

El contenedor Docker monta `orders-data` en `/app/backend/data`. El Dockerfile
expone el puerto `3000`, mientras que Docker Compose lo publica como `8080`.

## Cambios seguros

Lee el archivo relacionado antes de modificarlo y verifica el diff final.
Para cambios en cálculo, revisa tanto `calculations.js` como
`calculations.cjs`, porque las pruebas CommonJS dependen del segundo módulo.

No ejecutes comandos destructivos sobre el repositorio, datos SQLite,
contenedores o volúmenes sin una solicitud explícita. No uses herramientas
que reescriban historia salvo petición concreta.

## Seguimiento temporal de tareas

Para trabajos de varios pasos o con varios agentes, mantén un archivo
`TASK_PROGRESS.md` temporal en la raíz del proyecto. Antes de empezar, consulta
si ya existe para no perder el contexto de otros agentes.

Registra de forma breve:

- objetivo y estado actual;
- pasos pendientes y completados;
- agente responsable de cada paso, si aplica;
- archivos modificados y verificaciones ejecutadas;
- bloqueos y decisiones que necesiten coordinación.

Actualiza el archivo cuando cambie el estado, la asignación o el resultado de
un paso. Coordina cambios simultáneos al documento y no sobrescribas el
progreso de otro agente. Si los agentes trabajan en worktrees separados,
sincroniza el seguimiento explícitamente: un archivo temporal no se comparte
automáticamente entre worktrees.

No incluyas secretos ni datos sensibles. El archivo es solo para coordinar el
trabajo activo: no lo incluyas en commits y elimínalo al completar la tarea.
