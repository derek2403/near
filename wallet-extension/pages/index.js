import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'
import Layout from '../components/Layout'

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
      <Head>
        <title>Wallet Extension</title>
        <meta name="description" content="Web3 wallet extension" />
      </Head>
      <main>
        <h1>Welcome to Wallet Extension</h1>
      </main>
    </Layout>
  )
} 