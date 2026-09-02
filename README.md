# web-caballos

Calculadora web de pedidos de suministros para caballos. El proyecto está
organizado como dos aplicaciones independientes:

- `code/frontend`: aplicación Vite con HTML, JavaScript y CSS.
- `code/backend`: servidor Express que sirve la compilación del frontend y
  expone `GET /health`.

## Desarrollo local

Instala las dependencias de cada aplicación:

```bash
cd code/frontend && npm install
cd ../backend && npm install
```

Para trabajar con recarga automática, inicia Vite desde `code/frontend`:

```bash
cd code/frontend
npm run dev
```

La aplicación estará disponible en <http://localhost:5173>.

Para probar el servidor Express con la versión compilada:

```bash
cd code/frontend && npm run build
cd ../backend && npm start
```

La aplicación estará disponible en <http://localhost:3000> y el endpoint
<http://localhost:3000/health> devuelve `{ "status": "ok" }`.

Las pruebas del backend se ejecutan con:

```bash
cd code/backend
npm test
```

## Docker

Con Docker disponible (por ejemplo, mediante Colima):

```bash
docker compose up --build
```

La aplicación estará disponible en <http://localhost:8080>. Para detenerla:

```bash
docker compose down
```