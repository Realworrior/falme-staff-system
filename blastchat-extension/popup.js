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
  const statusEl = document.getElementById('status');
  const errorMsg = document.getElementById('error-msg');
  const searchInput = document.getElementById('search-input');
  const matchCountEl = document.getElementById('match-count');
  
  // AI Suggestion UI
  const aiBox = document.getElementById('ai-suggestion-box');
  const aiContent = document.getElementById('ai-suggestion-content');
  const aiInjectBtn = document.getElementById('ai-inject-btn');

  let activeTabId = null;
  let isBlastChat = false;

  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const activeTab = tabs[0];
    activeTabId = activeTab.id;
    isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      if (statusEl) {
        statusEl.textContent = "Ready for BlastChat Injector";
        statusEl.style.color = "#10b981";
      }
    } else {
      if (statusEl) {
        statusEl.textContent = "Navigate to blastchat.chat";
        statusEl.style.color = "#ef4444";
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
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/support_templates?select=*&apikey=${SUPABASE_ANON_KEY}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Flatten the nested structure: rows (categories) -> templates (array)
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
      renderTemplates(allTemplates);
    } catch (err) {
      console.error("SUPABASE FETCH ERROR:", err);
      showError(`Sync Error: ${err.message || "Connection failed"}`);
      // Fallback to basic templates if fetch fails
      allTemplates = [
        { id: 't1', title: 'Standard Greeting', text: 'Hello! How can I assist you today?', category: 'Support', triggers: ['hi', 'hello'] },
        { id: 't2', title: 'Refund Policy', text: 'Our policy does not allow refunds for this case.', category: 'Policy', triggers: ['refund'] }
      ];
      renderTemplates(allTemplates);
    }
  }

  function renderTemplates(templatesToRender) {
    if (!container) return;
    container.innerHTML = '';
    if (matchCountEl) matchCountEl.textContent = `${templatesToRender.length} items`;

    if (templatesToRender.length === 0) {
      container.innerHTML = '<div class="no-results">No intelligence matches.</div>';
      return;
    }

    templatesToRender.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'template-btn';
      
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.width = '100%';
      header.style.marginBottom = '2px';
      
      const title = document.createElement('div');
      title.className = 'template-title';
      title.textContent = t.title;
      
      const category = document.createElement('div');
      category.className = 'category-badge';
      category.textContent = t.category.split(' ').pop(); // Just show the emoji/last word
      
      header.appendChild(title);
      header.appendChild(category);
      
      const preview = document.createElement('div');
      preview.className = 'template-preview';
      preview.textContent = t.text;
      
      btn.appendChild(header);
      btn.appendChild(preview);
      
      btn.onclick = () => {
        if (!isBlastChat) {
          showError("Not on BlastChat!");
          return;
        }
        injectText(t.text, activeTabId);
      };
      
      container.appendChild(btn);
    });
  }

  // AI Matcher Logic
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const input = e.target.value.toLowerCase().trim();
      if (!input) {
        if (aiBox) aiBox.style.display = 'none';
        renderTemplates(allTemplates);
        return;
      }

    // Ported simplified AI matching from main app
    const tokens = input.split(/\s+/).filter(t => t.length > 2);
    let bestMatch = null;
    let maxScore = 0;

    const matched = allTemplates.map(tpl => {
      let score = 0;
      const combined = (tpl.title + ' ' + tpl.category + ' ' + tpl.triggers.join(' ')).toLowerCase();
      
      tokens.forEach(token => {
        if (combined.includes(token)) score += 10;
        if (tpl.text.toLowerCase().includes(token)) score += 2;
        if (tpl.triggers.some(tr => tr.toLowerCase() === token)) score += 25;
      });

      // Boost for keyword-specific scenarios
      if (input.includes('deposit') && tpl.title.toLowerCase().includes('deposit')) score += 30;
      if (input.includes('mpesa') && tpl.triggers.some(t => t.includes('mpesa'))) score += 30;
      if (input.includes('aviator') && tpl.triggers.some(t => t.includes('aviator'))) score += 30;

      if (score > maxScore) {
        maxScore = score;
        bestMatch = tpl;
      }

      return { ...tpl, score };
    })
    .filter(t => t.score > 5)
    .sort((a, b) => b.score - a.score);

    renderTemplates(matched);

    // Show AI Suggestion if score is high enough
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
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
      setTimeout(() => errorMsg.style.display = 'none', 3000);
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
