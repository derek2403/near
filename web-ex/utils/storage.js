// Storage utility functions for extension
export const storage = {
  get: async (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key]);
      });
    });
  },

  set: async (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
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