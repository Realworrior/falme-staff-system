// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplates = [];
let activeCategory = 'ALL';
let activeShortcut = null;
let activeTabId = null;
let isBlastChat = false;

// Fixed Keywords for Shortcuts
const SHORTCUT_KEYWORDS = [
  'Account number', 'Submitted', 'betid', 'Lost Amount', 
  'pending bet', 'pending cashout', 'violation', 'bonus', 'cashback'
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const searchInput = document.getElementById('search-input');
  
  updateStatus("Initializing Neural Sync...", "orange");

  // 1. Check Tab Connection
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      updateStatus("Matrix Linked: Live", "orange");
      chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
        if (response && response.text && searchInput) {
          searchInput.value = response.text;
          filterTemplates();
        }
      });
    } else {
      updateStatus("Waiting for Data...", "orange");
    }
  });

  // 2. Load Templates
  fetchTemplates();

  // 3. Setup Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeShortcut = null;
      document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
      filterTemplates();
    });
  }

  async function fetchTemplates() {
    const cached = localStorage.getItem('blastchat_templates');
    if (cached) {
      try {
        const { allTemplates: cachedTemplates, categories } = JSON.parse(cached);
        allTemplates = cachedTemplates;
        renderUI(categories);
        updateStatus("Matrix Ready", "orange");
      } catch (e) {}
    }

    try {
      const url = `${SUPABASE_URL}/rest/v1/supportTemplates?select=*`;
      const response = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      processData(data);
    } catch (err) {
      console.error("Fetch error", err);
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
            responses: t.responses || [],
            triggers: t.triggers || []
          });
        });
      }
    });
    
    allTemplates = flattened;
    const categories = [...new Set(data.map(d => d.category))].filter(Boolean);
    localStorage.setItem('blastchat_templates', JSON.stringify({ allTemplates, categories }));
    renderUI(categories);
    updateStatus("Matrix Synced", "orange");
  }

  function renderUI(categories) {
    renderShortcuts();
    renderCategoryNav(categories);
    filterTemplates();
  }

  function renderShortcuts() {
    const area = document.getElementById('shortcuts-row');
    if (!area) return;
    area.innerHTML = '';

    SHORTCUT_KEYWORDS.forEach(label => {
      const tag = document.createElement('div');
      tag.className = `shortcut-tag ${activeShortcut === label ? 'active' : ''}`;
      tag.textContent = label;
      tag.onclick = () => {
        if (activeShortcut === label) {
          activeShortcut = null;
          tag.classList.remove('active');
        } else {
          document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
          activeShortcut = label;
          tag.classList.add('active');
          if (searchInput) searchInput.value = '';
        }
        filterTemplates();
      };
      area.appendChild(tag);
    });
  }

  function renderCategoryNav(categories) {
    const nav = document.getElementById('category-navbar');
    if (!nav) return;
    nav.innerHTML = '';
    
    ['ALL', ...categories.sort()].forEach(cat => {
      const btn = document.createElement('div');
      btn.className = `nav-link ${activeCategory === cat ? 'active' : ''}`;
      // Display only the meaningful part or the icon if any
      btn.textContent = cat === 'ALL' ? 'ALL' : cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').split(' — ')[0].trim();
      btn.onclick = () => {
        activeCategory = cat;
        activeShortcut = null;
        document.querySelectorAll('.shortcut-tag').forEach(t => t.classList.remove('active'));
        renderCategoryNav(categories);
        filterTemplates();
      };
      nav.appendChild(btn);
    });
  }

  function filterTemplates() {
    const q = searchInput?.value.toLowerCase().trim() || '';
    let filtered = allTemplates;

    if (activeCategory !== 'ALL') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    if (activeShortcut) {
      const s = activeShortcut.toLowerCase();
      filtered = filtered.filter(t => 
        t.category.toLowerCase().includes(s) || 
        t.title.toLowerCase().includes(s) || 
        t.triggers.some(tr => tr.toLowerCase().includes(s))
      );
    }

    if (q) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) ||
        t.triggers.some(tr => tr.toLowerCase().includes(q)) ||
        t.responses.some(r => r.text.toLowerCase().includes(q))
      );
    }

    renderTemplates(filtered);
  }

  function renderTemplates(templates) {
    if (!container) return;
    container.innerHTML = '';
    
    if (templates.length === 0) {
      container.innerHTML = '<div class="empty-state">No matching intelligence found</div>';
      return;
    }

    templates.forEach((t, idx) => {
      const card = document.createElement('div');
      card.className = 'matrix-card';
      
      const majorCat = t.category.split(' — ')[0].trim();
      const responseText = t.responses[0]?.text || "No intelligence found for this module.";

      card.innerHTML = `
        <div class="card-header"></div>
        <div class="card-meta">
          <div class="card-number">INTEL_REF_${(idx + 1).toString().padStart(3, '0')}</div>
          <div style="font-size: 8px; font-weight: 900; color: var(--orange); text-transform: uppercase;">${majorCat}</div>
        </div>
        <div class="card-title">${t.title}</div>
        <div class="card-body">
          <div class="response-text">${highlightPlaceholders(responseText)}</div>
          <button class="copy-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
            Inject Logic
          </button>
        </div>
      `;

      card.querySelector('.copy-btn').addEventListener('click', () => {
        injectText(responseText);
      });

      container.appendChild(card);
    });
  }

  function highlightPlaceholders(text) {
    return text.replace(/\[([^\]]+)\]/g, '<span class="placeholder-highlight">[$1]</span>');
  }

  function updateStatus(text, colorVar) {
    const el = document.getElementById('status-text');
    if (el) {
      el.textContent = text;
      el.style.color = `var(--${colorVar})`;
    }
  }

  function showError(msg) {
    const el = document.getElementById('error-toast');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
  }

  function injectText(text) {
    if (!isBlastChat) {
      showError("Please open BlastChat first!");
      return;
    }
    updateStatus("Injecting...", "orange");
    
    chrome.tabs.sendMessage(activeTabId, { action: "injectText", text }, (res) => {
      if (chrome.runtime.lastError) {
        // Attempt repair
        chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          files: ['content.js']
        }).then(() => {
          setTimeout(() => {
            chrome.tabs.sendMessage(activeTabId, { action: "injectText", text }, (res2) => {
              if (res2?.success) {
                updateStatus("Injected", "orange");
                setTimeout(() => window.close(), 500);
              }
            });
          }, 200);
        });
      } else if (res?.success) {
        updateStatus("Success", "orange");
        setTimeout(() => window.close(), 100);
      } else {
        showError("Focus Chat Input!");
        updateStatus("Ready", "orange");
      }
    });
  }
});
