async function testRoot() {
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
  const url = 'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server-07e1ed14';
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${anonKey}` } });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Body:', text);
  } catch (err) { console.log(err.message); }
}
testRoot();
