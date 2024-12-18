import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Tabs, Tab, Textarea } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const { connect, keyStores, KeyPair } = nearAPI;

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let keyPair;
      let publicKey;
      let finalAccountId;

      if (loginMethod === 'seedPhrase') {
        if (!seedPhrase.trim()) {
          throw new Error('Please enter your seed phrase');
        }
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        // Extract account ID from seed phrase
        finalAccountId = seedPhrase.split(' ')[0] + '.testnet';
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }
        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();

        // Try to extract account from private key or throw error
        try {
          const account = await near.account(publicKey);
          finalAccountId = account.accountId;
        } catch (err) {
          throw new Error('Unable to determine account from private key');
        }
      }

      // Initialize connection to NEAR
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://testnet.nearblocks.io"
      };

      const near = await connect(connectionConfig);

      // Verify the account exists and the key pair matches
      try {
        const account = await near.account(finalAccountId);
        await account.state(); // This will throw if account doesn't exist

        // Store the key in keyStore
        await connectionConfig.keyStore.setKey("testnet", finalAccountId, keyPair);

        // Store account ID and private key in localStorage
        localStorage.setItem('nearAccountId', finalAccountId);
        localStorage.setItem('nearPrivateKey', keyPair.toString());

        console.log('Login successful');
        console.log('Account ID:', finalAccountId);
        setLoggedInAccount(finalAccountId);
        console.log('LoggedInAccount state set to:', finalAccountId);

        // Redirect to transfer page
        router.push('/transfer');
      } catch (accountErr) {
        console.error('Account verification error:', accountErr);
        throw new Error('Unable to verify account. Please check your credentials.');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
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

          {loggedInAccount && (
            <Card className="bg-success-50 border-none mb-4">
              <CardBody className="p-6">
                <div className="text-center">
                  <div className="text-success font-medium mb-2">
                    Successfully logged in!
                  </div>
                  <div className="text-gray-700 mb-4">
                    Account: <span className="font-mono font-medium">{loggedInAccount}</span>
                  </div>
                  <Button
                    onClick={() => router.push('/transfer')}
                    color="primary"
                    className="w-full"
                  >
                    Go to Transfer Page
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {!loggedInAccount && (
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
                onClick={handleLogin}
                isDisabled={loading}
                color="primary"
                className="w-full"
                size="lg"
                isLoading={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          )}

          {!loggedInAccount && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have a wallet?{' '}
                <span
                  onClick={() => router.push('/createWallet')}
                  style={{
                    color: "#0070f3", // Primary blue color
                    cursor: "pointer"
                  }}
                >
                  Create one here
                </span>
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
