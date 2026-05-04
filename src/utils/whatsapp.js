/**
 * WhatsApp Integration Utility for Betfalme Staff System
 */

const WHATSAPP_CONFIG = {
  // Replace with the tech team's WhatsApp number (with country code)
  TECH_TEAM_NUMBER: '254717619337', 
  
  // Choose your provider: 'callmebot' (free/easiest), 'whapi' (professional free tier), or 'ultramsg'
  PROVIDER: 'callmebot', 

  // --- CALLMEBOT CONFIG ---
  // 1. Add +34 621 07 38 66 to your contacts
  // 2. Send "I allow callmebot to send me messages" to get your API key
  CALLMEBOT_API_KEY: 'YOUR_CALLMEBOT_KEY_HERE',

  // --- WHAPI CONFIG ---
  WHAPI_API_URL: 'https://gate.whapi.cloud/messages/text',
  WHAPI_TOKEN: 'YOUR_WHAPI_TOKEN_HERE',

  // --- ULTRAMSG CONFIG ---
  ULTRAMSG_API_URL: 'https://api.ultramsg.com/INSTANCE_ID/messages/chat',
  ULTRAMSG_TOKEN: 'YOUR_ULTRAMSG_TOKEN_HERE',
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
  const { PROVIDER, TECH_TEAM_NUMBER } = WHATSAPP_CONFIG;
  const message = formatTicketForWhatsApp(ticket);
  const encodedMessage = encodeURIComponent(message);

  // 1. CALLMEBOT (Easiest Free Option)
  if (PROVIDER === 'callmebot' && WHATSAPP_CONFIG.CALLMEBOT_API_KEY !== 'YOUR_CALLMEBOT_KEY_HERE') {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${TECH_TEAM_NUMBER}&text=${encodedMessage}&apikey=${WHATSAPP_CONFIG.CALLMEBOT_API_KEY}`;
    
    return fetch(url)
      .then(() => ({ success: true, method: 'callmebot' }))
      .catch(err => ({ success: false, error: err }));
  }

  // 2. WHAPI.CLOUD (Professional Free Tier)
  if (PROVIDER === 'whapi' && WHATSAPP_CONFIG.WHAPI_TOKEN !== 'YOUR_WHAPI_TOKEN_HERE') {
    return fetch(WHATSAPP_CONFIG.WHAPI_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_CONFIG.WHAPI_TOKEN}`
      },
      body: JSON.stringify({
        typing_time: 0,
        to: TECH_TEAM_NUMBER,
        body: message
      })
    })
    .then(res => ({ success: true, method: 'whapi' }))
    .catch(err => ({ success: false, error: err }));
  }

  // 3. ULTRAMSG (Legacy)
  if (PROVIDER === 'ultramsg' && WHATSAPP_CONFIG.ULTRAMSG_TOKEN !== 'YOUR_ULTRAMSG_TOKEN_HERE') {
    return fetch(WHATSAPP_CONFIG.ULTRAMSG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: WHATSAPP_CONFIG.ULTRAMSG_TOKEN,
        to: TECH_TEAM_NUMBER,
        body: message
      })
    })
    .then(res => ({ success: true, method: 'ultramsg' }))
    .catch(err => ({ success: false, error: err }));
  }

  console.warn(`[WhatsApp] Provider ${PROVIDER} not configured or missing API key.`);
  return { success: false, error: 'API not configured' };
};
