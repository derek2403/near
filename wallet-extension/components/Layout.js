import React from 'react';

export default function Layout({ children }) {
  return (
    <div style={{ 
      minHeight: '100%',
      width: '100%',
      backgroundColor: '#ffffff',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '16px' }}>
        <h1 style={{ 
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          color: '#000000'
        }}>NEAR Wallet</h1>
      </header>
      <main style={{ color: '#000000' }}>
        {children}
      </main>
    </div>
  );
} 