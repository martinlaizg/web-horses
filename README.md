# web-horses

Aplicación web para calcular pedidos de suministros de caballos y conservar
el historial de pedidos.

Permite introducir cantidades y precios personalizados para paja, alfalfa,
baio y viruta, calcula el total de cada línea y el total del pedido en euros,
y guarda los pedidos mediante una API.

## Arquitectura

El proyecto está dividido en dos aplicaciones independientes:

- `code/frontend/`: aplicación React 19 con Vite.
- `code/backend/`: servidor Express 5 que expone la API y sirve el frontend
  compilado.

Los archivos principales son:

- `code/frontend/src/App.jsx`: interfaz y gestión del estado del formulario.
- `code/frontend/src/calculations.js`: cálculos y formato de moneda.
- `code/frontend/vite.config.js`: servidor de desarrollo y proxy de `/api`.
- `code/backend/server.js`: aplicación Express y rutas HTTP.
- `code/backend/database.js`: persistencia SQLite de los pedidos.
- `code/backend/app.test.js`: pruebas de cálculo.
- `Dockerfile`: compilación del frontend y empaquetado del backend.
- `docker-compose.yml`: despliegue local en el puerto `8080`.
- `.github/workflows/docker-publish.yml`: publicación de la imagen Docker.

## Requisitos

- Node.js 22 recomendado.
- npm.
- Docker y Docker Compose opcional para el despliegue completo.

## Desarrollo local

Instala las dependencias en cada aplicación:

```bash
cd code/frontend
npm install

cd ../backend
npm install
```

### Frontend

El servidor de Vite escucha en `http://localhost:5173` y redirige las
peticiones `/api` al backend en `http://localhost:3000`.

```bash
cd code/frontend
npm run dev
```

Para compilar el frontend:

```bash
npm run build
```

La compilación se genera en `code/frontend/dist/`. Este directorio está
ignorado por Git y no debe editarse manualmente.

### Backend

Inicia el servidor Express con:

```bash
cd code/backend
npm start
```

Por defecto escucha en `http://localhost:3000`.

Cuando el directorio `code/frontend/dist/` existe, Express sirve el frontend
compilado. Si no existe, la API sigue funcionando, pero el navegador no podrá
cargar la aplicación.

## API HTTP

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Comprueba el estado del servicio. Devuelve `{ "status": "ok" }`. |
| `GET` | `/api/orders` | Devuelve los pedidos guardados, ordenados del más reciente al más antiguo. |
| `POST` | `/api/orders` | Guarda un pedido. El cuerpo debe incluir `items` como lista y `total` como número no negativo. |

Ejemplo de respuesta al guardar un pedido:

```json
{
  "id": 1,
  "items": [],
  "total": 25,
  "created_at": "2026-11-22T17:30:57.867Z"
}
```

## Persistencia

Los pedidos se almacenan en SQLite. La ruta predeterminada es:

```text
code/backend/data/orders.db
```

Puede configurarse otra ruta mediante la variable de entorno `DB_PATH`:

```bash
DB_PATH=/ruta/personalizada/orders.db npm start
```

El directorio de datos se crea automáticamente. `code/backend/data/` está
incluido en `.gitignore` y no debe versionarse.

## Pruebas

Ejecuta las pruebas del backend desde su directorio:

```bash
cd code/backend
npm test
```

Las pruebas usan `node:test` y verifican los cálculos compartidos desde
`code/frontend/src/calculations.cjs`.

## Docker

Construye y ejecuta la aplicación completa con Docker Compose:

```bash
docker compose up --build
```

La aplicación estará disponible en `http://localhost:8080`.

Para detener los contenedores:

```bash
docker compose down
```

El volumen `orders-data` conserva la base SQLite en `/app/backend/data`.

## Visual Studio Code

La configuración de `.vscode/launch.json` incluye lanzamientos individuales
para el frontend y el backend, así como una configuración compuesta llamada
`Aplicación completa`.

## Publicación de la imagen

El flujo de GitHub Actions `.github/workflows/docker-publish.yml` construye y
publica `ghcr.io/<propietario>/web-horses:latest` al recibir cambios en `main`
o al ejecutarse manualmente.

## Contribuir

Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el flujo de trabajo,
las convenciones y las verificaciones requeridas.
