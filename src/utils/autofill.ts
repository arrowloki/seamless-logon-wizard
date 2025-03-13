
import { LoginCredential } from './storage';

interface FormField {
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  type: 'username' | 'password' | 'email' | 'unknown';
}

export interface DetectedForm {
  form: HTMLFormElement;
  fields: FormField[];
  hasUsername: boolean;
  hasPassword: boolean;
}

// Detect login forms on the page
export function detectForms(): DetectedForm[] {
  const forms: DetectedForm[] = [];
  
  // First look for actual form elements
  document.querySelectorAll('form').forEach(form => {
    const fields = analyzeForm(form);
    if (fields.some(f => f.type === 'password')) {
      forms.push({
        form,
        fields,
        hasUsername: fields.some(f => f.type === 'username' || f.type === 'email'),
        hasPassword: fields.some(f => f.type === 'password')
      });
    }
  });
  
  // Then look for password fields outside of forms (many sites do this)
  if (forms.length === 0) {
    const passwordFields = document.querySelectorAll('input[type="password"]');
    
    passwordFields.forEach(passwordField => {
      // Try to find the closest container that might be a login form
      const possibleForm = findClosestFormLikeContainer(passwordField);
      
      if (possibleForm) {
        const fields = analyzeFormLikeContainer(possibleForm);
        forms.push({
          form: possibleForm as HTMLFormElement,
          fields,
          hasUsername: fields.some(f => f.type === 'username' || f.type === 'email'),
          hasPassword: fields.some(f => f.type === 'password')
        });
      }
    });
  }
  
  return forms;
}

// Find the closest parent that looks like a form container
function findClosestFormLikeContainer(element: Element): Element | null {
  let current = element.parentElement;
  
  while (current && current !== document.body) {
    // Look for common form container clues
    if (
      current.querySelectorAll('input').length >= 2 ||
      current.querySelectorAll('button').length > 0 ||
      current.querySelectorAll('input[type="submit"]').length > 0
    ) {
      return current;
    }
    
    current = current.parentElement;
  }
  
  return null;
}

// Analyze a form for relevant fields
function analyzeForm(form: HTMLFormElement): FormField[] {
  const fields: FormField[] = [];
  
  form.querySelectorAll('input, select, textarea').forEach(element => {
    if (element instanceof HTMLInputElement || 
        element instanceof HTMLSelectElement || 
        element instanceof HTMLTextAreaElement) {
      
      const field = {
        element,
        type: determineFieldType(element)
      };
      
      fields.push(field);
    }
  });
  
  return fields;
}

// Analyze a div or other container that might act as a form
function analyzeFormLikeContainer(container: Element): FormField[] {
  const fields: FormField[] = [];
  
  container.querySelectorAll('input, select, textarea').forEach(element => {
    if (element instanceof HTMLInputElement || 
        element instanceof HTMLSelectElement || 
        element instanceof HTMLTextAreaElement) {
      
      const field = {
        element,
        type: determineFieldType(element)
      };
      
      fields.push(field);
    }
  });
  
  return fields;
}

// Try to determine what type of field this is
function determineFieldType(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): 'username' | 'password' | 'email' | 'unknown' {
  // Easy case: password field
  if (element instanceof HTMLInputElement && element.type === 'password') {
    return 'password';
  }
  
  // Email field
  if (element instanceof HTMLInputElement && element.type === 'email') {
    return 'email';
  }
  
  // Look at the element's attributes for clues
  const attributes = [
    element.id?.toLowerCase() || '',
    element.name?.toLowerCase() || '',
    element.placeholder?.toLowerCase() || '',
    element.className?.toLowerCase() || '',
    element.getAttribute('aria-label')?.toLowerCase() || ''
  ];
  
  // Username patterns
  if (attributes.some(attr => 
    attr.includes('user') || 
    attr === 'login' || 
    attr.includes('account') || 
    attr.includes('name') && !attr.includes('last') && !attr.includes('first')
  )) {
    return 'username';
  }
  
  // Email patterns (if not caught by type)
  if (attributes.some(attr => attr.includes('email'))) {
    return 'email';
  }
  
  return 'unknown';
}

// Fill credentials into a form
export function fillForm(form: DetectedForm, credential: LoginCredential): boolean {
  try {
    let usernameField = form.fields.find(f => f.type === 'username') ||
                        form.fields.find(f => f.type === 'email');
                        
    const passwordField = form.fields.find(f => f.type === 'password');
    
    // If we can't find a specific username field, try to use the first non-password field
    if (!usernameField && form.fields.length > 1) {
      usernameField = form.fields.find(f => f.type !== 'password');
    }
    
    // Fill in the fields
    if (usernameField) {
      usernameField.element.value = credential.username;
      usernameField.element.dispatchEvent(new Event('input', { bubbles: true }));
      usernameField.element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (passwordField) {
      passwordField.element.value = credential.password;
      passwordField.element.dispatchEvent(new Event('input', { bubbles: true }));
      passwordField.element.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('Error filling form:', e);
    return false;
  }
}

// Submit the form after filling
export function submitForm(form: DetectedForm): void {
  try {
    // Look for submit buttons
    const buttons = Array.from(form.form.querySelectorAll('button, input[type="submit"]'));
    const submitButton = buttons.find(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return (
        btn instanceof HTMLInputElement && btn.type === 'submit' ||
        text.includes('sign in') ||
        text.includes('login') ||
        text.includes('log in') ||
        text.includes('submit')
      );
    });
    
    if (submitButton) {
      (submitButton as HTMLElement).click();
    } else {
      // Try to submit the form directly
      form.form.dispatchEvent(new Event('submit', { bubbles: true }));
    }
  } catch (e) {
    console.error('Error submitting form:', e);
  }
}
