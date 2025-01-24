export interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
}

export interface Transaction {
  transaction_hash: string;
  signer_account_id: string;
  receiver_account_id: string;
  block_timestamp: number;
  deposit: string;
  status: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface Coin {
  key: string;
  label: string;
  symbol: string;
  icon: string;
  description: string;
}

export interface Chain {
  name: string;
  prefix: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  logo: string;
} 