// Configuration for Supabase
const SUPABASE_URL = 'https://kgpcruwlejoougjbeouw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGNydXdsZWpvb3VnamJlb3V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3Njg1NTgsImV4cCI6MjA5MjM0NDU1OH0.FUM24PZZdw1Rg5IYePFx0SKWp_GI6adn7etivCUAfgY';

// NLP Dictionaries
const SWAHILI_MAP = {
  'doo': 'money', 'pesa': 'money', 'nimechomeka': 'lost everything', 'haraka': 'fast',
  'saidia': 'help', 'niaje': 'hi', 'wezi': 'thieves', 'rudisha': 'refund'
};

let allTemplates = [];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const statusIndicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const errorMsg = document.getElementById('error-msg');
  const searchInput = document.getElementById('search-input');
  const matchCountEl = document.getElementById('match-count');
  
  // AI Suggestion UI
  const aiBox = document.getElementById('ai-suggestion-box');
  const aiContent = document.getElementById('ai-suggestion-content');
  const aiInjectBtn = document.getElementById('ai-inject-btn');
  const categoryNav = document.getElementById('category-nav');

  let activeTabId = null;
  let isBlastChat = false;
  let activeCategory = 'ALL';

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab) return;
    
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      if (statusText) statusText.textContent = "Connected to BlastChat Engine";
      if (statusIndicator) {
        statusIndicator.style.background = "#10b981";
        statusIndicator.style.boxShadow = "0 0 10px #10b981";
      }
    } else {
      if (statusText) statusText.textContent = "Waiting for blastchat.chat...";
      if (statusIndicator) {
        statusIndicator.style.background = "#ef4444";
        statusIndicator.style.boxShadow = "0 0 10px #ef4444";
      }
    }

    await fetchTemplates();

    // AUTO-MATCH: Check for highlighted text in the page
    if (activeTabId) {
      chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (response) => {
        if (chrome.runtime.lastError) {
          chrome.scripting.executeScript({
            target: { tabId: activeTabId },
            files: ['content.js']
          }, () => {
            if (!chrome.runtime.lastError) {
              chrome.tabs.sendMessage(activeTabId, { action: "getSelectedText" }, (retryResponse) => {
                if (retryResponse && retryResponse.text) {
                  applySelection(retryResponse.text);
                }
              });
            }
          });
        } else if (response && response.text) {
          applySelection(response.text);
        }
      });
    }
  });

  function applySelection(text) {
    const trimmed = text.trim();
    if (trimmed.length > 3 && searchInput) {
      searchInput.value = trimmed;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  async function fetchTemplates() {
    // Load from cache first for instant UI
    const cached = localStorage.getItem('blastchat_templates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        allTemplates = parsed.allTemplates;
        renderCategoryNav(parsed.categories);
        renderTemplates(allTemplates);
        if (statusText) statusText.textContent = "Matrix Synchronized (Cached)";
      } catch (e) { console.error("Cache parse error", e); }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/support_templates?select=*`, {
        signal: controller.signal,
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      const flattened = [];
      data.forEach(catRow => {
        if (catRow.templates && Array.isArray(catRow.templates)) {
          catRow.templates.forEach(t => {
            flattened.push({
              id: `${catRow.id}-${t.title}`,
              category: catRow.category,
              title: t.title,
              text: t.responses?.[0]?.text || "",
              responses: t.responses || [],
              triggers: t.triggers || []
            });
          });
        }
      });
      
      allTemplates = flattened;
      const categories = data.map(d => d.category);
      
      // Save to cache
      localStorage.setItem('blastchat_templates', JSON.stringify({
        allTemplates,
        categories
      }));

      renderCategoryNav(categories);
      renderTemplates(allTemplates);
      if (statusText) statusText.textContent = "Matrix Fully Synchronized";
    } catch (err) {
      console.error("SUPABASE FETCH ERROR:", err);
      if (!cached) {
         showError(`Sync Error: ${err.name === 'AbortError' ? 'Timeout' : 'Connection failed'}`);
      }
    }
  }

  function renderCategoryNav(categories) {
    if (!categoryNav) return;
    categoryNav.innerHTML = '';
    
    const allBtn = document.createElement('div');
    allBtn.className = `nav-item ${activeCategory === 'ALL' ? 'active' : ''}`;
    allBtn.textContent = 'ALL';
    allBtn.onclick = () => {
      activeCategory = 'ALL';
      renderCategoryNav(categories);
      filterTemplates();
    };
    categoryNav.appendChild(allBtn);

    const uniqueCats = [...new Set(categories)].sort();
    uniqueCats.forEach(cat => {
      const btn = document.createElement('div');
      btn.className = `nav-item ${activeCategory === cat ? 'active' : ''}`;
      btn.textContent = cat.split(' ').pop();
      btn.title = cat;
      btn.onclick = () => {
        activeCategory = cat;
        renderCategoryNav(categories);
        filterTemplates();
      };
      categoryNav.appendChild(btn);
    });
  }

  function filterTemplates() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let filtered = allTemplates;
    
    if (activeCategory !== 'ALL') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    if (query) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.text.toLowerCase().includes(query) ||
        (t.triggers && t.triggers.some(tr => tr.toLowerCase().includes(query)))
      );
    }
    
    renderTemplates(filtered);
  }

  function renderTemplates(templatesToRender) {
    if (!container) return;
    container.innerHTML = '';
    if (matchCountEl) matchCountEl.textContent = `${templatesToRender.length} items`;

    if (templatesToRender.length === 0) {
      if (container) container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted); font-size: 12px; grid-column: span 3;">No intelligence matches.</div>';
      return;
    }

    templatesToRender.forEach(t => {
      const card = document.createElement('div');
      card.className = 'template-card';
      
      const header = document.createElement('div');
      header.className = 'card-header';
      
      const title = document.createElement('div');
      title.className = 'card-title';
      title.textContent = t.title;
      
      const cat = document.createElement('div');
      cat.className = 'card-category';
      cat.textContent = t.category.split(' ').pop();
      
      header.appendChild(title);
      header.appendChild(cat);
      card.appendChild(header);

      // Tone Selector if multiple responses
      let activeText = t.text;
      if (t.responses && t.responses.length > 1) {
        const selector = document.createElement('div');
        selector.className = 'tone-selector';
        
        t.responses.forEach((resp, idx) => {
          const tBtn = document.createElement('button');
          const type = resp.type.toLowerCase();
          const isNamed = type.includes('standard') || type.includes('empathy');
          
          tBtn.className = `tone-btn ${idx === 0 ? 'active' : ''} ${isNamed ? 'named-tone' : ''}`;
          
          let icon = '<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>';
          let label = idx + 1;

          if (type.includes('standard')) {
            icon = '<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
            label = 'Standard';
          } else if (type.includes('empathy')) {
            icon = '<svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="3" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            label = 'Empathy';
          }

          tBtn.innerHTML = `${icon}${isNamed ? `<span style="margin-left:6px">${label}</span>` : `<span style="margin-left:2px; font-size:10px; font-weight:900">${label}</span>`}`;
          
          tBtn.onclick = (e) => {
            e.stopPropagation();
            selector.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
            tBtn.classList.add('active');
            preview.textContent = resp.text;
            activeText = resp.text;
          };
          selector.appendChild(tBtn);
        });
        card.appendChild(selector);
      }
      
      const preview = document.createElement('div');
      preview.className = 'response-preview';
      preview.textContent = activeText;
      card.appendChild(preview);
      
      const injectBtn = document.createElement('button');
      injectBtn.className = 'inject-mini-btn';
      injectBtn.textContent = 'Inject This Tone';
      injectBtn.onclick = () => {
        if (!isBlastChat) {
          showError("Not on BlastChat!");
          return;
        }
        injectText(activeText, activeTabId);
      };
      
      card.appendChild(injectBtn);
      container.appendChild(card);
    });
  }

  // AI Matcher Logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterTemplates();
      
      const input = e.target.value.toLowerCase().trim();
      if (!input) {
        if (aiBox) aiBox.style.display = 'none';
        return;
      }

    const tokens = input.split(/\s+/).filter(t => t.length > 2);
    let bestMatch = null;
    let maxScore = 0;

    const matched = allTemplates.map(tpl => {
      let score = 0;
      const combined = (tpl.title + ' ' + tpl.category + ' ' + (tpl.triggers || []).join(' ')).toLowerCase();
      
      tokens.forEach(token => {
        if (combined.includes(token)) score += 10;
        if (tpl.text.toLowerCase().includes(token)) score += 2;
        if (tpl.triggers && tpl.triggers.some(tr => tr.toLowerCase() === token)) score += 25;
      });

      if (input.includes('deposit') && tpl.title.toLowerCase().includes('deposit')) score += 30;
      if (input.includes('mpesa') && (tpl.triggers || []).some(t => t.includes('mpesa'))) score += 30;
      if (input.includes('aviator') && (tpl.triggers || []).some(t => t.includes('aviator'))) score += 30;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = tpl;
      }

      return { ...tpl, score };
    })
    .filter(t => t.score > 5)
    .sort((a, b) => b.score - a.score);

    renderTemplates(matched);

    if (bestMatch && maxScore > 25) {
      if (aiBox) aiBox.style.display = 'block';
      if (aiContent) aiContent.textContent = bestMatch.text;
      if (aiInjectBtn) {
        aiInjectBtn.onclick = () => {
          if (!isBlastChat) {
            showError("Not on BlastChat!");
            return;
          }
          injectText(bestMatch.text, activeTabId);
        };
      }
    } else {
      if (aiBox) aiBox.style.display = 'none';
    }
  });
}

  function showError(msg) {
    const errEl = document.getElementById('error-msg');
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
      setTimeout(() => {
        if (errEl) errEl.style.display = 'none';
      }, 3000);
    } else {
      console.error("Critical Extension Error:", msg);
    }
  }

  function injectText(text, tabId) {
    chrome.tabs.sendMessage(tabId, { action: "injectText", text: text }, (response) => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, () => {
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "injectText", text: text }, (r) => {
              if (r && r.success) window.close();
              else showError("Click inside chat input first!");
            });
          }, 100);
        });
      } else if (response && response.success) {
        window.close();
      } else {
        showError("Click inside chat input first!");
      }
    });
  }
});
