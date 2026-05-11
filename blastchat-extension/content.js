let lastFocusedInput = null;

// Continuously track the last focused input field
document.addEventListener('focusin', (e) => {
  const isInput = e.target.tagName === 'TEXTAREA' || 
                  (e.target.tagName === 'INPUT' && e.target.type === 'text') || 
                  e.target.isContentEditable;
  if (isInput) {
    lastFocusedInput = e.target;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    let target = lastFocusedInput;
    
    // Fallback: If no input was focused, find the best visible candidate
    if (!target) {
      const selectors = ['textarea', '[contenteditable="true"]', 'input[type="text"]'];
      for (let s of selectors) {
        const elements = document.querySelectorAll(s);
        for (let el of elements) {
          if (el.offsetParent !== null && !el.disabled) { // Is visible and enabled
            target = el;
            break;
          }
        }
        if (target) break;
      }
    }

    if (target) {
      target.focus();
      
      // 1. If it's a rich text editor (contenteditable)
      if (target.isContentEditable) {
        document.execCommand('insertText', false, request.text);
      } 
      // 2. If it's a standard React/Vue input or textarea
      else {
        // Try the native setter to bypass React's event hijacking
        const proto = target.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        
        if (nativeSetter) {
          nativeSetter.call(target, request.text);
        } else {
          target.value = request.text;
        }
        
        // Force the app to recognize the change
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false });
    }
  } else if (request.action === "getSelectedText") {
    const selection = window.getSelection().toString();
    sendResponse({ text: selection });
  }
  return true;
});
