import { NearWalletConnector } from '../../sdk';

// Get your extension ID after installing the extension
const EXTENSION_ID = 'your-extension-id';
const wallet = new NearWalletConnector(EXTENSION_ID);

let connected = false;

async function connect() {
  try {
    const { accountId, publicKey } = await wallet.connect();
    console.log('Connected to wallet:', { accountId, publicKey });
    connected = true;
    updateUI();
  } catch (error) {
    console.error('Failed to connect:', error);
  }
}

async function sendTransaction() {
  if (!connected) {
    console.error('Please connect wallet first');
    return;
  }

  try {
    const result = await wallet.sendTransaction({
      receiverId: 'bob.testnet',
      amount: '1.0'
    });
    console.log('Transaction sent:', result);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

function updateUI() {
  const connectBtn = document.getElementById('connect-btn');
  const sendBtn = document.getElementById('send-btn');
  
  if (connectBtn && sendBtn) {
    connectBtn.style.display = connected ? 'none' : 'block';
    sendBtn.style.display = connected ? 'block' : 'none';
  }
}

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div>
        <button id="connect-btn">Connect Wallet</button>
        <button id="send-btn" style="display: none;">Send 1 NEAR</button>
      </div>
    `;

    document.getElementById('connect-btn')?.addEventListener('click', connect);
    document.getElementById('send-btn')?.addEventListener('click', sendTransaction);
  }
}); 