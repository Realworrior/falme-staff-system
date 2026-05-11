let lastFocusedInput = null;

// Track focus across the document and within shadow roots
function trackFocus(root) {
  root.addEventListener('focusin', (e) => {
    const target = e.composedPath()[0]; // Get the actual element even through shadow boundaries
    const isInput = target.tagName === 'TEXTAREA' || 
                    (target.tagName === 'INPUT' && (target.type === 'text' || target.type === 'search')) || 
                    target.isContentEditable;
    if (isInput) {
      lastFocusedInput = target;
    }
  }, true);
}

trackFocus(document);

// Helper to find elements in Shadow DOMs
function findInShadows(root, selector) {
  const elements = Array.from(root.querySelectorAll(selector));
  const shadows = Array.from(root.querySelectorAll('*')).map(el => el.shadowRoot).filter(Boolean);
  
  for (const shadow of shadows) {
    elements.push(...findInShadows(shadow, selector));
  }
  return elements;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    let target = lastFocusedInput;
    
    if (!target || !document.body.contains(target)) {
      const selectors = ['textarea', '[contenteditable="true"]', 'input[type="text"]', 'input[type="search"]', '.public-DraftEditor-content'];
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
      target.focus();
      
      try {
        if (target.isContentEditable) {
          // Attempt execCommand first (best for keeping history/undo)
          const successful = document.execCommand('insertText', false, request.text);
          if (!successful) {
            // Fallback for strict editors: manually set text and dispatch events
            target.innerText = request.text;
          }
        } else {
          // Standard input/textarea with React/Vue protection bypass
          const proto = target.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
          
          if (nativeSetter) {
            nativeSetter.call(target, request.text);
          } else {
            target.value = request.text;
          }
        }

        // Broad event dispatch to wake up any framework (React, Vue, Angular, Svelte)
        const events = ['input', 'change', 'blur'];
        events.forEach(type => {
          target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
        });

        sendResponse({ success: true });
      } catch (e) {
        console.error("Injection failed:", e);
        sendResponse({ success: false });
      }
    } else {
      sendResponse({ success: false });
    }
  } else if (request.action === "getSelectedText") {
    const selection = window.getSelection().toString();
    sendResponse({ text: selection });
  }
  return true;
});
