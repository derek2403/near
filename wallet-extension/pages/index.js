import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (publicInfo) {
      setWalletInfo(JSON.parse(publicInfo));
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const storedHash = localStorage.getItem('passwordHash');
      const inputHash = await hashPassword(password);

      if (inputHash === storedHash) {
        const encryptedWallet = localStorage.getItem('encryptedWallet');
        const decryptedWallet = await decryptWalletData(encryptedWallet, password);
        setWalletInfo(decryptedWallet);
        setIsLoggedIn(true);
        router.push('/dashboard');
      } else {
        setLoginError('Incorrect password');
      }
    } catch (error) {
      setLoginError('Error accessing wallet');
      console.error(error);
    }
  };

  if (!walletInfo) {
    return (
      <div className="extension-container bg-gray-50">
        <Card className="mx-auto">
          <CardBody className="p-4">
            <h1 className="text-xl font-bold mb-3">Welcome to NEAR Wallet</h1>
            <p className="text-sm text-gray-600 mb-4">
              Create or import your NEAR wallet to get started.
            </p>
            
            <div className="space-y-3">
              <Button
                color="primary"
                className="w-full"
                onPress={() => router.push('/createWallet')}
              >
                Create New Wallet
              </Button>

              <Button
                variant="bordered"
                className="w-full"
                onPress={() => router.push('/login')}
              >
                Import Existing Wallet
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="extension-container bg-gray-50">
      <Card className="mx-auto">
        <CardBody className="p-4">
          <h1 className="text-xl font-bold mb-3">Welcome Back</h1>
          <p className="text-sm text-gray-600 mb-4">
            Enter your password to unlock your wallet.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              }
            />

            {loginError && (
              <p className="text-danger text-sm">{loginError}</p>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isDisabled={!password}
            >
              Unlock
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Want to use a different wallet?{' '}
              <span
                onClick={() => router.push('/login')}
                className="text-primary cursor-pointer hover:underline"
              >
                Import here
              </span>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Utility functions
const decryptWalletData = async (encryptedData, password) => {
  // This is a placeholder - use proper decryption in production
  return JSON.parse(atob(encryptedData)).data;
};

const hashPassword = async (password) => {
  // This is a placeholder - use proper hashing in production
  return btoa(password);
};
