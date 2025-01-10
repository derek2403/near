import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NativeNearSend from '../components/NativeNear/NativeNearSend';
import ChainSignatureSend from '../components/ChainSignature/ChainSignatureSend';

export default function Send() {
  const router = useRouter();
  const { mode } = router.query;

  useEffect(() => {
    // Check if user is logged in
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (!publicInfo) {
      router.push('/');
    }
  }, [router]);

  // Render the appropriate send component based on the mode query parameter
  return mode === 'chain' ? <ChainSignatureSend /> : <NativeNearSend />;
}
