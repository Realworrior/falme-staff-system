import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const dbTicket = {
    ticket_id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
    category: "Payment Issue",
    title: "Test Title",
    phone: "123-456-7890",
    comments: "Test description",
    amount: null,
    status: 'open',
    author: "Staff"
  };

  const { data, error } = await supabase
    .from('tickets')
    .insert([dbTicket])
    .select();

  if (error) {
    console.error("Create ticket error:", error);
  } else {
    console.log("Success:", data);
  }
}

testInsert();
