import { useState } from 'react';
import { setupAdapter } from 'near-ca';
import { Button, Input, Card } from "@nextui-org/react";
import { chains } from '../data/supportedChain.json';

// Get Ethereum Sepolia config from supportedChain.json
const SEPOLIA_CONFIG = chains.find(chain => chain.prefix === 'ethereum');

export default function EthTransfer() {
  const [ethAddress, setEthAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [derivationPath, setDerivationPath] = useState('ethereum,1');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');

  const generateAddress = async () => {
    setIsLoading(true);
    setError('');
    try {
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
        rpcUrl: SEPOLIA_CONFIG.rpcUrl,
      });

      setEthAddress(adapter.address);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFunds = async () => {
    setIsLoading(true);
    setError('');
    setTxHash('');
    try {
      const adapter = await setupAdapter({
        accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
        rpcUrl: SEPOLIA_CONFIG.rpcUrl,
      });
  
      // Convert amount from ETH to wei
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
  
      const hash = await adapter.signAndSendTransaction({
        to: recipientAddress,
        value: amountInWei,
        chainId: SEPOLIA_CONFIG.chainId,
      });
  
      setTxHash(hash);
    } catch (err) {
      setError(err.message);
      console.error('Transaction error details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const viewOnExplorer = () => {
    if (txHash) {
      window.open(`${SEPOLIA_CONFIG.explorerUrl}${txHash}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">ETH Sepolia Transfer Test Page</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Derivation Path:</label>
            <Input
              value={derivationPath}
              onChange={(e) => setDerivationPath(e.target.value)}
              placeholder="ethereum,1"
              className="w-full"
            />
          </div>

          <Button 
            color="primary"
            onClick={generateAddress} 
            isLoading={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate ETH Address'}
          </Button>

          {ethAddress && (
            <div className="space-y-6">
              <div className="p-4 bg-gray-100 rounded-lg break-all">
                <p className="font-medium">Your ETH address:</p>
                <p className="text-sm">{ethAddress}</p>
                <Button
                  size="sm"
                  color="secondary"
                  className="mt-2"
                  onClick={() => window.open(`${SEPOLIA_CONFIG.explorerUrl}${ethAddress}`, '_blank')}
                >
                  View on Explorer
                </Button>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Send ETH on Sepolia</h2>
                <Input
                  label="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full"
                />
                <Input
                  label="Amount (ETH)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.1"
                  className="w-full"
                />
                <Button 
                  color="primary"
                  onClick={sendFunds} 
                  isLoading={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send ETH'}
                </Button>
              </div>
            </div>
          )}

          {txHash && (
            <div className="p-4 bg-green-100 rounded-lg break-all">
              <p className="font-medium">Transaction Hash:</p>
              <p className="text-sm">{txHash}</p>
              <Button
                size="sm"
                color="secondary"
                className="mt-2"
                onClick={viewOnExplorer}
              >
                View Transaction
              </Button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 