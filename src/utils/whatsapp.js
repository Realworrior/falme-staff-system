/**
 * WhatsApp Integration Utility for Betfalme Staff System
 */

const WHATSAPP_CONFIG = {
  // Replace with the tech team's WhatsApp number (with country code)
  TECH_TEAM_NUMBER: '254717619337', 
  
  // Option: 'api' (invisible background sending)
  MODE: 'api', 
  
  // SELF-HOSTED GATEWAY CONFIG (WAHA, Evolution API, etc.)
  // Example: 'http://your-server-ip:3000/api/sendText'
  API_URL: 'http://localhost:3000/api/sendText',
  
  // The header name your gateway uses for authentication (e.g., 'apikey' or 'X-Api-Key')
  API_KEY_HEADER: 'apikey',
  API_TOKEN: 'YOUR_SECRET_KEY_HERE',

  // The property names your API expects (WAHA uses 'chatId' and 'text')
  PAYLOAD_TYPE: 'waha', // 'waha' or 'evolution' or 'generic'
};

/**
 * Formats a ticket object into a well-designed WhatsApp message
 */
export const formatTicketForWhatsApp = (ticket) => {
  const urgencyEmoji = ticket.priority === 'High' ? '🔴' : ticket.priority === 'Medium' ? '🟡' : '⚪';
  
  return `🚨 *NEW TICKET: ${ticket.ticket_id}*
--------------------------
${urgencyEmoji} *Priority:* ${ticket.priority || 'Medium'}
👤 *Author:* ${ticket.author || 'Staff'}
📞 *User Phone:* ${ticket.phone || 'N/A'}
🛠️ *Category:* ${ticket.category || 'General'}
📝 *Title:* ${ticket.title}
--------------------------
💬 *Details:*
${ticket.comments || ticket.description || 'No additional details.'}
--------------------------
🕒 *Logged at:* ${new Date(ticket.time || Date.now()).toLocaleString()}
🔗 *View in Portal:* https://betmfalme.vercel.app/tickets
--------------------------
_Reply to this ticket or update status on the portal._`.trim();
};

/**
 * Sends or prepares the WhatsApp message
 */
export const sendTicketToWhatsApp = (ticket) => {
  const message = formatTicketForWhatsApp(ticket);
  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = WHATSAPP_CONFIG.TECH_TEAM_NUMBER;

  if (WHATSAPP_CONFIG.MODE === 'api' && WHATSAPP_CONFIG.API_TOKEN !== 'YOUR_SECRET_KEY_HERE') {
    // Background API call (Invisible to Staff)
    console.log(`[WhatsApp] Attempting self-hosted sync for: ${ticket.ticket_id}`);
    
    // Prepare payload based on gateway type
    let body = {};
    if (WHATSAPP_CONFIG.PAYLOAD_TYPE === 'waha') {
      body = {
        chatId: `${phoneNumber}@c.us`,
        text: message
      };
    } else if (WHATSAPP_CONFIG.PAYLOAD_TYPE === 'evolution') {
      body = {
        number: phoneNumber,
        message: message
      };
    } else {
      // Generic fallback
      body = { to: phoneNumber, message: message };
    }

    return fetch(WHATSAPP_CONFIG.API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        [WHATSAPP_CONFIG.API_KEY_HEADER]: WHATSAPP_CONFIG.API_TOKEN
      },
      body: JSON.stringify(body)
    })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log(`[WhatsApp] Sync complete for ${ticket.ticket_id}`);
      return { success: true };
    })
    .catch(err => {
      console.error('[WhatsApp] Self-hosted sync failed:', err);
      return { success: false, error: err };
    });
  } else {
    console.warn('[WhatsApp] Gateway not configured. Please update WHATSAPP_CONFIG in src/utils/whatsapp.js');
    return { success: false, error: 'API not configured' };
  }
};
