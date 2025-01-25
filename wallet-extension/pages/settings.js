import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState({
    seedPhrase: false,
    privateKey: false
  });
  const [error, setError] = useState(null);
  const [copiedStates, setCopiedStates] = useState({
    seedPhrase: false,
    privateKey: false,
    publicKey: false,
    accountId: false
  });

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
  }, [router]);

  const handleCopy = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [field]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const toggleVisibility = (field) => {
    setShowPrivateInfo(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!walletInfo) {
    return <div className="extension-container bg-gray-50 flex items-center justify-center">
      <Card>
        <CardBody>
          {error || 'Loading...'}
        </CardBody>
      </Card>
    </div>;
  }

  return (
    <div className="extension-container bg-gray-50">
      <Card className="mx-auto">
        <CardBody className="p-4">
          <div className="flex items-center mb-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push('/dashboard')}
              className="mr-3"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <div className="space-y-4">
            {/* Account Info */}
            <div>
              <label className="text-sm font-medium">Account ID:</label>
              <div className="flex items-center bg-gray-50 p-2 rounded">
                <span className="flex-1 text-sm">{walletInfo.accountId}</span>
                <button onClick={() => handleCopy(walletInfo.accountId, 'accountId')}>
                  {copiedStates.accountId ? (
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Seed Phrase */}
            {walletInfo.seedPhrase && (
              <div>
                <label className="text-sm font-medium">Seed Phrase:</label>
                <div className="flex items-center bg-gray-50 p-2 rounded">
                  <span className={`flex-1 text-sm break-all ${!showPrivateInfo.seedPhrase ? 'blur-sm' : ''}`}>
                    {walletInfo.seedPhrase}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(walletInfo.seedPhrase, 'seedPhrase')}>
                      {copiedStates.seedPhrase ? (
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                      ) : (
                        <ClipboardIcon className="h-4 w-4" />
                      )}
                    </button>
                    <button onClick={() => toggleVisibility('seedPhrase')}>
                      {showPrivateInfo.seedPhrase ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Private Key */}
            <div>
              <label className="text-sm font-medium">Private Key:</label>
              <div className="flex items-center bg-gray-50 p-2 rounded">
                <span className={`flex-1 text-sm break-all ${!showPrivateInfo.privateKey ? 'blur-sm' : ''}`}>
                  {walletInfo.secretKey}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(walletInfo.secretKey, 'privateKey')}>
                    {copiedStates.privateKey ? (
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </button>
                  <button onClick={() => toggleVisibility('privateKey')}>
                    {showPrivateInfo.privateKey ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Public Key */}
            <div>
              <label className="text-sm font-medium">Public Key:</label>
              <div className="flex items-center bg-gray-50 p-2 rounded">
                <span className="flex-1 text-sm break-all">{walletInfo.publicKey}</span>
                <button onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}>
                  {copiedStates.publicKey ? (
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-600 text-sm">
                ⚠️ Never share your private key or seed phrase with anyone!
              </p>
            </div>

            <Button
              color="danger"
              className="w-full"
              onPress={handleLogout}
            >
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

const decryptWalletData = (encryptedData) => {
  // This is a placeholder - use proper decryption in production
  try {
    return JSON.parse(atob(encryptedData));
  } catch (err) {
    throw new Error('Failed to decrypt wallet data');
  }
}; 