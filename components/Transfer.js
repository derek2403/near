import { useState, useEffect } from 'react';

export default function Transfer({ transferParams, onClose, onRetry }) {
  const [isValid, setIsValid] = useState(false);
  const [missingParams, setMissingParams] = useState([]);
  const [confirmedParams, setConfirmedParams] = useState(null);

  useEffect(() => {
    validateParams();
  }, [transferParams]);

  const validateParams = () => {
    const required = {
      originchain: 'Origin Chain',
      destchain: 'Destination Chain',
      originwallet: 'Origin Wallet',
      destwallet: 'Destination Wallet',
      amount: 'Amount',
      currency: 'Currency'
    };

    const missing = [];
    
    Object.entries(required).forEach(([key, label]) => {
      if (!transferParams[key]) {
        missing.push(label);
      }
    });

    setMissingParams(missing);
    setIsValid(missing.length === 0);
  };

  if (!isValid) {
    return (
      <div className="transfer-modal">
        <div className="modal-content">
          <h2>Missing Information</h2>
          <p>Please provide the following information:</p>
          <ul>
            {missingParams.map((param, index) => (
              <li key={index}>{param}</li>
            ))}
          </ul>
          <div className="button-group">
            <button onClick={onRetry}>Try Again</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
        <style jsx>{`
          .transfer-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
          }
          .button-group {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
            margin-top: 20px;
          }
          button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
          }
          button:first-child {
            background: #007bff;
            color: white;
          }
          button:last-child {
            background: #6c757d;
            color: white;
          }
        `}</style>
      </div>
    );
  }

  if (transferParams.needsConfirmation && !confirmedParams) {
    return (
      <div className="transfer-modal">
        <div className="modal-content">
          <h2>Please Confirm Details</h2>
          {transferParams.suggestions.originChain && (
            <div className="suggestion-group">
              <p>Did you mean <strong>{transferParams.suggestions.originChain.suggested}</strong> for origin chain?</p>
              <p className="found-text">You entered: {transferParams.suggestions.originChain.found}</p>
            </div>
          )}
          {transferParams.suggestions.destChain && (
            <div className="suggestion-group">
              <p>Did you mean <strong>{transferParams.suggestions.destChain.suggested}</strong> for destination chain?</p>
              <p className="found-text">You entered: {transferParams.suggestions.destChain.found}</p>
            </div>
          )}
          {transferParams.suggestions.currency && (
            <div className="suggestion-group">
              <p>Did you mean <strong>{transferParams.suggestions.currency.suggested}</strong>?</p>
              <p className="found-text">You entered: {transferParams.suggestions.currency.found}</p>
            </div>
          )}
          <div className="button-group">
            <button onClick={() => setConfirmedParams(transferParams.params)}>Yes, Proceed</button>
            <button onClick={onRetry}>No, Let me correct</button>
            <button onClick={onClose}>Cancel</button>
          </div>
        </div>
        <style jsx>{`
          .suggestion-group {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .found-text {
            color: #6c757d;
            font-size: 0.9em;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="transfer-modal">
      <div className="modal-content">
        <h2>Confirm Transfer</h2>
        <div className="transfer-details">
          <div className="detail-group">
            <label>Amount:</label>
            <span>{transferParams.amount} {transferParams.currency}</span>
          </div>
          <div className="detail-group">
            <label>From Chain:</label>
            <span>{transferParams.originchain}</span>
          </div>
          <div className="detail-group">
            <label>To Chain:</label>
            <span>{transferParams.destchain}</span>
          </div>
          <div className="detail-group">
            <label>From Wallet:</label>
            <span className="wallet">{transferParams.originwallet}</span>
          </div>
          <div className="detail-group">
            <label>To Wallet:</label>
            <span className="wallet">{transferParams.destwallet}</span>
          </div>
        </div>
        <div className="button-group">
          <button onClick={() => {/* Handle transfer logic */}}>Confirm Transfer</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        <style jsx>{`
          .transfer-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
          }
          .transfer-details {
            margin: 20px 0;
          }
          .detail-group {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 4px;
          }
          .wallet {
            font-family: monospace;
            font-size: 0.9em;
          }
          .button-group {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
          }
          button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            cursor: pointer;
          }
          button:first-child {
            background: #28a745;
            color: white;
          }
          button:last-child {
            background: #6c757d;
            color: white;
          }
        `}</style>
      </div>
    </div>
  );
} 