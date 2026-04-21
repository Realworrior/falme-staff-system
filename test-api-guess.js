async function testGuess() {
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
  
  const urls = [
    'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server/make-server-07e1ed14/login',
    'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server/login'
  ];
  
  for (const url of urls) {
    console.log(`URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone:'123-456-7890', pin:'1234', role:'staff' })
      });
      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Body:', text);
    } catch (err) { console.log(err.message); }
    console.log('---');
  }
}

testGuess();
