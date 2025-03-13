
// This file will be bundled into background.js in the extension

// Listen for messages from the content script or popup
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageForms') {
      // Execute content script to detect forms on the current page
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0].id) {
          try {
            // Execute the script that detects forms
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: () => {
                // This function runs in the context of the page
                const forms = window.detectForms();
                return forms.length > 0;
              }
            });
            
            // If we get here, the script executed successfully
            sendResponse({ success: true });
          } catch (error) {
            console.error('Failed to execute script:', error);
            sendResponse({ success: false, error: String(error) });
          }
        }
      });
      
      // Return true to indicate we'll respond asynchronously
      return true;
    }
    
    if (message.action === 'fillCredential') {
      const { credential } = message;
      
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs[0].id) {
          try {
            // Execute the script that fills the form
            await chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (cred) => {
                // This function runs in the context of the page
                const forms = window.detectForms();
                if (forms.length > 0) {
                  const filled = window.fillForm(forms[0], cred);
                  if (filled) {
                    // Option to submit the form automatically
                    // window.submitForm(forms[0]);
                    return { success: true, filled };
                  }
                }
                return { success: false };
              },
              args: [credential]
            });
            
            sendResponse({ success: true });
          } catch (error) {
            console.error('Failed to fill credential:', error);
            sendResponse({ success: false, error: String(error) });
          }
        }
      });
      
      // Return true to indicate we'll respond asynchronously
      return true;
    }
    
    if (message.action === 'captureCredential') {
      // Content script has captured a submitted username/password
      // We'll save this to storage
      console.log('Captured credential for:', message.url);
      sendResponse({ success: true });
      return false;
    }
  });

  // When extension is installed or updated
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
      // First-time install
      console.log('OneLogin extension installed');
      
      // Open the onboarding page
      chrome.tabs.create({ url: 'index.html?onboarding=true' });
    }
  });
}
