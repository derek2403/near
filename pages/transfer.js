import { useState } from 'react';
import supportedChains from '../data/supportedChain.json';
import Transfer from '../components/Transfer';

export default function TransferPage() {
  const [isAIMode, setIsAIMode] = useState(false);
  const [input, setInput] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferParams, setTransferParams] = useState(null);
  
  // Manual transfer states
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [destChain, setDestChain] = useState('');
  const [destWallet, setDestWallet] = useState('');

  const handleAITransfer = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: input }),
      });

      const data = await res.json();
      
      if (data.params.isComplete) {
        setTransferParams(data.params.params);
        setShowTransfer(true);
      } else {
        alert('Some parameters are missing. Please check your input.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    }
  };

  const handleManualTransfer = () => {
    if (!amount || !currency || !destChain || !destWallet) {
      alert('Please fill in all fields');
      return;
    }

    setTransferParams({
      amount: parseFloat(amount),
      currency: currency,
      destchain: destChain,
      destwallet: destWallet
    });
    setShowTransfer(true);
  };

  const handleTransferClose = () => {
    setShowTransfer(false);
    setTransferParams(null);
    setInput('');
  };

  return (
    <div className="container">
      <div className="mode-toggle">
        <button 
          className={!isAIMode ? 'active' : ''} 
          onClick={() => setIsAIMode(false)}
        >
          Manual Transfer
        </button>
        <button 
          className={isAIMode ? 'active' : ''} 
          onClick={() => setIsAIMode(true)}
        >
          AI-Powered Transfer
        </button>
      </div>

      {!showTransfer && (
        <>
          {isAIMode ? (
            <div className="transfer-form">
              <h2>AI-Powered Transfer</h2>
              <p>Describe your transfer in natural language:</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Example: Transfer 1.5 ETH to 0x742d... on Polygon"
                rows={4}
              />
              <button onClick={handleAITransfer}>Process Transfer</button>
            </div>
          ) : (
            <div className="transfer-form">
              <h2>Manual Transfer</h2>
              <div className="form-group">
                <label>Amount:</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="form-group">
                <label>Currency:</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="">Select currency</option>
                  {[...new Set(supportedChains.chains.map(chain => chain.symbol))].map(symbol => (
                    <option key={symbol} value={symbol}>{symbol}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destination Chain:</label>
                <select value={destChain} onChange={(e) => setDestChain(e.target.value)}>
                  <option value="">Select chain</option>
                  {supportedChains.chains.map(chain => (
                    <option key={chain.name} value={chain.name}>{chain.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destination Wallet:</label>
                <input
                  type="text"
                  value={destWallet}
                  onChange={(e) => setDestWallet(e.target.value)}
                  placeholder="Enter destination wallet address"
                />
              </div>

              <button onClick={handleManualTransfer}>Process Transfer</button>
            </div>
          )}
        </>
      )}

      {showTransfer && (
        <Transfer
          transferParams={transferParams}
          onClose={handleTransferClose}
          onRetry={() => setShowTransfer(false)}
        />
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .mode-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .mode-toggle button {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
        }

        .mode-toggle button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .transfer-form {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-group {
          margin-bottom: 15px;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        input, select, textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        textarea {
          resize: vertical;
        }

        button {
          background: #28a745;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          width: 100%;
        }

        button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}
