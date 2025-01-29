import { useState } from 'react';
import { setupAdapter } from "../near-ca-lib";
import { useEvmDerivation } from '../hooks/useEvmDerivation';
import { useRouter } from 'next/router';

export const SEPOLIA_CHAIN_ID = 11155111;

async function sendETH(toAddress, amountInWei, walletInfo, derivationPath = 'ethereum,1') {
  try {
    if (!walletInfo?.accountId || !walletInfo?.privateKey) {
      throw new Error('Wallet info not available');
    }

    // Setup the adapter with wallet info
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
    return result;
  } catch (error) {
    console.error("Error details:", error);
    throw error;
  }
}

export default function SendETHPage() {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Get evmAddress from query params like ChainSignatureDashboard does
  const { evmAddress: queryEvmAddress } = router.query;

  // Use the hook with dynamic wallet info
  const walletInfo = {
    accountId: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
    privateKey: process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY,
  };
  
  const { 
    evmAddress, 
    isDerivingAddress, 
    derivationError 
  } = useEvmDerivation(walletInfo);

  // Use query param address if available, otherwise use derived address
  const activeEvmAddress = queryEvmAddress || evmAddress;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Processing...');

    try {
      if (!activeEvmAddress) {
        throw new Error('EVM address not available');
      }

      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      const result = await sendETH(
        toAddress, 
        amountInWei, 
        walletInfo, 
        'ethereum,1'
      );
      
      setStatus(`Transaction successful! Hash: ${result.hash}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while deriving address
  if (isDerivingAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-2">Deriving EVM address...</div>
          <div className="text-sm text-gray-500">Please wait while we set up your wallet</div>
        </div>
      </div>
    );
  }

  // Show error if derivation failed
  if (derivationError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <div className="text-xl mb-2">Error</div>
          <div>{derivationError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Send ETH</h1>
                {activeEvmAddress && (
                  <div className="text-sm text-gray-500">
                    From: {activeEvmAddress}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Recipient Address
                      <input
                        type="text"
                        value={toAddress}
                        onChange={(e) => setToAddress(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="0x..."
                        required
                      />
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (ETH)
                      <input
                        type="number"
                        step="0.000000000000000001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="0.0"
                        required
                      />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send ETH'}
                  </button>
                </form>
                {status && (
                  <div className={`mt-4 p-4 rounded-md ${
                    status.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                  }`}>
                    {status}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example usage:
// async function example() {
//   try {
//     // Send 1 WEI to an address
//     const toAddress = "0xdeADBeeF0000000000000000000000000b00B1e5";
//     const amountInWei = 1n; // 1 WEI
//     const result = await sendETH(toAddress, amountInWei);
//     console.log("Transaction result:", result);
//   } catch (error) {
//     console.error("Failed to send ETH:", error);
//   }
// }
