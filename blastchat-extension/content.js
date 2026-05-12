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
    
    // If last focused is gone or hidden, try to find a suitable one
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
          // Check if visible and not disabled
          if (el.offsetParent !== null && !el.disabled) {
            target = el;
            break;
          }
        }
        if (target) break;
      }
    }

    if (target) {
      console.log("BlastChat Injector: Injecting into", target);
      target.focus();
      
      try {
        if (target.isContentEditable || target.getAttribute('role') === 'textbox') {
          // Attempt execCommand first (best for keeping history/undo)
          const successful = document.execCommand('insertText', false, request.text);
          if (!successful) {
            // Fallback for strict editors
            if (target.tagName === 'P' || target.tagName === 'DIV') {
              target.innerText = request.text;
            } else {
              target.innerHTML = request.text;
            }
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

        // Broad event dispatch to wake up any framework
        const events = ['input', 'change', 'blur', 'keyup', 'keydown'];
        events.forEach(type => {
          target.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
        });

        sendResponse({ success: true });
      } catch (e) {
        console.error("BlastChat Injector: Injection failed:", e);
        sendResponse({ success: false, error: e.message });
      }
    } else {
      console.warn("BlastChat Injector: No target found for injection");
      sendResponse({ success: false, error: "No target found" });
    }
  } else if (request.action === "getSelectedText") {
    const selection = window.getSelection().toString();
    sendResponse({ text: selection });
  }
  return true;
});
