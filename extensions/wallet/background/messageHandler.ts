import { WalletEvent, TransactionParams } from '../../sdk/src/types';
import * as nearAPI from 'near-api-js';
import { ConnectionHandler } from './connectionHandler';
import { ConnectionManager } from '../../sdk/src/connectionManager';

const { connect, keyStores, utils } = nearAPI;

async function handleTransaction(params: TransactionParams) {
  try {
    const { walletInfo } = await chrome.storage.local.get(['walletInfo']);
    if (!walletInfo) {
      throw new Error('No wallet found');
    }

    // Create key store and load the account key
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = nearAPI.utils.KeyPair.fromString(walletInfo.secretKey);
    await keyStore.setKey("testnet", walletInfo.accountId, keyPair);

    // Setup connection to NEAR
    const connectionConfig = {
      networkId: "testnet",
      keyStore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://explorer.testnet.near.org",
    };

    const near = await connect(connectionConfig);
    const account = await near.account(walletInfo.accountId);

    // Convert NEAR amount to yoctoNEAR
    const yoctoAmount = utils.format.parseNearAmount(params.amount);
    if (!yoctoAmount) {
      throw new Error('Invalid amount');
    }

    // Send transaction
    const result = await account.sendMoney(
      params.receiverId,
      yoctoAmount
    );

    return {
      transactionHash: result.transaction.hash,
      status: 'success'
    };
  } catch (error) {
    return {
      status: 'failure',
      errorMessage: error instanceof Error ? error.message : 'Transaction failed'
    };
  }
}

// Handle messages from external sources
chrome.runtime.onMessageExternal.addListener(
  async (message: WalletEvent, sender, sendResponse) => {
    try {
      switch (message.type) {
        case 'CONNECT_WALLET': {
          // Handle connection request
          const isApproved = await ConnectionHandler.handleConnectionRequest();
          if (!isApproved) {
            sendResponse({ error: 'Connection rejected' });
            return;
          }

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
        }

        case 'SEND_TRANSACTION': {
          // Check if connected
          if (!await ConnectionManager.isConnected()) {
            sendResponse({ error: 'Not connected' });
            return;
          }

          const result = await handleTransaction(message.params);
          sendResponse(result);
          break;
        }

        case 'DISCONNECT_WALLET':
          await ConnectionManager.removeConnection();
          sendResponse({ success: true });
          break;

        case 'CHECK_CONNECTION': {
          const isConnected = await ConnectionManager.isConnected();
          const accountId = await ConnectionManager.getConnectedAccount();
          sendResponse({ connected: isConnected, accountId });
          break;
        }

        case 'GET_STATE': {
          const state = await ConnectionManager.getState();
          const info = await ConnectionManager.getConnectionInfo();
          sendResponse({ state, info });
          break;
        }

        case 'SWITCH_NETWORK': {
          await ConnectionManager.switchNetwork(message.network);
          sendResponse({ success: true });
          break;
        }

        case 'UPDATE_PERMISSIONS': {
          await ConnectionManager.updatePermissions(message.permissions);
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
    return true;
  }
);

// Handle messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle internal extension messages here
  return true;
}); 