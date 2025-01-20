import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
  const router = useRouter();
  const [showTestnet, setShowTestnet] = useState(true);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <Layout>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Show Testnet</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showTestnet}
                  onChange={(e) => setShowTestnet(e.target.checked)}
                />
                <div className={`
                  w-11 h-6 bg-gray-200 rounded-full peer 
                  peer-checked:after:translate-x-full peer-checked:bg-blue-600
                  after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                  after:bg-white after:rounded-full after:h-5 after:w-5 
                  after:transition-all
                `}></div>
              </label>
            </div>

            <Button
              variant="danger"
              onClick={handleLogout}
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
} 