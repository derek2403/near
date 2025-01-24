import { WalletEvent } from '../../sdk/src/types';

chrome.runtime.onMessageExternal.addListener(
  async (message: WalletEvent, sender, sendResponse) => {
    switch (message.type) {
      case 'CONNECT_WALLET':
        // Get wallet info from storage
        const { walletInfo } = await chrome.storage.local.get(['walletInfo']);
        if (!walletInfo) {
          sendResponse({ error: 'No wallet found' });
          return;
        }
        sendResponse({
          accountId: walletInfo.accountId,
          publicKey: walletInfo.publicKey
        });
        break;

      case 'SEND_TRANSACTION':
        // Handle transaction
        try {
          // Your transaction logic here
          // This should probably open the extension popup for approval
          sendResponse({
            transactionHash: 'tx-hash-here'
          });
        } catch (error) {
          sendResponse({ error: 'Transaction failed' });
        }
        break;

      case 'DISCONNECT_WALLET':
        // Handle disconnect
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }
); 