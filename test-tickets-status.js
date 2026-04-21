import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  const statuses = ['Pending', 'Resolved', 'Closed', 'Open', 'New', 'pending', 'resolved'];
  
  for (const status of statuses) {
    const dbTicket = {
      ticket_id: `T-${Math.floor(1000 + Math.random() * 9000)}-${status}`,
      category: "Payment Issue",
      title: "Test Title",
      comments: "Test description",
      status: status,
      author: "Staff"
    };

    const { data, error } = await supabase.from('tickets').insert([dbTicket]).select();

    if (error) {
      console.log(`Failed for status ${status}:`, error.message);
    } else {
      console.log(`SUCCESS for status ${status}`);
    }
  }
}

testInsert();
