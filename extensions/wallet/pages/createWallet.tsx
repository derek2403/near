import { useState } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";
import { EyeIcon, EyeSlashIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { Input, Button, Card, CardBody, Spinner } from "@nextui-org/react";
import { navigateTo } from '../utils/navigation';
import CreatePassword from '../components/CreatePassword';
import { WalletInfo } from '../types';

const { connect, keyStores } = nearAPI;

export default function CreateWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [accountId, setAccountId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedStates, setCopiedStates] = useState({
    seedPhrase: false,
    privateKey: false,
    publicKey: false,
    accountId: false
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [walletToEncrypt, setWalletToEncrypt] = useState<WalletInfo | null>(null);

  const checkAccountAvailability = async () => {
    try {
      setIsChecking(true);
      setError(null);

      const fullAccountId = `${accountId}.testnet`;
      console.log(`Checking availability for account: ${fullAccountId}`);

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
      console.error('Error checking account:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopy = async (text: string | undefined, field: keyof typeof copiedStates) => {
    if (!text) return;
    
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

  const handleBack = () => {
    navigateTo('home');
  };

  const validateAccountId = (id: string) => {
    if (id.length < 2) return 'Account ID must be at least 2 characters';
    if (id.length > 64) return 'Account ID must be less than 64 characters';
    if (!/^[a-z\d]+[-_]*[a-z\d]+$/.test(id)) {
      return 'Account ID can only contain lowercase letters, digits, - and _';
    }
    return '';
  };

  const handleCreateWallet = async (_password: string) => {
    setError('');
    setLoading(true);

    try {
      if (!walletToEncrypt) {
        throw new Error('No wallet information to encrypt');
      }

      await chrome.storage.local.set({
        walletInfo: {
          ...walletToEncrypt,
          loginMethod: 'create'
        }
      });

      navigateTo('dashboard');
    } catch (err) {
      console.error('Wallet creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const validateAndProceed = async () => {
    const validationError = validateAccountId(accountId);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Generate new keypair and seed phrase
      const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
      
      // Setup connection to NEAR
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
      };

      // Connect to NEAR
      const near = await connect(connectionConfig);
      
      // Create KeyPair and add it to KeyStore
      const keyPair = nearAPI.utils.KeyPair.fromString(secretKey);
      await connectionConfig.keyStore.setKey("testnet", accountId, keyPair);

      setWalletToEncrypt({
        accountId,
        publicKey,
        secretKey,
        seedPhrase
      });

      setShowPasswordModal(true);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <Button
        onPress={handleBack}
        variant="light"
        className="mb-4"
        size="sm"
      >
        ← Back
      </Button>
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <h1 className="text-xl font-bold mb-4">Create New Account</h1>
          <p className="text-gray-600 mb-6 text-sm">
            Enter an Account ID to use with your NEAR account.
          </p>

          {error && (
            <Card className="bg-danger-50 border-none mb-4">
              <CardBody className="text-danger py-2 text-sm">
                {error}
              </CardBody>
            </Card>
          )}

          {!walletInfo && (
            <div className="space-y-4">
              <Input
                label="Enter your Wallet Name"
                value={accountId}
                onChange={(e) => {
                  setAccountId(e.target.value.toLowerCase());
                  setIsAvailable(null);
                }}
                onBlur={checkAccountAvailability}
                variant="bordered"
                endContent={<span className="text-gray-500">.testnet</span>}
                className="max-w-full"
              />

              {isChecking && (
                <div className="text-gray-600 text-sm flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Checking availability...</span>
                </div>
              )}

              {isAvailable !== null && (
                <Card className={isAvailable ? "bg-success-50" : "bg-danger-50"}>
                  <CardBody className={`${isAvailable ? "text-success" : "text-danger"} text-sm`}>
                    {isAvailable
                      ? `${accountId}.testnet is available`
                      : 'Account ID is taken'}
                  </CardBody>
                </Card>
              )}

              <Button
                onPress={validateAndProceed}
                isDisabled={loading || !isAvailable || !accountId}
                color="primary"
                className="w-full"
                size="lg"
                isLoading={loading}
              >
                Continue
              </Button>
            </div>
          )}

          {walletInfo && (
            <div className="space-y-4">
              <Card className="bg-success-50 border-none">
                <CardBody className="text-success text-sm">
                  Wallet Created Successfully!
                </CardBody>
              </Card>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account ID:</label>
                  <div className="flex items-center bg-white p-2 rounded-lg border">
                    <p className="text-sm flex-1">{walletInfo.accountId}</p>
                    <button
                      onClick={() => handleCopy(walletInfo.accountId, 'accountId')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.accountId ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seed Phrase:</label>
                  <div className="flex items-center bg-white p-2 rounded-lg border">
                    <p className={`text-sm flex-1 break-all ${!showSeedPhrase ? 'blur-sm' : ''}`}>
                      {walletInfo.seedPhrase}
                    </p>
                    <button
                      onClick={() => handleCopy(walletInfo.seedPhrase, 'seedPhrase')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.seedPhrase ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {showSeedPhrase ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Private Key:</label>
                  <div className="flex items-center bg-white p-2 rounded-lg border">
                    <p className={`text-sm flex-1 break-all ${!showPrivateKey ? 'blur-sm' : ''}`}>
                      {walletInfo.secretKey}
                    </p>
                    <button
                      onClick={() => handleCopy(walletInfo.secretKey, 'privateKey')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.privateKey ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPrivateKey ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Key:</label>
                  <div className="flex items-center bg-white p-2 rounded-lg border">
                    <p className="text-sm flex-1 break-all">{walletInfo.publicKey}</p>
                    <button
                      onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.publicKey ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Card className="bg-red-50 border-none">
                  <CardBody className="text-red-600 text-sm">
                    ⚠️ Store this information securely. Never share your private key or seed phrase!
                  </CardBody>
                </Card>

                <div className="flex flex-col space-y-2 mt-4">
                  <Button
                    onPress={() => navigateTo('home')}
                    color="primary"
                    className="w-full"
                    size="lg"
                  >
                    Done
                  </Button>
                  <Button
                    onPress={() => {
                      setWalletInfo(null);
                      setAccountId('');
                      setIsAvailable(null);
                      setError(null);
                    }}
                    variant="bordered"
                    className="w-full"
                    size="lg"
                  >
                    Create Another Wallet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <CreatePassword
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleCreateWallet}
        error={error || undefined}
      />
    </div>
  );
} 