const axios = require('axios');

/**
 * Uploads events to Cloudflare KV storage
 * @param {Array} events - Array of event objects
 * @param {Object} config - Cloudflare configuration
 */
async function uploadToCloudflare(events, config) {
  const { accountId, apiToken, kvNamespaceId } = config;
  
  if (!accountId || !apiToken || !kvNamespaceId) {
    console.warn('Cloudflare configuration incomplete. Skipping upload.');
    return;
  }
  
  console.log('Uploading events to Cloudflare KV...');
  
  try {
    const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespaceId}`;
    
    // Upload all events as a single key
    const allEventsKey = `events_all_${Date.now()}`;
    await axios.put(
      `${baseUrl}/values/${allEventsKey}`,
      JSON.stringify(events),
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`Uploaded all events with key: ${allEventsKey}`);
    
    // Upload individual events
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const eventKey = `event_${i + 1}_${Date.now()}`;
      
      await axios.put(
        `${baseUrl}/values/${eventKey}`,
        JSON.stringify(event),
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`Uploaded event ${i + 1} with key: ${eventKey}`);
    }
    
    // Upload latest events index
    await axios.put(
      `${baseUrl}/values/events_latest`,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        count: events.length,
        key: allEventsKey
      }),
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('Updated latest events index');
    
    console.log('Successfully uploaded to Cloudflare KV');
  } catch (error) {
    console.error('Error uploading to Cloudflare:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

module.exports = {
  uploadToCloudflare
};
