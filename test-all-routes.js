async function testRoutes() {
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
  
  const base = 'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server-07e1ed14';
  const paths = [
    '/health',
    '/make-server-07e1ed14/health',
    '/login',
    '/make-server-07e1ed14/login'
  ];
  
  for (const p of paths) {
    const url = base + p;
    console.log(`URL: ${url}`);
    try {
      const response = await fetch(url, {
        method: p.includes('login') ? 'POST' : 'GET',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: p.includes('login') ? JSON.stringify({ phone:'123-456-7890', pin:'1234', role:'staff' }) : undefined
      });
      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Body:', text);
    } catch (err) { console.log(err.message); }
    console.log('---');
  }
}

testRoutes();
