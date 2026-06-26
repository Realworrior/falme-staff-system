// === BLASTCHAT MATRIX — Persistent Draggable Floating Panel + '/' Inline Menu ===

if (window.blastchatInjected) {
  console.log("BlastChat already injected");
  throw new Error("Already injected");
}
window.blastchatInjected = true;
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
let allTemplatesCache = null;
let lastFocusedInput = null;

// PANEL STATE
let panelRoot = null;
let panelShadow = null;
let panelVisible = false;
let panelMinimized = false;
let panelWidth = 440;
let panelHeight = 580;
let panelX = window.innerWidth - 460;
let panelY = 40;
let isDragging = false;
let isResizing = false;
let dragOffX = 0;
let dragOffY = 0;
let panelAllTemplates = [];
let panelActiveCategory = 'ALL';
let panelActiveShortcut = null;
let categoryIndexPanel = 0;

// SLASH MENU STATE
let slashRoot = null;
let slashShadow = null;
let slashVisible = false;
let slashSearch = '';
let slashActiveIndex = 0;
let slashFiltered = [];

// ─────────────────────────────────────────────────────────────────────────────
// SHORTCUTS
// ─────────────────────────────────────────────────────────────────────────────
const SHORTCUT_MAPPING = {
  'hello':           ['Client Says Hi / Silent After Auto Greeting'],
  'thank you':       ['Closing Statement'],
  'deposit':         ['Failed Deposit — M-PESA Code Required', 'General M-PESA Deposit Delay'],
  'lost amount':     ['Filing a Lost Amount Case — Requesting Details', 'Lost Stake — Error / Something Went Wrong / Rejected Bet', 'Lost Stake — Error During Virtual Game'],
  'roll back':       ['Roll Back — Funds Successfully Returned'],
  'phone number':    ["Client Is Vague — 'Help' / 'Problem'"],
  'case submitted':  ['Case Submitted to Technical Team'],
  'delete':          ['Account Closure / Self-Exclusion', 'Cooling — Pending Account Closure (Frustrated Client)'],
  'cashback':        ['Where Is My Cashback', 'Cashback Not Received — Conditions Not Met', 'How to Calculate Cashback', 'Will I Get Cashback Today', 'Daily Cashback Reset Window — 8:30 to 8:40 PM'],
  'activated':       ['Client Eligible to Withdraw', 'Account Reset Confirmation']
};

const SHORTCUT_COLORS = {
  'hello':           { bg: '#FF035C', text: '#ffffff' },
  'thank you':       { bg: '#BAFA1E', text: '#000000' },
  'deposit':         { bg: '#DFA544', text: '#000000' },
  'lost amount':     { bg: '#FFDF1B', text: '#000000' },
  'roll back':       { bg: '#BAFA1E', text: '#000000' },
  'phone number':    { bg: '#00C1EB', text: '#000000' },
  'case submitted':  { bg: '#DFA544', text: '#000000' },
  'delete':          { bg: '#FF6912', text: '#000000' },
  'cashback':        { bg: '#00C1EB', text: '#000000' },
  'activated':       { bg: '#BAFA1E', text: '#000000' }
};
const SHORTCUT_KEYWORDS = Object.keys(SHORTCUT_MAPPING);


// ─────────────────────────────────────────────────────────────────────────────
// THEMES (matching Templates.jsx)
// ─────────────────────────────────────────────────────────────────────────────
const THEMES = [
  { bg: '#BAFA1E', text: '#000', statusLabel: 'Ready',      statusBg: 'rgba(0,0,0,0.2)',       statusText: '#000' },
  { bg: '#FF6912', text: '#000', statusLabel: 'Live',       statusBg: 'rgba(0,0,0,0.2)',       statusText: '#000' },
  { bg: '#FFDF1B', text: '#000', statusLabel: 'Degraded',   statusBg: 'rgba(0,0,0,0.2)',       statusText: '#000' },
  { bg: '#00C1EB', text: '#000', statusLabel: 'Active',     statusBg: 'rgba(0,0,0,0.2)',       statusText: '#000' },
  { bg: '#FF035C', text: '#fff', statusLabel: 'Active',     statusBg: 'rgba(255,255,255,0.2)', statusText: '#fff' },
  { bg: '#DFA544', text: '#000', statusLabel: 'Processing', statusBg: 'rgba(0,0,0,0.2)',       statusText: '#000' },
];

