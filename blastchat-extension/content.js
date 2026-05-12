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
