import { useState } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";

const { connect, keyStores, KeyPair } = nearAPI;

export default function CreateWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);

  const generateWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Generate a new key pair and seed phrase
      const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
      
      // Generate a random account name
      const accountId = `wallet${Math.floor(Math.random() * 100000)}.testnet`;

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
      await keyStore.setKey("testnet", accountId, keyPair);

      // Create the account
      const account = await near.createAccount(accountId, publicKey);

      // Save wallet info to state
      setWalletInfo({
        accountId,
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

        {!walletInfo ? (
          <button
            onClick={generateWallet}
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Generating Wallet...' : 'Generate New Wallet'}
          </button>
        ) : (
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