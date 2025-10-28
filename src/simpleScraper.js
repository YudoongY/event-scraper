const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

/**
 * Scrapes events using axios and cheerio (lightweight alternative to Puppeteer)
 * @param {string} url - The HuskyLink events URL
 * @returns {Promise<Array>} Array of event objects
 */
async function scrapeEventsSimple(url) {
  console.log(`Starting to scrape events from: ${url} (using simple scraper)`);
  
  try {
    // Fetch the page
    console.log('Fetching events page...');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 30000
    });
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    const events = [];
    
    // Find event elements - adjust selectors based on actual page structure
    $('[class*="event"]').each((i, element) => {
      const $element = $(element);
      
      // Skip very small elements
      if ($element.text().trim().length < 10) return;
      
      const event = {};
      
      // Extract title
      const $title = $element.find('h1, h2, h3, h4, [class*="title"], [class*="name"]').first();
      event.title = $title.text().trim();
      
      // Extract description
      const $desc = $element.find('[class*="description"], [class*="detail"], p').first();
      event.description = $desc.text().trim();
      
      // Extract time/date
      const $time = $element.find('[class*="time"], [class*="date"], time').first();
      event.time = $time.text().trim();
      
      // Extract location
      const $location = $element.find('[class*="location"], [class*="venue"], [class*="place"]').first();
      event.location = $location.text().trim();
      
      // Extract RSVP link
      const $rsvp = $element.find('a[href*="rsvp"], a[href*="register"], a[class*="rsvp"]').first();
      event.rsvpLink = $rsvp.attr('href') || '';
      
      // Extract event link
      const $link = $element.find('a[href]').first();
      const eventLink = $link.attr('href') || '';
      // Make absolute URLs
      if (eventLink && eventLink.startsWith('/')) {
        const urlObj = new URL(url);
        event.eventLink = `${urlObj.protocol}//${urlObj.host}${eventLink}`;
      } else {
        event.eventLink = eventLink;
      }
      
      // Extract image
      const $image = $element.find('img').first();
      const imageSrc = $image.attr('src') || '';
      // Make absolute URLs
      if (imageSrc && imageSrc.startsWith('/')) {
        const urlObj = new URL(url);
        event.image = `${urlObj.protocol}//${urlObj.host}${imageSrc}`;
      } else {
        event.image = imageSrc;
      }
      
      // Only add if we have at least a title
      if (event.title) {
        event.scrapedAt = new Date().toISOString();
        events.push(event);
      }
    });
    
    console.log(`Successfully scraped ${events.length} events`);
    return events;
    
  } catch (error) {
    console.error('Error scraping events:', error.message);
    throw error;
  }
}

module.exports = {
  scrapeEventsSimple
};
