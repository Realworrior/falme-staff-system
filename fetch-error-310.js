async function fetchError() {
  const url = 'https://react.dev/errors/310';
  const response = await fetch(url);
  const text = await response.text();
  const match = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const match2 = text.match(/<div class="markdown">([\s\S]*?)<\/div>/i);
  console.log("Title: ", match ? match[1] : "not found");
  if (text.includes("Nothing was returned from render")) console.log("Nothing was returned");
}
fetchError();
