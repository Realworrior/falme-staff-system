// === BLASTCHAT MATRIX — Persistent Draggable Floating Panel + '/' Inline Menu ===

if (window.blastchatInjected) {
  const oldPanel = document.getElementById('blastchat-panel-root');
  if (oldPanel) oldPanel.remove();
  const oldSlash = document.getElementById('blastchat-slash-root');
  if (oldSlash) oldSlash.remove();
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
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :host { all: initial; }

  .panel {
    position: fixed;
    z-index: 2147483647;
    background: #161616;
    border: 1px solid #3a3b3f;
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
    color: #ffffff;
    overflow: hidden;
    box-shadow: 0 32px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.03);
    transition: height 0.25s ease, opacity 0.2s ease;
    min-width: 320px;
    min-height: 52px;
    resize: both;
  }

  /* ── TITLE BAR ── */
  .titlebar {
    flex-shrink: 0;
    height: 52px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    border-bottom: 1px solid #2a2b2f;
    background: #1e1f22;
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
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    border-bottom: 1px solid #2a2b2f;
    background: #1e1f22;
  }

  .controls-row {
    display: grid;
    grid-template-columns: 1fr 130px;
    gap: 10px;
  }

  .search-wrap { position: relative; }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #8e8e93;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: #161616;
    border: 1px solid #3a3b3f;
    border-radius: 12px;
    padding: 10px 12px 10px 36px;
    color: #ffffff;
    font-size: 12px;
    outline: none;
    transition: all 0.2s;
    font-family: inherit;
  }
  .search-input:focus { border-color: #baff55; box-shadow: 0 0 0 1px #baff55; }
  .search-input::placeholder { color: #8e8e93; }

  .cat-select {
    width: 100%;
    background: #161616;
    border: 1px solid #3a3b3f;
    border-radius: 12px;
    padding: 10px 12px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 600;
    outline: none;
    appearance: none;
    cursor: pointer;
    font-family: inherit;
  }
  .cat-select option { background-color: #1e1f22; color: #ffffff; }
  .cat-select:focus { border-color: #baff55; box-shadow: 0 0 0 1px #baff55; }

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

  /* ── BODY SPLIT (sidebar + template area) ── */
  .body-split {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 190px;
    flex-shrink: 0;
    border-right: 1px solid #2a2b2f;
    background: #1e1f22;
    overflow-y: auto;
    padding: 8px 6px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .sidebar-label {
    font-size: 9px;
    font-weight: 700;
    color: #374151;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    padding: 4px 8px 6px;
    flex-shrink: 0;
  }

  .sidebar-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 8px;
    border-radius: 9px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s, border-color 0.12s;
    font-family: inherit;
    position: relative;
  }
  .sidebar-item:hover { background: rgba(255,255,255,0.04); }
  .sidebar-item.active-cat { border-color: var(--cat-color, #baff55) !important; background: color-mix(in srgb, var(--cat-color, #baff55) 10%, transparent) !important; }
  .sidebar-item.active-cat .si-name { color: #e2e8f0; font-weight: 500; }
  .sidebar-item.active-cat .si-active-bar { opacity: 1; }

  .si-active-bar {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    border-radius: 0 3px 3px 0;
    background: var(--cat-color, #baff55);
    opacity: 0;
    transition: opacity 0.12s;
  }

  .si-emoji { font-size: 14px; flex-shrink: 0; width: 18px; text-align: center; line-height: 1; }
  .si-name {
    flex: 1;
    font-size: 11px;
    font-weight: 400;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: color 0.12s;
    line-height: 1.3;
  }
  .si-shortcut {
    flex-shrink: 0;
    font-size: 9px;
    font-family: monospace;
    padding: 1px 5px;
    border-radius: 4px;
    background: #2d3748;
    border: 1px solid #4a5568;
    color: #6b7280;
    opacity: 0;
    transition: opacity 0.12s;
  }
  .sidebar-item:hover .si-shortcut { opacity: 1; }

  /* ── TEMPLATE AREA ── */
  .template-area {
    flex: 1;
    overflow-y: auto;
    background: #161616;
    display: flex;
    flex-direction: column;
  }

  .ta-header {
    padding: 12px 16px 10px;
    border-bottom: 1px solid #2a2b2f;
    flex-shrink: 0;
  }

  .ta-cat-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 3px;
  }

  .ta-cat-emoji { font-size: 16px; }
  .ta-cat-name { font-size: 14px; font-weight: 600; color: #ffffff; }
  .ta-cat-count {
    margin-left: auto;
    font-size: 9px;
    padding: 2px 7px;
    border-radius: 6px;
    background: #2a2b2f;
    color: #8e8e93;
  }
  .ta-triggers { font-size: 10px; color: #8e8e93; }

  .ta-list {
    flex: 1;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
  }

  /* ── SUBCATEGORY ACCORDION BLOCK ── */
  .subcat-block {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #2a2b2f;
    flex-shrink: 0;
  }

  .subcat-header {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: #2a2b2f;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.12s;
  }
  .subcat-header:hover { background: #3a3b3f; }

  .subcat-emoji { font-size: 14px; flex-shrink: 0; }

  .subcat-info { flex: 1; min-width: 0; }
  .subcat-name { font-size: 12px; font-weight: 600; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .subcat-triggers { font-size: 9.5px; color: #8e8e93; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .subcat-meta { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .subcat-count {
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 5px;
    background: #161616;
    color: #8e8e93;
  }
  .subcat-chevron { font-size: 10px; color: #8e8e93; transition: transform 0.15s; }
  .subcat-chevron.open { transform: rotate(90deg); }

  .subcat-body {
    display: none;
    padding: 10px;
    background: #1e1f22;
    border-top: 1px solid #2a2b2f;
    flex-direction: column;
    gap: 8px;
  }
  .subcat-body.open { display: flex; }

  /* ── TEMPLATE CARD ── */
  .tpl-card {
    border-radius: 12px;
    padding: 12px 14px;
    background: #2a2b2f;
    border: 1px solid #3a3b3f;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .tpl-card:hover { background: #3a3b3f; border-color: #baff55; }

  .tpl-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
  }

  .tpl-label {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }

  .tpl-copy-btn {
    flex-shrink: 0;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid #3a3b3f;
    background: #161616;
    color: #8e8e93;
    font-size: 9.5px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.12s;
    opacity: 0;
  }
  .tpl-card:hover .tpl-copy-btn { opacity: 1; }
  .tpl-copy-btn.copied { border-color: #baff55; background: rgba(186,255,85,0.1); color: #baff55; opacity: 1; }

  .tpl-text {
    font-size: 11px;
    color: #f8fafc;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* ── SEARCH RESULTS ── */
  .search-result-group { font-size: 9px; color: #374151; padding: 6px 2px 3px; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── EMPTY / STATUS ── */
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: #374151;
    font-size: 12px;
    font-weight: 500;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .status-badge {
    font-size: 9px;
    font-weight: 700;
    color: #8e8e93;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── SCROLLBARS ── */
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 6px; }

  .var-hl { font-weight: 700; }

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
// CATEGORY COLORS (matching web app palette via THEMES cycle)
// ─────────────────────────────────────────────────────────────────────────────
const CAT_COLORS = ['#4f9cf9','#34d399','#f59e0b','#f87171','#a78bfa','#10b981','#fb923c','#06b6d4','#e879f9','#facc15','#f97316','#84cc16'];
let catColorIndex = 0;
const catColorMap = {}; // category name → color

function getCatColor(catName) {
  if (!catColorMap[catName]) {
    catColorMap[catName] = CAT_COLORS[catColorIndex % CAT_COLORS.length];
    catColorIndex++;
  }
  return catColorMap[catName];
}

function getCatEmoji(catName) {
  const m = catName.match(/(\p{Emoji})/u);
  return m ? m[0] : '📂';
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR BUILDER
// ─────────────────────────────────────────────────────────────────────────────
let panelSelectedCategory = null;

function buildSidebarItem(catName, catGroups) {
  const color = getCatColor(catName);
  const emoji = getCatEmoji(catName);
  const label = catName.replace(/(\p{Emoji})/gu, '').trim();
  const idx = Object.keys(catGroups).indexOf(catName);
  const shortcutKey = idx < 9 ? String(idx + 1) : '';

  const btn = document.createElement('button');
  btn.className = 'sidebar-item';
  btn.style.setProperty('--cat-color', color);
  btn.dataset.cat = catName;

  const bar = document.createElement('span');
  bar.className = 'si-active-bar';

  const emojiEl = document.createElement('span');
  emojiEl.className = 'si-emoji';
  emojiEl.textContent = emoji;

  const nameEl = document.createElement('span');
  nameEl.className = 'si-name';
  nameEl.textContent = label;

  btn.append(bar, emojiEl, nameEl);

  if (shortcutKey) {
    const sc = document.createElement('span');
    sc.className = 'si-shortcut';
    sc.textContent = shortcutKey;
    btn.appendChild(sc);
  }

  btn.onclick = () => {
    panelSelectedCategory = catName;
    panelActiveShortcut = null;
    const searchInput = panelShadow.getElementById('panel-search');
    if (searchInput) searchInput.value = '';
    updateSidebarActive();
    renderTemplateArea(catGroups[catName], catName);
    filterPanelTemplates();
  };

  return btn;
}

function updateSidebarActive() {
  const sidebar = panelShadow.getElementById('panel-sidebar');
  if (!sidebar) return;
  sidebar.querySelectorAll('.sidebar-item').forEach(btn => {
    const isActive = btn.dataset.cat === panelSelectedCategory;
    btn.classList.toggle('active-cat', isActive);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE AREA BUILDERS
// ─────────────────────────────────────────────────────────────────────────────
function buildTemplateCard(resp, catColor, tplTitle) {
  const card = document.createElement('div');
  card.className = 'tpl-card';

  const top = document.createElement('div');
  top.className = 'tpl-card-top';

  const labelBadge = document.createElement('span');
  labelBadge.className = 'tpl-label';
  labelBadge.textContent = resp.type || 'Standard';
  labelBadge.style.background = catColor + '22';
  labelBadge.style.color = catColor;
  labelBadge.style.border = `1px solid ${catColor}44`;

  const copyBtn = document.createElement('button');
  copyBtn.className = 'tpl-copy-btn';
  copyBtn.textContent = 'Copy & Inject';

  top.append(labelBadge, copyBtn);

  const textEl = document.createElement('div');
  textEl.className = 'tpl-text';
  renderHighlighted(textEl, resp.text, catColor);

  card.append(top, textEl);

  const doInject = () => {
    navigator.clipboard?.writeText(resp.text);
    injectIntoLastInput(resp.text);
    copyBtn.textContent = '✓ Copied!';
    copyBtn.classList.add('copied');
    setTimeout(() => { copyBtn.textContent = 'Copy & Inject'; copyBtn.classList.remove('copied'); }, 1800);
  };

  card.onclick = doInject;
  copyBtn.onclick = e => { e.stopPropagation(); doInject(); };

  return card;
}

function buildSubcatBlock(t, catColor, defaultOpen) {
  const responses = t.responses?.length ? t.responses : [{ text: 'No response found.', type: 'Standard' }];
  const emojiMatch = t.title.match(/(\p{Emoji})/u);
  const emoji = emojiMatch ? emojiMatch[0] : '📄';
  const titleLabel = t.title.replace(/(\p{Emoji})/gu, '').trim();
  const triggersText = Array.isArray(t.triggers) ? t.triggers.join(', ') : (t.triggers || '');

  const block = document.createElement('div');
  block.className = 'subcat-block';

  const header = document.createElement('button');
  header.className = 'subcat-header';

  const emojiEl = document.createElement('span');
  emojiEl.className = 'subcat-emoji';
  emojiEl.textContent = emoji;

  const info = document.createElement('div');
  info.className = 'subcat-info';

  const nameEl = document.createElement('div');
  nameEl.className = 'subcat-name';
  nameEl.textContent = titleLabel;

  const triggersEl = document.createElement('div');
  triggersEl.className = 'subcat-triggers';
  triggersEl.textContent = triggersText ? `Triggers: ${triggersText}` : '';

  info.append(nameEl, triggersEl);

  const meta = document.createElement('div');
  meta.className = 'subcat-meta';

  const countEl = document.createElement('span');
  countEl.className = 'subcat-count';
  countEl.textContent = `${responses.length} ${responses.length === 1 ? 'reply' : 'replies'}`;

  const chevron = document.createElement('span');
  chevron.className = 'subcat-chevron';
  chevron.textContent = '▶';

  meta.append(countEl, chevron);
  header.append(emojiEl, info, meta);

  const body = document.createElement('div');
  body.className = 'subcat-body';

  responses.forEach(resp => body.appendChild(buildTemplateCard(resp, catColor, t.title)));

  block.append(header, body);

  let isOpen = defaultOpen || false;
  const applyOpen = () => {
    body.classList.toggle('open', isOpen);
    chevron.classList.toggle('open', isOpen);
  };
  applyOpen();

  header.onclick = () => { isOpen = !isOpen; applyOpen(); };

  return block;
}

function renderTemplateArea(templates, catName) {
  const area = panelShadow.getElementById('panel-template-area');
  if (!area) return;
  area.innerHTML = '';

  if (!templates || templates.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No templates in this category.';
    area.appendChild(empty);
    return;
  }

  const color = getCatColor(catName);
  const emoji = getCatEmoji(catName);
  const label = catName.replace(/(\p{Emoji})/gu, '').trim();

  // Header
  const header = document.createElement('div');
  header.className = 'ta-header';

  const catRow = document.createElement('div');
  catRow.className = 'ta-cat-row';

  const catEmoji = document.createElement('span');
  catEmoji.className = 'ta-cat-emoji';
  catEmoji.textContent = emoji;

  const catNameEl = document.createElement('span');
  catNameEl.className = 'ta-cat-name';
  catNameEl.textContent = label;

  const catCount = document.createElement('span');
  catCount.className = 'ta-cat-count';
  catCount.textContent = `${templates.length} templates`;

  catRow.append(catEmoji, catNameEl, catCount);

  const triggersLine = document.createElement('div');
  triggersLine.className = 'ta-triggers';
  const allTriggers = templates.flatMap(t => Array.isArray(t.triggers) ? t.triggers : [t.triggers]).filter(Boolean);
  triggersLine.textContent = allTriggers.length ? `Triggers: ${[...new Set(allTriggers)].slice(0, 8).join(', ')}` : '';

  header.append(catRow, triggersLine);
  area.appendChild(header);

  // Template list
  const list = document.createElement('div');
  list.className = 'ta-list';
  templates.forEach((t, i) => list.appendChild(buildSubcatBlock(t, color, i === 0)));
  area.appendChild(list);
}

function renderSearchResults(templates, query) {
  const area = panelShadow.getElementById('panel-template-area');
  if (!area) return;
  area.innerHTML = '';

  if (!templates || templates.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = `No results for "${query}"`;
    area.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'ta-list';

  // Group by category
  const groups = new Map();
  templates.forEach(t => {
    if (!groups.has(t.category)) groups.set(t.category, []);
    groups.get(t.category).push(t);
  });

  const countLabel = document.createElement('div');
  countLabel.className = 'search-result-group';
  countLabel.textContent = `${templates.length} result${templates.length !== 1 ? 's' : ''} for "${query}"`;
  list.appendChild(countLabel);

  groups.forEach((items, cat) => {
    const color = getCatColor(cat);
    const groupLabel = document.createElement('div');
    groupLabel.className = 'search-result-group';
    groupLabel.textContent = cat;
    list.appendChild(groupLabel);
    items.forEach((t, i) => list.appendChild(buildSubcatBlock(t, color, i === 0)));
  });

  area.appendChild(list);
}

// ─────────────────────────────────────────────────────────────────────────────
// PANEL RENDERING
// ─────────────────────────────────────────────────────────────────────────────
function renderPanelTemplates(allTemplates) {
  // Build category groups
  const seen = new Set();
  const unique = (allTemplates || []).filter(t => {
    const k = `${t.category}||${t.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const groups = {};
  unique.forEach(t => {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  });

  // Populate sidebar
  const sidebar = panelShadow.getElementById('panel-sidebar');
  if (sidebar) {
    // Keep the label, remove old items
    const existingLabel = sidebar.querySelector('.sidebar-label');
    sidebar.innerHTML = '';
    if (existingLabel) sidebar.appendChild(existingLabel);
    else {
      const lbl = document.createElement('div');
      lbl.className = 'sidebar-label';
      lbl.textContent = 'Categories';
      sidebar.appendChild(lbl);
    }
    Object.keys(groups).forEach(catName => {
      sidebar.appendChild(buildSidebarItem(catName, groups));
    });
  }

  // Auto-select first category
  const firstCat = Object.keys(groups)[0];
  if (firstCat && !panelSelectedCategory) {
    panelSelectedCategory = firstCat;
  }
  updateSidebarActive();

  // Show first category templates
  if (panelSelectedCategory && groups[panelSelectedCategory]) {
    renderTemplateArea(groups[panelSelectedCategory], panelSelectedCategory);
  } else if (firstCat) {
    renderTemplateArea(groups[firstCat], firstCat);
  }
}

function filterPanelTemplates() {
  const searchInput = panelShadow.getElementById('panel-search');
  const catSelect = panelShadow.getElementById('panel-cat');
  let q = (searchInput ? searchInput.value : '').toLowerCase().trim();
  let cat = catSelect ? catSelect.value : 'ALL';

  let filtered = panelAllTemplates;

  // Shortcut filter takes priority — show matching templates across all cats
  if (panelActiveShortcut) {
    const titles = SHORTCUT_MAPPING[panelActiveShortcut] || [];
    filtered = filtered.filter(t => titles.some(targetTitle => t.title.includes(targetTitle)));
    panelSelectedCategory = null;
    updateSidebarActive();
    renderSearchResults(filtered, panelActiveShortcut);
    return;
  }

  // Search query — global search across all templates
  if (q) {
    let tokens = q.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    filtered = filtered.filter(t => {
      const title = t.title.toLowerCase();
      const triggers = (t.triggers || []).map(tr => tr.toLowerCase());
      return tokens.some(tok => title.includes(tok) || triggers.some(tr => tr.includes(tok)));
    });
    panelSelectedCategory = null;
    updateSidebarActive();
    renderSearchResults(filtered, q);
    return;
  }

  // Category filter via dropdown
  if (cat !== 'ALL') {
    filtered = filtered.filter(t => t.category === cat);
    panelSelectedCategory = cat;
    updateSidebarActive();
    renderTemplateArea(filtered, cat);
    return;
  }

  // Default: show currently selected sidebar category
  const groups = {};
  filtered.forEach(t => {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  });
  if (panelSelectedCategory && groups[panelSelectedCategory]) {
    renderTemplateArea(groups[panelSelectedCategory], panelSelectedCategory);
  }
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
  versionPill.textContent = 'v1.9';

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

  // ── BODY SPLIT (sidebar + template area) ──
  const bodySplit = document.createElement('div');
  bodySplit.className = 'body-split';
  bodySplit.id = 'panel-content';

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.id = 'panel-sidebar';
  const sidebarLabel = document.createElement('div');
  sidebarLabel.className = 'sidebar-label';
  sidebarLabel.textContent = 'Categories';
  sidebar.appendChild(sidebarLabel);

  const templateArea = document.createElement('div');
  templateArea.className = 'template-area';
  templateArea.id = 'panel-template-area';
  const loadingEl = document.createElement('div');
  loadingEl.className = 'empty-state';
  loadingEl.textContent = 'Syncing templates…';
  templateArea.appendChild(loadingEl);

  bodySplit.append(sidebar, templateArea);
  panel.appendChild(bodySplit);

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
      if (ctrl) ctrl.style.display = 'none';
      if (content) content.style.display = 'none';
      minBtn.title = 'Restore';
    } else {
      p.style.height = panelHeight + 'px';
      p.style.overflow = 'hidden';
      if (ctrl) ctrl.style.display = '';
      if (content) content.style.display = '';
      minBtn.title = 'Minimize';
    }
  };

  // ── MAXIMIZE ──
  maxBtn.onclick = () => {
    const p = panelShadow.getElementById('bmc-panel');
    panelWidth = Math.max(320, Math.round(window.innerWidth * 0.5));
    panelHeight = window.innerHeight - 20;
    panelX = window.innerWidth - panelWidth - 10;
    panelY = 10;
    p.style.cssText = `left:${panelX}px;top:10px;width:${panelWidth}px;height:${panelHeight}px;position:fixed;`;
    panelMinimized = false;
    const ctrl = panelShadow.getElementById('panel-controls');
    const content = panelShadow.getElementById('panel-content');
    if (ctrl) ctrl.style.display = '';
    if (content) content.style.display = '';
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

// Duplicate function removed

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
  // Don't show slash menu if the floating panel is visible
  if (panelVisible) return;

  // Don't trigger slash menu if the event originated inside our shadow roots
  const path = e.composedPath();
  if (panelRoot && path.includes(panelRoot)) return;
  if (slashRoot && path.includes(slashRoot)) return;

  const target = path[0];
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
