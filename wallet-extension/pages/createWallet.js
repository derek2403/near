import { useState } from 'react';
import * as nearAPI from "near-api-js";
import { generateSeedPhrase } from "near-seed-phrase";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import CreatePassword from '../components/CreatePassword';
import { useDisclosure } from '@nextui-org/react';

const { connect, keyStores, KeyPair } = nearAPI;

export default function CreateWallet() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Create, 2: Show Keys, 3: Set Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [passwordError, setPasswordError] = useState('');

  const handleCreateWallet = async () => {
    if (!accountId.trim()) {
      setError('Please enter an account ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { seedPhrase, secretKey, publicKey } = generateSeedPhrase();
      
      setWalletInfo({
        accountId: accountId + '.testnet',
        publicKey,
        privateKey: secretKey,
        seedPhrase
      });
      
      setStep(2); // Move to show keys step
    } catch (err) {
      setError('Error creating wallet');
      console.error('Wallet creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async (value) => {
    setAccountId(value);
    if (!value) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const provider = new nearAPI.providers.JsonRpcProvider({
        url: "https://rpc.testnet.near.org"
      });

      await provider.query({
        request_type: 'view_account',
        finality: 'final',
        account_id: value + '.testnet'
      });
      
      setIsAvailable(false); // Account exists
    } catch (err) {
      if (err.toString().includes('does not exist')) {
        setIsAvailable(true); // Account is available
      } else {
        setIsAvailable(false);
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleSetPassword = async (password) => {
    try {
      // Encrypt wallet info
      const encryptedWallet = await encryptWalletData(walletInfo, password);
      const passwordHash = await hashPassword(password);

      // Store in localStorage
      localStorage.setItem('encryptedWallet', encryptedWallet);
      localStorage.setItem('passwordHash', passwordHash);
      localStorage.setItem('publicWalletInfo', JSON.stringify({
        accountId: walletInfo.accountId,
        publicKey: walletInfo.publicKey
      }));

      onClose();
      router.push('/dashboard');
    } catch (err) {
      setPasswordError('Error saving wallet');
      console.error('Error saving wallet:', err);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Create New Account</h1>
            <div className="space-y-2">
              <Input
                label="Account ID"
                placeholder="yourname"
                value={accountId}
                onChange={(e) => handleCheckAvailability(e.target.value)}
                endContent={
                  <div className="flex items-center">
                    <span>.testnet</span>
                  </div>
                }
              />
              {isChecking && <p className="text-sm text-gray-600">Checking availability...</p>}
              {isAvailable === true && <p className="text-sm text-success">Account is available!</p>}
              {isAvailable === false && <p className="text-sm text-danger">Account is not available</p>}
            </div>
            
            <Button
              color="primary"
              className="w-full"
              onPress={handleCreateWallet}
              isLoading={loading}
              isDisabled={!isAvailable || !accountId}
            >
              Create Account
            </Button>

            {error && <p className="text-danger text-sm">{error}</p>}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Save Your Private Key</h1>
            <p className="text-sm text-gray-600">
              Please save this private key securely. You'll need it to recover your account.
            </p>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className={`text-sm break-all ${!showPrivateKey ? 'blur-sm' : ''}`}>
                  {walletInfo?.privateKey}
                </span>
                <button onClick={() => setShowPrivateKey(!showPrivateKey)}>
                  {showPrivateKey ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-600 text-sm">
                ⚠️ Never share your private key with anyone!
              </p>
            </div>

            <Button
              color="primary"
              className="w-full"
              onPress={() => {
                onOpen();
                setStep(3);
              }}
            >
              I've saved my private key
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Set Password</h1>
            <p className="text-sm text-gray-600">
              Create a password to secure your wallet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="extension-container bg-gray-50">
      <Card className="mx-auto">
        <CardBody className="p-4">
          {renderStep()}
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