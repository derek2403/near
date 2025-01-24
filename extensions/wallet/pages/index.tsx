import { useState, useEffect } from 'react';
import { Input, Button, Card, CardBody } from "@nextui-org/react";
import CreateWallet from './createWallet';
import Login from './login';
import type { Page } from '../utils/navigation';
import { navigateTo } from '../utils/navigation';
import Dashboard from './dashboard';

interface WalletInfo {
  address: string;
  balance: string;
  // Add other wallet properties as needed
}

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Listen for page changes
    chrome.storage.local.get(['currentPage'], (result) => {
      if (result.currentPage) {
        setCurrentPage(result.currentPage);
      }
    });

    // Add storage change listener
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.currentPage) {
        setCurrentPage(changes.currentPage.newValue);
      }
    };

    chrome.storage.local.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.local.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (publicInfo) {
      setWalletInfo(JSON.parse(publicInfo));
    }
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');

    try {
      const storedHash = localStorage.getItem('passwordHash');
      const inputHash = await hashPassword(password);

      if (inputHash === storedHash) {
        const encryptedWallet = localStorage.getItem('encryptedWallet');
        if (encryptedWallet) {
          const decryptedWallet = await decryptWalletData(encryptedWallet, password);
          setWalletInfo(decryptedWallet);
          setIsLoggedIn(true);
        }
      } else {
        setLoginError('Incorrect password');
      }
    } catch (error) {
      setLoginError('Error accessing wallet');
      console.error(error);
    }
  };

  // Render different pages based on currentPage
  if (currentPage === 'createWallet') {
    return <CreateWallet />;
  }

  if (currentPage === 'login') {
    return <Login />;
  }

  if (currentPage === 'dashboard') {
    return <Dashboard />;
  }

  // Home page content
  return (
    <div className="min-h-[600px] p-8 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-8">
          <h1 className="text-2xl font-bold mb-4">Welcome to NEAR Wallet</h1>
          <p className="text-gray-600 mb-6">To get started, create your first NEAR wallet.</p>
          
          <Button
            onPress={() => navigateTo('createWallet')}
            color="primary"
            className="w-full"
            size="lg"
          >
            Create New Wallet
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have a wallet?{' '}
              <Button
                onPress={() => navigateTo('login')}
                variant="light"
                color="primary"
                className="p-0"
              >
                Login here
              </Button>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Utility functions for decryption
const decryptWalletData = async (encryptedData: string, password: string): Promise<WalletInfo> => {
  // Implementation using proper decryption
  // This is a placeholder - use proper decryption in production
  return JSON.parse(atob(encryptedData)).data;
};

const hashPassword = async (password: string): Promise<string> => {
  // Implementation using proper password hashing
  // This is a placeholder - use proper hashing in production
  return btoa(password);
}; 