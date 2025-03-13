
// Define types for our stored data
export interface LoginCredential {
  id: string;
  url: string;
  username: string;
  password: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
}

export interface AppSettings {
  autoFillEnabled: boolean;
  lockAfterMinutes: number;
  passwordLength: number;
  useSymbols: boolean;
  useNumbers: boolean;
  useLowercase: boolean;
  useUppercase: boolean;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  autoFillEnabled: true,
  lockAfterMinutes: 5,
  passwordLength: 16,
  useSymbols: true,
  useNumbers: true,
  useLowercase: true,
  useUppercase: true,
};

// Storage keys
const CREDENTIALS_KEY = 'onelogin_credentials';
const SETTINGS_KEY = 'onelogin_settings';
const MASTER_KEY = 'onelogin_master';

// Simple encryption/decryption using a master password
// Note: This is a simple implementation for demo purposes
// A real extension would use more secure methods like the Web Crypto API
const encrypt = (data: string, masterPassword: string): string => {
  // Simple XOR encryption (for demonstration only)
  return btoa(
    data
      .split('')
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ masterPassword.charCodeAt(i % masterPassword.length))
      )
      .join('')
  );
};

const decrypt = (data: string, masterPassword: string): string => {
  try {
    // Simple XOR decryption (for demonstration only)
    return atob(data)
      .split('')
      .map((char, i) => 
        String.fromCharCode(char.charCodeAt(0) ^ masterPassword.charCodeAt(i % masterPassword.length))
      )
      .join('');
  } catch (e) {
    console.error('Decryption failed', e);
    return '';
  }
};

// Chrome storage wrapper
export const storage = {
  // Save credentials
  saveCredential: async (credential: LoginCredential, masterPassword: string): Promise<void> => {
    const existing = await storage.getCredentials(masterPassword);
    const updated = existing.filter(c => c.id !== credential.id).concat(credential);
    
    const encrypted = encrypt(JSON.stringify(updated), masterPassword);
    await chrome.storage.sync.set({ [CREDENTIALS_KEY]: encrypted });
  },

  // Get all credentials
  getCredentials: async (masterPassword: string): Promise<LoginCredential[]> => {
    try {
      const result = await chrome.storage.sync.get(CREDENTIALS_KEY);
      const encrypted = result[CREDENTIALS_KEY];
      
      if (!encrypted) return [];
      
      const decrypted = decrypt(encrypted, masterPassword);
      return decrypted ? JSON.parse(decrypted) : [];
    } catch (e) {
      console.error('Failed to get credentials', e);
      return [];
    }
  },

  // Delete a credential
  deleteCredential: async (id: string, masterPassword: string): Promise<void> => {
    const credentials = await storage.getCredentials(masterPassword);
    const updated = credentials.filter(c => c.id !== id);
    
    const encrypted = encrypt(JSON.stringify(updated), masterPassword);
    await chrome.storage.sync.set({ [CREDENTIALS_KEY]: encrypted });
  },

  // Find credentials for a specific URL
  findCredentialsForUrl: async (url: string, masterPassword: string): Promise<LoginCredential[]> => {
    const credentials = await storage.getCredentials(masterPassword);
    const domain = new URL(url).hostname;
    
    return credentials.filter(c => {
      try {
        const credDomain = new URL(c.url).hostname;
        return credDomain === domain;
      } catch (e) {
        return c.url.includes(domain);
      }
    });
  },

  // Settings management
  getSettings: async (): Promise<AppSettings> => {
    const result = await chrome.storage.sync.get(SETTINGS_KEY);
    return result[SETTINGS_KEY] || DEFAULT_SETTINGS;
  },

  saveSettings: async (settings: AppSettings): Promise<void> => {
    await chrome.storage.sync.set({ [SETTINGS_KEY]: settings });
  },

  // Master password management
  hasMasterPassword: async (): Promise<boolean> => {
    const result = await chrome.storage.sync.get(MASTER_KEY);
    return !!result[MASTER_KEY];
  },

  setMasterPassword: async (password: string): Promise<void> => {
    // Store a hash of the master password, not the password itself
    const hash = await hashPassword(password);
    await chrome.storage.sync.set({ [MASTER_KEY]: hash });
  },

  verifyMasterPassword: async (password: string): Promise<boolean> => {
    const result = await chrome.storage.sync.get(MASTER_KEY);
    const storedHash = result[MASTER_KEY];
    if (!storedHash) return false;
    
    // Verify the password against the stored hash
    return await verifyPassword(password, storedHash);
  },

  clearAllData: async (): Promise<void> => {
    await chrome.storage.sync.clear();
  }
};

// Password hashing (simplified for demo)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const calculatedHash = await hashPassword(password);
  return calculatedHash === hash;
}

// Generate a secure password
export function generatePassword(options: Partial<AppSettings> = {}): string {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  
  let charset = '';
  if (settings.useLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (settings.useUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (settings.useNumbers) charset += '0123456789';
  if (settings.useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (charset.length === 0) charset = 'abcdefghijklmnopqrstuvwxyz';
  
  let password = '';
  const length = Math.max(8, Math.min(settings.passwordLength, 64));
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

// Helper to generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
