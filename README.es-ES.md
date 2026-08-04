

# Event Scraper

Raspador de eventos automatizado para eventos de UW HuskyLink. Esta herramienta extrae eventos de [https://huskylink.washington.edu/events](https://huskylink.washington.edu/events) y los almacena en múltiples formatos y destinos.

## Características

- 🔍 **Extracción automática de eventos**: Extrae eventos de HuskyLink utilizando Puppeteer
- 📄 **Exportación a JSON**: Genera archivos JSON individuales y combinados para cada evento
- ☁️ **Integración con Cloudflare KV**: Carga eventos en el almacenamiento Cloudflare KV
- 📝 **Integración con Strapi CMS**: Sincroniza eventos con el CMS headless Strapi
- ⏰ **Ejecución programada**: Se ejecuta según un horario utilizando patrones cron
- 🎯 **Datos extraídos**: Hora, ubicación, título, descripción, enlace de confirmación (RSVP) y más

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/YudoongY/event-scraper.git
cd event-scraper
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tu configuración
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
# HuskyLink URL
HUSKYLINK_URL=https://huskylink.washington.edu/events

# Cloudflare Configuration (optional)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id

# Strapi Configuration (optional)
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_token

# Output Configuration
OUTPUT_DIR=./output

# Cron Schedule (default: every day at 6 AM)
CRON_SCHEDULE=0 6 * * *
```

### Configuración de Cloudflare KV

1. Crea un espacio de nombres KV en tu cuenta de Cloudflare
2. Obtén tu ID de cuenta desde el panel de Cloudflare
3. Crea un token de API con permisos de escritura para KV
4. Añade las credenciales a `.env`

### Configuración de Strapi

1. Configura una instancia de Strapi (local o en la nube)
2. Crea un tipo de contenido `events` con los siguientes campos:
   - `title` (Texto)
   - `description` (Texto enriquecido)
   - `eventTime` (Texto)
   - `location` (Texto)
   - `rsvpLink` (Texto)
   - `eventLink` (Texto)
   - `imageUrl` (Texto)
   - `scrapedAt` (Fecha y hora)
3. Crea un token de API con permisos de escritura
4. Añade las credenciales a `.env`

## Uso

### Ejecutar una sola vez

Ejecuta el raspador una sola vez y sal:

```bash
npm start
# o
node src/index.js --once
```

### Ejecutar en un horario programado

Ejecuta el raspador en un horario programado (se mantiene en ejecución):

```bash
node src/index.js --schedule
```

Esto hará lo siguiente:
1. Se ejecutará inmediatamente al iniciar
2. Continuará ejecutándose según el horario cron en `.env`

### Ejemplos de horarios Cron

- `* * * * *` - Cada minuto
- `0 * * * *` - Cada hora
- `0 6 * * *` - Todos los días a las 6:00 AM (predeterminado)
- `0 0 * * 0` - Todos los domingos a medianoche
- `0 */6 * * *` - Cada 6 horas

## Salida

### Archivos JSON

Los eventos se guardan en `OUTPUT_DIR` (predeterminado: `./output/`):
- `event_1_[timestamp].json` - Archivos de eventos individuales
- `event_2_[timestamp].json`
- ...
- `all_events_[timestamp].json` - Todos los eventos en un solo archivo

### Estructura de datos del evento

Cada evento contiene:
```json
{
  "title": "Event Title",
  "description": "Event description...",
  "time": "Date and time information",
  "location": "Event location",
  "rsvpLink": "https://...",
  "eventLink": "https://...",
  "image": "https://...",
  "scrapedAt": "2025-10-28T02:00:00.000Z"
}
```

## Despliegue en servidor

### Usando PM2 (Gestor de procesos)

```bash
# Install PM2 globally
npm install -g pm2

# Start the scraper with PM2
pm2 start src/index.js --name event-scraper -- --schedule

# View logs
pm2 logs event-scraper

# Stop
pm2 stop event-scraper

# Restart
pm2 restart event-scraper
```

### Usando Docker

Crea un `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js", "--schedule"]
```

Construye y ejecuta:
```bash
docker build -t event-scraper .
docker run -d --env-file .env --name event-scraper event-scraper
```

### Usando systemd (Linux)

Crea `/etc/systemd/system/event-scraper.service`:
```ini
[Unit]
Description=Event Scraper Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/event-scraper
ExecStart=/usr/bin/node src/index.js --schedule
Restart=always
EnvironmentFile=/path/to/event-scraper/.env

[Install]
WantedBy=multi-user.target
```

Habilita e inicia:
```bash
sudo systemctl enable event-scraper
sudo systemctl start event-scraper
sudo systemctl status event-scraper
```

## Desarrollo

### Estructura del proyecto

```
event-scraper/
├── src/
│   ├── index.js        # Main entry point
│   ├── scraper.js      # Event scraping logic
│   ├── cloudflare.js   # Cloudflare KV integration
│   └── strapi.js       # Strapi CMS integration
├── output/             # Generated JSON files
├── .env                # Configuration (not in git)
├── .env.example        # Configuration template
├── .gitignore
├── package.json
└── README.md
```

### Dependencias

- **puppeteer**: Automatización del navegador para extracción de datos
- **axios**: Cliente HTTP para llamadas a API
- **dotenv**: Gestión de variables de entorno
- **node-cron**: Programación de tareas
- **cheerio**: Análisis de HTML (alternativa a Puppeteer)

## Solución de problemas

### Problemas con Puppeteer

Si Puppeteer no logra iniciarse:
```bash
# Install dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use puppeteer-core with existing Chrome
npm install puppeteer-core
```

### Errores al cargar en Cloudflare

- Verifica que tu token de API tenga permisos de escritura para KV
- Comprueba que el ID del espacio de nombres KV sea correcto
- Asegúrate de que tu ID de cuenta sea correcto

### Errores al cargar en Strapi

- Verifica que la URL de Strapi sea accesible
- Comprueba que el token de API sea válido
- Asegúrate de que exista el tipo de contenido `events` con los campos correspondientes

## Licencia

ISC
