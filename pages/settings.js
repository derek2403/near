import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Divider } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    const encryptedWallet = localStorage.getItem('encryptedWallet');
    
    if (!publicInfo || !encryptedWallet) {
      router.push('/');
      return;
    }

    try {
      const decryptedWallet = decryptWalletData(encryptedWallet);
      const parsedPublicInfo = JSON.parse(publicInfo);

      setWalletInfo({
        ...parsedPublicInfo,
        ...decryptedWallet.data
      });
    } catch (err) {
      setError('Error decrypting wallet data');
      console.error('Decryption error:', err);
    }
  }, []);

  const decryptWalletData = (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData));
    } catch (err) {
      throw new Error('Failed to decrypt wallet data');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!walletInfo) {
    return <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <Card>
        <CardBody>
          {error || 'Loading...'}
        </CardBody>
      </Card>
    </div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-2xl mx-auto">
        <CardBody className="p-8">
          <div className="flex items-center mb-6">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Wallet Information Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Wallet Information</h2>
                <Button
                  color="primary"
                  variant="light"
                  onPress={() => setShowPrivateInfo(!showPrivateInfo)}
                  startContent={showPrivateInfo ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                >
                  {showPrivateInfo ? 'Hide' : 'Show'} Private Info
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account ID:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                    {walletInfo.accountId}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Public Key:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg break-all">
                    {walletInfo.publicKey}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Private Key:</label>
                  <div className={`mt-1 p-3 bg-gray-50 rounded-lg break-all ${!showPrivateInfo && 'blur-sm'}`}>
                    {walletInfo.secretKey}
                  </div>
                </div>

                {walletInfo.seedPhrase && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seed Phrase:</label>
                    <div className={`mt-1 p-3 bg-gray-50 rounded-lg break-all ${!showPrivateInfo && 'blur-sm'}`}>
                      {walletInfo.seedPhrase}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            {/* Actions Section */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-3">
                <Button
                  color="danger"
                  variant="flat"
                  className="w-full"
                  onPress={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Warning Message */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                ⚠️ Warning: Never share your private key or seed phrase with anyone!
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 