/**
 * WhatsApp Integration Utility for Betfalme Staff System
 */

const WHATSAPP_CONFIG = {
  // Replace with the tech team's WhatsApp number (with country code, e.g., '254111222333')
  TECH_TEAM_NUMBER: '254111222333', 
  
  // Option: 'api' (invisible background sending)
  // To use this, you need a service like UltraMsg or Whapi.
  MODE: 'api', 
  
  // API credentials for the WhatsApp Gateway (e.g., UltraMsg)
  // Get these from your provider dashboard
  API_URL: 'https://api.ultramsg.com/INSTANCE_ID/messages/chat',
  API_TOKEN: 'YOUR_TOKEN_HERE',
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

  if (WHATSAPP_CONFIG.MODE === 'api' && WHATSAPP_CONFIG.API_TOKEN !== 'YOUR_TOKEN_HERE') {
    // Background API call (Invisible to Staff)
    console.log(`[WhatsApp] Background sync started for ticket: ${ticket.ticket_id}`);
    
    return fetch(WHATSAPP_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: WHATSAPP_CONFIG.API_TOKEN,
        to: phoneNumber,
        body: message
      })
    })
    .then(res => {
      console.log(`[WhatsApp] Sync complete for ${ticket.ticket_id}`);
      return { success: true, method: 'api' };
    })
    .catch(err => {
      console.error('[WhatsApp] Background sync failed:', err);
      return { success: false, error: err };
    });
  } else {
    // Fallback if no API is configured yet
    console.warn('[WhatsApp] No API configured. In-app notification only.');
    return { success: false, error: 'API not configured' };
  }
};
