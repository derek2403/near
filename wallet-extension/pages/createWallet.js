import { useState } from 'react';
import { useRouter } from 'next/router';
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CreatePassword from '../components/CreatePassword';

export default function CreateWallet() {
  const router = useRouter();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = async () => {
    if (seedPhrase) {
      await navigator.clipboard.writeText(seedPhrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateWallet = async (password) => {
    try {
      // Add wallet creation logic here
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <Card>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create New Wallet</h1>
            <p className="text-gray-600 mt-2">Save your seed phrase securely</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg relative">
              <p className="text-sm break-all">{seedPhrase}</p>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2"
              >
                {copied ? (
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => router.push('/login')}
              >
                Back
              </Button>
              <Button
                onClick={() => setShowCreatePassword(true)}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <CreatePassword
        isOpen={showCreatePassword}
        onClose={() => setShowCreatePassword(false)}
        onSubmit={handleCreateWallet}
        error={error}
      />
    </Layout>
  );
} 