// === INLINE COMMAND MENU FOR BLASTCHAT MATRIX ===

const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplatesCache = null;
let commandMenuRoot = null;
let commandMenuShadow = null;
let currentSearch = "";
let isMenuOpen = false;
let activeIndex = 0;
let filteredResults = [];

// HubSpot styling for the floating menu
const MENU_CSS = `
  .command-menu {
    position: fixed;
    z-index: 999999;
    background: #2b3640;
    border: 1px solid #425b76;
    border-radius: 8px;
    width: 320px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    font-family: 'Inter', -apple-system, sans-serif;
    color: #ffffff;
    display: none;
    flex-direction: column;
  }
  .command-menu.visible {
    display: flex;
  }
  .command-header {
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 600;
    color: #cbd6e2;
    border-bottom: 1px solid #425b76;
    background: #33404d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .command-item {
    padding: 12px;
    border-bottom: 1px solid #425b76;
    cursor: pointer;
    transition: background 0.1s;
  }
  .command-item:last-child {
    border-bottom: none;
  }
  .command-item.active, .command-item:hover {
    background: #3a4b5c;
  }
  .command-title {
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 4px;
  }
  .command-category {
    font-size: 10px;
    font-weight: 600;
    color: #ff7a59;
    text-transform: uppercase;
    margin-bottom: 4px;
    display: inline-block;
    background: rgba(255,122,89,0.15);
    padding: 2px 6px;
    border-radius: 4px;
  }
  .command-preview {
    font-size: 11px;
    color: #cbd6e2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #ff7a59; }
`;

function createMenuDOM() {
  if (commandMenuRoot) return;
  commandMenuRoot = document.createElement('div');
  commandMenuRoot.id = 'blastchat-command-menu-root';
  document.documentElement.appendChild(commandMenuRoot);

  commandMenuShadow = commandMenuRoot.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = MENU_CSS;
  commandMenuShadow.appendChild(style);

  const menu = document.createElement('div');
  menu.className = 'command-menu';
  menu.id = 'menu';
  commandMenuShadow.appendChild(menu);
}

