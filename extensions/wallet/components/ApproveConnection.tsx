import { useState, useEffect } from 'react';
import { Card, CardBody, Button, Image } from "@nextui-org/react";
import { useRouter } from 'next/router';

export default function ApproveConnection() {
  const router = useRouter();
  const { requestId } = router.query;
  const [connectionDetails, setConnectionDetails] = useState<{
    origin: string;
    title: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    if (requestId) {
      // Get connection request details
      chrome.runtime.sendMessage({
        type: 'GET_CONNECTION_REQUEST',
        requestId
      }, (response) => {
        if (response) {
          setConnectionDetails(response);
        }
      });
    }
  }, [requestId]);

  const handleApprove = async () => {
    await chrome.runtime.sendMessage({
      type: 'APPROVE_CONNECTION',
      requestId
    });
    window.close();
  };

  const handleReject = async () => {
    await chrome.runtime.sendMessage({
      type: 'REJECT_CONNECTION',
      requestId
    });
    window.close();
  };

  if (!connectionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardBody className="p-6">
        <div className="text-center">
          <Image
            src={connectionDetails.icon || '/default-icon.png'}
            alt={connectionDetails.title}
            className="w-16 h-16 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold mb-4">Connect to {connectionDetails.title}</h2>
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