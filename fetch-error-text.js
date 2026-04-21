import * as cheerio from 'cheerio';
async function fetchErrorText() {
  const url = 'https://react.dev/errors/310';
  const response = await fetch(url);
  const text = await response.text();
  const $ = cheerio.load(text);
  console.log($('p').map((i, el) => $(el).text()).get().join('\n'));
}
fetchErrorText();
