import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button } from "@nextui-org/react";
import { ArrowLeftIcon, ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode.react';

export default function Receive() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (!publicInfo) {
      router.push('/');
      return;
    }
    setWalletInfo(JSON.parse(publicInfo));
  }, [router]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!walletInfo) return null;

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
            <h1 className="text-xl font-bold">Receive NEAR</h1>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <QRCode value={walletInfo.accountId} size={200} />
            
            <div className="flex items-center gap-2">
              <span className="text-sm">{walletInfo.accountId}</span>
              <button onClick={handleCopy}>
                {copied ? (
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-sm text-gray-600 text-center">
              Share your account ID to receive NEAR tokens
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 