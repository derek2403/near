export interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
}

export interface WalletResponse {
  accountId: string;
  publicKey: string;
  error?: string;
}

export interface TransactionParams {
  receiverId: string;
  amount: string;
  gas?: string;
  deposit?: string;
  methodName?: string;
  args?: Record<string, unknown>;
}

export interface NetworkConfig {
  networkId: 'mainnet' | 'testnet';
  nodeUrl: string;
  walletUrl: string;
  helperUrl: string;
  explorerUrl: string;
}

export interface WalletConfig {
  networkConfig?: NetworkConfig;
  extensionId?: string;
  debug?: boolean;
}

export interface TransactionResponse {
  transactionHash: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export type WalletEvent = 
  | { type: 'CONNECT_WALLET' }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SEND_TRANSACTION'; params: TransactionParams }
  | { type: 'SIGN_MESSAGE'; message: string }
  | { type: 'GET_ACCOUNT_STATE' }; 