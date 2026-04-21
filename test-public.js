async function testPublic() {
  const url = 'https://kgpcruwlejoougjbeouw.supabase.co/functions/v1/make-server-07e1ed14/login';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone:'123-456-7890', pin:'1234', role:'staff' })
    });
    const text = await response.text();
    console.log('Status (Public):', response.status);
    console.log('Body:', text);
  } catch (err) { console.log(err.message); }
}
testPublic();
