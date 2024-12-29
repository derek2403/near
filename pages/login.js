import { useState } from 'react';
import { parseSeedPhrase } from "near-seed-phrase";
import * as nearAPI from "near-api-js";
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Tabs, Tab, Textarea } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';

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
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [passwordError, setPasswordError] = useState('');
  const [tempWalletInfo, setTempWalletInfo] = useState(null);

  const handleLogin = async () => {
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
        
        // Parse seed phrase and get key pair
        console.log('Processing seed phrase...');
        const parsedKey = parseSeedPhrase(seedPhrase);
        keyPair = KeyPair.fromString(parsedKey.secretKey);
        publicKey = parsedKey.publicKey;
        
        // Get account ID from the first word of seed phrase
        finalAccountId = seedPhrase.split(' ')[0] + '.testnet';
        
        // Log the reconstructed information
        console.log('From Seed Phrase:');
        console.log('Public Key:', publicKey);
        console.log('Account ID:', finalAccountId);
        
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter your private key');
        }

        // Create key pair from private key
        console.log('Processing private key...');
        keyPair = KeyPair.fromString(privateKey);
        publicKey = keyPair.getPublicKey().toString();
        
        // Set up connection to get account info
        const connectionConfig = {
          networkId: "testnet",
          keyStore: new keyStores.InMemoryKeyStore(),
          nodeUrl: "https://rpc.testnet.near.org",
        };

        // Connect to NEAR and get account details
        const near = await connect(connectionConfig);
        
        try {
          // Try to get account info using the public key
          const account = await near.account(publicKey);
          finalAccountId = account.accountId;
          
          // Log the reconstructed information
          console.log('From Private Key:');
          console.log('Public Key:', publicKey);
          console.log('Account ID:', finalAccountId);
          
        } catch (accountError) {
          console.error('Error getting account from private key:', accountError);
          throw new Error('Could not retrieve account information from private key');
        }
      }

      // Create wallet info object
      const walletInfo = {
        accountId: finalAccountId,
        publicKey: publicKey.toString(),
        secretKey: keyPair.toString(),
        seedPhrase: loginMethod === 'seedPhrase' ? seedPhrase : null
      };

      // Log the final wallet info (except secret key for security)
      console.log('Final Wallet Info:');
      console.log('Account ID:', walletInfo.accountId);
      console.log('Public Key:', walletInfo.publicKey);

      // Store temporarily and open password modal
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
      // Store encrypted wallet info
      const encryptedWallet = await encryptWalletData(tempWalletInfo, password);
      localStorage.setItem('encryptedWallet', encryptedWallet);
      
      // Store public info separately
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: tempWalletInfo.accountId,
        publicKey: tempWalletInfo.publicKey
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

  // Add the utility functions
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
                    onPress={() => router.push('/transfer')}
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
