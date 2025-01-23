import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { Card, CardBody, Button, Input, Tabs, Tab } from "@nextui-org/react";
import { navigateTo } from '../utils/navigation';
import { LockIcon } from '../public/icons/LockIcon';
import CreatePassword from '../components/CreatePassword';

const { connect, keyStores } = nearAPI;

export default function Login() {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'seedPhrase' | 'privateKey'>('seedPhrase');
  const [walletToEncrypt, setWalletToEncrypt] = useState<any>(null);

  const handleLogin = async (password: string) => {
    setError('');
    setIsLoading(true);

    try {
      if (!walletToEncrypt) {
        throw new Error('No wallet information to encrypt');
      }

      // Store wallet info in Chrome storage
      await chrome.storage.local.set({
        walletInfo: {
          ...walletToEncrypt,
          loginMethod
        }
      });

      navigateTo('dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  const validateAndProceed = async () => {
    setError('');
    setIsLoading(true);

    try {
      let accountId, keyPair;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }

        const { secretKey, publicKey } = parseSeedPhrase(seedPhrase);
        keyPair = nearAPI.utils.KeyPair.fromString(secretKey);

        // Setup connection to NEAR
        const connectionConfig = {
          networkId: "testnet",
          keyStore: new keyStores.InMemoryKeyStore(),
          nodeUrl: "https://rpc.testnet.near.org",
        };

        // Connect to NEAR
        const near = await connect(connectionConfig);
        
        // Get account ID from public key
        const pubKey = keyPair.getPublicKey();
        accountId = Buffer.from(pubKey.data).toString('hex');

        setWalletToEncrypt({
          accountId,
          publicKey: publicKey,
          secretKey: secretKey,
          seedPhrase
        });

      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        keyPair = nearAPI.utils.KeyPair.fromString(privateKey);
        const pubKey = keyPair.getPublicKey();
        accountId = Buffer.from(pubKey.data).toString('hex');

        setWalletToEncrypt({
          accountId,
          publicKey: pubKey.toString(),
          secretKey: privateKey
        });
      }

      setShowPasswordModal(true);
    } catch (err) {
      console.error('Validation error:', err);
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[600px] p-6 bg-gray-50">
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Login to your NEAR wallet</p>
          </div>

          <Tabs 
            aria-label="Login options" 
            selectedKey={loginMethod}
            onSelectionChange={(key) => setLoginMethod(key as 'seedPhrase' | 'privateKey')}
            className="mb-6"
          >
            <Tab key="seedPhrase" title="Seed Phrase">
              <div className="py-4">
                <Input
                  label="Enter your seed phrase"
                  placeholder="Enter your 12-word seed phrase"
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  type="text"
                  variant="bordered"
                  className="mb-4"
                />
              </div>
            </Tab>
            <Tab key="privateKey" title="Private Key">
              <div className="py-4">
                <Input
                  label="Enter your private key"
                  placeholder="Enter your private key"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  type="text"
                  variant="bordered"
                  className="mb-4"
                />
              </div>
            </Tab>
          </Tabs>

          {error && (
            <div className="mb-4 p-3 bg-danger-50 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              color="primary"
              className="w-full"
              onPress={validateAndProceed}
              isLoading={isLoading}
            >
              Continue
            </Button>
            <Button
              variant="light"
              className="w-full"
              onPress={() => navigateTo('home')}
            >
              Back
            </Button>
          </div>
        </CardBody>
      </Card>

      <CreatePassword
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleLogin}
        error={error}
      />
    </div>
  );
} 