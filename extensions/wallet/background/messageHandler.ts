import { WalletEvent, TransactionParams } from '../../sdk/src/types';
import * as nearAPI from 'near-api-js';

const { connect, keyStores, utils } = nearAPI;

async function handleTransaction(params: TransactionParams) {
  try {
    const { walletInfo } = await chrome.storage.local.get(['walletInfo']);
    if (!walletInfo) {
      throw new Error('No wallet found');
    }

    // Setup connection to NEAR
    const connectionConfig = {
      networkId: "testnet",
      keyStore: new keyStores.InMemoryKeyStore(),
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

chrome.runtime.onMessageExternal.addListener(
  async (message: WalletEvent, sender, sendResponse) => {
    try {
      switch (message.type) {
        case 'CONNECT_WALLET': {
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
          const result = await handleTransaction(message.params);
          sendResponse(result);
          break;
        }

        case 'SIGN_MESSAGE': {
          // Implement message signing
          break;
        }

        case 'GET_ACCOUNT_STATE': {
          // Implement account state retrieval
          break;
        }

        case 'DISCONNECT_WALLET':
          // Handle disconnect
          sendResponse({ success: true });
          break;

        default:
          sendResponse({ error: 'Unknown message type' });
      }
    } catch (error) {
      sendResponse({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
); 