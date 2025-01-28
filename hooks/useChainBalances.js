import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';

const formatToFourDecimals = (value) => {
  // Convert to number and fix to 4 decimal places
  return Number(value).toFixed(4);
};

export function useChainBalances(evmAddress) {
  const [balances, setBalances] = useState({});
  const [totalBalance, setTotalBalance] = useState('0.0000');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBalances = async () => {
    if (!evmAddress) return;
    
    try {
      const newBalances = {};
      let totalEth = BigInt(0);

      for (const chain of chains) {
        try {
          const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
          const balance = await provider.getBalance(evmAddress);
          const formattedBalance = formatToFourDecimals(ethers.formatEther(balance));
          
          newBalances[chain.prefix] = formattedBalance;
          totalEth += balance;

        } catch (chainError) {
          console.error(`Error fetching balance for ${chain.name}:`, chainError);
          newBalances[chain.prefix] = '0.0000';
        }
      }

      setBalances(newBalances);
      setTotalBalance(formatToFourDecimals(ethers.formatEther(totalEth)));

    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (evmAddress) {
      fetchBalances();
    }
  }, [evmAddress]);

  return {
    balances,
    totalBalance,
    isLoading,
    error,
    refreshBalances: fetchBalances
  };
} 