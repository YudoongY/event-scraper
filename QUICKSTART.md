# Quick Start Guide

This guide will help you get the event scraper up and running quickly.

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- (Optional) Docker for containerized deployment

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YudoongY/event-scraper.git
   cd event-scraper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (Cloudflare and Strapi are optional)
   ```

## Usage

### Run Once (Quick Test)

```bash
npm start
```

This will:
- Scrape events from HuskyLink
- Save JSON files to the `output/` directory
- Upload to Cloudflare KV (if configured)
- Upload to Strapi (if configured)
- Exit

### Run on Schedule

```bash
npm run schedule
```

This will:
- Run immediately on start
- Continue running and scrape events based on the cron schedule in `.env`
- Default schedule: Every day at 6 AM

### Custom Scrape Only

```bash
npm run scrape
```

## Output

Events will be saved to the `output/` directory (configurable via `OUTPUT_DIR` in `.env`):

- `event_1_[timestamp].json` - Individual event files
- `event_2_[timestamp].json`
- ...
- `all_events_[timestamp].json` - All events combined

## Configuration

Edit `.env` file:

```env
# Required
HUSKYLINK_URL=https://huskylink.washington.edu/events

# Optional - Cloudflare KV
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id

# Optional - Strapi CMS
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_token

# Output
OUTPUT_DIR=./output

# Schedule (cron pattern)
CRON_SCHEDULE=0 6 * * *
```

## Deployment Options

### Option 1: Docker (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the scraper
pm2 start ecosystem.config.js

# View logs
pm2 logs event-scraper

# Stop
pm2 stop event-scraper
```

### Option 3: systemd (Linux Service)

```bash
# Copy files
sudo cp event-scraper.service /etc/systemd/system/

# Edit service file with your paths
sudo nano /etc/systemd/system/event-scraper.service

# Enable and start
sudo systemctl enable event-scraper
sudo systemctl start event-scraper

# Check status
sudo systemctl status event-scraper
```

## Testing

```bash
npm test
```

This runs a mock test to verify the event structure and JSON saving functionality.

## Troubleshooting

### Network Errors

If you get network errors when scraping:
- Check that the HuskyLink URL is accessible
- Verify your network/firewall settings
- The scraper will use a fallback method if Puppeteer fails

### Puppeteer Not Working

The scraper includes a fallback that uses axios + cheerio if Puppeteer isn't available. In Docker, Chromium is installed automatically.

### Cloudflare/Strapi Upload Errors

These are optional features. If you don't need them, just leave the configuration empty in `.env`. The scraper will still save JSON files locally.

## Next Steps

1. ✅ Run `npm test` to verify everything works
2. ✅ Run `npm start` to do a test scrape
3. ✅ Configure Cloudflare KV or Strapi if needed
4. ✅ Deploy using your preferred method
5. ✅ Monitor the logs to ensure scheduled scraping works

## Support

For issues or questions, please open an issue on GitHub.
