import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Card from '../components/ui/Card';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a wallet
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (publicInfo) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <Layout>
      <Card className="flex items-center justify-center min-h-[500px]">
        <p className="text-gray-600">Loading...</p>
      </Card>
    </Layout>
  );
} 