// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplates = [];
let activeCategory = 'ALL';
let activeShortcut = null;
let activeTabId = null;
let isBlastChat = false;

const EXTENSION_VERSION = "2026-05-12T12:50:00Z";
const SYSTEM_URL = "https://betmfalme.vercel.app";

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const searchInput = document.getElementById('search-input');
  
  updateStatus("Initialising Matrix...", "purple");

  // 1. Check Tab Connection
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      updateStatus("Matrix Linked to BlastChat", "emerald");
      chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
        if (response && response.text && searchInput) {
          searchInput.value = response.text;
          filterTemplates();
        }
      });
    } else {
      updateStatus("Waiting for BlastChat...", "orange");
    }
  });

  // 2. Load Templates
  fetchTemplates();

  // 3. Setup Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeShortcut = null;
      document.querySelectorAll('.tag-item').forEach(t => t.classList.remove('active'));
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
        updateStatus("Matrix Synchronized", "emerald");
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
    updateStatus("Matrix Fully Synchronized", "emerald");
  }

  function renderUI(categories) {
    renderShortcuts();
    renderCategoryNav(categories);
    filterTemplates();
  }

  function renderShortcuts() {
    const area = document.getElementById('shortcut-tags');
    if (!area) return;
    area.innerHTML = '';

    const shortcuts = new Set();
    
    allTemplates.forEach(t => {
      // 1. Major Category (Before Hyphen)
      const major = t.category.split(' — ')[0].replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').replace(/[^\w\s&]/g, '').trim();
      if (major && major.length > 2) shortcuts.add(major);

      // 2. After Hyphen
      const after = t.category.split(' — ')[1]?.trim();
      if (after) shortcuts.add(after);

      // 3. Keywords (Triggers) - Max 10 most common/important ones
      t.triggers.forEach(tr => {
        if (tr.length > 3) shortcuts.add(tr.toLowerCase());
      });
    });

    // Sort and limit shortcuts
    const list = Array.from(shortcuts).sort((a, b) => a.length - b.length).slice(0, 24);

    list.forEach(label => {
      const tag = document.createElement('div');
      tag.className = 'tag-item';
      tag.textContent = label;
      tag.onclick = () => {
        if (activeShortcut === label) {
          activeShortcut = null;
          tag.classList.remove('active');
        } else {
          document.querySelectorAll('.tag-item').forEach(t => t.classList.remove('active'));
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
    const nav = document.getElementById('category-nav');
    if (!nav) return;
    nav.innerHTML = '';
    
    ['ALL', ...categories.sort()].forEach(cat => {
      const btn = document.createElement('div');
      btn.className = `nav-btn ${activeCategory === cat ? 'active' : ''}`;
      // Display only the meaningful part or the icon if any
      btn.textContent = cat === 'ALL' ? 'ALL' : cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').split(' — ')[0].trim();
      btn.onclick = () => {
        activeCategory = cat;
        activeShortcut = null;
        document.querySelectorAll('.tag-item').forEach(t => t.classList.remove('active'));
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
    
    const countEl = document.getElementById('match-count');
    if (countEl) countEl.textContent = `${templates.length} items`;

    if (templates.length === 0) {
      container.innerHTML = '<div class="empty-state">No matching intelligence found</div>';
      return;
    }

    templates.forEach(t => {
      const card = document.createElement('div');
      card.className = 'card';
      
      let currentStep = 0;
      const totalSteps = t.responses.length;

      const renderCardContent = () => {
        const resp = t.responses[currentStep] || { text: "No content", type: "Standard" };
        const progress = ((currentStep + 1) / totalSteps) * 100;
        const majorCat = t.category.split(' — ')[0].trim();

        card.innerHTML = `
          <div class="card-head">
            <div class="card-top">
              <div class="card-title">${t.title}</div>
              <div class="cat-badge">${majorCat}</div>
            </div>
            
            <div class="tone-selector">
              <div class="step-nav">
                <button class="arrow-btn prev" ${currentStep === 0 ? 'disabled' : ''}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button class="arrow-btn next" ${currentStep === totalSteps - 1 ? 'disabled' : ''}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>
              <div class="step-info">
                <div class="step-numbers">${currentStep + 1}<span>/${totalSteps}</span></div>
                <div class="progress-track">
                  <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <div class="tone-label">${resp.type}</div>
              </div>
            </div>
          </div>
          
          <div class="card-body">
            <div class="response-box">${resp.text}</div>
            <button class="inject-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              Inject to Chat
            </button>
          </div>
        `;

        // Re-attach listeners
        card.querySelector('.prev')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentStep > 0) { currentStep--; renderCardContent(); }
        });
        card.querySelector('.next')?.addEventListener('click', (e) => {
          e.stopPropagation();
          if (currentStep < totalSteps - 1) { currentStep++; renderCardContent(); }
        });
        card.querySelector('.inject-btn')?.addEventListener('click', () => {
          injectText(resp.text);
        });
      };

      renderCardContent();
      container.appendChild(card);
    });
  }

  function updateStatus(text, colorVar) {
    const el = document.getElementById('status-text');
    if (el) {
      el.textContent = text;
      el.style.color = `var(--${colorVar})`;
    }
  }

  function showError(msg) {
    const el = document.getElementById('error-msg');
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
    chrome.tabs.sendMessage(activeTabId, { action: "injectText", text }, (res) => {
      if (chrome.runtime.lastError || !res?.success) {
        showError("Click inside chat input first!");
      } else {
        window.close();
      }
    });
  }
});
