import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';

const { connect, keyStores, KeyPair } = nearAPI;

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase'); // or 'privateKey'
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const [accountId, setAccountId] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let keyPair;
      let publicKey;
      
      // Handle login based on method
      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }
        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
      }

      // Initialize connection to NEAR
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io"
      };

      const near = await connect(connectionConfig);
      
      let finalAccountId;
      
      if (loginMethod === 'seedPhrase') {
        // For seed phrase, try to extract account ID from the first word
        finalAccountId = seedPhrase.split(' ')[0] + '.testnet';
      } else {
        if (!accountId.trim()) {
          throw new Error('Please enter your account ID');
        }
        finalAccountId = accountId.trim() + '.testnet';
      }

      // Verify the account exists and the key pair matches
      try {
        const account = await near.account(finalAccountId);
        await account.state(); // This will throw if account doesn't exist
        
        // Store the key in keyStore
        await connectionConfig.keyStore.setKey("testnet", finalAccountId, keyPair);

        // Store account ID and private key in localStorage
        localStorage.setItem('nearAccountId', finalAccountId);
        localStorage.setItem('nearPrivateKey', keyPair.toString());

        console.log('Login successful');
        console.log('Account ID:', finalAccountId);
        setLoggedInAccount(finalAccountId);
        console.log('LoggedInAccount state set to:', finalAccountId);

        // Redirect to transfer page
        router.push('/transfer');
      } catch (accountErr) {
        console.error('Account verification error:', accountErr);
        throw new Error('Unable to verify account. Please check your credentials.');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-6">Login to NEAR Wallet</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {loggedInAccount && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="text-green-600 font-medium mb-2">
                Successfully logged in!
              </div>
              <div className="text-gray-700 mb-4">
                Account: <span className="font-mono font-medium">{loggedInAccount}</span>
              </div>
              <button
                onClick={() => router.push('/transfer')}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                Go to Transfer Page
              </button>
            </div>
          </div>
        )}

        {!loggedInAccount && (
          <div className="mb-4">
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setLoginMethod('seedPhrase')}
                className={`flex-1 py-2 px-4 rounded ${
                  loginMethod === 'seedPhrase'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Seed Phrase
              </button>
              <button
                onClick={() => setLoginMethod('privateKey')}
                className={`flex-1 py-2 px-4 rounded ${
                  loginMethod === 'privateKey'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Private Key
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginMethod === 'seedPhrase' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your 12-word seed phrase
                  </label>
                  <textarea
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    className="w-full p-2 border rounded min-h-[100px]"
                    placeholder="Enter your seed phrase (12 words separated by spaces)"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your private key
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    placeholder="Enter your private key"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter your account ID
                  </label>
                  <input
                    type="text"
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="example (without .testnet)"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        )}

        {!loggedInAccount && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don't have a wallet?{' '}
              <button
                onClick={() => router.push('/createWallet')}
                className="text-blue-500 hover:text-blue-600"
              >
                Create one here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
