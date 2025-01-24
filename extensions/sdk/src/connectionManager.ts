import { WalletInfo } from './types';

export class ConnectionManager {
  private static readonly STORAGE_KEY = 'near_wallet_connection';

  static async saveConnection(accountId: string): Promise<void> {
    await chrome.storage.local.set({
      [this.STORAGE_KEY]: {
        accountId,
        timestamp: Date.now(),
        connected: true
      }
    });
  }

  static async removeConnection(): Promise<void> {
    await chrome.storage.local.remove([this.STORAGE_KEY]);
  }

  static async isConnected(): Promise<boolean> {
    const result = await chrome.storage.local.get([this.STORAGE_KEY]);
    return !!result[this.STORAGE_KEY]?.connected;
  }

  static async getConnectedAccount(): Promise<string | null> {
    const result = await chrome.storage.local.get([this.STORAGE_KEY]);
    return result[this.STORAGE_KEY]?.accountId || null;
  }
} 