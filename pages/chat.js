import { useState } from 'react';

export default function Chatbot() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [action, setAction] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    // Identify the action using a switch statement
    let detectedAction = '';
    const keywords = input.toLowerCase();

    switch (true) {
      case keywords.includes('transfer'):
        detectedAction = 'transfer';
        break;
      case keywords.includes('create wallet'):
        detectedAction = 'create_wallet';
        break;
      case keywords.includes('view balance'):
        detectedAction = 'view_balance';
        break;
      default:
        detectedAction = 'unknown';
    }

    setAction(detectedAction);

    // Send the input to the backend if needed
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: input }),
      });

      const data = await res.json();
      setResponse(data.result || 'No response from the API');
    } catch (error) {
      console.error('Error communicating with API:', error);
      setResponse('An error occurred.');
    }
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
    </div>
  );
}