import { useState } from 'react';
import { setupAdapter } from 'near-ca';

// Chain IDs for different networks
const CHAIN_IDS = {
  ethereum: 11155111,  // Sepolia testnet
  optimism: 11155420,  // Optimism testnet
  base: 84531,        // Base testnet
  arbitrum: 421614    // Arbitrum testnet
};

export function useEvmSend() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const sendTransaction = async ({
    accountId,
    secretKey,
    recipientAddress,
    amount,
    selectedChain
  }) => {
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Get the chain's derivation path
      const derivationPath = `${selectedChain.prefix},1`;
      
      // Setup the adapter for the selected chain
      const adapter = await setupAdapter({
        accountId: accountId,
        privateKey: secretKey,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
        derivationPath: derivationPath,
      });

      // Convert amount from ETH to wei
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));

      // Get chain ID
      const chainId = CHAIN_IDS[selectedChain.prefix];
      if (!chainId) {
        throw new Error(`Chain ID not found for ${selectedChain.name}`);
      }

      // Send the transaction
      const hash = await adapter.signAndSendTransaction({
        to: recipientAddress,
        value: amountInWei,
        chainId: chainId,
      });

      setTxHash(hash);
      return { success: true, hash };

    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to send transaction');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash, selectedChain) => {
    if (!hash || !selectedChain?.explorerUrl) return '';
    return `${selectedChain.explorerUrl}tx/${hash}`;
  };

  return {
    sendTransaction,
    isLoading,
    error,
    txHash,
    getExplorerUrl
  };
} 