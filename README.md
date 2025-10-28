# Event Scraper

Automated event scraper for UW HuskyLink events. This tool scrapes events from [https://huskylink.washington.edu/events](https://huskylink.washington.edu/events) and stores them in multiple formats and destinations.

## Features

- 🔍 **Automatic Event Scraping**: Scrapes events from HuskyLink using Puppeteer
- 📄 **JSON Export**: Generates individual and combined JSON files for each event
- ☁️ **Cloudflare KV Integration**: Uploads events to Cloudflare KV storage
- 📝 **Strapi CMS Integration**: Syncs events with Strapi headless CMS
- ⏰ **Scheduled Execution**: Run on a schedule using cron patterns
- 🎯 **Extracted Data**: Time, location, title, description, RSVP link, and more

## Installation

1. Clone the repository:
```bash
git clone https://github.com/YudoongY/event-scraper.git
cd event-scraper
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Configuration

Create a `.env` file based on `.env.example`:

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

### Cloudflare KV Setup

1. Create a KV namespace in your Cloudflare account
2. Get your Account ID from Cloudflare dashboard
3. Create an API token with KV write permissions
4. Add credentials to `.env`

### Strapi Setup

1. Set up a Strapi instance (local or cloud)
2. Create an `events` content type with fields:
   - `title` (Text)
   - `description` (Rich Text)
   - `eventTime` (Text)
   - `location` (Text)
   - `rsvpLink` (Text)
   - `eventLink` (Text)
   - `imageUrl` (Text)
   - `scrapedAt` (DateTime)
3. Create an API token with write permissions
4. Add credentials to `.env`

## Usage

### Run Once

Run the scraper once and exit:

```bash
npm start
# or
node src/index.js --once
```

### Run on Schedule

Run the scraper on a schedule (keeps running):

```bash
node src/index.js --schedule
```

This will:
1. Run immediately on start
2. Continue running based on the cron schedule in `.env`

### Cron Schedule Examples

- `* * * * *` - Every minute
- `0 * * * *` - Every hour
- `0 6 * * *` - Every day at 6 AM (default)
- `0 0 * * 0` - Every Sunday at midnight
- `0 */6 * * *` - Every 6 hours

## Output

### JSON Files

Events are saved to the `OUTPUT_DIR` (default: `./output/`):
- `event_1_[timestamp].json` - Individual event files
- `event_2_[timestamp].json`
- ...
- `all_events_[timestamp].json` - All events in one file

### Event Data Structure

Each event contains:
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

## Server Deployment

### Using PM2 (Process Manager)

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

### Using Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "src/index.js", "--schedule"]
```

Build and run:
```bash
docker build -t event-scraper .
docker run -d --env-file .env --name event-scraper event-scraper
```

### Using systemd (Linux)

Create `/etc/systemd/system/event-scraper.service`:
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

Enable and start:
```bash
sudo systemctl enable event-scraper
sudo systemctl start event-scraper
sudo systemctl status event-scraper
```

## Development

### Project Structure

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

### Dependencies

- **puppeteer**: Browser automation for scraping
- **axios**: HTTP client for API calls
- **dotenv**: Environment variable management
- **node-cron**: Task scheduling
- **cheerio**: HTML parsing (alternative to Puppeteer)

## Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:
```bash
# Install dependencies (Linux)
sudo apt-get install -y chromium-browser

# Or use puppeteer-core with existing Chrome
npm install puppeteer-core
```

### Cloudflare Upload Errors

- Verify your API token has KV write permissions
- Check that the KV namespace ID is correct
- Ensure your account ID is correct

### Strapi Upload Errors

- Verify the Strapi URL is accessible
- Check that the API token is valid
- Ensure the `events` content type exists with matching fields

## License

ISC
