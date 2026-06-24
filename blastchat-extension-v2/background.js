// background.js — Toggle floating panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }).then(() => {
    chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
  }).catch(err => {
    // Content script might already be injected, just send the message
    chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
  });
});
