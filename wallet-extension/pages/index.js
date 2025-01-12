import Head from 'next/head'
import Layout from '../components/Layout'

export default function Home() {
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