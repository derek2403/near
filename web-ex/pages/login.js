import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';
import { extensionRouter } from '../utils/extensionRouter';
import { storage, crypto } from '../utils/storage';

const { connect, keyStores, KeyPair } = nearAPI;

const FASTNEAR_API_URL = "https://test.api.fastnear.com";

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [passwordError, setPasswordError] = useState('');
  const [tempWalletInfo, setTempWalletInfo] = useState(null);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      let keyPair;
      let publicKey;
      let finalAccountId;
      let walletInfo;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }
        
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        
        const accounts = await lookupAccountsByPublicKey(publicKey);
        if (accounts.length === 0) {
          throw new Error('No accounts found for this seed phrase');
        }
        finalAccountId = accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey,
          privateKey: parsedKey.secretKey,
          seedPhrase,
          loginMethod: 'seedPhrase'
        };
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
        
        const accounts = await lookupAccountsByPublicKey(publicKey);
        if (accounts.length === 0) {
          throw new Error('No accounts found for this private key');
        }
        finalAccountId = accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey,
          privateKey,
          loginMethod: 'privateKey'
        };
      }

      setTempWalletInfo(walletInfo);
      onOpen(); // Open password modal

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const lookupAccountsByPublicKey = async (publicKey) => {
    try {
      const response = await fetch(`${FASTNEAR_API_URL}/v0/public_key/${publicKey}/all`);
      if (!response.ok) {
        throw new Error('Failed to lookup accounts');
      }
      const data = await response.json();
      return data.account_ids || [];
    } catch (error) {
      console.error('FastNear API - Error looking up accounts:', error);
      return [];
    }
  };

  const handleSetPassword = async (password) => {
    try {
      console.log('Setting up wallet with password...');
      
      // Encrypt wallet info
      const encryptedWallet = await crypto.encrypt(tempWalletInfo, password);
      
      // Store public info first
      const publicInfo = {
        accountId: tempWalletInfo.accountId,
        publicKey: tempWalletInfo.publicKey,
        loginMethod: tempWalletInfo.loginMethod
      };
      
      console.log('Storing public wallet info...');
      await storage.set('publicWalletInfo', publicInfo);
      
      console.log('Storing encrypted wallet...');
      await storage.set('encryptedWallet', encryptedWallet);

      console.log('Wallet setup complete, navigating to dashboard...');
      onClose();
      
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      if (isExtension) {
        extensionRouter.replace('dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error in handleSetPassword:', error);
      setPasswordError('Error securing wallet');
    }
  };

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <h1 className="text-2xl font-bold mb-4">Login to NEAR Wallet</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <Tabs 
              selectedKey={loginMethod}
              onSelectionChange={setLoginMethod}
              variant="bordered"
              fullWidth
            >
              <Tab key="seedPhrase" title="Seed Phrase">
                <div className="pt-4">
                  <Input
                    label="Enter your seed phrase"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    type={showSeedPhrase ? "text" : "password"}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      >
                        {showSeedPhrase ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    }
                  />
                </div>
              </Tab>
              <Tab key="privateKey" title="Private Key">
                <div className="pt-4">
                  <Input
                    label="Enter your private key"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    type={showPrivateKey ? "text" : "password"}
                    endContent={
                      <button
                        type="button"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    }
                  />
                </div>
              </Tab>
            </Tabs>

            <Button
              onClick={handleLogin}
              isLoading={loading}
              disabled={loading}
              color="primary"
              className="w-full"
              size="lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have a wallet?{' '}
              <span
                onClick={() => {
                  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
                  if (isExtension) {
                    extensionRouter.replace('createWallet');
                  } else {
                    router.push('/createWallet');
                  }
                }}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                Create one here
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
