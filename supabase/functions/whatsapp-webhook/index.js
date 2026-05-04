// Supabase Edge Function to handle WhatsApp Webhooks
// This allows tech teams to reply or update ticket status directly from WhatsApp

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    console.log("Received WhatsApp Webhook:", payload)

    // Example for UltraMsg: payload.data.body contains the message text
    // Expected format from Tech Team: "T-1234 Resolved" or "T-1234 In Progress"
    const messageText = payload.data?.body || ""
    const parts = messageText.trim().split(" ")

    if (parts.length >= 2 && parts[0].startsWith("T-")) {
      const ticketId = parts[0]
      const newStatus = parts.slice(1).join(" ") // Handles "In Progress"

      // Initialize Supabase
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL'),
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      )

      // Update Ticket
      const { error } = await supabase
        .from('tickets')
        .update({ status: newStatus })
        .eq('ticket_id', ticketId)

      if (error) throw error

      return new Response(JSON.stringify({ success: true, message: `Ticket ${ticketId} updated to ${newStatus}` }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: false, message: "No ticket command detected" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
