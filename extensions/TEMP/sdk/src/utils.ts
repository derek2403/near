import { NetworkConfig } from './types';
import { DEFAULT_NETWORK_CONFIG } from './constants';

export function validateNetworkConfig(config?: Partial<NetworkConfig>): NetworkConfig {
  if (!config) {
    return DEFAULT_NETWORK_CONFIG.testnet;
  }

  return {
    networkId: config.networkId || 'testnet',
    nodeUrl: config.nodeUrl || DEFAULT_NETWORK_CONFIG.testnet.nodeUrl,
    walletUrl: config.walletUrl || DEFAULT_NETWORK_CONFIG.testnet.walletUrl,
    helperUrl: config.helperUrl || DEFAULT_NETWORK_CONFIG.testnet.helperUrl,
    explorerUrl: config.explorerUrl || DEFAULT_NETWORK_CONFIG.testnet.explorerUrl
  };
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
} 