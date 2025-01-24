import { NearWalletConnector } from '../../extensions/sdk';

// Your extension ID (you'll get this after installing the extension)
const EXTENSION_ID = 'your-extension-id';
const wallet = new NearWalletConnector(EXTENSION_ID);

const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement;
const sendBtn = document.getElementById('sendBtn') as HTMLButtonElement;
const disconnectBtn = document.getElementById('disconnectBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function updateStatus(message: string, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = isError ? 'error' : 'success';
}

function updateButtons(connected: boolean) {
  connectBtn.disabled = connected;
  sendBtn.disabled = !connected;
  disconnectBtn.disabled = !connected;
}

connectBtn.onclick = async () => {
  try {
    const { accountId, publicKey } = await wallet.connect();
    updateStatus(`Connected: ${accountId}`);
    updateButtons(true);
  } catch (error) {
    updateStatus(String(error), true);
  }
};

sendBtn.onclick = async () => {
  try {
    const result = await wallet.sendTransaction({
      receiverId: 'bob.testnet',
      amount: '1.0'
    });
    updateStatus(`Transaction sent: ${result.transactionHash}`);
  } catch (error) {
    updateStatus(String(error), true);
  }
};

disconnectBtn.onclick = async () => {
  try {
    await wallet.disconnect();
    updateStatus('Disconnected');
    updateButtons(false);
  } catch (error) {
    updateStatus(String(error), true);
  }
}; 