function getTypeLabel(name) {
  const l = name.toLowerCase();
  if (l.includes('support') || l.includes('patience') || l.includes('client')) return 'SUPPORT';
  if (l.includes('casino') || l.includes('gaming') || l.includes('game'))      return 'GAMING';
  if (l.includes('aviator') || l.includes('slot'))                              return 'AVIATOR';
  if (l.includes('deposit') || l.includes('withdraw') || l.includes('payment')) return 'FINANCE';
  if (l.includes('referral') || l.includes('bonus'))                            return 'PROMOTIONS';
  if (l.includes('security') || l.includes('account'))                          return 'SECURITY';
  return 'SYSTEM';
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────────────
const PANEL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :host { all: initial; }

  .panel {
    position: fixed;
    z-index: 2147483647;
    background: rgba(8, 8, 10, 0.82);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #fff;
    overflow: hidden;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05);
    transition: height 0.25s ease, opacity 0.2s ease;
    min-width: 320px;
    min-height: 52px;
    resize: both;
  }

  /* ── TITLE BAR ── */
  .titlebar {
    flex-shrink: 0;
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 10px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    background: rgba(0,0,0,0.3);
    cursor: grab;
    user-select: none;
  }
  .titlebar:active { cursor: grabbing; }

  .logo {
    width: 26px;
    height: 26px;
    background: #baff55;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .title-text {
    flex: 1;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.01em;
  }

  .version-pill {
    font-size: 9px;
    font-weight: 700;
    color: #baff55;
    background: rgba(186,255,85,0.1);
    border: 1px solid rgba(186,255,85,0.2);
    border-radius: 20px;
    padding: 2px 7px;
    letter-spacing: 0.05em;
  }

  .title-btn {
    width: 28px;
    height: 28px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #8e8e93;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .title-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
  .title-btn.close:hover { background: rgba(255,59,48,0.2); color: #ff3b30; }

  /* ── CONTROLS ── */
  .controls {
    flex-shrink: 0;
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .controls-row {
    display: grid;
    grid-template-columns: 1fr 130px;
    gap: 8px;
  }

  .search-wrap { position: relative; }

  .search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #8e8e93;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 8px 10px 8px 32px;
    color: #fff;
    font-size: 12px;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .search-input:focus { border-color: rgba(186,255,85,0.5); }
  .search-input::placeholder { color: #8e8e93; }

  .cat-select {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 8px 10px;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    outline: none;
    appearance: none;
    cursor: pointer;
    font-family: inherit;
  }
  .cat-select option { background-color: #fff; color: #000; }
  .cat-select:focus { border-color: rgba(186,255,85,0.5); }

  .shortcuts-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .shortcut-tag {
    padding: 3px 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
    color: #8e8e93;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
    font-family: inherit;
  }
  .shortcut-tag:hover { color: #fff; background: rgba(255,255,255,0.08); }
  .shortcut-tag.active { color: #baff55; border-color: rgba(186,255,85,0.3); background: rgba(186,255,85,0.08); }

  /* ── CONTENT ── */
  .content-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    align-items: start;
  }
  @media (min-width: 520px) {
    .content-scroll { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 800px) {
    .content-scroll { grid-template-columns: repeat(3, 1fr); }
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 6px; }

  /* ── CATEGORY CARD ── cloned from Templates.jsx ── */
  .cat-card {
    background: #1e1f22;
    border-radius: 18px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .card-top-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 14px 8px;
  }

  .card-icon-box {
    width: 34px;
    height: 34px;
    background: #2a2b2f;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .count-badge {
    border-radius: 12px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    margin-top: -2px;
    margin-right: -2px;
  }

  .count-num {
    font-size: 22px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .count-lbl {
    font-size: 7px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 2px;
    opacity: 0.7;
  }

  .count-status {
    margin-top: 4px;
    padding: 1px 7px;
    border-radius: 20px;
    font-size: 7px;
    font-weight: 700;
  }

  .card-labels { padding: 0 14px 12px; }

  .type-label {
    font-size: 9px;
    font-weight: 700;
    color: #8e8e93;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 2px;
  }

  .cat-name {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
  }

  .card-divider { height: 1px; background: #2a2b2f; margin: 0 14px; }

  /* ── TEMPLATE ROW ── */
  .row-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: none;
    border: none;
    border-bottom: 1px solid rgba(42,43,47,0.5);
    cursor: pointer;
    text-align: left;
    color: #c0c0c5;
    font-size: 12px;
    font-weight: 500;
    transition: background 0.15s;
    font-family: inherit;
  }
  .row-btn:hover { background: rgba(255,255,255,0.02); }

  .row-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; background: #4a4b50; }
  .row-title { flex: 1; }
  .row-arrow { font-size: 10px; color: #4a4b50; flex-shrink: 0; }

  .expanded-panel { display: none; padding: 0 14px 14px; }
  .expanded-panel.open { display: block; }

  .variant-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .variant-label { font-size: 9px; color: #8e8e93; font-weight: 600; }

  .variant-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #3a3b3f;
    background: transparent;
    color: #8e8e93;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    font-family: inherit;
  }

  .resp-block {
    background: #161616;
    border-radius: 12px;
    padding: 12px;
    font-size: 11px;
    color: #c0c0c5;
    line-height: 1.6;
    border: 1px solid #3a3b3f;
    white-space: pre-wrap;
    word-break: break-word;
    margin-bottom: 10px;
    font-family: 'Courier New', Courier, monospace;
  }

  .var-hl { font-weight: 700; }
  .danger-hl { color: #ff4d4d; font-weight: 700; }
  .success-hl { color: #00e676; font-weight: 700; }
  .info-hl { color: #4080ff; font-weight: 700; }
  .data-hl { color: #ffea00; font-weight: 700; }

  .action-row { display: flex; align-items: center; gap: 10px; }

  .act-edit, .act-del {
    font-size: 11px;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s;
    font-family: inherit;
  }
  .act-edit { color: #8e8e93; }
  .act-edit:hover { color: #fff; }
  .act-del { color: #ff4d4d; }
  .act-del:hover { color: #ff6b6b; }

  .act-copy {
    margin-left: auto;
    padding: 5px 14px;
    border-radius: 20px;
    border: 2px solid;
    background: transparent;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    font-family: inherit;
  }

  /* ── EMPTY / STATUS ── */
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #8e8e93;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge {
    font-size: 9px;
    font-weight: 700;
    color: #8e8e93;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── RESIZE HANDLE ── */
  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 18px;
    height: 18px;
    cursor: se-resize;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 3px;
    color: rgba(255,255,255,0.15);
  }
`;

const SLASH_CSS = `
  .slash-menu {
    position: fixed;
    z-index: 2147483647;
    background: rgba(8, 8, 10, 0.92);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    width: 320px;
    max-height: 300px;
    overflow-y: auto;
    font-family: 'Inter', -apple-system, sans-serif;
    color: #fff;
    box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    display: none;
    flex-direction: column;
  }
  .slash-menu.visible { display: flex; }
  .slash-header {
    padding: 8px 12px;
    font-size: 10px;
    font-weight: 700;
    color: #8e8e93;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .slash-item {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    cursor: pointer;
    transition: background 0.1s;
  }
  .slash-item:last-child { border-bottom: none; }
  .slash-item:hover, .slash-item.active { background: rgba(186,255,85,0.07); }
  .slash-cat {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    color: #baff55;
    background: rgba(186,255,85,0.1);
    border: 1px solid rgba(186,255,85,0.2);
    padding: 1px 6px;
    border-radius: 4px;
    margin-bottom: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .slash-title { font-size: 12px; font-weight: 600; color: #fff; margin-bottom: 3px; }
  .slash-preview { font-size: 10px; color: #8e8e93; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 6px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE FETCH
// ─────────────────────────────────────────────────────────────────────────────
async function fetchTemplates() {
  if (allTemplatesCache) return allTemplatesCache;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/support_templates?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const flat = [];
    data.forEach(cat => {
      (cat.templates || []).forEach(t => {
        flat.push({ category: cat.category, title: t.title, responses: t.responses || [], triggers: t.triggers || [] });
      });
    });
    allTemplatesCache = flat;
    return flat;
  } catch (e) {
    console.error('BlastChat Matrix fetch error', e);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HIGHLIGHT HELPER
// ─────────────────────────────────────────────────────────────────────────────
const KEYWORD_COLORS = [
  { hex: '#BAFA1E', words: ['resolved', 'safe', 'accounted for', 'successfully', 'good news', 'eligible', 'confirm', 'confirmed'] },
  { hex: '#FF6912', words: ['crash', 'aviator', 'jetx', 'virtual', 'casino', 'stake', 'winnings', 'bet', 'betslip', 'odds', 'sport', 'sports'] },
  { hex: '#FFDF1B', words: ['urgent', 'delay', 'delayed', 'error', 'wrong', 'voided', 'failed', 'issue', 'problem', 'degraded', 'unavailable', 'down', 'maintenance', 'frustrated', 'frustration', 'missing', 'lost'] },
  { hex: '#00C1EB', words: ['cashback', 'referral', 'bonus', 'offers', 'tax-free', 'free bet', 'rain'] },
  { hex: '#FF035C', words: ['hello', 'hi', 'welcome', 'greet', 'vip'] },
  { hex: '#DFA544', words: ['deposit', 'withdraw', 'withdrawal', 'm-pesa', 'balance', 'ksh', 'paybill', 'transaction', 'funds', 'amount', 'wallet'] }
];
const ALL_KW = KEYWORD_COLORS.flatMap(c => c.words).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const KW_PATTERN = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|\\b(?:${ALL_KW.join('|')})\\b)`, 'gi');

function renderHighlighted(container, text, themeColor) {
  if (!text) return;
  text.split(KW_PATTERN).forEach(part => {
    if (!part) return;
    const isVar = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
    if (isVar) {
      const s = document.createElement('span');
      s.className = 'var-hl';
      s.style.color = themeColor || '#BAFA1E';
      s.textContent = part;
      container.appendChild(s);
      return;
    }

    const lowerPart = part.toLowerCase();
    let matchedColor = null;
    for (const cat of KEYWORD_COLORS) {
      if (cat.words.includes(lowerPart)) {
        matchedColor = cat.hex;
        break;
      }
    }
    if (matchedColor) {
      const s = document.createElement('span');
      s.className = 'var-hl';
      s.style.color = matchedColor;
      s.textContent = part;
      container.appendChild(s);
      return;
    }

    // Now split for ALL CAPS
    part.split(/(\b[A-Z][A-Z0-9_-]+\b)/).forEach(sub => {
      if (!sub) return;
      if (sub.match(/^\b[A-Z][A-Z0-9_-]+\b$/)) {
        const s = document.createElement('span');
        s.className = 'var-hl';
        s.style.color = themeColor || '#BAFA1E';
        s.textContent = sub;
        container.appendChild(s);
      } else {
        container.appendChild(document.createTextNode(sub));
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function buildCategoryCard(categoryName, items, shadow) {
  const theme = THEMES[categoryIndexPanel % THEMES.length];
  categoryIndexPanel++;

  const emojiMatch = categoryName.match(/(\p{Emoji})/u);
  const emoji = emojiMatch ? emojiMatch[0] : '📂';
  const catLabel = categoryName.replace(/(\p{Emoji})/gu, '').trim();

  const card = shadow.createElement ? shadow.createElement('div') : document.createElement('div');
  card.className = 'cat-card';

  // Top row
  const topRow = document.createElement('div');
  topRow.className = 'card-top-row';

  const iconBox = document.createElement('div');
  iconBox.className = 'card-icon-box';
  iconBox.textContent = emoji;

  const badge = document.createElement('div');
  badge.className = 'count-badge';
  badge.style.backgroundColor = theme.bg;
  badge.style.color = theme.text;

  const num = document.createElement('div');
  num.className = 'count-num';
  num.textContent = String(items.length).padStart(2, '0');

  const lbl = document.createElement('div');
  lbl.className = 'count-lbl';
  lbl.textContent = 'RESPONSES';

  const statusPill = document.createElement('div');
  statusPill.className = 'count-status';
  statusPill.style.backgroundColor = theme.statusBg;
  statusPill.style.color = theme.statusText;
  statusPill.textContent = theme.statusLabel;

  badge.append(num, lbl, statusPill);
  topRow.append(iconBox, badge);
  card.appendChild(topRow);

  // Labels
  const labelsDiv = document.createElement('div');
  labelsDiv.className = 'card-labels';

  const typeEl = document.createElement('div');
  typeEl.className = 'type-label';
  typeEl.textContent = getTypeLabel(catLabel);

  const nameEl = document.createElement('div');
  nameEl.className = 'cat-name';
  nameEl.textContent = catLabel;

  labelsDiv.append(typeEl, nameEl);
  card.appendChild(labelsDiv);

  const divider = document.createElement('div');
  divider.className = 'card-divider';
  card.appendChild(divider);

  items.forEach(t => card.appendChild(buildTemplateRow(t, theme)));

  return card;
}

function buildTemplateRow(t, theme) {
  const responses = t.responses?.length ? t.responses : [{ text: 'No response found.', type: 'Standard' }];
  let expanded = false;
  let activeVariant = 0;

  const wrapper = document.createElement('div');

  // Row button
  const rowBtn = document.createElement('button');
  rowBtn.className = 'row-btn';

  const dot = document.createElement('div');
  dot.className = 'row-dot';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'row-title';
  titleSpan.textContent = t.title;

  const arrow = document.createElement('span');
  arrow.className = 'row-arrow';
  arrow.textContent = '▼';

  rowBtn.append(dot, titleSpan, arrow);

  // Expanded panel
  const panel = document.createElement('div');
  panel.className = 'expanded-panel';

  // Variants
  const variantBtns = [];
  if (responses.length > 1) {
    const varRow = document.createElement('div');
    varRow.className = 'variant-row';
    const varLbl = document.createElement('span');
    varLbl.className = 'variant-label';
    varLbl.textContent = 'Variant';
    varRow.appendChild(varLbl);
    responses.forEach((_, i) => {
      const vb = document.createElement('button');
      vb.className = 'variant-btn';
      vb.textContent = i + 1;
      variantBtns.push(vb);
      varRow.appendChild(vb);
    });
    panel.appendChild(varRow);
  }

  const respBlock = document.createElement('div');
  respBlock.className = 'resp-block';

  const actionRow = document.createElement('div');
  actionRow.className = 'action-row';

  const editBtn = document.createElement('button');
  editBtn.className = 'act-edit';
  editBtn.textContent = 'Edit';

  const delBtn = document.createElement('button');
  delBtn.className = 'act-del';
  delBtn.textContent = 'Delete';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'act-copy';

  actionRow.append(editBtn, delBtn, copyBtn);
  panel.append(respBlock, actionRow);

  function setVariant(i) {
    activeVariant = i;
    const resp = responses[i];
    respBlock.textContent = '';
    renderHighlighted(respBlock, resp.text, theme.bg);

    copyBtn.textContent = 'Copy';
    copyBtn.style.cssText = `border-color:${theme.bg};color:${theme.bg};background:transparent;`;
    copyBtn.onclick = () => {
      navigator.clipboard?.writeText(resp.text).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.style.cssText = `border-color:${theme.bg};color:${theme.text};background:${theme.bg};`;
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.style.cssText = `border-color:${theme.bg};color:${theme.bg};background:transparent;`;
        }, 1500);
      });
      injectIntoLastInput(resp.text);
    };

    variantBtns.forEach((vb, vi) => {
      if (vi === i) {
        vb.style.cssText = `background:${theme.bg};border-color:${theme.bg};color:${theme.text};`;
      } else {
        vb.style.cssText = 'background:transparent;border-color:#3a3b3f;color:#8e8e93;';
      }
    });
    dot.style.backgroundColor = theme.bg;
    arrow.style.color = theme.bg;
  }

  variantBtns.forEach((vb, vi) => {
    vb.onclick = e => { e.stopPropagation(); setVariant(vi); };
  });

  rowBtn.onclick = () => {
    expanded = !expanded;
    panel.classList.toggle('open', expanded);
    arrow.textContent = expanded ? '▲' : '▼';
    dot.style.backgroundColor = expanded ? theme.bg : '#4a4b50';
    arrow.style.color = expanded ? theme.bg : '#4a4b50';
    if (expanded) setVariant(activeVariant);
  };

  editBtn.onclick = () => {};
  delBtn.onclick = () => {};

  wrapper.append(rowBtn, panel);
  return wrapper;
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL RENDERING
// ─────────────────────────────────────────────────────────────────────────────
function renderPanelTemplates(templates) {
  const container = panelShadow.getElementById('panel-content');
  if (!container) return;
  container.innerHTML = '';
  categoryIndexPanel = 0;

  if (!templates || templates.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No templates found. Syncing…';
    container.appendChild(empty);
    return;
  }

  const seen = new Set();
  const unique = templates.filter(t => {
    const k = `${t.category}||${t.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const groups = new Map();
  unique.forEach(t => {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category).push(t);
  });

  groups.forEach((items, cat) => {
    container.appendChild(buildCategoryCard(cat, items, {}));
  });
}

function filterPanelTemplates() {
  const searchEl = panelShadow.getElementById('panel-search');
  const catEl = panelShadow.getElementById('panel-cat');
  const q = (searchEl?.value || '').toLowerCase().trim();
  const cat = catEl?.value || 'ALL';

  let filtered = panelAllTemplates;
  if (cat !== 'ALL') filtered = filtered.filter(t => t.category === cat);
  if (q) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.triggers || []).some(tr => tr.toLowerCase().includes(q))
    );
  }
  renderPanelTemplates(filtered);
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD FLOATING PANEL DOM
// ─────────────────────────────────────────────────────────────────────────────
function renderPanelShortcuts(container) {
  container.textContent = '';
  SHORTCUT_KEYWORDS.forEach(label => {
    const tag = document.createElement('div');
    const colors = SHORTCUT_COLORS[label];
    tag.className = 'shortcut-tag';
    tag.textContent = label;
    
    if (panelActiveShortcut === label) {
      tag.classList.add('active');
      tag.style.backgroundColor = colors.bg;
      tag.style.color = colors.text;
      tag.style.borderColor = 'transparent';
    } else {
      tag.style.backgroundColor = 'rgba(255,255,255,0.04)';
      tag.style.color = '#8e8e93';
      tag.style.borderColor = 'rgba(255,255,255,0.08)';
    }

    tag.onmouseenter = () => {
      if (panelActiveShortcut !== label) {
        tag.style.backgroundColor = colors.bg + '22';
        tag.style.color = colors.bg;
        tag.style.borderColor = colors.bg + '66';
      }
    };
    tag.onmouseleave = () => {
      if (panelActiveShortcut !== label) {
        tag.style.backgroundColor = 'rgba(255,255,255,0.04)';
        tag.style.color = '#8e8e93';
        tag.style.borderColor = 'rgba(255,255,255,0.08)';
      }
    };

    tag.onclick = () => {
      if (panelActiveShortcut === label) {
        panelActiveShortcut = null;
      } else {
        panelActiveShortcut = label;
        panelActiveCategory = 'ALL';
        const catEl = panelShadow.getElementById('panel-cat');
        if (catEl) catEl.value = 'ALL';
        const searchInput = panelShadow.getElementById('panel-search');
        if (searchInput) searchInput.value = '';
      }
      renderPanelShortcuts(container);
      filterPanelTemplates();
    };
    container.appendChild(tag);
  });
}

function buildPanel() {
  if (panelRoot) return;
  panelRoot = document.createElement('div');
  panelRoot.id = 'blastchat-panel-root';
  document.documentElement.appendChild(panelRoot);
  panelShadow = panelRoot.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = PANEL_CSS;
  panelShadow.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'panel';
  panel.id = 'bmc-panel';
  panel.style.cssText = `left:${panelX}px;top:${panelY}px;width:${panelWidth}px;height:${panelHeight}px;`;
  panelShadow.appendChild(panel);

  // ── TITLE BAR ──
  const titlebar = document.createElement('div');
  titlebar.className = 'titlebar';

  const logo = document.createElement('div');
  logo.className = 'logo';
  logo.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;

  const titleText = document.createElement('div');
  titleText.className = 'title-text';
  titleText.textContent = 'BlastChat Matrix';

  const versionPill = document.createElement('div');
  versionPill.className = 'version-pill';
  versionPill.textContent = 'v1.7';

  const statusEl = document.createElement('div');
  statusEl.id = 'panel-status';
  statusEl.className = 'status-badge';
  statusEl.textContent = 'Syncing…';

  const minBtn = document.createElement('button');
  minBtn.className = 'title-btn';
  minBtn.title = 'Minimize';
  minBtn.innerHTML = `<svg width="12" height="2" viewBox="0 0 12 2" fill="currentColor"><rect width="12" height="2" rx="1"/></svg>`;

  const maxBtn = document.createElement('button');
  maxBtn.className = 'title-btn';
  maxBtn.title = 'Expand';
  maxBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="0.75" y="0.75" width="10.5" height="10.5" rx="2"/></svg>`;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'title-btn close';
  closeBtn.title = 'Close';
  closeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l10 10M11 1L1 11"/></svg>`;

  titlebar.append(logo, titleText, versionPill, statusEl, minBtn, maxBtn, closeBtn);
  panel.appendChild(titlebar);

  // ── CONTROLS (hidden when minimized) ──
  const controls = document.createElement('div');
  controls.className = 'controls';
  controls.id = 'panel-controls';

  const ctrlRow = document.createElement('div');
  ctrlRow.className = 'controls-row';

  const searchWrap = document.createElement('div');
  searchWrap.className = 'search-wrap';
  searchWrap.innerHTML = `<span class="search-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg></span>`;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'panel-search';
  searchInput.className = 'search-input';
  searchInput.placeholder = 'Search templates…';
  searchInput.autocomplete = 'off';
  searchWrap.appendChild(searchInput);

  const catSelect = document.createElement('select');
  catSelect.id = 'panel-cat';
  catSelect.className = 'cat-select';
  const allOpt = document.createElement('option');
  allOpt.value = 'ALL';
  allOpt.textContent = 'All Categories';
  catSelect.appendChild(allOpt);

  ctrlRow.append(searchWrap, catSelect);

  const shortcutsRow = document.createElement('div');
  shortcutsRow.className = 'shortcuts-row';
  shortcutsRow.id = 'panel-shortcuts';

  controls.append(ctrlRow, shortcutsRow);
  panel.appendChild(controls);

  renderPanelShortcuts(shortcutsRow);

  // ── CONTENT ──
  const contentScroll = document.createElement('div');
  contentScroll.className = 'content-scroll';
  contentScroll.id = 'panel-content';
  const loading = document.createElement('div');
  loading.className = 'empty-state';
  loading.textContent = 'Syncing templates…';
  contentScroll.appendChild(loading);
  panel.appendChild(contentScroll);

  // ── RESIZE HANDLE ──
  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'resize-handle';
  resizeHandle.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M9 1L1 9M9 5L5 9M9 9L9 9"/></svg>`;
  panel.style.position = 'fixed';
  panel.appendChild(resizeHandle);

  // ── DRAG ──
  titlebar.addEventListener('mousedown', e => {
    if (e.target !== titlebar && !e.target.classList.contains('title-text') && !e.target.classList.contains('logo') && !e.target.classList.contains('brand-text') && e.target.tagName !== 'svg' && e.target.tagName !== 'path') return;
    isDragging = true;
    const rect = panel.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;
    e.preventDefault();
  });

  // ── RESIZE ──
  resizeHandle.addEventListener('mousedown', e => {
    isResizing = true;
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener('mousemove', e => {
    if (isDragging) {
      const panel = panelShadow.getElementById('bmc-panel');
      if (!panel) return;
      panelX = Math.max(0, Math.min(e.clientX - dragOffX, window.innerWidth - panelWidth));
      panelY = Math.max(0, Math.min(e.clientY - dragOffY, window.innerHeight - 52));
      panel.style.left = panelX + 'px';
      panel.style.top = panelY + 'px';
    }
    if (isResizing) {
      const panel = panelShadow.getElementById('bmc-panel');
      if (!panel) return;
      panelWidth = Math.max(300, e.clientX - panelX);
      panelHeight = Math.max(200, e.clientY - panelY);
      panel.style.width = panelWidth + 'px';
      panel.style.height = panelMinimized ? '52px' : panelHeight + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    isResizing = false;
  });

  // ── MINIMIZE ──
  minBtn.onclick = () => {
    panelMinimized = !panelMinimized;
    const p = panelShadow.getElementById('bmc-panel');
    const ctrl = panelShadow.getElementById('panel-controls');
    const content = panelShadow.getElementById('panel-content');
    if (panelMinimized) {
      p.style.height = '52px';
      p.style.overflow = 'hidden';
      ctrl.style.display = 'none';
      content.style.display = 'none';
      minBtn.title = 'Restore';
    } else {
      p.style.height = panelHeight + 'px';
      p.style.overflow = 'hidden';
      ctrl.style.display = '';
      content.style.display = '';
      minBtn.title = 'Minimize';
    }
  };

  // ── MAXIMIZE ──
  maxBtn.onclick = () => {
    const p = panelShadow.getElementById('bmc-panel');
    panelX = 10; panelY = 10;
    panelWidth = window.innerWidth - 20;
    panelHeight = window.innerHeight - 20;
    p.style.cssText = `left:10px;top:10px;width:${panelWidth}px;height:${panelHeight}px;`;
    panelMinimized = false;
    panelShadow.getElementById('panel-controls').style.display = '';
    panelShadow.getElementById('panel-content').style.display = '';
  };

  // ── CLOSE ──
  closeBtn.onclick = () => hidePanel();

  // ── SEARCH / CAT EVENTS ──
  searchInput.addEventListener('input', () => {
    panelActiveShortcut = null;
    const shortcutsContainer = panelShadow.getElementById('panel-shortcuts');
    if (shortcutsContainer) renderPanelShortcuts(shortcutsContainer);
    filterPanelTemplates();
  });
  catSelect.addEventListener('change', (e) => {
    panelActiveCategory = e.target.value;
    panelActiveShortcut = null;
    const shortcutsContainer = panelShadow.getElementById('panel-shortcuts');
    if (shortcutsContainer) renderPanelShortcuts(shortcutsContainer);
    filterPanelTemplates();
  });
}

function renderPanelShortcuts(container) {
  if (!container) return;
  container.textContent = '';
  
  const keywords = Object.keys(SHORTCUT_MAPPING);
  keywords.forEach(label => {
    const tag = document.createElement('div');
    const colors = SHORTCUT_COLORS[label] || { bg: 'rgba(255,255,255,0.04)', text: '#8e8e93' };
    
    tag.className = 'shortcut-tag';
    tag.textContent = label;
    tag.style.cssText = `
      padding: 3px 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;
      color: #8e8e93;
      cursor: pointer;
      transition: all 0.15s;
    `;
    
    if (panelActiveShortcut === label) {
      tag.style.background = colors.bg;
      tag.style.color = colors.text;
      tag.style.borderColor = 'transparent';
    }
    
    tag.onmouseenter = () => {
      if (panelActiveShortcut !== label) {
        tag.style.background = colors.bg + '22';
        tag.style.color = colors.bg;
        tag.style.borderColor = colors.bg + '66';
      }
    };
    tag.onmouseleave = () => {
      if (panelActiveShortcut !== label) {
        tag.style.background = 'rgba(255,255,255,0.04)';
        tag.style.color = '#8e8e93';
        tag.style.borderColor = 'rgba(255,255,255,0.08)';
      }
    };
    
    tag.onclick = () => {
      if (panelActiveShortcut === label) {
        panelActiveShortcut = null;
      } else {
        panelActiveShortcut = label;
        panelActiveCategory = 'ALL';
        const catSelect = panelShadow.getElementById('panel-cat');
        const searchInput = panelShadow.getElementById('panel-search');
        if (catSelect) catSelect.value = 'ALL';
        if (searchInput) searchInput.value = '';
      }
      renderPanelShortcuts(container);
      filterPanelTemplates();
    };
    
    container.appendChild(tag);
  });
}

function showPanel() {
  if (!panelRoot) buildPanel();
  const p = panelShadow.getElementById('bmc-panel');
  p.style.display = 'flex';
  panelVisible = true;

  if (panelAllTemplates.length === 0) {
    fetchTemplates().then(templates => {
      panelAllTemplates = templates;
      renderPanelTemplates(templates);

      // Populate category dropdown
      const cats = [...new Set(templates.map(t => t.category))].filter(Boolean).sort();
      const catEl = panelShadow.getElementById('panel-cat');
      cats.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        catEl.appendChild(opt);
      });

      const statusEl = panelShadow.getElementById('panel-status');
      if (statusEl) statusEl.textContent = 'Ready';
    });
  }
}

function hidePanel() {
  if (!panelShadow) return;
  const p = panelShadow.getElementById('bmc-panel');
  if (p) p.style.display = 'none';
  panelVisible = false;
}

function togglePanel() {
  if (panelVisible) {
    hidePanel();
  } else {
    showPanel();
  }
}

function filterPanelTemplates() {
  const searchInput = panelShadow.getElementById('panel-search');
  const catSelect = panelShadow.getElementById('panel-cat');
  let q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  let cat = catSelect ? catSelect.value : 'ALL';

  let filtered = panelAllTemplates;

  if (panelActiveShortcut) {
    const titles = new Set(SHORTCUT_MAPPING[panelActiveShortcut] || []);
    filtered = filtered.filter(t => titles.has(t.title));
  } else if (cat !== 'ALL') {
    filtered = filtered.filter(t => t.category === cat);
  }

  if (q && !panelActiveShortcut) {
    let tokens = q.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    // basic matching
    filtered = filtered.filter(t => {
      const title = t.title.toLowerCase();
      const triggers = (t.triggers || []).map(tr => tr.toLowerCase());
      return tokens.some(tok => title.includes(tok) || triggers.some(tr => tr.includes(tok)));
    });
  }

  renderPanelTemplates(filtered);
}

// ─────────────────────────────────────────────────────────────────────────────
// SLASH MENU
// ─────────────────────────────────────────────────────────────────────────────
function buildSlashMenu() {
  if (slashRoot) return;
  slashRoot = document.createElement('div');
  slashRoot.id = 'blastchat-slash-root';
  document.documentElement.appendChild(slashRoot);
  slashShadow = slashRoot.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = SLASH_CSS;
  slashShadow.appendChild(style);

  const menu = document.createElement('div');
  menu.className = 'slash-menu';
  menu.id = 'slash-menu';
  slashShadow.appendChild(menu);
}

function openSlashMenu(x, y) {
  if (!slashRoot) buildSlashMenu();
  slashVisible = true;
  slashActiveIndex = 0;
  const menu = slashShadow.getElementById('slash-menu');
  menu.classList.add('visible');

  let posX = x;
  let posY = y + 20;
  if (posX + 320 > window.innerWidth) posX = window.innerWidth - 330;
  if (posY + 300 > window.innerHeight) posY = y - 310;

  menu.style.left = posX + 'px';
  menu.style.top = posY + 'px';

  fetchTemplates().then(templates => {
    filterSlash(slashSearch);
  });
}

function closeSlashMenu() {
  slashVisible = false;
  slashSearch = '';
  if (slashShadow) {
    const menu = slashShadow.getElementById('slash-menu');
    if (menu) menu.classList.remove('visible');
  }
}

function filterSlash(query) {
  if (!allTemplatesCache) return;
  const q = query.toLowerCase().trim();
  slashFiltered = (q
    ? allTemplatesCache.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.triggers || []).some(tr => tr.toLowerCase().includes(q))
      )
    : allTemplatesCache
  ).slice(0, 10);
  if (slashActiveIndex >= slashFiltered.length) slashActiveIndex = 0;
  renderSlashMenu();
}

function renderSlashMenu() {
  if (!slashShadow) return;
  const menu = slashShadow.getElementById('slash-menu');
  menu.innerHTML = `<div class="slash-header">Templates · Type to search</div>`;
  if (slashFiltered.length === 0) {
    menu.innerHTML += '<div class="slash-item"><div class="slash-preview">No matches</div></div>';
    return;
  }
  slashFiltered.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'slash-item' + (i === slashActiveIndex ? ' active' : '');

    const cat = document.createElement('div');
    cat.className = 'slash-cat';
    cat.textContent = t.category;

    const title = document.createElement('div');
    title.className = 'slash-title';
    title.textContent = t.title;

    const preview = document.createElement('div');
    preview.className = 'slash-preview';
    preview.textContent = t.responses[0]?.text || '';

    item.append(cat, title, preview);
    item.addEventListener('mousedown', e => {
      e.preventDefault();
      injectTemplate(t);
    });
    if (i === slashActiveIndex) setTimeout(() => item.scrollIntoView({ block: 'nearest' }), 0);
    menu.appendChild(item);
  });
}

function injectTemplate(t) {
  const text = t.responses[0]?.text || '';
  injectIntoLastInput(text, true);
  closeSlashMenu();
}

function injectIntoLastInput(text, removeSlash = false) {
  if (!lastFocusedInput) return;
  try {
    if (lastFocusedInput.isContentEditable) {
      if (removeSlash) {
        const content = lastFocusedInput.innerText;
        const si = content.lastIndexOf('/');
        if (si !== -1) lastFocusedInput.innerText = content.substring(0, si) + text;
        else lastFocusedInput.innerText += text;
      } else {
        document.execCommand('insertText', false, text);
      }
    } else {
      const val = lastFocusedInput.value || '';
      let newVal;
      if (removeSlash) {
        const si = val.lastIndexOf('/');
        newVal = si !== -1 ? val.substring(0, si) + text : val + text;
      } else {
        newVal = text;
      }
      const proto = lastFocusedInput.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(lastFocusedInput, newVal);
      else lastFocusedInput.value = newVal;
    }
    ['input', 'change'].forEach(ev => {
      lastFocusedInput.dispatchEvent(new Event(ev, { bubbles: true, composed: true }));
    });
  } catch (e) {
    console.error('BlastChat Matrix inject error', e);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INPUT / KEYBOARD TRACKING
// ─────────────────────────────────────────────────────────────────────────────
function checkAndSetTarget(target) {
  if (!target) return;
  const isInput = target.tagName === 'TEXTAREA' ||
    (target.tagName === 'INPUT' && ['text','search','email'].includes(target.type)) ||
    target.isContentEditable ||
    target.getAttribute('role') === 'textbox' ||
    target.classList.contains('public-DraftEditor-content');
  if (isInput) lastFocusedInput = target;
}

document.addEventListener('mousedown', e => checkAndSetTarget(e.composedPath()[0]), true);
document.addEventListener('focusin', e => checkAndSetTarget(e.composedPath()[0]), true);

document.addEventListener('keydown', e => {
  if (!slashVisible) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    slashActiveIndex = (slashActiveIndex + 1) % slashFiltered.length;
    renderSlashMenu();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    slashActiveIndex = (slashActiveIndex - 1 + slashFiltered.length) % slashFiltered.length;
    renderSlashMenu();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (slashFiltered[slashActiveIndex]) injectTemplate(slashFiltered[slashActiveIndex]);
  } else if (e.key === 'Escape') {
    closeSlashMenu();
  }
});

document.addEventListener('keyup', e => {
  // Don't show slash menu if the floating panel is already visible
  if (panelVisible) return;

  const target = e.composedPath()[0];
  checkAndSetTarget(target);
  if (!lastFocusedInput) return;

  const val = lastFocusedInput.value || lastFocusedInput.innerText || '';
  const lastSlash = val.lastIndexOf('/');

  if (lastSlash !== -1) {
    const isStartOrSpace = lastSlash === 0 || [' ', '\n'].includes(val[lastSlash - 1]);
    if (isStartOrSpace) {
      const query = val.substring(lastSlash + 1);
      if (!query.includes(' ') && query.length < 20) {
        slashSearch = query;
        if (!slashVisible) {
          const rect = target.getBoundingClientRect();
          openSlashMenu(rect.left + 10, rect.bottom);
        } else {
          filterSlash(slashSearch);
        }
        return;
      }
    }
  }
  if (slashVisible) closeSlashMenu();
});

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE LISTENER
// ─────────────────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'togglePanel') {
    togglePanel();
    sendResponse({ success: true });
  } else if (request.action === 'injectText') {
    injectIntoLastInput(request.text);
    sendResponse({ success: true });
  } else if (request.action === 'getSelectedText') {
    sendResponse({ text: window.getSelection().toString() });
  }
  return true;
});
