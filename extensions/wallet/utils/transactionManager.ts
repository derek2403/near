import { TransactionHistory } from '../../sdk/src/types';

export class TransactionManager {
  private static readonly STORAGE_KEY = 'near_wallet_transactions';
  private static readonly MAX_TRANSACTIONS = 100;

  static async addTransaction(transaction: Omit<TransactionHistory, 'timestamp'>): Promise<void> {
    const transactions = await this.getTransactions();
    
    const newTransaction: TransactionHistory = {
      ...transaction,
      timestamp: Date.now()
    };

    transactions.unshift(newTransaction);

    // Keep only the last MAX_TRANSACTIONS
    if (transactions.length > this.MAX_TRANSACTIONS) {
      transactions.length = this.MAX_TRANSACTIONS;
    }

    await chrome.storage.local.set({ [this.STORAGE_KEY]: transactions });
  }

  static async getTransactions(): Promise<TransactionHistory[]> {
    const result = await chrome.storage.local.get([this.STORAGE_KEY]);
    return result[this.STORAGE_KEY] || [];
  }

  static async clearTransactions(): Promise<void> {
    await chrome.storage.local.remove([this.STORAGE_KEY]);
  }

  static async updateTransactionStatus(
    hash: string,
    status: TransactionHistory['status'],
    errorMessage?: string
  ): Promise<void> {
    const transactions = await this.getTransactions();
    const transaction = transactions.find(tx => tx.hash === hash);
    
    if (transaction) {
      transaction.status = status;
      if (errorMessage) {
        transaction.errorMessage = errorMessage;
      }
      await chrome.storage.local.set({ [this.STORAGE_KEY]: transactions });
    }
  }
} 