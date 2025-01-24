import { WalletResponse, TransactionParams, TransactionResponse, WalletEvent } from './types';

export class NearWalletSDK {
  private connected: boolean;
  private accountId: string | null;
  private extensionId: string;

  constructor() {
    this.connected = false;
    this.accountId = null;
    // Your extension ID - this should be configurable or auto-detected
    this.extensionId = 'your-extension-id'; // This will be replaced during build
  }

  private async sendMessage(event: WalletEvent): Promise<any> {
    // First try to connect to the extension
    if (!chrome.runtime?.id) {
      // If running in browser, open extension popup
      window.open(
        `chrome-extension://${this.extensionId}/popup.html`,
        'NEAR Wallet',
        'width=360,height=600'
      );

      // Wait for response via window message
      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          if (event.origin === `chrome-extension://${this.extensionId}`) {
            window.removeEventListener('message', handleMessage);
            if (event.data.error) {
              reject(new Error(event.data.error));
            } else {
              resolve(event.data);
            }
          }
        };

        window.addEventListener('message', handleMessage);
      });
    }

    // If running in extension context, use runtime messaging
    return chrome.runtime.sendMessage(this.extensionId, event);
  }

  async connect(): Promise<WalletResponse> {
    try {
      const response = await this.sendMessage({ type: 'CONNECT_WALLET' });

      if (response.error) {
        throw new Error(response.error);
      }

      this.connected = true;
      this.accountId = response.accountId;

      return {
        accountId: response.accountId,
        publicKey: response.publicKey
      };
    } catch (error) {
      throw new Error(`Failed to connect to wallet: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.sendMessage({ type: 'DISCONNECT_WALLET' });
      this.connected = false;
      this.accountId = null;
    } catch (error) {
      throw new Error(`Failed to disconnect wallet: ${error}`);
    }
  }

  async sendTransaction(params: TransactionParams): Promise<TransactionResponse> {
    if (!this.connected) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await this.sendMessage({
        type: 'SEND_TRANSACTION',
        params
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return {
        transactionHash: response.transactionHash
      };
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`);
    }
  }

  getAccountId(): string | null {
    return this.accountId;
  }

  isConnected(): boolean {
    return this.connected;
  }
} 