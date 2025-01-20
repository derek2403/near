import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { Input, Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../utils/navigation';

const { connect, keyStores, KeyPair } = nearAPI;

const FASTNEAR_API_URL = "https://test.api.fastnear.com";

interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
}

interface AccountResponse {
  account_ids: string[];
}

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const lookupAccountsByPublicKey = async (publicKey: string): Promise<string[]> => {
    try {
      const response = await fetch(`${FASTNEAR_API_URL}/v0/public_key/${publicKey}/all`);
      if (!response.ok) {
        throw new Error('Failed to lookup accounts');
      }
      const data = await response.json() as AccountResponse;
      return data.account_ids || [];
    } catch (error) {
      console.error('Error looking up accounts:', error);
      return [];
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      let keyPair: nearAPI.KeyPair;
      let publicKey: string;
      let finalAccountId: string;
      let walletInfo: WalletInfo;

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
        
        finalAccountId = accounts.find((acc: string) => acc.includes('.')) || accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey: publicKey.toString(),
          seedPhrase: seedPhrase,
          secretKey: parsedKey.secretKey
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
        
        finalAccountId = accounts.find((acc: string) => acc.includes('.')) || accounts[0];
        
        walletInfo = {
          accountId: finalAccountId,
          publicKey: publicKey.toString(),
          secretKey: privateKey
        };
      }

      // Store wallet info in extension storage
      chrome.storage.local.set({ walletInfo }, () => {
        console.log('Wallet info stored');
        // Navigate to dashboard or main view
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigateTo('home');
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
          <h1 className="text-xl font-bold mb-4">Login to NEAR Wallet</h1>

          {error && (
            <Card className="bg-danger-50 border-none mb-4">
              <CardBody className="text-danger py-2 text-sm">
                {error}
              </CardBody>
            </Card>
          )}

          <div className="space-y-4">
            <Tabs
              selectedKey={loginMethod}
              onSelectionChange={key => setLoginMethod(key as string)}
              variant="bordered"
              fullWidth
            >
              <Tab key="seedPhrase" title="Seed Phrase">
                <div className="pt-4">
                  <Input
                    label="Enter your seed phrase"
                    value={seedPhrase}
                    onChange={(e) => setSeedPhrase(e.target.value)}
                    variant="bordered"
                    type={showSeedPhrase ? "text" : "password"}
                    endContent={
                      <button
                        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                        className="focus:outline-none"
                      >
                        {showSeedPhrase ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-500" />
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
                    endContent={
                      <button
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                        className="focus:outline-none"
                      >
                        {showPrivateKey ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-500" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-500" />
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
        </CardBody>
      </Card>
    </div>
  );
} 