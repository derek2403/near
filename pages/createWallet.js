import { useState, useEffect } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";
import { EyeIcon, EyeSlashIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';
import { Input, Button, Card, CardBody, Spinner } from "@nextui-org/react";

const { connect, keyStores, KeyPair } = nearAPI;

export default function CreateWallet() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    seedPhrase: false,
    privateKey: false,
    publicKey: false,
    accountId: false
  });
  const [passwordError, setPasswordError] = useState('');

  const {isOpen, onOpen, onClose} = useDisclosure();

  useEffect(() => {
    if (!accountId) {
      setIsAvailable(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkAccountAvailability();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [accountId]);

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

      // Create wallet info object
      const newWalletInfo = {
        accountId: fullAccountId,
        seedPhrase,
        publicKey,
        secretKey
      };

      // Just set the wallet info, don't show modal here
      setWalletInfo(newWalletInfo);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      // Store encrypted wallet info
      const encryptedWallet = await encryptWalletData(walletInfo, password);
      localStorage.setItem('encryptedWallet', encryptedWallet);
      
      // Store public info separately
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: walletInfo.accountId,
        publicKey: walletInfo.publicKey
      }));

      // Store password hash for verification
      const passwordHash = await hashPassword(password);
      localStorage.setItem('passwordHash', passwordHash);

      onClose();
      router.push('/dashboard');
    } catch (error) {
      setPasswordError('Error securing wallet');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto md:max-w-2xl">
        <CardBody className="p-8">
          <h1 className="text-2xl font-bold mb-4">Create New Account</h1>
          <p className="text-gray-600 mb-8">
            Enter an Account ID to use with your NEAR account. Your Account ID will be used for all NEAR operations, including sending and receiving assets.
          </p>

          {error && (
            <div className="mb-6">
              <Card className="bg-danger-50 border-none">
                <CardBody className="text-danger">
                  {error}
                </CardBody>
              </Card>
            </div>
          )}

          {!walletInfo && (
            <div>
              <div className="mb-6">
                <Input
                  label="Enter your Wallet Name"
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value.toLowerCase());
                    setIsAvailable(null);
                  }}
                  variant="bordered"
                  endContent={<span className="text-gray-500">.testnet</span>}
                  className="max-w-full"
                />
              </div>

              {isChecking && (
                <div className="text-gray-600 mb-4 flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Checking availability...</span>
                </div>
              )}

              {isAvailable !== null && (
                <div className="mb-6">
                  <Card className={isAvailable ? "bg-success-50" : "bg-danger-50"}>
                    <CardBody className={isAvailable ? "text-success" : "text-danger"}>
                      {isAvailable
                        ? `Congrats! ${accountId}.testnet is available.`
                        : 'Account ID is taken. Try something else.'}
                    </CardBody>
                  </Card>
                </div>
              )}

              <Button
                onPress={generateWallet}
                isDisabled={loading || !isAvailable || !accountId}
                color="primary"
                className="w-full"
                size="lg"
                isLoading={loading}
                spinner={<Spinner color="white" size="sm" />}
              >
                Generate New Wallet
              </Button>
            </div>
          )}

          {walletInfo && (
            <div className="space-y-6">
              <Card className="bg-success-50 border-none">
                <CardBody className="text-success">
                  Wallet Generated Successfully!
                </CardBody>
              </Card>
              
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h2 className="font-semibold text-yellow-800 mb-4">
                  Important: Save This Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account ID:</label>
                    <div className="flex items-center bg-white p-3 rounded-lg border">
                      <p className="text-sm flex-1">{walletInfo.accountId}</p>
                      <button
                        onClick={() => handleCopy(walletInfo.accountId, 'accountId')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedStates.accountId ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seed Phrase:</label>
                    <div className="flex items-center bg-white p-3 rounded-lg border">
                      <p className={`text-sm flex-1 break-all ${!showSeedPhrase ? 'blur-sm' : ''}`}>
                        {walletInfo.seedPhrase}
                      </p>
                      <button
                        onClick={() => handleCopy(walletInfo.seedPhrase, 'seedPhrase')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedStates.seedPhrase ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showSeedPhrase ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Private Key:</label>
                    <div className="flex items-center bg-white p-3 rounded-lg border">
                      <p className={`text-sm flex-1 break-all ${!showPrivateKey ? 'blur-sm' : ''}`}>
                        {walletInfo.secretKey}
                      </p>
                      <button
                        onClick={() => handleCopy(walletInfo.secretKey, 'privateKey')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedStates.privateKey ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPrivateKey ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Key:</label>
                    <div className="flex items-center bg-white p-3 rounded-lg border">
                      <p className="text-sm flex-1 break-all">{walletInfo.publicKey}</p>
                      <button
                        onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedStates.publicKey ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium">
                      ⚠️ Warning: Store this information securely. Never share your private key or seed phrase with anyone!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  onClick={onOpen}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={() => {
                    setWalletInfo(null);
                    setError(null);
                    setShowSeedPhrase(false);
                    setShowPrivateKey(false);
                    setCopiedStates({
                      seedPhrase: false,
                      privateKey: false,
                      publicKey: false,
                      accountId: false
                    });
                  }}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Generate Another Wallet
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a wallet?{' '}
              <span
                onClick={() => router.push('/login')}
                style={{
                  color: "#0070f3",
                  cursor: "pointer"
                }}
              >
                Login here
              </span>
            </p>
          </div>
        </CardBody>
      </Card>
      <CreatePassword 
        isOpen={isOpen} 
        onClose={onClose}
        onSubmit={handleSetPassword}
        error={passwordError}
      />
    </div>
  );
}

// Utility functions for encryption
const encryptWalletData = async (walletInfo, password) => {
  // Implementation using a proper encryption library
  // This is a placeholder - use proper encryption in production
  return btoa(JSON.stringify({
    data: walletInfo,
    timestamp: Date.now()
  }));
};

const hashPassword = async (password) => {
  // Implementation using proper password hashing
  // This is a placeholder - use proper hashing in production
  return btoa(password);
};