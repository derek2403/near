import { useState, useEffect } from 'react';
import { Button, Card, CardBody } from "@nextui-org/react";
import CreateWallet from './createWallet';
import Login from './login';
import { navigateTo } from '../utils/navigation';
import Dashboard from './dashboard';
import { WalletInfo } from '../types';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<string>('home');

  useEffect(() => {
    // Check for existing wallet and intended destination
    chrome.storage.local.get(['walletInfo', 'currentPage', 'intendedDestination'], (result) => {
      if (result.walletInfo) {
        // If user is authenticated and there's an intended destination, go there
        if (result.intendedDestination) {
          navigateTo(result.intendedDestination);
          chrome.storage.local.remove(['intendedDestination']);
        } else if (result.currentPage && result.currentPage !== 'home') {
          // Stay on current page if it's not home
          setCurrentPage(result.currentPage);
        } else {
          // Default to dashboard if authenticated
          navigateTo('dashboard');
        }
      } else if (result.currentPage && !['dashboard', 'send', 'receive', 'settings'].includes(result.currentPage)) {
        // Only allow non-protected routes when not authenticated
        setCurrentPage(result.currentPage);
      }
    });

    // Listen for page changes
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