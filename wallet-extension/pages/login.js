import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';

const { connect, keyStores, KeyPair } = nearAPI;

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [passwordError, setPasswordError] = useState('');
  const [tempWalletInfo, setTempWalletInfo] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      let keyPair;
      let publicKey;
      let walletInfo;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }
        
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        
        const provider = new nearAPI.providers.JsonRpcProvider({
          url: "https://rpc.testnet.near.org"
        });

        // Get account ID from public key
        const response = await fetch(
          `https://test.api.fastnear.com/v0/public_key/${publicKey}/all`
        );
        const data = await response.json();
        
        if (!data.account_ids?.length) {
          throw new Error('No accounts found for this seed phrase');
        }

        const accountId = data.account_ids[0];
        
        walletInfo = {
          accountId,
          publicKey: publicKey.toString(),
          seedPhrase,
          secretKey: parsedKey.secretKey
        };
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
        
        const response = await fetch(
          `https://test.api.fastnear.com/v0/public_key/${publicKey}/all`
        );
        const data = await response.json();

        if (!data.account_ids?.length) {
          throw new Error('No accounts found for this private key');
        }

        const accountId = data.account_ids[0];
        
        walletInfo = {
          accountId,
          publicKey,
          secretKey: privateKey,
          seedPhrase: null
        };
      }

      setTempWalletInfo(walletInfo);
      onOpen();

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      const encryptedWallet = await encryptWalletData(tempWalletInfo, password);
      localStorage.setItem('encryptedWallet', encryptedWallet);
      
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: tempWalletInfo.accountId,
        publicKey: tempWalletInfo.publicKey
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
          <h1 className="text-xl font-bold mb-4">Import Wallet</h1>

          {error && (
            <div className="mb-4">
              <Card className="bg-danger-50 border-none">
                <CardBody className="text-danger py-2">
                  {error}
                </CardBody>
              </Card>
            </div>
          )}

          <Tabs
            selectedKey={loginMethod}
            onSelectionChange={setLoginMethod}
            variant="bordered"
            fullWidth
            size="sm"
          >
            <Tab key="seedPhrase" title="Seed Phrase">
              <div className="pt-4">
                <Input
                  type={showSeedPhrase ? "text" : "password"}
                  label="Enter your seed phrase"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  endContent={
                    <button onClick={() => setShowSeedPhrase(!showSeedPhrase)}>
                      {showSeedPhrase ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
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
                  endContent={
                    <button onClick={() => setShowPrivateKey(!showPrivateKey)}>
                      {showPrivateKey ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              </div>
            </Tab>
          </Tabs>

          <Button
            color="primary"
            className="w-full mt-4"
            onPress={handleLogin}
            isLoading={loading}
          >
            Import Wallet
          </Button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have a wallet?{' '}
              <span
                onClick={() => router.push('/createWallet')}
                className="text-primary cursor-pointer hover:underline"
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