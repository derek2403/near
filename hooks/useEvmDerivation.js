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
    const deriveEvmAddresses = async () => {
      if (!walletInfo?.accountId || evmAddress) return;

      try {
        setIsDerivingAddress(true);
        setDerivationError('');

        // Define chain derivation paths
        const chainPaths = [
          { chain: 'ethereum', path: 'ethereum,1' },
          { chain: 'base', path: 'base,1' },
          { chain: 'optimism', path: 'optimism,1' },
          { chain: 'arbitrum', path: 'arbitrum,1' }
        ];

        // Derive the first address (ethereum) as the main EVM address
        const mainAdapter = await setupAdapter({
          accountId: walletInfo.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: chainPaths[0].path,
        });

        setEvmAddress(mainAdapter.address);

        // Fetch balances from all supported chains
        const balances = {};
        for (const chain of chains) {
          try {
            // Get the appropriate derivation path for this chain
            const chainConfig = chainPaths.find(cp => cp.chain === chain.prefix);
            
            // If this chain has a specific derivation path, use it
            let address = mainAdapter.address; // Default to main address
            if (chainConfig) {
              const chainAdapter = await setupAdapter({
                accountId: walletInfo.accountId,
                mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
                derivationPath: chainConfig.path,
              });
              address = chainAdapter.address;
            }

            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            const balance = await provider.getBalance(address);
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

    deriveEvmAddresses();
  }, [walletInfo, evmAddress]);

  return {
    evmAddress,
    isDerivingAddress,
    derivationError,
    chainBalances
  };
} 