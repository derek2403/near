import { useRouter } from 'next/router';
import { Card, CardBody } from "@nextui-org/react";
import { extensionRouter } from '../utils/extensionRouter';

export default function Send() {
  const router = useRouter();

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <h1 className="text-2xl font-bold mb-4">Send</h1>
          {/* Add your send content here */}
        </CardBody>
      </Card>
    </div>
  );
}
