import { useState } from 'react';
import { useRouter } from 'next/router';
import * as nearAPI from "near-api-js";
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

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
    <Layout>
      <Card>
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
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
} 