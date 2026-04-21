import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kgpcruwlejoougjbeouw.supabase.co'
const supabaseAnonKey = 'sb_publishable_IQ5GX8LA-KzgMOqBWHIUCg_SdDZ5zyQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing connection to Supabase...')
  const { data, error } = await supabase.from('tickets').select('*').limit(1)
  
  if (error) {
    console.error('Connection failed:', error.message)
  } else {
    console.log('Connection successful! Data:', data)
  }
}

test()
