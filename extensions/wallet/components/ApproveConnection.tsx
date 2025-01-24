import { Card, CardBody, Button } from "@nextui-org/react";
import { useRouter } from 'next/router';

export default function ApproveConnection() {
  const router = useRouter();

  const handleApprove = async () => {
    await chrome.runtime.sendMessage({
      type: 'APPROVE_CONNECTION'
    });
    window.close();
  };

  const handleReject = async () => {
    await chrome.runtime.sendMessage({
      type: 'REJECT_CONNECTION'
    });
    window.close();
  };

  return (
    <Card>
      <CardBody className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Connect to NEAR Wallet</h2>
          <p className="text-gray-600 mb-6">
            This site is requesting access to view your account address and propose transactions
          </p>
          <div className="space-y-2">
            <Button
              color="primary"
              className="w-full"
              onPress={handleApprove}
            >
              Connect
            </Button>
            <Button
              color="danger"
              variant="light"
              className="w-full"
              onPress={handleReject}
            >
              Reject
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 