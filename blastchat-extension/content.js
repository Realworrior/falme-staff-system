let lastFocusedInput = null;

// Track focus across the document and within shadow roots
function trackFocus(root) {
  // Use mousedown to capture the element before focus even shifts
  root.addEventListener('mousedown', (e) => {
    const target = e.composedPath()[0];
    checkAndSetTarget(target);
  }, true);

  root.addEventListener('focusin', (e) => {
    const target = e.composedPath()[0];
    checkAndSetTarget(target);
  }, true);
}

function checkAndSetTarget(target) {
  if (!target) return;
  
  const isInput = target.tagName === 'TEXTAREA' || 
                  (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search' || target.type === 'email')) || 
                  target.isContentEditable ||
                  target.getAttribute('role') === 'textbox' ||
                  target.classList.contains('public-DraftEditor-content');

  if (isInput) {
    lastFocusedInput = target;
    console.log("BlastChat Injector: Target captured", target);
  }
}

trackFocus(document);

// Helper to find elements in Shadow DOMs
function findInShadows(root, selector) {
  let elements = Array.from(root.querySelectorAll(selector));
  const shadows = Array.from(root.querySelectorAll('*')).map(el => el.shadowRoot).filter(Boolean);
  
  for (const shadow of shadows) {
    elements = elements.concat(findInShadows(shadow, selector));
  }
  return elements;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    let target = lastFocusedInput;
    
    // Check if current active element is an input (even if focus tracking missed it)
    if (!target || !document.body.contains(target)) {
      const active = document.activeElement;
      if (active && (active.tagName === 'TEXTAREA' || active.isContentEditable || (active.tagName === 'INPUT' && active.type === 'text'))) {
        target = active;
      }
    }

    // Fallback: search for visible inputs
    if (!target || !document.body.contains(target) || target.offsetParent === null) {
      const selectors = [
        'textarea', 
        '[contenteditable="true"]', 
        '[role="textbox"]',
        '.public-DraftEditor-content',
        'input[type="text"]', 
        'input[type="search"]'
      ];
      
      for (let s of selectors) {
        const elements = findInShadows(document, s);
        for (let el of elements) {
          if (el.offsetParent !== null && !el.disabled) {
            target = el;
            break;
          }
        }
        if (target) break;
      }
    }

    if (target) {
      console.log("BlastChat Injector: Target identified", target);
      target.focus();
      
      try {
        if (target.isContentEditable || target.getAttribute('role') === 'textbox') {
          // Force focus and clear range for some editors
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
             // Keep existing range if possible
          }
          
          const successful = document.execCommand('insertText', false, request.text);
          if (!successful) {
            console.log("BlastChat Injector: execCommand failed, using innerText fallback");
            target.innerText = request.text;
          }
        } else {
          const proto = target.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          
          if (nativeSetter) {
            nativeSetter.call(target, request.text);
          } else {
            target.value = request.text;
          }
        }

        // Framework event trigger
        const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
        events.forEach(type => {
          target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
        });

        sendResponse({ success: true, frame: window.location.href });
      } catch (e) {
        console.error("BlastChat Injector: Error during injection", e);
        sendResponse({ success: false, error: e.message });
      }
    } else {
      sendResponse({ success: false, error: "No target found in this frame" });
    }
  } else if (request.action === "getSelectedText") {
    const selection = window.getSelection().toString();
    sendResponse({ text: selection });
  }
  return true;
});

// ═══════════════════════════════════════════════════════════════════════════════
// NEW MODULES — Added on top of existing content.js (nothing above was changed)
// ═══════════════════════════════════════════════════════════════════════════════

// ─── 0. Supabase Config (reuse from popup.js) ────────────────────────────────
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';
let _cachedTemplates = [];

