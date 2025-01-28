import React from 'react';
import { createRoot } from 'react-dom/client';

function Popup() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: 'black' }}>NEAR Wallet</h1>
      <p style={{ color: 'black' }}>Loading...</p>
    </div>
  );
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
