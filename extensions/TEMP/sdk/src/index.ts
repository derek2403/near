import { WalletResponse, TransactionParams, TransactionResponse, WalletEvent } from './types';

export class NearWalletConnector {
  private connected: boolean;
  private accountId: string | null;
  private readonly extensionId: string;

  constructor(extensionId: string) {
    if (!extensionId) {
      throw new Error('Extension ID is required');
    }
    this.extensionId = extensionId;
    this.connected = false;
    this.accountId = null;

    // Check for existing connection
    this.checkExistingConnection();
  }

  private async checkExistingConnection(): Promise<void> {
    try {
      const response = await this.sendMessage({ type: 'CHECK_CONNECTION' });
      if (response.connected) {
        this.connected = true;
        this.accountId = response.accountId;
      }
    } catch (error) {
      console.error('Failed to check connection:', error);
    }
  }

  private async sendMessage(event: WalletEvent): Promise<any> {
    if (!chrome.runtime?.id) {
      // If running in browser, open extension popup
      const popup = window.open(
        `chrome-extension://${this.extensionId}/index.html`,
        'NEAR Wallet',
        'width=360,height=600'
      );

      if (!popup) {
        throw new Error('Failed to open wallet popup. Please check your popup blocker settings.');
      }

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
        transactionHash: response.transactionHash,
        status: response.status
      };
    } catch (error) {
      throw new Error(`Transaction failed: ${error}`);
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

  getAccountId(): string | null {
    return this.accountId;
  }

  isConnected(): boolean {
    return this.connected;
  }
} 