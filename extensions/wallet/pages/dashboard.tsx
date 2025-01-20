import { useState, useEffect } from 'react';
import { Button, Card, CardBody } from "@nextui-org/react";
import { navigateTo } from '../utils/navigation';

interface WalletInfo {
  accountId: string;
  publicKey: string;
  balance?: string;
}

export default function Dashboard() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    chrome.storage.local.get(['walletInfo'], (result) => {
      if (result.walletInfo) {
        setWalletInfo(result.walletInfo);
      }
    });
  }, []);

  const handleLogout = () => {
    chrome.storage.local.remove(['walletInfo'], () => {
      navigateTo('home');
    });
  };

  if (!walletInfo) {
    return null;
  }

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <h1 className="text-xl font-bold mb-4">Wallet Dashboard</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Account ID</label>
              <p className="text-lg font-medium">{walletInfo.accountId}</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Balance</label>
              <p className="text-lg font-medium">{walletInfo.balance || '0 NEAR'}</p>
            </div>

            <Button
              onPress={handleLogout}
              color="danger"
              variant="light"
              className="w-full mt-4"
            >
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 