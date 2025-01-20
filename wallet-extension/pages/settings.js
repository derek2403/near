import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Switch } from "@nextui-org/react";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const router = useRouter();
  const [showTestnet, setShowTestnet] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="w-[400px] h-[600px] overflow-auto bg-gray-50 p-4">
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push('/dashboard')}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Show Testnet</span>
              <Switch 
                checked={showTestnet}
                onChange={(e) => setShowTestnet(e.target.checked)}
              />
            </div>

            <Button
              color="danger"
              onPress={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 