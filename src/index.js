require('dotenv').config();
const cron = require('node-cron');
const { scrapeEvents, saveEventsToJSON } = require('./scraper');
const { uploadToCloudflare } = require('./cloudflare');
const { uploadToStrapi } = require('./strapi');

/**
 * Main function to run the scraper
 */
async function runScraper() {
  console.log('\n=================================');
  console.log('Starting Event Scraper');
  console.log('Time:', new Date().toISOString());
  console.log('=================================\n');
  
  try {
    // Get configuration from environment variables
    const huskyLinkUrl = process.env.HUSKYLINK_URL || 'https://huskylink.washington.edu/events';
    const outputDir = process.env.OUTPUT_DIR || './output';
    
    // Scrape events
    const events = await scrapeEvents(huskyLinkUrl);
    
    if (events.length === 0) {
      console.log('No events found. Exiting.');
      return;
    }
    
    // Save to JSON files
    console.log('\nSaving events to JSON files...');
    await saveEventsToJSON(events, outputDir);
    
    // Upload to Cloudflare KV
    const cloudflareConfig = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      kvNamespaceId: process.env.CLOUDFLARE_KV_NAMESPACE_ID
    };
    
    if (cloudflareConfig.accountId && cloudflareConfig.apiToken && cloudflareConfig.kvNamespaceId) {
      console.log('\nUploading to Cloudflare...');
      await uploadToCloudflare(events, cloudflareConfig);
    } else {
      console.log('\nSkipping Cloudflare upload (configuration not provided)');
    }
    
    // Upload to Strapi
    const strapiConfig = {
      url: process.env.STRAPI_URL,
      apiToken: process.env.STRAPI_API_TOKEN
    };
    
    if (strapiConfig.url && strapiConfig.apiToken) {
      console.log('\nUploading to Strapi...');
      await uploadToStrapi(events, strapiConfig);
    } else {
      console.log('\nSkipping Strapi upload (configuration not provided)');
    }
    
    console.log('\n=================================');
    console.log('Scraper completed successfully!');
    console.log('Events processed:', events.length);
    console.log('=================================\n');
    
  } catch (error) {
    console.error('\n=================================');
    console.error('Error running scraper:', error);
    console.error('=================================\n');
    throw error;
  }
}

/**
 * Set up scheduled scraping
 */
function setupScheduler() {
  const cronSchedule = process.env.CRON_SCHEDULE || '0 6 * * *'; // Default: 6 AM daily
  
  console.log(`Setting up scheduler with cron pattern: ${cronSchedule}`);
  console.log('Cron pattern guide:');
  console.log('  * * * * * - Every minute');
  console.log('  0 * * * * - Every hour');
  console.log('  0 6 * * * - Every day at 6 AM');
  console.log('  0 0 * * 0 - Every Sunday at midnight\n');
  
  cron.schedule(cronSchedule, () => {
    console.log('Cron job triggered');
    runScraper().catch(console.error);
  });
  
  console.log('Scheduler started successfully!');
  console.log('Server is running and waiting for scheduled tasks...\n');
}

// Main entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--once') || args.includes('-o')) {
    // Run once and exit
    console.log('Running scraper once...\n');
    runScraper()
      .then(() => {
        console.log('Done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
      });
  } else if (args.includes('--schedule') || args.includes('-s')) {
    // Run on schedule
    console.log('Starting scheduled scraper...\n');
    setupScheduler();
    // Run immediately on start
    runScraper().catch(console.error);
  } else {
    // Default: run once
    console.log('Running scraper once... (use --schedule to run on a schedule)\n');
    runScraper()
      .then(() => {
        console.log('Done!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('Failed:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  runScraper,
  setupScheduler
};
