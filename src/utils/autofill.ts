
// Utility functions for form detection and autofill

interface FormField {
  element: HTMLInputElement;
  type: string;
  id: string;
  name: string;
  visible: boolean;
}

interface DetectedForm {
  element: HTMLFormElement;
  usernameField?: FormField;
  passwordField?: FormField;
  submitButton?: HTMLElement;
}

// Check if an element is visible
const isVisible = (element: HTMLElement): boolean => {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
};

// Get all input elements recursively
const getAllInputs = (form: HTMLFormElement): HTMLInputElement[] => {
  const inputs: HTMLInputElement[] = [];
  
  // Helper function to recursively find input elements
  const findInputs = (element: HTMLElement) => {
    // If the element is an input, add it to the list
    if (element.tagName === 'INPUT') {
      inputs.push(element as HTMLInputElement);
    }
    
    // Recursively check all child elements
    Array.from(element.children).forEach(child => {
      findInputs(child as HTMLElement);
    });
  };
  
  findInputs(form);
  return inputs;
};

// Find the submit button for a form
const findSubmitButton = (form: HTMLFormElement): HTMLElement | undefined => {
  // Look for submit inputs
  const submitInputs = getAllInputs(form).filter(
    input => input.type === 'submit' && isVisible(input)
  );
  
  if (submitInputs.length > 0) {
    return submitInputs[0];
  }
  
  // Look for buttons
  const buttons = Array.from(form.querySelectorAll('button'));
  
  // First, try to find a button with type="submit"
  const submitButtons = buttons.filter(
    button => button.getAttribute('type') === 'submit' && isVisible(button)
  );
  
  if (submitButtons.length > 0) {
    return submitButtons[0];
  }
  
  // Next, look for buttons that look like submit buttons
  const buttonsByText = buttons.filter(button => {
    const buttonText = button.textContent?.toLowerCase() || '';
    return isVisible(button) && 
           (buttonText.includes('sign in') || 
            buttonText.includes('login') || 
            buttonText.includes('log in') ||
            buttonText.includes('submit'));
  });
  
  if (buttonsByText.length > 0) {
    return buttonsByText[0];
  }
  
  return undefined;
};

// Detect login forms on the page
export const detectForms = (): DetectedForm[] => {
  const forms = Array.from(document.querySelectorAll('form'));
  const detectedForms: DetectedForm[] = [];
  
  forms.forEach(form => {
    const inputs = getAllInputs(form);
    
    // Find password fields
    const passwordFields = inputs.filter(input => {
      return input.type === 'password' && isVisible(input);
    }).map(input => ({
      element: input,
      type: 'password',
      id: input.id || '',
      name: input.name || '',
      visible: isVisible(input)
    }));
    
    if (passwordFields.length === 0) {
      return; // Not a login form if no password field
    }
    
    // Find username fields (usually text inputs that come before password fields)
    const usernameFields = inputs.filter(input => {
      return (input.type === 'text' || 
              input.type === 'email' || 
              input.type === 'tel' || 
              input.getAttribute('autocomplete') === 'username') && 
              isVisible(input) &&
              input.type !== 'hidden';
    }).map(input => ({
      element: input,
      type: input.type,
      id: input.id || '',
      name: input.name || '',
      visible: isVisible(input)
    }));
    
    if (usernameFields.length === 0) {
      return; // Skip forms with no obvious username field
    }
    
    // Find the submit button
    const submitButton = findSubmitButton(form);
    
    detectedForms.push({
      element: form,
      usernameField: usernameFields[0],
      passwordField: passwordFields[0],
      submitButton
    });
  });
  
  return detectedForms;
};

// Fill a form with credentials
export const fillForm = (form: DetectedForm, credentials: { username: string, password: string }): boolean => {
  if (!form.usernameField || !form.passwordField) {
    return false;
  }
  
  try {
    // Fill username field
    const usernameInput = form.usernameField.element;
    if (usernameInput && !usernameInput.disabled && usernameInput.type !== 'hidden') {
      usernameInput.value = credentials.username;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
      usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Fill password field
    const passwordInput = form.passwordField.element;
    if (passwordInput && !passwordInput.disabled && passwordInput.type !== 'hidden') {
      passwordInput.value = credentials.password;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    return true;
  } catch (error) {
    console.error('Error filling form:', error);
    return false;
  }
};

// Submit a form after filling
export const submitForm = (form: DetectedForm): void => {
  if (form.submitButton) {
    form.submitButton.click();
  } else if (form.element) {
    form.element.submit();
  }
};
