import { useState, useEffect } from 'react';
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import { navigateTo } from '../utils/navigation';
import Image from 'next/image';

export default function Home() {
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    // Check if wallet exists in Chrome storage
    chrome.storage.local.get(['walletInfo'], (result) => {
      if (result.walletInfo) {
        navigateTo('dashboard');
      }
    });
  }, []);

  return (
    <div className="min-h-[600px] p-6 bg-gray-50">
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="text-center mb-8">
            <div className="mb-4">
              <Image
                src="/icons/near.svg"
                alt="NEAR Logo"
                width={64}
                height={64}
                className="mx-auto"
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Nearer</h1>
            <p className="text-gray-600">Your gateway to the NEAR ecosystem</p>
          </div>

          <div className="space-y-4">
            <Button
              color="primary"
              className="w-full"
              size="lg"
              onPress={() => navigateTo('createWallet')}
            >
              Create New Wallet
            </Button>
            <Button
              variant="bordered"
              className="w-full"
              size="lg"
              onPress={() => navigateTo('login')}
            >
              Import Existing Wallet
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 