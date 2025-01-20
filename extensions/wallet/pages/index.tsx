import { useState, useEffect } from 'react';
import { Input, Button, Card, CardBody } from "@nextui-org/react";

interface WalletInfo {
  address: string;
  balance: string;
  // Add other wallet properties as needed
}

export default function Home() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (publicInfo) {
      setWalletInfo(JSON.parse(publicInfo));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');

    try {
      const storedHash = localStorage.getItem('passwordHash');
      const inputHash = await hashPassword(password);

      if (inputHash === storedHash) {
        const encryptedWallet = localStorage.getItem('encryptedWallet');
        if (encryptedWallet) {
          const decryptedWallet = await decryptWalletData(encryptedWallet, password);
          setWalletInfo(decryptedWallet);
          setIsLoggedIn(true);
        }
      } else {
        setLoginError('Incorrect password');
      }
    } catch (error) {
      setLoginError('Error accessing wallet');
      console.error(error);
    }
  };

  const navigateTo = (path: string) => {
    // For now, we'll just console.log since we don't have router in extension
    console.log('Navigate to:', path);
  };

  if (!walletInfo) {
    return (
      <div className="min-h-[600px] p-8 bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardBody className="p-8">
            <h1 className="text-2xl font-bold mb-4">Welcome to NEAR Wallet</h1>
            <p className="text-gray-600 mb-6">To get started, create your first NEAR wallet.</p>
            
            <Button
              onPress={() => navigateTo('/createWallet')}
              color="primary"
              className="w-full"
              size="lg"
            >
              Create New Wallet
            </Button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have a wallet?{' '}
                <Button
                  onPress={() => navigateTo('/login')}
                  variant="light"
                  color="primary"
                  className="p-0"
                >
                  Login here
                </Button>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] p-8 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-8">
          <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>
          <p className="text-gray-600 mb-6">Enter your password to access your wallet.</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="bordered"
              className="max-w-full"
              required
            />

            {loginError && (
              <Card className="bg-danger-50 border-none">
                <CardBody className="text-danger py-2">
                  {loginError}
                </CardBody>
              </Card>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
            >
              Unlock
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onPress={() => navigateTo('/login')}
              variant="bordered"
              color="primary"
              className="w-full"
              size="lg"
            >
              Login to Different Wallet
            </Button>

            <Button
              onPress={() => navigateTo('/createWallet')}
              variant="light"
              color="primary"
              className="w-full"
              size="lg"
            >
              Create New Wallet
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Utility functions for decryption
const decryptWalletData = async (encryptedData: string, password: string): Promise<WalletInfo> => {
  // Implementation using proper decryption
  // This is a placeholder - use proper decryption in production
  return JSON.parse(atob(encryptedData)).data;
};

const hashPassword = async (password: string): Promise<string> => {
  // Implementation using proper password hashing
  // This is a placeholder - use proper hashing in production
  return btoa(password);
}; 