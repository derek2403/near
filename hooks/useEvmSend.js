import { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { chains } from '../data/supportedChain.json';

// Create chain IDs mapping from supportedChain.json
const CHAIN_IDS = chains.reduce((acc, chain) => ({
  ...acc,
  [chain.prefix]: chain.chainId
}), {});

export const SEPOLIA_CHAIN_ID = 11155111;

export function useEvmSend() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const sendETH = async (toAddress, amountInWei, walletInfo, derivationPath = 'ethereum,1') => {
    try {
      if (!walletInfo?.accountId || !walletInfo?.privateKey) {
        throw new Error('Wallet info not available');
      }

      const evm = await setupAdapter({
        accountId: walletInfo.accountId,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        privateKey: walletInfo.privateKey,
        derivationPath,
      });

      const result = await evm.signAndSendTransaction({
        to: toAddress,
        value: amountInWei,
        chainId: SEPOLIA_CHAIN_ID,
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
      const derivationPath = `${selectedChain.prefix},1`;
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      const walletInfo = {
        accountId,
        privateKey: secretKey
      };

      const result = await sendETH(
        recipientAddress,
        amountInWei,
        walletInfo,
        derivationPath
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
    return `${selectedChain.explorerUrl}tx/${hash}`;
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