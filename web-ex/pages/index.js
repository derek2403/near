import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody } from "@nextui-org/react";
import { storage } from '../utils/storage';
import { extensionRouter } from '../utils/extensionRouter';

export default function Home() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      const publicInfo = await storage.get('publicWalletInfo');
      if (publicInfo) {
        setWalletInfo(publicInfo);
      }
    };
    checkWallet();
  }, []);

  const handleClick = (path) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
    if (isExtension) {
      window.location.href = chrome.runtime.getURL(`${path}.html`);
    } else {
      router.replace(path);
    }
  };

  if (!walletInfo) {
    return (
      <div className="min-h-[600px] p-4 bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardBody className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to NEAR Wallet</h1>
            <p className="text-gray-600 mb-6">To get started, create your first NEAR wallet.</p>
            
            <button
              onClick={handleClick('createWallet')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
              Create New Wallet
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have a wallet?{' '}
                <button
                  onClick={handleClick('login')}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  Login here
                </button>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-gray-600 mb-6">Continue to your NEAR wallet.</p>

          <button
            onClick={handleClick('dashboard')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors mb-4"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleClick('login')}
            className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors mb-4"
          >
            Login to Different Wallet
          </button>

          <button
            onClick={handleClick('createWallet')}
            className="w-full text-blue-600 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create New Wallet
          </button>
        </CardBody>
      </Card>
    </div>
  );
}