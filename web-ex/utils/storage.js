// Storage utility functions for extension
export const storage = {
  get: async (key) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          resolve(result[key]);
        });
      });
    } else {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  },

  set: async (key, value) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  },

  remove: async (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve();
      });
    });
  },

  clear: async () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.clear(resolve);
      });
    } else {
      localStorage.clear();
    }
  }
};

// Encryption/Decryption utilities
export const crypto = {
  encrypt: async (data, password) => {
    // TODO: Implement proper encryption
    return btoa(JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  },

  decrypt: async (encryptedData) => {
    // TODO: Implement proper decryption
    try {
      return JSON.parse(atob(encryptedData)).data;
    } catch (err) {
      throw new Error('Failed to decrypt data');
    }
  },

  hashPassword: async (password) => {
    // TODO: Implement proper password hashing
    return btoa(password);
  }
}; 