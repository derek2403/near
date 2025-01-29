import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { extensionRouter } from '../utils/extensionRouter';
import { storage } from '../utils/storage';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
      
      if (isExtension) {
        try {
          const publicInfo = await storage.get('publicWalletInfo');
          const currentPath = window.location.pathname.replace(/\.html$/, '').replace(/^\//, '');
          
          console.log('Current path:', currentPath);
          console.log('Public info:', publicInfo);
          
          if (!publicInfo && 
              currentPath !== 'createWallet' && 
              currentPath !== 'login' && 
              currentPath !== 'index') {
            console.log('Redirecting to home...');
            extensionRouter.replace('/');
          }
        } catch (error) {
          console.error('Error checking auth:', error);
        }
      }
    };

    checkAuth();
  }, []);

  return (
    <NextUIProvider>
      <main className="light text-foreground bg-background">
        <div className="w-[375px] h-[600px] overflow-auto bg-white">
          <Component {...pageProps} />
        </div>
      </main>
    </NextUIProvider>
  );
}
