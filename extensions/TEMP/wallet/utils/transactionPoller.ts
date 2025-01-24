import { TransactionManager } from './transactionManager';
import * as nearAPI from 'near-api-js';

export class TransactionPoller {
  private static pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  static async startPolling(txHash: string, networkId: 'mainnet' | 'testnet'): Promise<void> {
    if (this.pollingIntervals.has(txHash)) return;

    const provider = new nearAPI.providers.JsonRpcProvider(
      networkId === 'mainnet' 
        ? 'https://rpc.mainnet.near.org' 
        : 'https://rpc.testnet.near.org'
    );

    const interval = setInterval(async () => {
      try {
        const result = await provider.txStatus(txHash, 'unnused');
        if (result.status) {
          if (result.status.SuccessValue !== undefined) {
            await TransactionManager.updateTransactionStatus(txHash, 'success');
            this.stopPolling(txHash);
          } else if (result.status.Failure !== undefined) {
            await TransactionManager.updateTransactionStatus(
              txHash,
              'failure',
              'Transaction execution failed'
            );
            this.stopPolling(txHash);
          }
        }
      } catch (error) {
        console.error(`Error polling transaction ${txHash}:`, error);
      }
    }, 1000);

    this.pollingIntervals.set(txHash, interval);

    // Stop polling after 5 minutes
    setTimeout(() => {
      this.stopPolling(txHash);
    }, 5 * 60 * 1000);
  }

  static stopPolling(txHash: string): void {
    const interval = this.pollingIntervals.get(txHash);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(txHash);
    }
  }
} 