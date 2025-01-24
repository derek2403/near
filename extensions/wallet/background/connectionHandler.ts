import { ConnectionManager } from '../../sdk/src/connectionManager';

interface ConnectionRequest {
  origin: string;
  title: string;
  icon: string;
}

export class ConnectionHandler {
  private static pendingRequests: Map<string, ConnectionRequest> = new Map();

  static async handleConnectionRequest(origin: string, sender: chrome.runtime.MessageSender): Promise<boolean> {
    // Check if already connected
    if (await ConnectionManager.isConnected(origin)) {
      return true;
    }

    // Create connection request
    const request: ConnectionRequest = {
      origin,
      title: sender.tab?.title || origin,
      icon: sender.tab?.favIconUrl || ''
    };

    // Store pending request
    const requestId = Math.random().toString(36).substring(7);
    this.pendingRequests.set(requestId, request);

    // Open connection approval popup
    await chrome.windows.create({
      url: `popup.html#/approve-connection/${requestId}`,
      type: 'popup',
      width: 360,
      height: 600
    });

    // Wait for user approval
    return new Promise((resolve) => {
      const checkApproval = setInterval(async () => {
        if (!this.pendingRequests.has(requestId)) {
          clearInterval(checkApproval);
          const isConnected = await ConnectionManager.isConnected(origin);
          resolve(isConnected);
        }
      }, 500);
    });
  }

  static async approveConnection(requestId: string): Promise<void> {
    const request = this.pendingRequests.get(requestId);
    if (!request) return;

    const { walletInfo } = await chrome.storage.local.get(['walletInfo']);
    if (!walletInfo) throw new Error('No wallet found');

    await ConnectionManager.saveConnection(request.origin, walletInfo.accountId);
    this.pendingRequests.delete(requestId);
  }

  static async rejectConnection(requestId: string): Promise<void> {
    this.pendingRequests.delete(requestId);
  }

  static async getConnectionRequest(requestId: string): Promise<ConnectionRequest | null> {
    return this.pendingRequests.get(requestId) || null;
  }
} 