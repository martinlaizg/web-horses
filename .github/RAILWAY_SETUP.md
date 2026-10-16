# Railway Preview Deployments - Configuración

Este proyecto está configurado para desplegar automáticamente **preview environments** en Railway para cada Pull Request.

## 🔧 Requisitos previos

1. **Cuenta en Railway** - Regístrate en [https://railway.app](https://railway.app)
2. **Token de API de Railway** - Necesario para autenticar los despliegues
3. **ID del Proyecto en Railway** - El proyecto donde se desplegarán los servicios

## 📝 Configuración

### 1. Obtener el Token de API de Railway

1. Ve a [Railway App](https://railway.app) e inicia sesión
2. Haz clic en tu avatar en la esquina superior derecha
3. Selecciona **Settings** > **API Tokens**
4. Crea un nuevo token (o usa uno existente)
5. Copia el token

### 2. Crear el Proyecto en Railway

1. Ve a [Railway App](https://railway.app)
2. Haz clic en **New Project**
3. Dale un nombre como `web-horses`
4. Copia el **Project ID** (lo verás en la URL: `https://railway.app/project/XXXXXX`)

### 3. Configurar Secrets en GitHub

Ve a tu repositorio en GitHub:
- **Settings** > **Secrets and variables** > **Actions** > **New repository secret**

Añade estos secrets:

| Nombre | Valor | Descripción |
|--------|-------|-------------|
| `RAILWAY_TOKEN` | Tu token de API | Para autenticar con Railway |
| `RAILWAY_PROJECT_ID` | ID del proyecto | Ej: `12345678-1234-1234-1234-123456789abc` |

### 4. Instalar Railway CLI (opcional, para desarrollo local)

```bash
npm install -g @railway/cli
railway login
```

## ✅ ¿Cómo funciona?

1. **Al abrir un PR**: Se crea automáticamente un despliegue en Railway
2. **Comentario en el PR**: Se publica un comentario con el URL del preview
3. **Al fusionar/cerrar el PR**: Se elimina automáticamente el servicio
4. **Limpieza diaria**: Un workflow elimina servicios antiguos (a las 00:00 UTC)

## 🔄 Workflows

- **`.github/workflows/railway-preview.yml`** - Despliega previews para cada PR
- **`.github/workflows/railway-cleanup.yml`** - Limpieza diaria de previews antiguos

## 🚀 Despliegue manual

Puedes ejecutar manualmente los workflows desde:
- GitHub Actions > Railway Preview Deployment > Run workflow

## ⚠️ Notas

- Los preview deployments usan Docker (como tu `docker-compose.yml`)
- Cada servicio tiene un nombre único: `web-horses-pr-{NUMERO_DE_PR}`
- El volumen de SQLite (`orders-data`) es efímero en previews
- El puerto expuesto es el 3000 (configurado en Dockerfile)

## 📞 Solución de problemas

Si el despliegue falla:
1. Verifica que los secrets estén configurados correctamente
2. Revisa los logs en GitHub Actions
3. Asegúrate de que tu cuenta de Railway tenga créditos disponibles
4. Verifica que el Project ID sea correcto

## 🔗 Recursos

- [Railway Documentation](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/guides/cli)
- [GitHub Actions for Railway](https://github.com/marketplace/actions/railway-deploy)
