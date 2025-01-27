import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button } from "@nextui-org/react";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Send() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (!publicInfo) {
      router.push('/');
    }
  }, [router]);

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
            <h1 className="text-xl font-bold">Send NEAR</h1>
          </div>

          {/* Send functionality will be implemented later */}
          <p className="text-sm text-gray-600">
            Send functionality coming soon...
          </p>
        </CardBody>
      </Card>
    </div>
  );
} 