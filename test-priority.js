import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testPriority() {
  const priorities = ['Normal', 'High', 'Urgent', 'Low', 'Medium'];
  for (const p of priorities) {
    const { error } = await supabase.from('tickets').insert([{
      ticket_id: `PRIO-${p}-${Date.now()}`,
      priority: p,
      status: 'Pending',
      title: 'Testing'
    }]);
    if (error) console.log(`Priority ${p} FAILED:`, error.message);
    else console.log(`Priority ${p} SUCCESS`);
  }
}

testPriority();
