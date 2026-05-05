const testCases = [
  "Fri , , 1",
  "Sat , , 2",
  "Sun , , 3",
  "Mon , , 4",
  "1",
  "01",
  "Fri, 1",
  "Fri 1",
  "Fri, , 1"
];

const year = 2026;
const month = 4; // May

testCases.forEach(raw => {
  const clean = raw.trim()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/(\d+)(st|nd|rd|th)/i, '$1')
      .replace(/\s+/g, ' ');
      
  const dayMatch = clean.match(/(?:[a-zA-Z]{2,10}|,|\s)+\s*(\d{1,2})$/i);
  let result = null;
  if (dayMatch) {
    const dayNum = parseInt(dayMatch[1]);
    if (dayNum >= 1 && dayNum <= 31) {
      try {
        const d = new Date(year, month, dayNum);
        if (!isNaN(d.getTime())) result = d.toISOString().split('T')[0];
      } catch (e) { result = null; }
    }
  }
  console.log(`"${raw}" -> "${clean}" -> `, dayMatch ? dayMatch[1] : null, " -> ", result);
});
