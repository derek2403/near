import { useState } from 'react';
import Transfer from '../components/Transfer';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [action, setAction] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferParams, setTransferParams] = useState(null);

  const handleSend = async () => {
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
      
      if (data.type === 'transfer') {
        setAction('transfer');
        if (data.params.isComplete) {
          setTransferParams(data.params.params);
          setShowTransfer(true);
          setResponse('Processing transfer request...');
        } else {
          setResponse('Some parameters are missing. Here\'s what I detected:\n' +
            JSON.stringify(data.params.params, null, 2));
        }
      } else {
        setAction('chat');
        setResponse(data.result || 'No response from the API');
      }
    } catch (error) {
      console.error('Error communicating with API:', error);
      setResponse('An error occurred.');
    }
  };

  const handleTransferClose = () => {
    setShowTransfer(false);
    setTransferParams(null);
    setInput('');
    setResponse('Transfer cancelled.');
  };

  const handleTransferRetry = () => {
    setShowTransfer(false);
    setResponse('Please provide all required transfer information: origin chain, destination chain, origin wallet address, and destination wallet address.');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Chatbot</h1>
      <textarea
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleSend} style={{ marginBottom: '10px' }}>Send</button>
      <p><strong>Detected Action:</strong> {action}</p>
      <div style={{ whiteSpace: 'pre-wrap' }}>
        <strong>Response:</strong>
        <p>{response}</p>
      </div>

      {showTransfer && (
        <Transfer
          transferParams={transferParams}
          onClose={handleTransferClose}
          onRetry={handleTransferRetry}
        />
      )}
    </div>
  );
}