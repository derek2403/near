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

export interface ConnectionState {
  connected: boolean;
  accountId: string | null;
  network: 'mainnet' | 'testnet';
  permissions: {
    viewAccount: boolean;
    sendTransactions: boolean;
    signMessages: boolean;
  };
}

export interface ConnectionInfo {
  dapp: {
    name: string;
    url: string;
    icon?: string;
  };
  connectedAt: number;
  lastActive: number;
}

export interface TransactionHistory {
  hash: string;
  type: 'send' | 'receive' | 'contract_call';
  status: 'success' | 'failure' | 'pending';
  from: string;
  to: string;
  amount?: string;
  timestamp: number;
  network: 'mainnet' | 'testnet';
  methodName?: string;
  args?: Record<string, unknown>;
  errorMessage?: string;
}

export type WalletEvent = 
  | { type: 'CONNECT_WALLET' }
  | { type: 'DISCONNECT_WALLET' }
  | { type: 'SEND_TRANSACTION'; params: TransactionParams }
  | { type: 'CHECK_CONNECTION' }
  | { type: 'GET_STATE' }
  | { type: 'SWITCH_NETWORK'; network: 'mainnet' | 'testnet' }
  | { type: 'UPDATE_PERMISSIONS'; permissions: Partial<ConnectionState['permissions']> }
  | { type: 'GET_TRANSACTION_HISTORY' }
  | { type: 'CLEAR_TRANSACTION_HISTORY' }; 