/**
 * WhatsApp Integration Utility for Betfalme Staff System
 */

const WHATSAPP_CONFIG = {
  // Replace with the tech team's WhatsApp number (with country code)
  TECH_TEAM_NUMBER: '254717619337', 
  
  // Option: 'api' (background sending)
  // Supported APIs: 'callmebot' (free for personal use) or 'whapi' (premium/business)
  MODE: 'callmebot', 
  
  // CallMeBot API Key (Get it by messaging +34 644 20 47 56 on WhatsApp with "I allow callmebot to send me messages")
  CALLMEBOT_API_KEY: 'YOUR_CALLMEBOT_KEY_HERE',

  // Whapi.Cloud credentials (Alternative for more professional use)
  WHAPI_TOKEN: 'YOUR_WHAPI_TOKEN_HERE',
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

  if (WHATSAPP_CONFIG.MODE === 'callmebot' && WHATSAPP_CONFIG.CALLMEBOT_API_KEY !== 'YOUR_CALLMEBOT_KEY_HERE') {
    // CallMeBot FREE API (GET Request)
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${WHATSAPP_CONFIG.CALLMEBOT_API_KEY}`;
    
    console.log(`[WhatsApp] CallMeBot sync started for: ${ticket.ticket_id}`);
    
    return fetch(url)
      .then(res => {
        console.log(`[WhatsApp] CallMeBot sync complete.`);
        return { success: true };
      })
      .catch(err => {
        console.error('[WhatsApp] CallMeBot sync failed:', err);
        return { success: false, error: err };
      });
  } else if (WHATSAPP_CONFIG.MODE === 'whapi' && WHATSAPP_CONFIG.WHAPI_TOKEN !== 'YOUR_WHAPI_TOKEN_HERE') {
    // Whapi.Cloud API (POST Request)
    return fetch('https://gate.whapi.cloud/messages/text', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_CONFIG.WHAPI_TOKEN}`
      },
      body: JSON.stringify({
        to: phoneNumber,
        body: message
      })
    })
    .then(res => res.json())
    .catch(err => {
      console.error('[WhatsApp] Whapi sync failed:', err);
      return { success: false, error: err };
    });
  } else {
    console.warn('[WhatsApp] No valid API token configured. Sync skipped.');
    return { success: false, error: 'Config missing' };
  }
};
