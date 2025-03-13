
// This file will be injected as a content script

// Import types (these won't be included in the bundled content script, just for TS)
import { detectForms, fillForm, submitForm, DetectedForm } from './utils/autofill';
import { LoginCredential } from './utils/storage';

// Make functions available to the page context
declare global {
  interface Window {
    detectForms: () => DetectedForm[];
    fillForm: (form: DetectedForm, credential: LoginCredential) => boolean;
    submitForm: (form: DetectedForm) => void;
  }
}

// Export functions to global scope so they can be called from the extension
window.detectForms = detectForms;
window.fillForm = fillForm;
window.submitForm = submitForm;

// Listen for form submissions to capture login credentials
document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement;
  const passwordField = form.querySelector('input[type="password"]');
  
  if (passwordField) {
    // This might be a login form
    const formData = new FormData(form);
    let username = '';
    let password = '';
    
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        if (key.toLowerCase().includes('user') || 
            key.toLowerCase().includes('email') || 
            key.toLowerCase().includes('login')) {
          username = value;
        } else if (key.toLowerCase().includes('pass')) {
          password = value;
        }
      }
    }
    
    // If we found both username and password, send them to the background script
    if (username && password) {
      chrome.runtime.sendMessage({
        action: 'captureCredential',
        url: window.location.href,
        username,
        password
      });
    }
  }
});

// Listen for URL changes to detect login forms
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    
    // Check for login forms on the new page
    const forms = detectForms();
    if (forms.length > 0) {
      chrome.runtime.sendMessage({
        action: 'formDetected',
        url: currentUrl
      });
    }
  }
});

// Start observing
observer.observe(document, { subtree: true, childList: true });

// Initial form detection
const forms = detectForms();
if (forms.length > 0) {
  chrome.runtime.sendMessage({
    action: 'formDetected',
    url: currentUrl
  });
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkForForms') {
    const forms = detectForms();
    sendResponse({ hasForms: forms.length > 0 });
  }
  return true;
});
