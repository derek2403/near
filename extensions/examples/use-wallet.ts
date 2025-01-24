import { NearWalletConnector } from '../extensions/sdk';

// Initialize the wallet connector with your extension ID
const wallet = new NearWalletConnector('your-extension-id');

// Example usage in a web app
async function connectToWallet() {
  try {
    const { accountId, publicKey } = await wallet.connect();
    console.log('Connected to wallet:', { accountId, publicKey });
    
    // Send a transaction
    const result = await wallet.sendTransaction({
      receiverId: 'bob.testnet',
      amount: '1.5'
    });
    
    console.log('Transaction result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add connect button to webpage
const connectButton = document.createElement('button');
connectButton.textContent = 'Connect NEAR Wallet';
connectButton.onclick = connectToWallet;
document.body.appendChild(connectButton); 