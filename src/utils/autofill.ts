
// Helper functions for form detection and autofill

interface FormField {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  type: string;
  id: string;
  name: string;
  className: string;
  isPassword: boolean;
  isUsername: boolean;
}

interface DetectedForm {
  element: HTMLFormElement;
  usernameField?: FormField;
  passwordField?: FormField;
  submitButton?: HTMLElement;
  fields: FormField[];
}

// Keywords that might indicate a username field
const usernameKeywords = [
  'user', 'email', 'login', 'id', 'identifier', 'account', 'customer', 'phone', 'mail'
];

// Keywords that might indicate a password field
const passwordKeywords = [
  'pass', 'pwd', 'secret'
];

// Common selectors for login forms
const loginFormSelectors = [
  'form[action*="login"]',
  'form[action*="signin"]',
  'form[action*="sign-in"]',
  'form[action*="auth"]',
  'form[id*="login"]',
  'form[id*="signin"]',
  'form[id*="auth"]',
  'form[class*="login"]',
  'form[class*="signin"]',
  'form.login',
  'form.signin',
  'form[name*="login"]',
  'form.sign-in',
  'form.auth'
];

/**
 * Detects potential login forms on the page
 */
export function detectForms(): DetectedForm[] {
  // First try specific login form selectors
  let forms = Array.from(document.querySelectorAll(loginFormSelectors.join(',')));
  
  // If no login forms found, get all forms
  if (forms.length === 0) {
    forms = Array.from(document.querySelectorAll('form'));
  }
  
  // If still no forms, search for inputs directly
  if (forms.length === 0) {
    const passwordFields = Array.from(document.querySelectorAll('input[type="password"]'));
    
    // Create a virtual form for each password field
    return passwordFields.map(passwordField => {
      // Find closest parent that might be a form container
      const container = passwordField.closest('div, section, main') || document.body;
      
      // Look for a nearby input that might be a username
      const inputs = Array.from(container.querySelectorAll('input')).filter(
        input => input !== passwordField && 
          input.type !== 'hidden' && 
          input.type !== 'checkbox' &&
          input.type !== 'radio' &&
          !input.disabled
      );
      
      const usernameField = inputs.find(input => {
        const inputId = (input.id || '').toLowerCase();
        const inputName = (input.name || '').toLowerCase();
        const inputType = (input.type || '').toLowerCase();
        
        return usernameKeywords.some(keyword => 
          inputId.includes(keyword) || 
          inputName.includes(keyword) ||
          (input.placeholder && input.placeholder.toLowerCase().includes(keyword))
        ) || inputType === 'email';
      });
      
      const detectedForm: DetectedForm = {
        element: container as any as HTMLFormElement, // Not actually a form but we need a container
        fields: [],
        passwordField: {
          element: passwordField as HTMLInputElement,
          type: 'password',
          id: passwordField.id,
          name: passwordField.name,
          className: passwordField.className,
          isPassword: true,
          isUsername: false
        }
      };
      
      if (usernameField) {
        detectedForm.usernameField = {
          element: usernameField as HTMLInputElement,
          type: usernameField.type,
          id: usernameField.id,
          name: usernameField.name,
          className: usernameField.className,
          isPassword: false,
          isUsername: true
        };
      }
      
      // Look for a submit button
      const buttons = Array.from(container.querySelectorAll('button, input[type="submit"], [role="button"]'));
      const submitButton = buttons.find(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('sign in') || 
               text.includes('login') || 
               text.includes('log in') ||
               text.includes('enter') ||
               text.includes('submit') ||
               button.getAttribute('type') === 'submit';
      });
      
      if (submitButton) {
        detectedForm.submitButton = submitButton as HTMLElement;
      }
      
      return detectedForm;
    });
  }
  
  // Process regular forms to identify username and password fields
  return forms.map(form => {
    const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
    
    const fields: FormField[] = inputs
      .filter(input => !input.disabled && input.type !== 'hidden')
      .map(input => {
        const inputElement = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        const inputId = (inputElement.id || '').toLowerCase();
        const inputName = (inputElement.name || '').toLowerCase();
        const inputPlaceholder = 'placeholder' in inputElement ? (inputElement.placeholder || '').toLowerCase() : '';
        
        // Determine if this is likely a username field
        const isUsername = usernameKeywords.some(keyword => 
          inputId.includes(keyword) || 
          inputName.includes(keyword) ||
          inputPlaceholder.includes(keyword)
        ) || inputElement.type === 'email';
        
        // Determine if this is a password field
        const isPassword = inputElement.type === 'password' || 
          passwordKeywords.some(keyword => 
            inputId.includes(keyword) || 
            inputName.includes(keyword) ||
            inputPlaceholder.includes(keyword)
          );
        
        return {
          element: inputElement,
          type: inputElement.type,
          id: inputElement.id,
          name: inputElement.name,
          className: inputElement.className,
          isUsername,
          isPassword
        };
      });
    
    // Find the first username and password fields
    const usernameField = fields.find(field => field.isUsername);
    const passwordField = fields.find(field => field.isPassword);
    
    // Find a submit button
    const buttons = Array.from(form.querySelectorAll('button, input[type="submit"], [role="button"]'));
    const submitButton = buttons.find(button => {
      const text = button.textContent?.toLowerCase() || '';
      return text.includes('sign in') || 
             text.includes('login') || 
             text.includes('log in') ||
             text.includes('enter') ||
             text.includes('submit') ||
             button.getAttribute('type') === 'submit';
    });
    
    return {
      element: form as HTMLFormElement,
      usernameField,
      passwordField,
      submitButton: submitButton as HTMLElement,
      fields
    };
  });
}

/**
 * Fills a detected form with the provided credentials
 */
export function fillForm(form: DetectedForm, credential: any): boolean {
  let filled = false;
  
  // Fill username field if available
  if (form.usernameField && credential.username) {
    form.usernameField.element.value = credential.username;
    form.usernameField.element.dispatchEvent(new Event('input', { bubbles: true }));
    form.usernameField.element.dispatchEvent(new Event('change', { bubbles: true }));
    filled = true;
  }
  
  // Fill password field if available
  if (form.passwordField && credential.password) {
    form.passwordField.element.value = credential.password;
    form.passwordField.element.dispatchEvent(new Event('input', { bubbles: true }));
    form.passwordField.element.dispatchEvent(new Event('change', { bubbles: true }));
    filled = true;
  }
  
  return filled;
}

/**
 * Submits a form after filling it
 */
export function submitForm(form: DetectedForm): boolean {
  if (form.submitButton) {
    form.submitButton.click();
    return true;
  } else if (form.element.tagName === 'FORM') {
    form.element.submit();
    return true;
  }
  return false;
}

// Make these functions available globally for content script
if (typeof window !== 'undefined') {
  (window as any).detectForms = detectForms;
  (window as any).fillForm = fillForm;
  (window as any).submitForm = submitForm;
}
