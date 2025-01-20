import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { Input, Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../utils/navigation';

const { connect, keyStores, KeyPair } = nearAPI;

interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
}

export default function Login() {
  const [loginMethod, setLoginMethod] = useState('seedPhrase');
  const [seedPhrase, setSeedPhrase] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      let keyPair: nearAPI.KeyPair;
      let publicKey: string;
      let walletInfo: WalletInfo;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }
        
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = keyPair.getPublicKey().toString();

        // Initialize NEAR connection
        const connectionConfig = {
          networkId: "testnet",
          keyStore: new keyStores.InMemoryKeyStore(),
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://testnet.mynearwallet.com/",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://testnet.nearblocks.io"
        };

        const near = await connect(connectionConfig);
        const keyStore = new keyStores.InMemoryKeyStore();

        // Get all accounts for this public key using NEAR RPC
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
              request_type: 'view_access_key_list',
              finality: 'final',
              account_id: 'extensions.testnet'
            }
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error('No accounts found for this seed phrase');
        }

        walletInfo = {
          accountId: 'extensions.testnet',
          publicKey: publicKey,
          secretKey: parsedKey.secretKey,
          seedPhrase: seedPhrase
        };

      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        try {
          keyPair = KeyPair.fromString(privateKey);
          publicKey = keyPair.getPublicKey().toString();

          // Initialize NEAR connection
          const connectionConfig = {
            networkId: "testnet",
            keyStore: new keyStores.InMemoryKeyStore(),
            nodeUrl: "https://rpc.testnet.near.org",
            walletUrl: "https://testnet.mynearwallet.com/",
            helperUrl: "https://helper.testnet.near.org",
            explorerUrl: "https://testnet.nearblocks.io"
          };

          const near = await connect(connectionConfig);
          const keyStore = new keyStores.InMemoryKeyStore();

          // Get all accounts for this public key using NEAR RPC
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
                request_type: 'view_access_key_list',
                finality: 'final',
                account_id: 'extensions.testnet'
              }
            })
          });

          const data = await response.json();
          if (data.error) {
            throw new Error('No accounts found for this private key');
          }

          walletInfo = {
            accountId: 'extensions.testnet',
            publicKey: publicKey,
            secretKey: privateKey
          };
        } catch (err) {
          throw new Error('No accounts found for this private key');
        }
      }

      // Store wallet info and navigate to dashboard
      chrome.storage.local.set({ 
        walletInfo,
        currentPage: 'dashboard'
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Login error:', err);
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
                        type="button"
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
                        type="button"
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