
// Type definitions for Chrome extension API
interface Chrome {
  tabs: {
    query: (queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: any[]) => void) => void;
  };
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
    onMessage: {
      addListener: (callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void | boolean) => void;
    };
    onInstalled: {
      addListener: (callback: (details: { reason: string }) => void) => void;
    };
  };
  storage: {
    sync: {
      get: (keys: string | string[] | null, callback: (items: { [key: string]: any }) => void) => void;
      set: (items: { [key: string]: any }, callback?: () => void) => void;
      clear: (callback?: () => void) => void;
    };
  };
  scripting: {
    executeScript: (options: {
      target: { tabId: number };
      func: (...args: any[]) => any;
      args?: any[];
    }) => Promise<any>;
  };
}

declare global {
  interface Window {
    chrome: Chrome;
    detectForms: () => any[];
    fillForm: (form: any, credentials: any) => boolean;
    submitForm: (form: any) => void;
  }
  const chrome: Chrome;
}

export {};
