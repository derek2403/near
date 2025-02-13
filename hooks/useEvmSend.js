import { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { chains } from '../data/supportedChain.json';

// Create chain IDs mapping from supportedChain.json
const CHAIN_IDS = chains.reduce((acc, chain) => ({
  ...acc,
  [chain.prefix]: chain.chainId
}), {});

// Create RPC URL mapping
const RPC_URLS = chains.reduce((acc, chain) => ({
  ...acc,
  [chain.chainId]: chain.rpcUrl
}), {});

export function useEvmSend() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const sendETH = async (toAddress, amountInWei, walletInfo, chainId) => {
    try {
      if (!walletInfo?.accountId || !walletInfo?.privateKey) {
        throw new Error('Wallet info not available');
      }

      // Find the chain configuration
      const chainConfig = chains.find(chain => chain.chainId === chainId);
      if (!chainConfig) {
        throw new Error(`Chain configuration not found for chainId ${chainId}`);
      }

      // Always use ethereum,1 as derivation path to get consistent addresses across chains
      const evm = await setupAdapter({
        accountId: walletInfo.accountId,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        privateKey: walletInfo.privateKey,
        derivationPath: 'ethereum,1', // Use consistent derivation path
        network: {
          networkId: 'testnet',
          nodeUrl: 'https://rpc.testnet.near.org',
          walletUrl: 'https://wallet.testnet.near.org',
          helperUrl: 'https://helper.testnet.near.org',
          explorerUrl: 'https://explorer.testnet.near.org'
        }
      });

      const result = await evm.signAndSendTransaction({
        to: toAddress,
        value: amountInWei,
        chainId,
        gasLimit: BigInt(21000),
        rpcUrl: chainConfig.rpcUrl
      });

      console.log("Transaction sent successfully!", result);
      return { hash: result };
    } catch (error) {
      console.error("Error details:", error);
      throw error;
    }
  };

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
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      const walletInfo = {
        accountId,
        privateKey: secretKey
      };

      const result = await sendETH(
        recipientAddress,
        amountInWei,
        walletInfo,
        selectedChain.chainId
      );

      if (!result?.hash) {
        throw new Error('No transaction hash received');
      }

      setTxHash(result.hash);
      return { success: true, hash: result.hash };

    } catch (err) {
      console.error('Transaction error:', err);
      const errorMessage = err.message || 'Failed to send transaction';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash, selectedChain) => {
    if (!hash || !selectedChain?.explorerUrl) return '';
    const baseUrl = selectedChain.explorerUrl.replace('address/', '');
    return `${baseUrl}tx/${hash}`;
  };

  return {
    sendETH,
    sendTransaction,
    isLoading,
    error,
    txHash,
    getExplorerUrl,
    CHAIN_IDS
  };
} 