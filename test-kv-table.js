import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testTable() {
  console.log('Testing access to kv_store_07e1ed14...');
  const { data, error } = await supabase.from('kv_store_07e1ed14').select('*').limit(1);
  
  if (error) {
    console.error('Access failed:', error.message);
  } else {
    console.log('Access successful! Data:', data);
  }
}

testTable();
