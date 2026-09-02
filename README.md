# web-caballos

Aplicación Vite con Express para calcular pedidos de suministros para
caballos. El código está separado entre `code/frontend` y `code/backend`.

## Uso local

Instala las dependencias desde cada aplicación:

```bash
cd code/frontend
npm install
npm run dev
```

El servidor de desarrollo de Vite estará disponible en
<http://localhost:5173>. Para servir la versión compilada con Express:

```bash
cd code/frontend
npm run build
cd ../backend
npm install
npm start
```

La aplicación estará disponible en <http://localhost:3000>. El endpoint
`/health` devuelve el estado del servidor.

Para ejecutar las pruebas:

```bash
cd code/backend
npm test
```

## Docker

```bash
docker compose up --build
```

La aplicación estará disponible en <http://localhost:8080>.