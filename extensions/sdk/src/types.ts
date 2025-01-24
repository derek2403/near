export interface WalletResponse {
  accountId: string;
  publicKey: string;
  error?: string;
}

export interface TransactionParams {
  receiverId: string;
  amount: string;
}

export interface TransactionResponse {
  transactionHash: string;
  error?: string;
}

export type WalletEvent = 
  | { type: 'CONNECT_WALLET' }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SEND_TRANSACTION'; params: TransactionParams }; 