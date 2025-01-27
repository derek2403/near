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

    const checkAccountAvailability = async () => {
      try {
        setIsChecking(true);
        setError(null);

        const fullAccountId = `${accountId}.testnet`;
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
        
        if (data.error && data.error.cause && data.error.cause.name === 'UNKNOWN_ACCOUNT') {
          setIsAvailable(true);
        } else {
          setIsAvailable(false);
        }
      } catch (err) {
        console.error('Error checking account availability:', err);
        setError(err.message);
      } finally {
        setIsChecking(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkAccountAvailability();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [accountId]);

  const generateWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
      const fullAccountId = `${accountId}.testnet`;

      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io"
      };

      const near = await connect(connectionConfig);
      const keyPair = KeyPair.fromString(secretKey);
      await connectionConfig.keyStore.setKey("testnet", fullAccountId, keyPair);

      const account = await near.createAccount(fullAccountId, publicKey);

      const newWalletInfo = {
        accountId: fullAccountId,
        seedPhrase,
        publicKey,
        secretKey
      };

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
      const encryptedWallet = await encryptWalletData(walletInfo, password);
      localStorage.setItem('encryptedWallet', encryptedWallet);
      
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: walletInfo.accountId,
        publicKey: walletInfo.publicKey
      }));

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
    <div className="extension-container bg-gray-50">
      <Card className="mx-auto">
        <CardBody className="p-4">
          <h1 className="text-xl font-bold mb-3">Create New Account</h1>
          
          {error && (
            <div className="mb-4">
              <Card className="bg-danger-50 border-none">
                <CardBody className="text-danger py-2">
                  {error}
                </CardBody>
              </Card>
            </div>
          )}

          {!walletInfo ? (
            <div className="space-y-4">
              <Input
                label="Enter your Wallet Name"
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value.toLowerCase());
                  setIsAvailable(null);
                }}
                variant="bordered"
                endContent={<span className="text-gray-500">.testnet</span>}
              />

              {isChecking && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Spinner size="sm" />
                  <span>Checking availability...</span>
                </div>
              )}

              {isAvailable !== null && (
                <Card className={isAvailable ? "bg-success-50" : "bg-danger-50"}>
                  <CardBody className={isAvailable ? "text-success" : "text-danger"}>
                    {isAvailable
                      ? `${accountId}.testnet is available!`
                      : 'Account ID is taken. Try another.'}
                  </CardBody>
                </Card>
              )}

              <Button
                onPress={generateWallet}
                isDisabled={loading || !isAvailable || !accountId}
                color="primary"
                className="w-full"
                isLoading={loading}
              >
                Create Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-success-50 p-3 rounded-lg">
                <p className="text-success text-sm">Wallet Created Successfully!</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Account ID:</label>
                  <div className="flex items-center bg-gray-50 p-2 rounded">
                    <span className="flex-1 text-sm">{walletInfo.accountId}</span>
                    <button onClick={() => handleCopy(walletInfo.accountId, 'accountId')}>
                      {copiedStates.accountId ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Seed Phrase:</label>
                  <div className="flex items-center bg-gray-50 p-2 rounded">
                    <span className={`flex-1 text-sm ${!showSeedPhrase ? 'blur-sm' : ''}`}>
                      {walletInfo.seedPhrase}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleCopy(walletInfo.seedPhrase, 'seedPhrase')}>
                        {copiedStates.seedPhrase ? (
                          <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button onClick={() => setShowSeedPhrase(!showSeedPhrase)}>
                        {showSeedPhrase ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-red-600 text-sm">
                    ⚠️ Save this information securely. Never share your seed phrase!
                  </p>
                </div>

                <Button
                  color="primary"
                  className="w-full"
                  onPress={onOpen}
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Already have a wallet?{' '}
              <span
                onClick={() => router.push('/login')}
                className="text-primary cursor-pointer hover:underline"
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

// Utility functions
const encryptWalletData = async (walletInfo, password) => {
  // This is a placeholder - use proper encryption in production
  return btoa(JSON.stringify({
    data: walletInfo,
    timestamp: Date.now()
  }));
};

const hashPassword = async (password) => {
  // This is a placeholder - use proper hashing in production
  return btoa(password);
}; 