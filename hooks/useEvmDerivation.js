import { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';

export function useEvmDerivation(walletInfo) {
  const [evmAddress, setEvmAddress] = useState(null);
  const [isDerivingAddress, setIsDerivingAddress] = useState(true);
  const [derivationError, setDerivationError] = useState('');
  const [chainBalances, setChainBalances] = useState({});

  useEffect(() => {
    const deriveEvmAddress = async () => {
      if (!walletInfo?.accountId || evmAddress) return;

      try {
        setIsDerivingAddress(true);
        setDerivationError('');

        const derivationPath = `ethereum,1`;
        const adapter = await setupAdapter({
          accountId: walletInfo.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: derivationPath,
        });

        setEvmAddress(adapter.address);

        // Fetch balances from all supported chains
        const balances = {};
        for (const chain of chains) {
          try {
            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            const balance = await provider.getBalance(adapter.address);
            balances[chain.prefix] = ethers.formatEther(balance);
          } catch (err) {
            console.error(`Error fetching balance for ${chain.name}:`, err);
            balances[chain.prefix] = '0';
          }
        }
        
        setChainBalances(balances);

      } catch (err) {
        console.error('Error deriving address:', err);
        setDerivationError('Failed to derive EVM address');
      } finally {
        setIsDerivingAddress(false);
      }
    };

    deriveEvmAddress();
  }, [walletInfo, evmAddress]);

  return {
    evmAddress,
    isDerivingAddress,
    derivationError,
    chainBalances
  };
} 