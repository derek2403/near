import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Input, Button } from "@nextui-org/react";
import * as nearAPI from "near-api-js";

export default function Send() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add NEAR transfer logic here
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[400px] h-[600px] overflow-auto bg-gray-50 p-4">
      <Card className="w-full">
        <CardBody className="p-6">
          <h1 className="text-xl font-bold mb-4">Send NEAR</h1>
          
          <div className="space-y-4">
            <Input
              label="Recipient Address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="account.testnet"
            />
            
            <Input
              label="Amount (NEAR)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="0"
              step="0.1"
            />

            {error && (
              <p className="text-danger text-sm">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                color="danger"
                variant="light"
                onPress={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleSend}
                isLoading={loading}
              >
                Send
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 