import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Tabs, Tab, Textarea } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';

const { connect, keyStores, KeyPair } = nearAPI;

const FASTNEAR_API_URL = "https://test.api.fastnear.com"; // Using FastNear API testnet

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [passwordError, setPasswordError] = useState('');
  const [tempWalletInfo, setTempWalletInfo] = useState(null);

  const lookupAccountsByPublicKey = async (publicKey) => {
    try {
      const response = await fetch(`${FASTNEAR_API_URL}/v0/public_key/${publicKey}/all`);
      if (!response.ok) {
        throw new Error('Failed to lookup accounts');
      }
      const data = await response.json();
      console.log('FastNear API - Found accounts for public key:', data);
      return data.account_ids || [];
    } catch (error) {
      console.error('FastNear API - Error looking up accounts:', error);
      return [];
    }
  };

  const validateSeedPhrase = (phrase) => {
    const words = phrase.trim().split(/\s+/);
    return words.length === 12;
  };

  const validatePrivateKey = (key) => {
    // Check basic format first (ed25519: followed by 87 characters)
    if (!/^ed25519:[A-Za-z0-9]{87}$/.test(key)) {
      return false;
    }
    
    // Split by colon and check the part after it
    const [prefix, keyPart] = key.split(':');
    // Ensure no symbols in the key part
    return /^[A-Za-z0-9]+$/.test(keyPart);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      let keyPair;
      let publicKey;
      let finalAccountId;
      let walletInfo;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }

        // Validate seed phrase length
        if (!validateSeedPhrase(seedPhrase)) {
          throw new Error('Invalid seed phrase. Must be 12 words');
        }
        
        // Parse seed phrase and get key pair
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        
        // Continue with account lookup...
        const accounts = await lookupAccountsByPublicKey(publicKey);
        
        if (accounts.length === 0) {
          throw new Error('No accounts found. Please check your seed phrase and try again.');
        }
        
        finalAccountId = accounts.find(acc => acc.includes('.')) || accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey: publicKey.toString(),
          seedPhrase: seedPhrase,
          secretKey: parsedKey.secretKey,
          loginMethod: 'seedPhrase'
        };
        
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        // Validate private key format
        if (!validatePrivateKey(privateKey)) {
          throw new Error('Invalid private key format. Must be in format: ed25519:followed by 87 characters');
        }

        // Create key pair from private key
        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
        
        // Continue with account lookup...
        const accounts = await lookupAccountsByPublicKey(publicKey);

        if (accounts.length === 0) {
          throw new Error('No accounts found. Please check your private key and try again.');
        }
        
        finalAccountId = accounts.find(acc => acc.includes('.')) || accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey: publicKey.toString(),
          secretKey: privateKey,
          seedPhrase: null,
          loginMethod: 'privateKey'
        };
      }

      // Store temporarily and open password modal
      setTempWalletInfo(walletInfo);
      setLoggedInAccount(finalAccountId);
      onOpen();

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      // Store encrypted wallet info
      const encryptedWallet = await encryptWalletData(tempWalletInfo, password);
      localStorage.setItem('encryptedWallet', encryptedWallet);
      
      // Store public info separately
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: tempWalletInfo.accountId,
        publicKey: tempWalletInfo.publicKey,
        loginMethod: tempWalletInfo.loginMethod // Add login method to public info
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

  // Add utility functions for encryption (same as createWallet.js)
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

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto md:max-w-2xl">
        <CardBody className="p-8">
          <h1 className="text-2xl font-bold mb-6">Login to NEAR Wallet</h1>

          {error && (
            <Card className="bg-danger-50 border-none mb-4">
              <CardBody className="text-danger py-2">
                {error}
              </CardBody>
            </Card>
          )}

          <div className="space-y-6">
            <Tabs
              selectedKey={loginMethod}
              onSelectionChange={setLoginMethod}
              variant="bordered"
              fullWidth
              classNames={{
                tabList: "gap-4",
                cursor: "w-full bg-primary",
                tab: "h-10",
                tabContent: "group-data-[selected=true]:text-white"
              }}
            >
              <Tab key="seedPhrase" title="Seed Phrase">
                <div className="pt-4">
                  <Input
                    label="Enter your seed phrase (12 words separated by spaces)"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    variant="bordered"
                    className="w-full"
                    type={showSeedPhrase ? "text" : "password"}
                    endContent={
                      <button
                        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                        className="focus:outline-none"
                      >
                        {showSeedPhrase ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    }
                  />
                </div>
              </Tab>
              <Tab key="privateKey" title="Private Key">
                <div className="pt-4">
                  <Input
                    type={showPrivateKey ? "text" : "password"}
                    label="Enter your private key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    variant="bordered"
                    className="w-full"
                    endContent={
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="focus:outline-none"
                      >
                        {showPrivateKey ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                    }
                  />
                </div>
              </Tab>
            </Tabs>

            <Button
              onPress={handleLogin}
              isDisabled={loading}
              color="primary"
              className="w-full"
              size="lg"
              isLoading={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a wallet?{' '}
              <span
                onClick={() => router.push('/createWallet')}
                style={{
                  color: "#0070f3",
                  cursor: "pointer"
                }}
              >
                Create one here
              </span>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Add CreatePassword modal */}
      <CreatePassword 
        isOpen={isOpen} 
        onClose={onClose}
        onSubmit={handleSetPassword}
        error={passwordError}
      />
    </div>
  );
}
