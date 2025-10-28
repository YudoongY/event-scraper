const fs = require('fs').promises;
const path = require('path');

let puppeteer;
let usePuppeteer = true;

// Try to load puppeteer, fall back to simple scraper if not available
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.warn('Puppeteer not available, will use simple scraper');
  usePuppeteer = false;
}

/**
 * Scrapes events from HuskyLink using Puppeteer
 * @param {string} url - The HuskyLink events URL
 * @returns {Promise<Array>} Array of event objects
 */
async function scrapeEventsWithPuppeteer(url) {
  console.log(`Starting to scrape events from: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    console.log('Navigating to events page...');
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });
    
    // Wait for events to load
    console.log('Waiting for events to load...');
    await page.waitForSelector('.event-item, .event, [class*="event"]', { timeout: 30000 }).catch(() => {
      console.log('Default selector not found, trying alternative selectors...');
    });
    
    // Extract event data
    console.log('Extracting event data...');
    const events = await page.evaluate(() => {
      const eventElements = document.querySelectorAll('[class*="event"]');
      const eventsData = [];
      
      eventElements.forEach((element) => {
        // Skip if element is too small or hidden
        if (element.offsetHeight < 10) return;
        
        const event = {};
        
        // Extract title
        const titleEl = element.querySelector('h1, h2, h3, h4, [class*="title"], [class*="name"]');
        event.title = titleEl ? titleEl.innerText.trim() : '';
        
        // Extract description
        const descEl = element.querySelector('[class*="description"], [class*="detail"], p');
        event.description = descEl ? descEl.innerText.trim() : '';
        
        // Extract time/date
        const timeEl = element.querySelector('[class*="time"], [class*="date"], time');
        event.time = timeEl ? timeEl.innerText.trim() : '';
        
        // Extract location
        const locationEl = element.querySelector('[class*="location"], [class*="venue"], [class*="place"]');
        event.location = locationEl ? locationEl.innerText.trim() : '';
        
        // Extract RSVP link
        const rsvpEl = element.querySelector('a[href*="rsvp"], a[href*="register"], a[class*="rsvp"]');
        event.rsvpLink = rsvpEl ? rsvpEl.href : '';
        
        // Extract event link
        const eventLinkEl = element.querySelector('a[href]');
        event.eventLink = eventLinkEl ? eventLinkEl.href : '';
        
        // Extract image if available
        const imageEl = element.querySelector('img');
        event.image = imageEl ? imageEl.src : '';
        
        // Only add if we have at least a title
        if (event.title) {
          event.scrapedAt = new Date().toISOString();
          eventsData.push(event);
        }
      });
      
      return eventsData;
    });
    
    console.log(`Successfully scraped ${events.length} events`);
    return events;
    
  } catch (error) {
    console.error('Error scraping events:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Scrapes events from HuskyLink (tries Puppeteer first, falls back to simple scraper)
 * @param {string} url - The HuskyLink events URL
 * @returns {Promise<Array>} Array of event objects
 */
async function scrapeEvents(url) {
  if (usePuppeteer) {
    try {
      return await scrapeEventsWithPuppeteer(url);
    } catch (error) {
      console.warn('Puppeteer scraping failed, falling back to simple scraper:', error.message);
    }
  }
  
  // Fall back to simple scraper
  const { scrapeEventsSimple } = require('./simpleScraper');
  return await scrapeEventsSimple(url);
}

/**
 * Saves events to JSON files
 * @param {Array} events - Array of event objects
 * @param {string} outputDir - Directory to save JSON files
 */
async function saveEventsToJSON(events, outputDir) {
  try {
    // Create output directory if it doesn't exist
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save individual event files
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const filename = `event_${i + 1}_${Date.now()}.json`;
      const filepath = path.join(outputDir, filename);
      await fs.writeFile(filepath, JSON.stringify(event, null, 2));
      console.log(`Saved event to ${filepath}`);
    }
    
    // Save all events to a single file
    const allEventsFile = path.join(outputDir, `all_events_${Date.now()}.json`);
    await fs.writeFile(allEventsFile, JSON.stringify(events, null, 2));
    console.log(`Saved all events to ${allEventsFile}`);
    
    return { individualFiles: events.length, allEventsFile };
  } catch (error) {
    console.error('Error saving events:', error);
    throw error;
  }
}

module.exports = {
  scrapeEvents,
  saveEventsToJSON
};
