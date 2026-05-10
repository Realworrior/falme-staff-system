// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectText") {
    
    // BlastChat uses various input fields. We try to find the active chat input.
    // We look for common chat input selectors (textareas, contenteditable divs, or specific React input wrappers).
    const inputSelectors = [
      'textarea[placeholder*="Type a message"]',
      'textarea[placeholder*="reply"]',
      'textarea',
      '#chat-input',
      '.chat-input',
      '[contenteditable="true"]',
      'input[type="text"]'
    ];
    
    let injected = false;
    
    for (let selector of inputSelectors) {
      const elements = document.querySelectorAll(selector);
      
      // Attempt to inject into the first visible/interactive input found
      for (let element of elements) {
        if (element && element.offsetParent !== null) { // Ensure it's visible
          
          // Handle contenteditable divs (rich text editors)
          if (element.isContentEditable) {
            element.innerText = request.text;
          } 
          // Handle standard textareas / inputs
          else {
            element.value = request.text;
          }
          
          // React/Vue/Angular require events to be dispatched so their state updates
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          injected = true;
          break; // Stop at the first successful injection
        }
      }
      if (injected) break;
    }
    
    sendResponse({ success: injected });
  }
  return true;
});
