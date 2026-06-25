import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const text = fs.readFileSync('Betfalme_Support_Templates_v4.md', 'utf8');

const categories = [];
let currentCat = null;
let currentTemplate = null;

const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  if (line.startsWith('# ') && line.includes('CATEGORY') && line.includes('—')) {
    const titleMatch = line.match(/CATEGORY \d+ — (.+)/);
    if (titleMatch) {
      currentCat = {
        category: titleMatch[1].trim(),
        templates: []
      };
      categories.push(currentCat);
    }
  } else if (line.startsWith('### ') && currentCat) {
    const title = line.replace('### ', '').replace(/^\d+\.\d+\s+/, '').trim();
    currentTemplate = {
      title,
      triggers: [],
      responses: []
    };
    currentCat.templates.push(currentTemplate);
  } else if (line.startsWith('⚡ *Triggers:') && currentTemplate) {
    const trigs = line.replace('⚡ *Triggers:', '').replace(/\*/g, '').split(',').map(t => t.trim());
    currentTemplate.triggers = trigs;
  } else if (line.startsWith('▸ **') && currentTemplate) {
    const type = line.match(/▸ \*\*(.*?)\*\*/)[1];
    let textBody = '';
    let j = i + 1;
    while (j < lines.length && !lines[j].startsWith('▸ **') && !lines[j].startsWith('### ') && !lines[j].startsWith('# ')) {
      if (lines[j].trim() !== '') {
        textBody += lines[j].trim() + ' ';
      }
      j++;
    }
    currentTemplate.responses.push({ type, text: textBody.trim() });
    i = j - 1; // skip lines we just read
  }
}

async function upload() {
  console.log(`Parsed ${categories.length} categories.`);
  const { error: delError } = await supabase.from('support_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) console.error('Delete error:', delError);
  
  for (const cat of categories) {
    const { error: insError } = await supabase.from('support_templates').insert([cat]);
    if (insError) console.error('Insert error for', cat.category, insError);
    else console.log('Inserted', cat.category);
  }
  console.log('Upload complete!');
}

upload();
