import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCreate() {
  const dbTicket = {
    ticket_id: `DEBUG-${Date.now()}`,
    category: "Debug",
    title: "Debug Ticket",
    phone: "123",
    comments: "Testing full schema",
    amount: 100,
    status: 'Pending',
    author: "Debugger"
  };

  console.log("Attempting insert with payload:", dbTicket);
  const { data, error } = await supabase
    .from('tickets')
    .insert([dbTicket])
    .select();

  if (error) {
    console.error("FULL ERROR OBJECT:", JSON.stringify(error, null, 2));
  } else {
    console.log("SUCCESS:", data);
  }
}

debugCreate();
