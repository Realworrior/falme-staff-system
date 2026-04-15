import Papa from 'papaparse';
import * as fs from 'fs';

const STAFF_CONFIG = [
  { name: 'Ascar', type: 'NT_ROTATION', cycleOffset: 0 },
  { name: 'Chris', type: 'NT_ROTATION', cycleOffset: 3 },
  { name: 'Faye', type: 'NT_ROTATION', cycleOffset: 1 },
  { name: 'Joyce', type: 'NT_ROTATION', cycleOffset: 2 },
  { name: 'Linda', type: 'AM_ROTATION', cycleOffset: 0 }, 
  { name: 'Nickson', type: 'AM_ROTATION', cycleOffset: 2 }, 
  { name: 'pauline', type: 'NT_ROTATION', cycleOffset: 5 },
  { name: 'Sylvia', type: 'NT_ROTATION', cycleOffset: 6 },
  { name: 'Terry', type: 'NT_ROTATION', cycleOffset: 4 }
];

const cleanShift = (raw: string) => {
    if (!raw) return '';
    return raw.replace(/[^a-zA-Z]/g, '').toUpperCase();
};

const normalizeDate = (raw: string): string | null => {
    if (!raw) return null;
    const clean = raw.trim().replace(/,+/g, ',');
    const match = clean.match(/(\d+)/);
    if (match) {
        const dayNum = parseInt(match[1]);
        if (dayNum >= 1 && dayNum <= 31) {
            return `2026-04-${dayNum.toString().padStart(2, '0')}`;
        }
    }
    return null;
};

const text = fs.readFileSync('./test_rota.csv', 'utf8');

Papa.parse(text, {
  complete: (results) => {
    const data = results.data;
    console.log("Parsed rows:", data.length);
    console.log("Headers:", data[0]);

    const headers = data[0].map(h => h?.trim() || '');
    const staffIndices = [];
    const validStaffNames = STAFF_CONFIG.map(s => s.name.toLowerCase());

    headers.forEach((h, i) => {
      if (i === 0) return;
      if (validStaffNames.includes(h.toLowerCase())) {
        const properName = STAFF_CONFIG.find(s => s.name.toLowerCase() === h.toLowerCase())?.name;
        if (properName) staffIndices.push({ name: properName, index: i });
      }
    });
    
    console.log("Staff indices:", staffIndices);

    const result = {};
    const invalidEntries = [];

    data.slice(1).forEach((row, lineIdx) => {
      if (!row || row.length === 0 || !row[0]?.trim()) return;

      const rawDate = row[0].trim();
      const dateKey = normalizeDate(rawDate);

      if (!dateKey) {
        invalidEntries.push(`Row ${lineIdx + 2}: Invalid date "${rawDate}"`);
        return;
      }

      staffIndices.forEach(({ name, index }) => {
        const shift = cleanShift(row[index]);
        if (shift && ['AM', 'PM', 'NT', 'OFF'].includes(shift)) {
          if (!result[dateKey]) result[dateKey] = {};
          result[dateKey][name] = shift;
        }
      });
    });

    console.log("Invalid entries:", invalidEntries);
    console.log("Result length:", Object.keys(result).length);
    console.log("Result:", JSON.stringify(result, null, 2));

  },
  skipEmptyLines: true
});
