import Head from 'next/head'
import Layout from '../components/Layout'

export default function Popup() {
  return (
    <Layout>
      <Head>
        <title>Wallet Extension</title>
        <meta name="description" content="Web3 wallet extension popup" />
        <link rel="stylesheet" href="static/css/styles.css" />
      </Head>
      <div className="popup-container">
        <h1>Wallet Extension</h1>
        <div className="wallet-content">
          {/* Add your wallet functionality here */}
          <p>Your wallet content goes here</p>
        </div>
      </div>
    </Layout>
  )
} 