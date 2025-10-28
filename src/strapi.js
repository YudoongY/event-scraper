const axios = require('axios');

/**
 * Uploads events to Strapi CMS
 * @param {Array} events - Array of event objects
 * @param {Object} config - Strapi configuration
 */
async function uploadToStrapi(events, config) {
  const { url, apiToken } = config;
  
  if (!url || !apiToken) {
    console.warn('Strapi configuration incomplete. Skipping upload.');
    return;
  }
  
  console.log('Uploading events to Strapi CMS...');
  
  try {
    const uploadedEvents = [];
    
    for (const event of events) {
      // Transform event data to Strapi format
      const strapiEvent = {
        data: {
          title: event.title,
          description: event.description,
          eventTime: event.time,
          location: event.location,
          rsvpLink: event.rsvpLink,
          eventLink: event.eventLink,
          imageUrl: event.image,
          scrapedAt: event.scrapedAt,
          publishedAt: new Date().toISOString()
        }
      };
      
      try {
        // Post to Strapi events collection
        // Assumes you have an 'events' content type in Strapi
        const response = await axios.post(
          `${url}/api/events`,
          strapiEvent,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        uploadedEvents.push(response.data);
        console.log(`Uploaded event: ${event.title}`);
      } catch (error) {
        console.error(`Failed to upload event "${event.title}":`, error.message);
        if (error.response) {
          console.error('Response data:', error.response.data);
        }
      }
    }
    
    console.log(`Successfully uploaded ${uploadedEvents.length} out of ${events.length} events to Strapi`);
    return uploadedEvents;
  } catch (error) {
    console.error('Error uploading to Strapi:', error.message);
    throw error;
  }
}

/**
 * Gets existing events from Strapi
 * @param {Object} config - Strapi configuration
 */
async function getEventsFromStrapi(config) {
  const { url, apiToken } = config;
  
  if (!url || !apiToken) {
    console.warn('Strapi configuration incomplete.');
    return [];
  }
  
  try {
    const response = await axios.get(
      `${url}/api/events`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching events from Strapi:', error.message);
    return [];
  }
}

module.exports = {
  uploadToStrapi,
  getEventsFromStrapi
};
