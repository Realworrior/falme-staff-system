// Mock templates - these could later be fetched from Supabase!
const templates = [
  { 
    id: 't1', 
    title: 'Standard Greeting', 
    text: 'Hello! Thank you for reaching out to us. How can I assist you today?' 
  },
  { 
    id: 't2', 
    title: 'Refund Refusal (Policy)', 
    text: 'I apologize, but based on our refund policy, we are unable to process a refund for this transaction as it falls outside of the eligible period.' 
  },
  { 
    id: 't3', 
    title: 'Account Verification Request', 
    text: 'To proceed with your request, could you please provide your account email and the last 4 digits of the payment method used?' 
  },
  { 
    id: 't4', 
    title: 'Escalation to Advanced Team', 
    text: 'I understand your frustration. I am escalating this ticket to our Advanced Resolutions Team who will review this and follow up with you shortly.' 
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('templates');
  const statusEl = document.getElementById('status');
  const errorMsg = document.getElementById('error-msg');

  // Check if we are on blastchat
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    const isBlastChat = activeTab.url && activeTab.url.includes("blastchat.chat");
    
    if (isBlastChat) {
      statusEl.textContent = "Ready to inject into BlastChat";
      statusEl.style.color = "#10b981";
    } else {
      statusEl.textContent = "Warning: Not on blastchat.chat/agent";
      statusEl.style.color = "#ef4444";
    }

    // Render templates
    templates.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'template-btn';
      
      const title = document.createElement('div');
      title.className = 'template-title';
      title.textContent = t.title;
      
      const preview = document.createElement('div');
      preview.className = 'template-preview';
      preview.textContent = t.text;
      
      btn.appendChild(title);
      btn.appendChild(preview);
      
      btn.onclick = () => {
        if (!isBlastChat) {
          showError("Please navigate to blastchat.chat/agent to use this.");
          return;
        }
        injectText(t.text, activeTab.id);
      };
      
      container.appendChild(btn);
    });
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
    setTimeout(() => {
      errorMsg.style.display = 'none';
    }, 4000);
  }

  function injectText(text, tabId) {
    // Attempt 1: Send message (assuming content script is already there)
    chrome.tabs.sendMessage(tabId, { action: "injectText", text: text }, (response) => {
      if (chrome.runtime.lastError) {
        // Attempt 2: If content script isn't there, inject it dynamically
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        }, () => {
          if (chrome.runtime.lastError) {
             showError("Cannot inject here. Are you on a protected page?");
             return;
          }
          
          // Now that it's injected, send the message again
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { action: "injectText", text: text }, (retryResponse) => {
              if (chrome.runtime.lastError || !retryResponse || !retryResponse.success) {
                showError("Could not find the chat input box. Please click inside it first.");
              } else {
                window.close();
              }
            });
          }, 100); // short delay to ensure script initializes
        });
      } else {
        // Success on first try
        if (!response || !response.success) {
          showError("Could not find the chat input box. Please click inside it first.");
        } else {
          window.close();
        }
      }
    });
  }
});
