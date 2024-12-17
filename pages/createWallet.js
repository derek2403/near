import { useState, useEffect } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";
import { EyeIcon, EyeSlashIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';
import { Input, Button, Card, CardBody } from "@nextui-org/react";

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
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
            </div>
          )}

          {!walletInfo && (
            <div>
              <div className="mb-6">
                <Input
                  label="Account ID"
                  value={accountId}
                  onChange={(e) => {
                    setAccountId(e.target.value.toLowerCase());
                    setIsAvailable(null);
                  }}
                  placeholder="yourname"
                  variant="bordered"
                  endContent={<span className="text-gray-500">.testnet</span>}
                  className="max-w-full"
                />
              </div>

              {isChecking && (
                <div className="text-gray-600 mb-4">
                  Checking availability...
                </div>
              )}

              {isAvailable !== null && (
                <div className={`p-3 rounded-lg mb-6 ${isAvailable
                    ? 'bg-green-50 text-green-600 border border-green-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                  {isAvailable
                    ? `Congrats! ${accountId}.testnet is available.`
                    : 'Account ID is taken. Try something else.'}
                </div>
              )}

              <Button
                onClick={generateWallet}
                isDisabled={loading || !isAvailable || !accountId}
                color="primary"
                className="w-full"
                size="lg"
              >
                {loading ? 'Generating Wallet...' : 'Generate New Wallet'}
              </Button>
            </div>
          )}

          {walletInfo && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                Wallet Generated Successfully!
              </div>
              
              <Card className="bg-yellow-50 border-yellow-200">
                <CardBody className="p-6">
                  <h2 className="font-semibold text-yellow-800 mb-4">
                    Important: Save This Information
                  </h2>
                  <div className="space-y-4">
                    <Input
                      label="Account ID"
                      value={walletInfo.accountId}
                      isReadOnly
                      variant="bordered"
                      endContent={
                        <button
                          onClick={() => handleCopy(walletInfo.accountId, 'accountId')}
                          className="focus:outline-none"
                        >
                          {copiedStates.accountId ? (
                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardIcon className="h-5 w-5" />
                          )}
                        </button>
                      }
                    />

                    <Input
                      label="Seed Phrase"
                      value={walletInfo.seedPhrase}
                      isReadOnly
                      type={showSeedPhrase ? "text" : "password"}
                      variant="bordered"
                      endContent={
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(walletInfo.seedPhrase, 'seedPhrase')}
                            className="focus:outline-none"
                          >
                            {copiedStates.seedPhrase ? (
                              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <ClipboardIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                            className="focus:outline-none"
                          >
                            {showSeedPhrase ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      }
                    />

                    <Input
                      label="Private Key"
                      value={walletInfo.secretKey}
                      isReadOnly
                      type={showPrivateKey ? "text" : "password"}
                      variant="bordered"
                      endContent={
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopy(walletInfo.secretKey, 'privateKey')}
                            className="focus:outline-none"
                          >
                            {copiedStates.privateKey ? (
                              <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <ClipboardIcon className="h-5 w-5" />
                            )}
                          </button>
                          <button
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="focus:outline-none"
                          >
                            {showPrivateKey ? (
                              <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      }
                    />

                    <Input
                      label="Public Key"
                      value={walletInfo.publicKey}
                      isReadOnly
                      variant="bordered"
                      endContent={
                        <button
                          onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}
                          className="focus:outline-none"
                        >
                          {copiedStates.publicKey ? (
                            <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <ClipboardIcon className="h-5 w-5" />
                          )}
                        </button>
                      }
                    />

                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium">
                        ⚠️ Warning: Store this information securely. Never share your private key or seed phrase with anyone!
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={onOpen}
                  color="primary"
                  size="lg"
                >
                  Go to Dashboard
                </Button>

                <Button
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
                  color="default"
                  variant="bordered"
                  size="lg"
                >
                  Generate Another Wallet
                </Button>
              </div>
            </div>
          )}
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