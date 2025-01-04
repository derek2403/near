import { Card, CardBody, Button } from "@nextui-org/react";
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ChainSignatureSend() {
  const router = useRouter();

  return (
    <Card>
      <CardBody className="p-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/dashboard')}
            className="mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Chain Signature Send</h1>
        </div>

        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-600">
            Chain signature transaction functionality is currently under development.
            Please use Native NEAR mode for now.
          </p>
        </div>
      </CardBody>
    </Card>
  );
} 