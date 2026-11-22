# Contribuir a web-horses

Gracias por contribuir. Este proyecto usa JavaScript y mantiene separados el
frontend React/Vite y el backend Express.

## Preparar el entorno

Requisitos recomendados:

- Node.js 22.
- npm.
- Docker y Docker Compose para probar el empaquetado completo.

Instala las dependencias de ambas aplicaciones desde la raíz del repositorio:

```bash
npm --prefix code/frontend install
npm --prefix code/backend install
```

## Flujo de desarrollo

Para el desarrollo diario, inicia el backend y el frontend en terminales
separadas:

```bash
# Terminal 1
cd code/backend
npm start

# Terminal 2
cd code/frontend
npm run dev
```

Frontend: `http://localhost:5173`

Backend y API: `http://localhost:3000`

La configuración de Vite reenvía `/api` al backend. Para probar la aplicación
como se entrega en producción, compila el frontend y inicia el backend:

```bash
cd code/frontend
npm run build

cd ../backend
npm start
```

La aplicación completa estará disponible en `http://localhost:3000`.

También puede probarse con Docker:

```bash
docker compose up --build
```

## Archivos que se deben y no se deben modificar

Modifica el código fuente de:

- `code/frontend/src/` para interfaz y cálculos.
- `code/backend/` para rutas HTTP y persistencia.
- `Dockerfile`, `docker-compose.yml` y `.github/workflows/` para la entrega.

No edites manualmente:

- `code/frontend/dist/`, generado por Vite.
- `code/backend/data/`, que contiene datos SQLite locales.
- `node_modules/`, generado por npm.

Los cambios en configuración o dependencias deben mantener actualizados los
archivos `package-lock.json` correspondientes.

## Convenciones de código

- Usa JavaScript en frontend y backend.
- Conserva el formato existente: punto y coma, indentación con tabulador y
  comillas dobles en archivos JSX/JavaScript existentes.
- Mantén frontend y backend desacoplados. El frontend accede al servidor
  mediante rutas relativas como `/api/orders`.
- Evita duplicar la lógica de cálculo: los módulos de cálculo están en
  `code/frontend/src/calculations.js` y `calculations.cjs`.
- Mantén las validaciones de entrada en el límite HTTP y conserva respuestas
  JSON claras.
- No introduzcas secretos ni rutas absolutas de datos en el código o Git.
- Usa nombres claros y cambios pequeños y centrados.

## Pruebas

Antes de entregar cambios, ejecuta al menos:

```bash
cd code/frontend
npm run build

cd ../backend
npm test
```

También se recomienda una comprobación manual de los flujos afectados:

- cálculo y guardado de pedidos;
- carga del historial;
- respuesta `/health`;
- persistencia con Docker;
- comportamiento de desarrollo con Vite y el backend.

Añade o actualiza pruebas cuando cambie la lógica de cálculo o del servidor.
Las pruebas existentes usan `node:test` y están en
`code/backend/app.test.js`.

## Comprobación antes de crear un commit

Usa esta secuencia mínima:

```bash
npm --prefix code/frontend run build
npm --prefix code/backend test
git diff --check
git diff --stat
git diff
```

No incluyas `code/frontend/dist/`, bases de datos ni dependencias instaladas.
Revisa el diff final para asegurar que no quedan cambios ajenos o temporales.

## Mensajes de commit

Sigue Conventional Commits:

- `feat: añadir exportación de pedidos`
- `fix: validar precios negativos`
- `docs: ampliar guía de instalación`
- `test: añadir casos de cálculo`
- `chore: actualizar dependencias`
- `ci: publicar una imagen multiarquitectura`

## Variables de entorno

- `PORT`: puerto del servidor Express. Predeterminado: `3000`.
- `DB_PATH`: ruta completa o relativa a la base SQLite.
  Predeterminado: `code/backend/data/orders.db`.
- `NODE_ENV`: usada al ejecutar la aplicación; no es necesaria para desarrollo.
