// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

let allTemplates = [];
let activeCategory = 'ALL';
let activeShortcut = null;
let activeTabId = null;
let isBlastChat = false;

const SHORTCUT_MAPPING = {
  'Account number': 'Account verification',
  'Failed deposit': 'Deposit',
  'Case submitted': 'Submitted',
  'Lost amount': 'casino',
  'Unpaid winning bet': 'BetId',
  'Pending betslip': 'BetId',
  'Account closure': 'Delete',
  'Cashback': 'cashback'
};

const SHORTCUT_KEYWORDS = Object.keys(SHORTCUT_MAPPING);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  
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

  // 4. Setup Category Dropdown
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
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
      const url = `${SUPABASE_URL}/rest/v1/support_templates?select=*`;
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
    renderCategoryDropdown(categories);
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
          // Clear active category and search input for shortcut priority
          activeCategory = 'ALL';
          if (categorySelect) categorySelect.value = 'ALL';
          if (searchInput) searchInput.value = '';
        }
        filterTemplates();
      };
      area.appendChild(tag);
    });
  }

  function renderCategoryDropdown(categories) {
    if (!categorySelect) return;
    // Keep the "ALL" option
    categorySelect.innerHTML = '<option value="ALL">All Categories</option>';
    
    categories.sort().forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      // Clean up category name for dropdown
      option.textContent = cat.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '').split(' — ')[0].trim();
      if (activeCategory === cat) option.selected = true;
      categorySelect.appendChild(option);
    });
  }

  function filterTemplates() {
    const q = searchInput?.value.toLowerCase().trim() || '';
    let filtered = allTemplates;

    // Use Shortcut Mapping if active
    if (activeShortcut) {
      const queryStr = SHORTCUT_MAPPING[activeShortcut].toLowerCase();
      const keywords = queryStr.split(' ');
      
      filtered = filtered.filter(t => {
        // Check if ALL keywords are present in any of the fields
        return keywords.every(kw => 
          t.category.toLowerCase().includes(kw) || 
          t.title.toLowerCase().includes(kw) || 
          t.triggers.some(tr => tr.toLowerCase().includes(kw)) ||
          t.responses.some(r => r.text.toLowerCase().includes(kw))
        );
      });
    } else if (activeCategory !== 'ALL') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    if (q) {
      const keywords = q.split(' ');
      filtered = filtered.filter(t => 
        keywords.every(kw => 
          t.title.toLowerCase().includes(kw) || 
          t.category.toLowerCase().includes(kw) ||
          t.triggers.some(tr => tr.toLowerCase().includes(kw)) ||
          t.responses.some(r => r.text.toLowerCase().includes(kw))
        )
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
          <div class="response-text">${highlightText(responseText)}</div>
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

      card.querySelector('.response-text').addEventListener('click', () => {
        navigator.clipboard.writeText(responseText).then(() => {
          updateStatus("Copied to Clipboard", "orange");
          setTimeout(() => updateStatus("Ready", "orange"), 2000);
        });
      });

      container.appendChild(card);
    });
  }

  function highlightText(text) {
    if (!text) return '';

    const categories = {
      danger: ['Referral Violation', 'Deleted Message', 'Lost', 'Rolled back'],
      success: ['Submitted', 'Cashback', 'Referral Bonus'],
      info: ['Deposit', 'Withdrawal', 'bet ID', 'Mpesa'],
      data: ['Phone number', 'Account Number', 'registered phone number']
    };

    const allKeywords = Object.values(categories).flat();
    const pattern = new RegExp(`(\\{[^}]+\\}|\\[[^\\]]+\\]|${allKeywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

    return text.split(pattern).map(part => {
      if (!part) return '';
      
      const isPlaceholder = (part.startsWith('{') && part.endsWith('}')) || (part.startsWith('[') && part.endsWith(']'));
      if (isPlaceholder) return `<span class="var-highlight">${part}</span>`;

      const k = part.toLowerCase();
      if (categories.danger.some(v => v.toLowerCase() === k)) return `<span class="danger-highlight">${part}</span>`;
      if (categories.success.some(v => v.toLowerCase() === k)) return `<span class="success-highlight">${part}</span>`;
      if (categories.info.some(v => v.toLowerCase() === k)) return `<span class="info-highlight">${part}</span>`;
      if (categories.data.some(v => v.toLowerCase() === k)) return `<span class="data-highlight">${part}</span>`;

      return part;
    }).join('');
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
