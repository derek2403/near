import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import QRCode from 'qrcode.react';

export default function Receive() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (publicInfo) {
      setWalletInfo(JSON.parse(publicInfo));
    }
  }, []);

  const handleCopy = async () => {
    if (walletInfo?.accountId) {
      await navigator.clipboard.writeText(walletInfo.accountId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-[400px] h-[600px] overflow-auto bg-gray-50 p-4">
      <Card className="w-full">
        <CardBody className="p-6">
          <h1 className="text-xl font-bold mb-4">Receive NEAR</h1>
          
          <div className="space-y-4">
            {walletInfo?.accountId && (
              <>
                <div className="flex justify-center">
                  <QRCode value={walletInfo.accountId} size={200} />
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <span className="text-sm break-all">{walletInfo.accountId}</span>
                  <button onClick={handleCopy}>
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </>
            )}

            <Button
              color="primary"
              variant="light"
              onPress={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 