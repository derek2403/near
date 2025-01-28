import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { Input, Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';

const { connect, keyStores, KeyPair } = nearAPI;

const FASTNEAR_API_URL = "https://test.api.fastnear.com";

export default function Login({ router }) {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState(null);
  const [loggedInAccount, setLoggedInAccount] = useState(null);

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
      return data.account_ids || [];
    } catch (error) {
      console.error('FastNear API - Error looking up accounts:', error);
      return [];
    }
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
        
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        
        const accounts = await lookupAccountsByPublicKey(publicKey);
        
        if (accounts.length === 0) {
          finalAccountId = seedPhrase.split(' ')[0] + '.testnet';
        } else {
          finalAccountId = accounts.find(acc => acc.includes('.')) || accounts[0];
        }
        
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

        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
        
        const accounts = await lookupAccountsByPublicKey(publicKey);

        if (accounts.length === 0) {
          throw new Error('No accounts found for this private key');
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

      setTempWalletInfo(walletInfo);
      setLoggedInAccount(finalAccountId);
      onOpen();

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      const encryptedWallet = await encryptWalletData(tempWalletInfo, password);
      const passwordHash = await hashPassword(password);
      
      chrome.storage.local.set({
        encryptedWallet: encryptedWallet,
        passwordHash: passwordHash,
        publicWalletInfo: JSON.stringify({
          accountId: tempWalletInfo.accountId,
          publicKey: tempWalletInfo.publicKey,
          loginMethod: tempWalletInfo.loginMethod
        })
      }, () => {
        onClose();
        router.push('dashboard');
      });
    } catch (error) {
      setPasswordError('Error securing wallet');
      console.error(error);
    }
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
              Don&apos;t have a wallet?{' '}
              <span
                onClick={() => router.push('createWallet')}
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

      <CreatePassword 
        isOpen={isOpen} 
        onClose={onClose}
        onSubmit={handleSetPassword}
        error={passwordError}
      />
    </div>
  );
}

const encryptWalletData = async (walletInfo, password) => {
  return btoa(JSON.stringify({
    data: walletInfo,
    timestamp: Date.now()
  }));
};

const hashPassword = async (password) => {
  return btoa(password);
};