async function fetchTemplatesForAutocomplete() {
  if (_cachedTemplates.length > 0) return _cachedTemplates;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/support_templates?select=*`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const flat = [];
    (data || []).forEach(cat => {
      (cat.templates || []).forEach(t => {
        flat.push({ category: cat.category || 'General', title: t.title, responses: t.responses || [], triggers: t.triggers || [] });
      });
    });
    _cachedTemplates = flat;
    return flat;
  } catch (e) {
    console.warn('[BlastChat] Template fetch failed:', e);
    return [];
  }
}

// ─── 1. Inject page_injector.js into the page's main world ───────────────────
(function injectPageScript() {
  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page_injector.js');
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);
    console.log('[BlastChat] Page injector bridge loaded.');
  } catch (e) {
    console.warn('[BlastChat] Could not inject page script:', e);
  }
})();

/**
 * Enhanced injection that tries the page-context React bridge first,
 * then falls back to the existing DOM-level injection.
 */
function injectTextEnhanced(target, text) {
  if (!target) return;
  target.focus();

  // Try React bridge first via page_injector.js
  let selectorHint = '';
  if (target.id) selectorHint = '#' + target.id;
  else if (target.getAttribute('data-testid')) selectorHint = `[data-testid="${target.getAttribute('data-testid')}"]`;

  window.dispatchEvent(new CustomEvent('blastchat-inject', {
    detail: { text, targetSelector: selectorHint }
  }));
}

// ─── 2. BlastChat Formatter — flatten newlines into single-line ──────────────
function formatForBlastChat(text) {
  if (!text) return '';
  let formatted = text;
  // Convert numbered lists ("1. Item") into "✦ 1. Item"
  formatted = formatted.replace(/^(\d+\.\s+)/gm, '✦ $1');
  // Convert bullet points ("- Item" or "• Item") into "✦ Item"
  formatted = formatted.replace(/^[\-•]\s+/gm, '✦ ');
  // Flatten all newlines into " ✦ "
  formatted = formatted.replace(/\n+/g, ' ✦ ');
  // Clean up duplicate dividers and leading dividers
  formatted = formatted.replace(/\s*✦\s*✦/g, ' ✦');
  formatted = formatted.replace(/^\s*✦\s*/, '');
  return formatted.trim();
}

// ─── 3. Chat Context Scraper ─────────────────────────────────────────────────
const AGENT_CLOSURE_PHRASES = [
  'rolled back', 'resolved', 'sorted', 'glad', 'welcome back',
  'thank you for choosing', 'issue has been resolved', 'successfully',
  'reactivated', 'credited', 'account is now', 'we\'re glad',
  'feel free to reach out', 'take care', 'have a wonderful day'
];

/**
 * Scrape visible chat messages from the BlastChat DOM.
 * Returns an array of { sender: 'client'|'agent', text: string, timeStr: string }
 */
function scrapeChatMessages() {
  const messages = [];

  // Strategy 1: Look for common chat message containers
  const selectors = [
    '.message', '.chat-message', '.msg', '[class*="message"]',
    '[class*="Message"]', '[class*="chat"]', '[data-message]'
  ];

  let messageElements = [];
  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 3) { // Chat usually has multiple messages
      messageElements = Array.from(els);
      break;
    }
  }

  // Strategy 2: If no selector matched, look for repeated sibling elements in a scrollable container
  if (messageElements.length === 0) {
    const scrollContainers = document.querySelectorAll('[style*="overflow"], [class*="scroll"], [class*="chat"]');
    for (const container of scrollContainers) {
      const children = container.children;
      if (children.length > 5) {
        messageElements = Array.from(children);
        break;
      }
    }
  }

  for (const el of messageElements) {
    const text = (el.textContent || '').trim();
    if (!text || text.length < 2) continue;

    // Detect sender — heuristic based on alignment, class names, or background color
    const classes = (el.className || '').toLowerCase();
    const style = window.getComputedStyle(el);
    let sender = 'client'; // default

    if (classes.includes('agent') || classes.includes('operator') || classes.includes('outgoing') ||
        classes.includes('sent') || classes.includes('self') || classes.includes('right') ||
        style.textAlign === 'right' || style.marginLeft === 'auto') {
      sender = 'agent';
    }

    // Extract time — look for a time-like pattern in the element or its children
    let timeStr = '';
    const timeEl = el.querySelector('[class*="time"], [class*="Time"], time, small, .timestamp');
    if (timeEl) {
      timeStr = timeEl.textContent.trim();
    } else {
      const timeMatch = text.match(/\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/);
      if (timeMatch) timeStr = timeMatch[1];
    }

    // Strip the time from the main text if it was embedded
    const cleanText = timeStr ? text.replace(timeStr, '').trim() : text;

    messages.push({ sender, text: cleanText, timeStr });
  }

  return messages;
}

/**
 * Parse a BlastChat time string (e.g. "4:15 PM", "16:15") into minutes since midnight.
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/);
  if (!match) return -1;
  let hours = parseInt(match[1], 10);
  const mins = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + mins;
}

/**
 * Determine the active context window from scraped messages.
 * Returns only the messages in the current (unresolved) conversation segment.
 */
function getActiveContext(messages) {
  if (messages.length === 0) return [];

  let contextStartIdx = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    // Check for agent closure phrases
    if (msg.sender === 'agent') {
      const lower = msg.text.toLowerCase();
      const isClosure = AGENT_CLOSURE_PHRASES.some(phrase => lower.includes(phrase));
      if (isClosure && i < messages.length - 1) {
        // There are messages after this closure — new context starts at i+1
        contextStartIdx = i + 1;
        break;
      }
    }

    // Check for temporal gap (>2 hours between adjacent messages)
    if (i > 0) {
      const prevTime = parseTimeToMinutes(messages[i - 1].timeStr);
      const currTime = parseTimeToMinutes(msg.timeStr);
      if (prevTime >= 0 && currTime >= 0) {
        let gap = currTime - prevTime;
        if (gap < 0) gap += 24 * 60; // Handle day wrap
        if (gap > 120) { // 2+ hour gap
          contextStartIdx = i;
          break;
        }
      }
    }
  }

  return messages.slice(contextStartIdx);
}

/**
 * Build a context summary string from the active chat window.
 */
function buildContextSummary() {
  const allMessages = scrapeChatMessages();
  const activeMessages = getActiveContext(allMessages);
  const clientMessages = activeMessages.filter(m => m.sender === 'client');

  if (clientMessages.length === 0) return '';
  return clientMessages.map(m => m.text).join(' | ');
}

// ─── 4. Autocomplete Dropdown (the "/" command) ──────────────────────────────
let autocompleteContainer = null;
let autocompleteVisible = false;
let autocompleteItems = [];
let autocompleteSelectedIdx = 0;
let autocompleteQuery = '';

function createAutocompleteUI() {
  if (autocompleteContainer) return;

  autocompleteContainer = document.createElement('div');
  autocompleteContainer.id = 'blastchat-autocomplete';
  autocompleteContainer.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    width: 420px;
    max-height: 360px;
    overflow-y: auto;
    background: rgba(10, 10, 20, 0.97);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(37, 99, 235, 0.4);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 30px rgba(37,99,235,0.15);
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    display: none;
    padding: 6px;
  `;

  // Scrollbar styling
  const style = document.createElement('style');
  style.textContent = `
    #blastchat-autocomplete::-webkit-scrollbar { width: 4px; }
    #blastchat-autocomplete::-webkit-scrollbar-track { background: transparent; }
    #blastchat-autocomplete::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.3); border-radius: 10px; }
    #blastchat-autocomplete .bc-ac-item {
      padding: 10px 14px;
      cursor: pointer;
      border-radius: 10px;
      transition: background 0.15s;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    #blastchat-autocomplete .bc-ac-item:hover,
    #blastchat-autocomplete .bc-ac-item.active {
      background: rgba(37,99,235,0.15);
    }
    #blastchat-autocomplete .bc-ac-title {
      font-size: 12px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.01em;
    }
    #blastchat-autocomplete .bc-ac-category {
      font-size: 9px;
      font-weight: 800;
      color: rgba(37,99,235,0.8);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    #blastchat-autocomplete .bc-ac-preview {
      font-size: 10px;
      color: rgba(255,255,255,0.4);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 390px;
    }
    #blastchat-autocomplete .bc-ac-header {
      padding: 8px 14px 6px;
      font-size: 9px;
      font-weight: 900;
      color: rgba(37,99,235,0.6);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      margin-bottom: 4px;
    }
    #blastchat-autocomplete .bc-ac-empty {
      padding: 20px 14px;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      text-align: center;
      font-weight: 600;
    }
    #blastchat-autocomplete .bc-ac-context {
      padding: 8px 14px;
      font-size: 9px;
      color: rgba(139,92,246,0.7);
      border-top: 1px solid rgba(255,255,255,0.04);
      margin-top: 4px;
      font-weight: 600;
    }
    #blastchat-autocomplete .bc-ac-item.ai-suggested {
      border-left: 3px solid #10b981;
      background: rgba(16, 185, 129, 0.05);
    }
    #blastchat-autocomplete .bc-ac-item.ai-suggested:hover,
    #blastchat-autocomplete .bc-ac-item.ai-suggested.active {
      background: rgba(16, 185, 129, 0.15);
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(autocompleteContainer);
}

function positionAutocomplete(inputEl) {
  if (!autocompleteContainer || !inputEl) return;
  const rect = inputEl.getBoundingClientRect();
  const dropdownHeight = Math.min(autocompleteContainer.scrollHeight, 360);

  // Position above the input
  autocompleteContainer.style.left = rect.left + 'px';
  autocompleteContainer.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
  autocompleteContainer.style.top = 'auto';
  autocompleteContainer.style.width = Math.max(rect.width, 420) + 'px';
}

function renderAutocompleteItems(items, query) {
  if (!autocompleteContainer) return;
  autocompleteContainer.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'bc-ac-header';
  header.textContent = query ? `⚡ Results for "${query}"` : '⚡ BlastChat Templates — type to filter';
  autocompleteContainer.appendChild(header);

  // Context indicator
  const contextSummary = buildContextSummary();
  if (contextSummary) {
    const ctxDiv = document.createElement('div');
    ctxDiv.className = 'bc-ac-context';
    ctxDiv.textContent = '🧠 Context: ' + (contextSummary.length > 80 ? contextSummary.substring(0, 80) + '…' : contextSummary);
    autocompleteContainer.appendChild(ctxDiv);
  }

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'bc-ac-empty';
    empty.textContent = 'No templates match — keep typing or press Esc';
    autocompleteContainer.appendChild(empty);
    return;
  }

  items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'bc-ac-item' + (idx === autocompleteSelectedIdx ? ' active' : '');
    if (item.isAISuggested) {
      div.classList.add('ai-suggested');
    }
    div.dataset.index = idx;

    const cat = document.createElement('div');
    cat.className = 'bc-ac-category';
    cat.style.display = 'flex';
    cat.style.justifyContent = 'space-between';
    cat.style.width = '100%';
    
    const catName = document.createElement('span');
    catName.textContent = item.category;
    cat.appendChild(catName);

    if (item.isAISuggested) {
      const aiBadge = document.createElement('span');
      aiBadge.textContent = '🧠 AI RECOMMENDED';
      aiBadge.style.color = '#10b981';
      aiBadge.style.fontWeight = '900';
      aiBadge.style.fontSize = '8px';
      aiBadge.style.letterSpacing = '0.05em';
      cat.appendChild(aiBadge);
    }
    div.appendChild(cat);

    const title = document.createElement('div');
    title.className = 'bc-ac-title';
    title.textContent = item.title;
    div.appendChild(title);

    const preview = document.createElement('div');
    preview.className = 'bc-ac-preview';
    const firstResp = item.responses[0]?.text || '';
    preview.textContent = firstResp.substring(0, 100) + (firstResp.length > 100 ? '…' : '');
    div.appendChild(preview);

    div.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      selectAutocompleteItem(idx);
    });

    autocompleteContainer.appendChild(div);
  });
}

function filterTemplates(query, templates) {
  if (!query) return templates.slice(0, 12);

  const lower = query.toLowerCase().trim();
  const tokens = lower.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length >= 2);

  const scored = templates.map(t => {
    let score = 0;
    const titleLower = t.title.toLowerCase();
    const triggers = (t.triggers || []).map(tr => tr.toLowerCase());

    // 1. Check exact/substring match of the entire query against triggers (shortcuts)
    if (triggers.includes(lower)) {
      score += 60; // Exact trigger match gets highest priority
    } else if (triggers.some(tr => tr.startsWith(lower))) {
      score += 40; // Trigger prefix match
    } else if (triggers.some(tr => tr.includes(lower))) {
      score += 25; // Trigger substring match
    }

    // 2. Token-level matches on triggers (shortcuts)
    for (const token of tokens) {
      if (triggers.includes(token)) score += 20;
      else if (triggers.some(tr => tr.includes(token))) score += 10;
    }

    // 3. Title matches
    if (titleLower.includes(lower)) {
      score += 30; // Substring match on title
    } else {
      for (const token of tokens) {
        if (titleLower.includes(token)) score += 10;
      }
    }

    // 4. Category matches
    if (t.category.toLowerCase().includes(lower)) {
      score += 15;
    } else {
      for (const token of tokens) {
        if (t.category.toLowerCase().includes(token)) score += 5;
      }
    }

    return { item: t, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => s.item);
}

function selectAutocompleteItem(idx) {
  const item = autocompleteItems[idx];
  if (!item) return;

  // Pick the first response and format it for BlastChat
  const responseText = item.responses[0]?.text || item.title;
  const formatted = formatForBlastChat(responseText);

  // Find the input element
  const target = lastFocusedInput || document.activeElement;
  if (target) {
    // Clear the "/" command text first
    if ('value' in target) {
      const proto = target.tagName === 'TEXTAREA'
        ? window.HTMLTextAreaElement.prototype
        : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(target, '');
      else target.value = '';
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Now inject the formatted text using the enhanced injector
    setTimeout(() => {
      injectTextEnhanced(target, formatted);

      // Also fire standard DOM events as belt-and-suspenders
      if ('value' in target) {
        const proto2 = target.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const setter2 = Object.getOwnPropertyDescriptor(proto2, 'value')?.set;
        if (setter2) setter2.call(target, formatted);
        else target.value = formatted;
      }
      ['input', 'change', 'keydown', 'keyup'].forEach(type => {
        target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
      });
    }, 50);
  }

  hideAutocomplete();
}

function showAutocomplete(inputEl) {
  createAutocompleteUI();
  autocompleteVisible = true;
  autocompleteSelectedIdx = 0;
  autocompleteContainer.style.display = 'block';
  positionAutocomplete(inputEl);
}

function hideAutocomplete() {
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
  }
  autocompleteVisible = false;
  autocompleteQuery = '';
  autocompleteItems = [];
  autocompleteSelectedIdx = 0;
}

// ─── 5. Keyboard Listeners for "/" Autocomplete ──────────────────────────────
document.addEventListener('keydown', async (e) => {
  const target = e.composedPath()[0] || e.target;
  const isInput = target && (
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'INPUT' ||
    target.isContentEditable ||
    target.getAttribute('role') === 'textbox'
  );

  if (!isInput) return;

  // Handle autocomplete navigation when visible
  if (autocompleteVisible) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      autocompleteSelectedIdx = Math.min(autocompleteSelectedIdx + 1, autocompleteItems.length - 1);
      renderAutocompleteItems(autocompleteItems, autocompleteQuery);
      // Scroll selected item into view
      const activeEl = autocompleteContainer.querySelector('.bc-ac-item.active');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      autocompleteSelectedIdx = Math.max(autocompleteSelectedIdx - 1, 0);
      renderAutocompleteItems(autocompleteItems, autocompleteQuery);
      const activeEl = autocompleteContainer.querySelector('.bc-ac-item.active');
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      selectAutocompleteItem(autocompleteSelectedIdx);
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideAutocomplete();
      return;
    }
  }
}, true);

document.addEventListener('input', async (e) => {
  const target = e.composedPath()[0] || e.target;
  const isInput = target && (
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'INPUT' ||
    target.isContentEditable ||
    target.getAttribute('role') === 'textbox'
  );
  if (!isInput) return;

  let value = target.value || target.textContent || '';
  
  // Clean zero-width space and other non-printable characters, then trim leading whitespace
  value = value.replace(/^[\u200B\u200C\u200D\uFEFF]+/g, '').trimStart();

  // Check if the input starts with "/"
  if (value.startsWith('/')) {
    const query = value.substring(1).trim();
    autocompleteQuery = query;

    // Fetch templates and get AI recommendations on demand
    const templates = await fetchTemplatesForAutocomplete();
    const aiSuggestions = await getAISuggestions();
    const aiTitles = new Set(aiSuggestions.map(t => t.title));

    let displayItems = [];
    if (!query) {
      // Put AI suggestions at the top of the autocomplete list
      displayItems = [...aiSuggestions];
      // Append normal templates up to 12 items total, avoiding duplicates
      const others = templates.filter(t => !aiTitles.has(t.title));
      displayItems = displayItems.concat(others.slice(0, 12 - displayItems.length));
    } else {
      // Filter templates normally by query
      displayItems = filterTemplates(query, templates);
    }

    // Mark AI suggested items for green styling in render
    displayItems.forEach(item => {
      item.isAISuggested = aiTitles.has(item.title);
    });

    autocompleteItems = displayItems;
    autocompleteSelectedIdx = 0;

    showAutocomplete(target);
    renderAutocompleteItems(autocompleteItems, query);
  } else {
    if (autocompleteVisible) hideAutocomplete();
  }
}, true);

// Hide autocomplete when clicking outside
document.addEventListener('click', (e) => {
  if (autocompleteVisible && autocompleteContainer && !autocompleteContainer.contains(e.target)) {
    hideAutocomplete();
  }
}, true);

// ─── 6. On-Demand AI Recommendations ─────────────────────────────────────────

async function getAISuggestions() {
  try {
    const allMsgs = scrapeChatMessages();
    const activeMsgs = getActiveContext(allMsgs);
    const clientMsgs = activeMsgs.filter(m => m.sender === 'client');
    if (clientMsgs.length === 0) return [];

    const latestClientMsg = clientMsgs[clientMsgs.length - 1].text;
    if (!latestClientMsg || latestClientMsg.length < 3) return [];

    const templates = await fetchTemplatesForAutocomplete();
    return filterTemplates(latestClientMsg, templates).slice(0, 3);
  } catch (e) {
    console.warn('[BlastChat] Error getting AI suggestions:', e);
    return [];
  }
}

// Pre-fetch templates on load
fetchTemplatesForAutocomplete();

console.log('[BlastChat] Extension v1.4 modules loaded — Autocomplete (/), Context Analysis, Formatting, React Injection.');
