import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Input, Button, Card, CardBody, Spinner } from "@nextui-org/react";

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
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
      <div className="min-h-screen p-8 bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardBody className="p-8">
            <h1 className="text-2xl font-bold mb-4">No Wallet Found</h1>
            <p className="text-gray-600 mb-6">You need to create a wallet first.</p>
            <Button
              onClick={() => router.push('/createWallet')}
              color="primary"
              className="w-full"
              size="lg"
            >
              Create Wallet
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
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
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="mb-4">
          <p className="text-gray-600">Account ID: {walletInfo.accountId}</p>
        </div>
        {/* Add more wallet info display here */}
      </div>
    </div>
  );
}

// Utility functions for decryption
const decryptWalletData = async (encryptedData, password) => {
  // Implementation using proper decryption
  // This is a placeholder - use proper decryption in production
  return JSON.parse(atob(encryptedData)).data;
};

const hashPassword = async (password) => {
  // Implementation using proper password hashing
  // This is a placeholder - use proper hashing in production
  return btoa(password);
};
