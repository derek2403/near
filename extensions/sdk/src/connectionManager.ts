import { ConnectionState, ConnectionInfo, WalletInfo } from './types';

export class ConnectionManager {
  private static readonly STATE_KEY = 'near_wallet_connection_state';
  private static readonly INFO_KEY = 'near_wallet_connection_info';

  static async saveConnection(
    accountId: string, 
    dappInfo: ConnectionInfo['dapp'],
    permissions?: Partial<ConnectionState['permissions']>
  ): Promise<void> {
    const state: ConnectionState = {
      connected: true,
      accountId,
      network: 'testnet', // Default to testnet
      permissions: {
        viewAccount: true,
        sendTransactions: true,
        signMessages: false,
        ...permissions
      }
    };

    const info: ConnectionInfo = {
      dapp: dappInfo,
      connectedAt: Date.now(),
      lastActive: Date.now()
    };

    await Promise.all([
      chrome.storage.local.set({ [this.STATE_KEY]: state }),
      chrome.storage.local.set({ [this.INFO_KEY]: info })
    ]);
  }

  static async updateLastActive(): Promise<void> {
    const info = await this.getConnectionInfo();
    if (info) {
      info.lastActive = Date.now();
      await chrome.storage.local.set({ [this.INFO_KEY]: info });
    }
  }

  static async updatePermissions(permissions: Partial<ConnectionState['permissions']>): Promise<void> {
    const state = await this.getState();
    if (state) {
      state.permissions = { ...state.permissions, ...permissions };
      await chrome.storage.local.set({ [this.STATE_KEY]: state });
    }
  }

  static async switchNetwork(network: 'mainnet' | 'testnet'): Promise<void> {
    const state = await this.getState();
    if (state) {
      state.network = network;
      await chrome.storage.local.set({ [this.STATE_KEY]: state });
    }
  }

  static async removeConnection(): Promise<void> {
    await Promise.all([
      chrome.storage.local.remove([this.STATE_KEY]),
      chrome.storage.local.remove([this.INFO_KEY])
    ]);
  }

  static async isConnected(): Promise<boolean> {
    const state = await this.getState();
    return !!state?.connected;
  }

  static async getState(): Promise<ConnectionState | null> {
    const result = await chrome.storage.local.get([this.STATE_KEY]);
    return result[this.STATE_KEY] || null;
  }

  static async getConnectionInfo(): Promise<ConnectionInfo | null> {
    const result = await chrome.storage.local.get([this.INFO_KEY]);
    return result[this.INFO_KEY] || null;
  }

  static async hasPermission(permission: keyof ConnectionState['permissions']): Promise<boolean> {
    const state = await this.getState();
    return !!state?.permissions[permission];
  }
} 