async function fetchTemplates() {
  if (allTemplatesCache) return allTemplatesCache;
  try {
    const url = \`\${SUPABASE_URL}/rest/v1/support_templates?select=*\`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': \`Bearer \${SUPABASE_ANON_KEY}\`
      }
    });
    if (!response.ok) return [];
    const data = await response.json();
    let flat = [];
    data.forEach(cat => {
      if (cat.templates) {
        cat.templates.forEach(t => {
          flat.push({ category: cat.category, title: t.title, responses: t.responses, triggers: t.triggers });
        });
      }
    });
    allTemplatesCache = flat;
    return flat;
  } catch (e) {
    console.error("BlastChat Matrix: Failed to fetch templates inline", e);
    return [];
  }
}

function renderMenu() {
  if (!commandMenuShadow) return;
  const menu = commandMenuShadow.getElementById('menu');
  menu.innerHTML = '<div class="command-header">Templates Search: ' + currentSearch + '</div>';
  
  if (filteredResults.length === 0) {
    menu.innerHTML += '<div class="command-item"><div class="command-preview">No matches found.</div></div>';
    return;
  }

  filteredResults.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'command-item' + (index === activeIndex ? ' active' : '');
    
    const cat = document.createElement('div');
    cat.className = 'command-category';
    cat.textContent = item.category;

    const title = document.createElement('div');
    title.className = 'command-title';
    title.textContent = item.title;

    const preview = document.createElement('div');
    preview.className = 'command-preview';
    preview.textContent = item.responses[0]?.text || '';

    el.appendChild(cat);
    el.appendChild(title);
    el.appendChild(preview);

    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      injectTemplate(item);
    });
    
    // Auto-scroll logic
    if (index === activeIndex) {
      setTimeout(() => {
        el.scrollIntoView({ block: 'nearest' });
      }, 0);
    }

    menu.appendChild(el);
  });
}

function openMenu(x, y) {
  if (!commandMenuRoot) createMenuDOM();
  isMenuOpen = true;
  activeIndex = 0;
  fetchTemplates().then(templates => {
    filterTemplates(currentSearch);
  });
  
  const menu = commandMenuShadow.getElementById('menu');
  menu.classList.add('visible');
  
  // Position it
  const menuWidth = 320;
  const menuHeight = 300;
  
  let posX = x;
  let posY = y + 20; // slightly below cursor
  
  if (posX + menuWidth > window.innerWidth) posX = window.innerWidth - menuWidth - 10;
  if (posY + menuHeight > window.innerHeight) posY = y - menuHeight - 10;

  menu.style.left = posX + 'px';
  menu.style.top = posY + 'px';
}

function closeMenu() {
  isMenuOpen = false;
  currentSearch = "";
  if (commandMenuShadow) {
    const menu = commandMenuShadow.getElementById('menu');
    if (menu) menu.classList.remove('visible');
  }
}

function filterTemplates(query) {
  if (!allTemplatesCache) return;
  const q = query.toLowerCase().trim();
  if (!q) {
    filteredResults = allTemplatesCache.slice(0, 10);
  } else {
    filteredResults = allTemplatesCache.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.triggers || []).some(tr => tr.toLowerCase().includes(q))
    ).slice(0, 10);
  }
  if (activeIndex >= filteredResults.length) activeIndex = Math.max(0, filteredResults.length - 1);
  renderMenu();
}

function injectTemplate(template) {
  if (!lastFocusedInput) return;
  const text = template.responses[0]?.text || '';
  
  // Try to remove the "/search" part
  const val = lastFocusedInput.value || lastFocusedInput.innerText || "";
  const lastSlashIdx = val.lastIndexOf('/');
  
  if (lastFocusedInput.isContentEditable) {
    // Basic contenteditable replacement (doesn't perfectly handle cursor ranges, but works as fallback)
    const current = lastFocusedInput.innerText;
    if (lastSlashIdx !== -1) {
      lastFocusedInput.innerText = current.substring(0, lastSlashIdx) + text;
    } else {
      lastFocusedInput.innerText += text;
    }
  } else {
    if (lastSlashIdx !== -1) {
      const before = val.substring(0, lastSlashIdx);
      // use native setter to trigger React/Angular bindings
      const proto = lastFocusedInput.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) {
        setter.call(lastFocusedInput, before + text);
      } else {
        lastFocusedInput.value = before + text;
      }
    }
  }

  // Trigger events
  ['input', 'change'].forEach(e => {
    lastFocusedInput.dispatchEvent(new Event(e, { bubbles: true, composed: true }));
  });

  closeMenu();
  lastFocusedInput.focus();
}

// === EXISTING FOCUS TRACKING & MESSAGE LISTENER ===
let lastFocusedInput = null;

function checkAndSetTarget(target) {
  if (!target) return;
  const isInput = target.tagName === 'TEXTAREA' || 
                  (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'email')) || 
                  target.isContentEditable ||
                  target.getAttribute('role') === 'textbox' ||
                  target.classList.contains('public-DraftEditor-content');

  if (isInput) lastFocusedInput = target;
}

document.addEventListener('mousedown', (e) => checkAndSetTarget(e.composedPath()[0]), true);
document.addEventListener('focusin', (e) => checkAndSetTarget(e.composedPath()[0]), true);

document.addEventListener('keydown', (e) => {
  if (isMenuOpen) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filteredResults.length;
      renderMenu();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filteredResults.length) % filteredResults.length;
      renderMenu();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        injectTemplate(filteredResults[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      closeMenu();
    }
  }
});

document.addEventListener('keyup', (e) => {
  const target = e.composedPath()[0];
  checkAndSetTarget(target);
  
  if (!lastFocusedInput) return;

  const val = lastFocusedInput.value || lastFocusedInput.innerText || "";
  
  // Logic to detect "/something"
  // Find last index of '/'
  const lastSlash = val.lastIndexOf('/');
  
  if (lastSlash !== -1) {
    // Make sure it's preceded by space or start of line
    const isStartOrSpace = lastSlash === 0 || val[lastSlash - 1] === ' ' || val[lastSlash - 1] === '\\n';
    
    if (isStartOrSpace) {
      const query = val.substring(lastSlash + 1);
      // If query has no spaces, it's a valid command search
      if (!query.includes(' ') && query.length < 20) {
        currentSearch = query;
        if (!isMenuOpen) {
          // get caret coords approximation
          const rect = target.getBoundingClientRect();
          openMenu(rect.left + 10, rect.bottom);
        } else {
          filterTemplates(currentSearch);
        }
        return;
      }
    }
  }
  
  if (isMenuOpen) closeMenu();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    // (existing injectText logic)
    let target = lastFocusedInput;
    if (target) {
      target.focus();
      try {
        if (target.isContentEditable || target.getAttribute('role') === 'textbox') {
          const successful = document.execCommand('insertText', false, request.text);
          if (!successful) target.innerText = request.text;
        } else {
          const proto = target.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          if (nativeSetter) {
            nativeSetter.call(target, request.text);
          } else {
            target.value = request.text;
          }
        }
        ['input', 'change', 'blur'].forEach(type => {
          target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
        });
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    } else {
      sendResponse({ success: false, error: "No target found" });
    }
  } else if (request.action === "getSelectedText") {
    sendResponse({ text: window.getSelection().toString() });
  }
  return true;
});
