/**
 * WhatsApp Integration Utility for Betfalme Staff System
 */

const WHATSAPP_CONFIG = {
  // Replace with the tech team's WhatsApp number (with country code, e.g., '254111222333')
  TECH_TEAM_NUMBER: '254111222333', 
  
  // Option: 'redirect' (manual) or 'api' (automated)
  // For 'api', you need a service like UltraMsg, Whapi, or Twilio
  MODE: 'redirect', 
  
  // API credentials (if MODE is 'api')
  API_URL: '',
  API_TOKEN: '',
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

  if (WHATSAPP_CONFIG.MODE === 'redirect') {
    // Open WhatsApp Web or App with pre-filled message
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
    return { success: true, method: 'redirect' };
  } else if (WHATSAPP_CONFIG.MODE === 'api' && WHATSAPP_CONFIG.API_URL) {
    // background API call (e.g., UltraMsg)
    return fetch(WHATSAPP_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: WHATSAPP_CONFIG.API_TOKEN,
        to: phoneNumber,
        body: message
      })
    })
    .then(res => res.json())
    .catch(err => {
      console.error('WhatsApp API Error:', err);
      return { success: false, error: err };
    });
  }
  
  return { success: false, error: 'Invalid Configuration' };
};
