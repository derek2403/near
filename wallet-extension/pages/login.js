import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import CreatePassword from '../components/CreatePassword';

export default function Login() {
  const router = useRouter();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWallet = () => {
    router.push('/createWallet');
  };

  const handleImportWallet = async (password) => {
    try {
      setLoading(true);
      setError('');
      
      // Add wallet import logic here
      
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
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome to NEAR Wallet</h1>
            <p className="text-gray-600 mt-2">Import or create a new wallet</p>
          </div>

          <div className="space-y-4">
            <Input
              label="Seed Phrase"
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              placeholder="Enter your 12-word seed phrase"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              onClick={() => setShowCreatePassword(true)}
              disabled={!seedPhrase || loading}
              className="w-full"
            >
              Import Wallet
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={handleCreateWallet}
              className="w-full"
            >
              Create New Wallet
            </Button>
          </div>
        </div>
      </Card>

      <CreatePassword
        isOpen={showCreatePassword}
        onClose={() => setShowCreatePassword(false)}
        onSubmit={handleImportWallet}
        error={error}
      />
    </Layout>
  );
} 