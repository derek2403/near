import { useEffect, useState } from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../utils/navigation';

interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
  loginMethod?: string;
}

export default function Settings() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showPrivateInfo, setShowPrivateInfo] = useState({
    seedPhrase: false,
    privateKey: false
  });
  const [error, setError] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState({
    seedPhrase: false,
    privateKey: false,
    publicKey: false,
    accountId: false
  });

  useEffect(() => {
    const loadWalletInfo = async () => {
      try {
        const result = await chrome.storage.local.get(['walletInfo']);
        if (!result.walletInfo) {
          navigateTo('home');
          return;
        }

        setWalletInfo(result.walletInfo);
      } catch (err) {
        setError('Error loading wallet data');
        console.error('Decryption error:', err);
      }
    };

    loadWalletInfo();
  }, []);

  const handleCopy = async (text: string, field: keyof typeof copiedStates) => {
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
    chrome.storage.local.clear(() => {
      navigateTo('home');
    });
  };

  const toggleVisibility = (field: keyof typeof showPrivateInfo) => {
    setShowPrivateInfo(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!walletInfo) {
    return (
      <div className="min-h-[600px] p-6 bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody>
            {error || 'Loading...'}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] p-6 bg-gray-50">
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="flex items-center mb-6">
            <Button
              isIconOnly
              variant="light"
              onPress={() => navigateTo('dashboard')}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <div className="space-y-6">
            {/* Wallet Information Section */}
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <h2 className="font-semibold text-yellow-800 mb-4">
                Wallet Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account ID:</label>
                  <div className="flex items-center bg-white p-3 rounded-lg border">
                    <p className="text-sm flex-1">{walletInfo.accountId}</p>
                    <button
                      onClick={() => handleCopy(walletInfo.accountId, 'accountId')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.accountId ? (
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {walletInfo.seedPhrase ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seed Phrase:</label>
                    <div className="flex items-center bg-white p-3 rounded-lg border">
                      <p className={`text-sm flex-1 break-all ${!showPrivateInfo.seedPhrase ? 'blur-sm' : ''}`}>
                        {walletInfo.seedPhrase}
                      </p>
                      <button
                        onClick={() => handleCopy(walletInfo.seedPhrase || '', 'seedPhrase')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedStates.seedPhrase ? (
                          <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleVisibility('seedPhrase')}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {showPrivateInfo.seedPhrase ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seed Phrase:</label>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        This account wasn't created or imported using a Secret Phrase via Nearer, so no encrypted secret phrase is currently available.
                        <br /><br />
                        Rest assured, your original secret phrase should still work as a recovery method if you haven't removed it from your Near account.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Private Key:</label>
                  <div className="flex items-center bg-white p-3 rounded-lg border">
                    <p className={`text-sm flex-1 break-all ${!showPrivateInfo.privateKey ? 'blur-sm' : ''}`}>
                      {walletInfo.secretKey}
                    </p>
                    <button
                      onClick={() => handleCopy(walletInfo.secretKey, 'privateKey')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.privateKey ? (
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleVisibility('privateKey')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPrivateInfo.privateKey ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Public Key:</label>
                  <div className="flex items-center bg-white p-3 rounded-lg border">
                    <p className="text-sm flex-1 break-all">{walletInfo.publicKey}</p>
                    <button
                      onClick={() => handleCopy(walletInfo.publicKey, 'publicKey')}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      {copiedStates.publicKey ? (
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <ClipboardIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">
                    ⚠️ Warning: Store this information securely. Never share your private key or seed phrase with anyone!
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Section */}
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 