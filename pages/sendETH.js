import { useState } from 'react';
import dotenv from "dotenv";
import {
  setupAdapter,
} from "../near-ca/src";

dotenv.config();

// Constants from setup.ts
export const SEPOLIA_CHAIN_ID = 11155111;

async function sendETH(toAddress, amountInWei) {
  try {
    const accountId = process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID;
    const privateKey = process.env.NEXT_PUBLIC_NEAR_ACCOUNT_PRIVATE_KEY;
    const mpcContractId = process.env.NEXT_PUBLIC_MPC_CONTRACT_ID;

    if (!accountId || !mpcContractId) {
      throw new Error(`Missing required environment variables`);
    }

    // Setup the adapter exactly like send-eth.ts
    const evm = await setupAdapter({
      accountId,
      mpcContractId,
      privateKey,
    });

    // Use the exact same transaction structure as send-eth.ts
    const result = await evm.signAndSendTransaction({
      // Sending to provided address
      to: toAddress,
      // Amount in WEI
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Processing...');

    try {
      // Convert amount from ETH to WEI (1 ETH = 10^18 WEI)
      const amountInWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
      
      const result = await sendETH(toAddress, amountInWei);
      setStatus(`Transaction successful! Hash: ${result.hash}`);
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold mb-8">Send ETH</h1>
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
