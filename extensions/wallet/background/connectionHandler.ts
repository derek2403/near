import { ConnectionManager } from '../../TEMP/sdk/src/connectionManager';

export class ConnectionHandler {
  static async handleConnectionRequest(): Promise<boolean> {
    // Check if already connected
    if (await ConnectionManager.isConnected()) {
      return true;
    }

    // Open connection approval popup
    const popup = await chrome.windows.create({
      url: 'index.html#/approve-connection',
      type: 'popup',
      width: 360,
      height: 600
    });

    // Wait for user approval
    return new Promise((resolve) => {
      const checkApproval = setInterval(async () => {
        const isConnected = await ConnectionManager.isConnected();
        if (isConnected) {
          clearInterval(checkApproval);
          if (popup.id) {
            await chrome.windows.remove(popup.id);
          }
          resolve(true);
        }
      }, 500);
    });
  }

  static async approveConnection(): Promise<void> {
    const { walletInfo } = await chrome.storage.local.get(['walletInfo']);
    if (!walletInfo) throw new Error('No wallet found');

    await ConnectionManager.saveConnection(walletInfo.accountId);
  }

  static async rejectConnection(): Promise<void> {
    await ConnectionManager.removeConnection();
  }
} 