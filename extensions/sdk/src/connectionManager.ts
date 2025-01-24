import { WalletInfo } from './types';

export class ConnectionManager {
  private static readonly STORAGE_KEY = 'near_wallet_connections';

  static async saveConnection(origin: string, accountId: string): Promise<void> {
    const connections = await this.getConnections();
    connections[origin] = {
      accountId,
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ [this.STORAGE_KEY]: connections });
  }

  static async removeConnection(origin: string): Promise<void> {
    const connections = await this.getConnections();
    delete connections[origin];
    await chrome.storage.local.set({ [this.STORAGE_KEY]: connections });
  }

  static async isConnected(origin: string): Promise<boolean> {
    const connections = await this.getConnections();
    return !!connections[origin];
  }

  static async getConnectedAccount(origin: string): Promise<string | null> {
    const connections = await this.getConnections();
    return connections[origin]?.accountId || null;
  }

  private static async getConnections(): Promise<Record<string, { accountId: string; timestamp: number }>> {
    const result = await chrome.storage.local.get([this.STORAGE_KEY]);
    return result[this.STORAGE_KEY] || {};
  }
} 