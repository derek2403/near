import { NearWalletSDK } from 'near-wallet-sdk';

const wallet = new NearWalletSDK({
  networkConfig: {
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.near.org',
    walletUrl: 'https://wallet.testnet.near.org',
    helperUrl: 'https://helper.testnet.near.org',
    explorerUrl: 'https://explorer.testnet.near.org'
  },
  debug: true
});

// Connect to wallet
async function connectWallet() {
  try {
    const { accountId, publicKey } = await wallet.connect();
    console.log('Connected to wallet:', { accountId, publicKey });
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

// Send transaction
async function sendTransaction() {
  try {
    const result = await wallet.sendTransaction({
      receiverId: 'recipient.testnet',
      amount: '1.5',
      methodName: 'transfer',
      args: { message: 'Test transfer' }
    });
    console.log('Transaction result:', result);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

// Sign message
async function signMessage() {
  try {
    const message = 'Hello NEAR!';
    const signature = await wallet.signMessage(message);
    console.log('Signature:', signature);
  } catch (error) {
    console.error('Signing failed:', error);
  }
} 