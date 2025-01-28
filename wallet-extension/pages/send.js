import { useEffect } from 'react';
import NativeNearSend from '../components/NativeNear/NativeNearSend';
import ChainSignatureSend from '../components/ChainSignature/ChainSignatureSend';

export default function Send({ router }) {
  const mode = router.query?.mode;

  useEffect(() => {
    // Check if user is logged in
    chrome.storage.local.get('publicWalletInfo', (result) => {
      if (!result.publicWalletInfo) {
        router.push('');
      }
    });
  }, [router]);

  // Render the appropriate send component based on the mode query parameter
  return mode === 'chain' ? <ChainSignatureSend router={router} /> : <NativeNearSend router={router} />;
}
