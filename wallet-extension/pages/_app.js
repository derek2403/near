import { useState, useEffect } from 'react';
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";

export default function App({ Component }) {
  const [currentPage, setCurrentPage] = useState('index');
  const [currentProps, setCurrentProps] = useState({});

  // Custom router for extension
  const router = {
    push: (path) => {
      const page = path.replace('/', '') || 'index';
      setCurrentPage(page);
    },
    query: currentProps
  };

  useEffect(() => {
    // Check if user is logged in
    chrome.storage.local.get('publicWalletInfo', (result) => {
      if (result.publicWalletInfo) {
        setCurrentPage('dashboard');
      }
    });
  }, []);

  // Map pages to components
  const pages = {
    index: require('./index').default,
    createWallet: require('./createWallet').default,
    dashboard: require('./dashboard').default,
    login: require('./login').default,
    send: require('./send').default,
    settings: require('./settings').default
  };

  const PageComponent = pages[currentPage] || pages.index;

  return (
    <NextUIProvider>
      <PageComponent router={router} />
    </NextUIProvider>
  );
}
