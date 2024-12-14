import { useState } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";

const { connect, keyStores, KeyPair } = nearAPI;

export default function CreateWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);

  const checkAccountAvailability = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const fullAccountId = `${accountId}.testnet`;
      console.log(`Checking availability for account: ${fullAccountId}`);
      
      // Use NEAR RPC endpoint to check account
      const response = await fetch('https://rpc.testnet.near.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'dontcare',
          method: 'query',
          params: {
            request_type: 'view_account',
            finality: 'final',
            account_id: fullAccountId
          }
        })
      });

      const data = await response.json();
      console.log('RPC response:', data);
      
      // If we get an error about account not existing, then it's available
      if (data.error && data.error.cause && data.error.cause.name === 'UNKNOWN_ACCOUNT') {
        console.log(`Account ${fullAccountId} does not exist - IS available`);
        setIsAvailable(true);
      } else {
        console.log(`Account ${fullAccountId} exists - NOT available`);
        setIsAvailable(false);
      }

    } catch (err) {
      console.error('Error checking account availability:', err);
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  const generateWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a new key pair and seed phrase
      const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
      
      const fullAccountId = `${accountId}.testnet`;

      // Initialize connection to NEAR testnet
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io"
      };

      const near = await connect(connectionConfig);
      
      // Set up the key pair
      const keyPair = KeyPair.fromString(secretKey);
      const keyStore = new keyStores.InMemoryKeyStore();
      await keyStore.setKey("testnet", fullAccountId, keyPair);

      // Create the account
      const account = await near.createAccount(fullAccountId, publicKey);

      // Save wallet info to state
      setWalletInfo({
        accountId: fullAccountId,
        seedPhrase,
        publicKey,
        secretKey
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">Generate NEAR Wallet</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {!walletInfo && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value.toLowerCase());
                  setIsAvailable(null);
                }}
                placeholder="Enter desired account name"
                className="flex-1 p-2 border rounded"
              />
              <span className="p-2 bg-gray-100 rounded">.testnet</span>
            </div>

            <button
              onClick={checkAccountAvailability}
              disabled={isChecking || !accountId}
              className={`w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors ${
                isChecking || !accountId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isChecking ? 'Checking...' : 'Check Availability'}
            </button>

            {isAvailable !== null && (
              <div className={`p-3 rounded ${isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isAvailable ? 'Account name is available!' : 'Account name is already taken'}
              </div>
            )}

            <button
              onClick={generateWallet}
              disabled={loading || !isAvailable || !accountId}
              className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
                loading || !isAvailable || !accountId ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Generating Wallet...' : 'Generate New Wallet'}
            </button>
          </div>
        )}

        {walletInfo && (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Wallet Generated Successfully!
            </div>
            
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h2 className="font-semibold text-yellow-800 mb-2">
                Important: Save This Information
              </h2>
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account ID:</label>
                  <p className="mt-1 text-sm bg-white p-2 rounded border">{walletInfo.accountId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seed Phrase:</label>
                  <p className="mt-1 text-sm bg-white p-2 rounded border break-all">
                    {walletInfo.seedPhrase}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Public Key:</label>
                  <p className="mt-1 text-sm bg-white p-2 rounded border break-all">
                    {walletInfo.publicKey}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600 text-sm font-medium">
                    ⚠️ Warning: Store this information securely. You'll need it to access your wallet!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setWalletInfo(null);
                setError(null);
              }}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              Generate Another Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}