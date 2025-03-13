
// Content script that runs in the page context
import { detectForms, fillForm, submitForm } from './utils/autofill';

// Listen for form submissions to capture login credentials
document.addEventListener('submit', (event) => {
  const form = event.target as HTMLFormElement;
  const detectedForms = detectForms();
  
  // Find if this is one of our detected forms
  const detectedForm = detectedForms.find(f => f.element === form);
  
  if (detectedForm && detectedForm.usernameField && detectedForm.passwordField) {
    const username = detectedForm.usernameField.element.value;
    const password = detectedForm.passwordField.element.value;
    
    if (username && password) {
      // Get the domain of the current page
      const url = window.location.href;
      const title = document.title;
      
      // Send the credentials to the background script
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'captureCredential',
          credential: {
            url,
            title,
            username,
            password
          }
        });
      }
    }
  }
});

// Listen for messages from the extension
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'detectForms') {
      const forms = detectForms();
      sendResponse({ forms: forms.length > 0 });
      return true;
    }
    
    if (message.action === 'fillForm') {
      const forms = detectForms();
      if (forms.length > 0) {
        const filled = fillForm(forms[0], message.credential);
        sendResponse({ success: filled });
      } else {
        sendResponse({ success: false, error: 'No forms detected' });
      }
      return true;
    }
  });
}

// Inject the autofill utilities into the page
if (typeof window !== 'undefined') {
  // Make functions available to the page context
  window.detectForms = detectForms;
  window.fillForm = fillForm;
  window.submitForm = submitForm;
}
