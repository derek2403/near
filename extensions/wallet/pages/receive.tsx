import { useState, useEffect } from 'react';
import { Card, CardBody, Button } from "@nextui-org/react";
import { ArrowLeftIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { navigateTo } from '../utils/navigation';
import QRCode from 'qrcode.react';

interface WalletInfo {
  accountId: string;
}

export default function Receive() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['walletInfo'], (result) => {
      if (result.walletInfo) {
        setWalletInfo(result.walletInfo);
      } else {
        navigateTo('home');
      }
    });
  }, []);

  const handleCopy = async () => {
    if (!walletInfo) return;
    
    try {
      await navigator.clipboard.writeText(walletInfo.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!walletInfo) {
    return null;
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
            <h1 className="text-xl font-bold">Receive</h1>
          </div>

          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode 
                  value={walletInfo.accountId}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Wallet Address
              </label>
              <div className="flex items-center bg-white p-3 rounded-lg border">
                <p className="text-sm flex-1 break-all">{walletInfo.accountId}</p>
                <button
                  onClick={handleCopy}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Share this address to receive NEAR and other tokens on the NEAR network.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 