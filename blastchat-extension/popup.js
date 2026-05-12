// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

// NLP Dictionaries
const SWAHILI_MAP = {
  'doo': 'money', 'pesa': 'money', 'nimechomeka': 'lost everything', 'haraka': 'fast',
  'saidia': 'help', 'niaje': 'hi', 'wezi': 'thieves', 'rudisha': 'refund'
};

let allTemplates = [];
let activeCategory = 'ALL';
let activeTabId = null;
let isBlastChat = false;

const EXTENSION_VERSION = "2026-05-12T12:50:00Z";
const SYSTEM_URL = "https://betmfalme.vercel.app"; // Fallback to Vercel URL for version checks

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const searchInput = document.getElementById('search-input');
  
  // 1. Initialise Status UI
  updateStatus("Initialising...", "orange");

  // 2. Check Tab Connection
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      updateStatus("Connected to BlastChat Engine", "green");
      // Try to capture selected text for auto-matching
      chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
        if (response && response.text && searchInput) {
          searchInput.value = response.text;
          filterTemplates();
        }
      });
    } else {
      updateStatus("Waiting for blastchat.chat...", "orange");
    }
  });

  // 3. Load Templates & Check Updates
  fetchTemplates();
  checkUpdates();

  async function checkUpdates() {
    try {
      const res = await fetch(`${SYSTEM_URL}/version.json?t=${Date.now()}`);
      const data = await res.json();
      if (data.timestamp && data.timestamp !== EXTENSION_VERSION) {
        updateStatus("Matrix Update Available!", "orange");
      }
    } catch (e) {}
  }

  // 4. Setup Search
  if (searchInput) {
    searchInput.addEventListener('input', () => filterTemplates());
  }

  async function fetchTemplates() {
    // Check Cache
    const cached = localStorage.getItem('blastchat_templates');
    if (cached) {
      try {
        const { allTemplates: cachedTemplates, categories } = JSON.parse(cached);
        allTemplates = cachedTemplates;
        renderCategoryNav(categories);
        renderTemplates(allTemplates);
        updateStatus("Matrix Synchronized (Cached)", "green");
      } catch (e) { console.error("Cache error", e); }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const url = `${SUPABASE_URL}/rest/v1/support_templates?select=*`;
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      processData(data);
    } catch (err) {
      console.error("SUPABASE FETCH ERROR:", err);
      // Try fallback to camelCase if snake_case failed
      if (err.message.includes('404')) {
        try {
          const retryRes = await fetch(`${SUPABASE_URL}/rest/v1/supportTemplates?select=*`, {
            headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            processData(retryData);
            return;
          }
        } catch (e) {}
      }
      if (!cached) showError(`Sync Failed: ${err.message}`);
    }
  }

  function processData(data) {
    if (!data || !Array.isArray(data)) return;
    const flattened = [];
    data.forEach(catRow => {
      if (catRow.templates) {
        catRow.templates.forEach(t => {
          flattened.push({
            id: `${catRow.id}-${t.title}`,
            category: catRow.category || "General",
            title: t.title,
            text: t.responses?.[0]?.text || "",
            responses: t.responses || [],
            triggers: t.triggers || []
          });
        });
      }
    });
    
    allTemplates = flattened;
    const categories = [...new Set(data.map(d => d.category))].filter(Boolean);
    
    localStorage.setItem('blastchat_templates', JSON.stringify({ allTemplates, categories }));
    renderCategoryNav(categories);
    renderTemplates(allTemplates);
    updateStatus("Matrix Fully Synchronized", "green");
  }

  function renderCategoryNav(categories) {
    const nav = document.getElementById('category-nav');
    if (!nav) return;
    nav.innerHTML = '';
    
    ['ALL', ...categories.sort()].forEach(cat => {
      const btn = document.createElement('div');
      btn.className = `nav-item ${activeCategory === cat ? 'active' : ''}`;
      btn.textContent = cat === 'ALL' ? 'ALL' : cat.split(' ').pop();
      btn.onclick = () => {
        activeCategory = cat;
        renderCategoryNav(categories);
        filterTemplates();
      };
      nav.appendChild(btn);
    });
  }

  function renderTemplates(templatesToRender) {
    if (!container) return;
    container.innerHTML = '';
    
    const countEl = document.getElementById('match-count');
    if (countEl) countEl.textContent = `${templatesToRender.length} items`;

    templatesToRender.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.innerHTML = `
        <div class="card-header">
          <div class="card-title">${t.title}</div>
          <div class="card-category">${t.category.split(' ').pop()}</div>
        </div>
      `;

      let currentToneIdx = 0;
      let activeText = t.responses?.[0]?.text || t.text;

      if (t.responses && t.responses.length > 0) {
        const carousel = document.createElement('div');
        carousel.className = 'tone-carousel';
        
        const header = document.createElement('div');
        header.className = 'carousel-header';
        header.innerHTML = `
          <div class="carousel-btn prev">←</div>
          <div class="carousel-info"></div>
          <div class="carousel-btn next">→</div>
        `;
        
        const preview = document.createElement('div');
        preview.className = 'response-preview';
        
        const dots = document.createElement('div');
        dots.className = 'carousel-dots';
        t.responses.forEach((_, i) => {
          const dot = document.createElement('div');
          dot.className = i === 0 ? 'dot active' : 'dot';
          dots.appendChild(dot);
        });

        const update = (idx) => {
          currentToneIdx = idx;
          const r = t.responses[idx];
          preview.textContent = r.text;
          activeText = r.text;
          const info = header.querySelector('.carousel-info');
          if (info) info.innerHTML = `<span>${idx + 1}/${t.responses.length}</span> <span style="opacity:0.3">|</span> <span>${r.type.toUpperCase()}</span>`;
          dots.querySelectorAll('.dot').forEach((d, i) => d.className = i === idx ? 'dot active' : 'dot');
        };

        header.querySelector('.prev').onclick = (e) => { e.stopPropagation(); update((currentToneIdx - 1 + t.responses.length) % t.responses.length); };
        header.querySelector('.next').onclick = (e) => { e.stopPropagation(); update((currentToneIdx + 1) % t.responses.length); };
        
        carousel.appendChild(header);
        carousel.appendChild(preview);
        carousel.appendChild(dots);
        card.appendChild(carousel);
        update(0);
      }

      const injectBtn = document.createElement('button');
      injectBtn.className = 'inject-mini-btn';
      injectBtn.textContent = 'Inject to Chat';
      injectBtn.onclick = () => {
        if (!isBlastChat) { showError("Not on BlastChat!"); return; }
        injectText(activeText, activeTabId);
      };
      card.appendChild(injectBtn);
      container.appendChild(card);
    });
  }

  function filterTemplates() {
    const q = searchInput?.value.toLowerCase().trim() || '';
    let filtered = allTemplates;
    if (activeCategory !== 'ALL') filtered = filtered.filter(t => t.category === activeCategory);
    if (q) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) ||
        t.triggers.some(tr => tr.toLowerCase().includes(q))
      );
    }
    renderTemplates(filtered);
  }

  function updateStatus(text, color) {
    const sText = document.getElementById('status-text');
    const sDot = document.getElementById('status-indicator');
    if (sText) sText.textContent = text;
    if (sDot) {
      sDot.style.background = color === 'green' ? 'var(--green)' : 'var(--orange)';
      sDot.style.boxShadow = `0 0 12px ${color === 'green' ? 'var(--green)' : 'var(--orange)'}`;
    }
  }

  function showError(msg) {
    const el = document.getElementById('error-msg');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { if (el) el.style.display = 'none'; }, 3000);
    }
  }

  function injectText(text, tabId) {
    chrome.tabs.sendMessage(tabId, { action: "injectText", text }, (res) => {
      if (chrome.runtime.lastError || !res?.success) {
        chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "injectText", text }, (r) => {
              if (r?.success) window.close();
              else showError("Click inside chat input first!");
            });
          }, 100);
        });
      } else {
        window.close();
      }
    });
  }
});
