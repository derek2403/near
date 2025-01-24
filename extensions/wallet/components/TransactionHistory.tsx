import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Spinner } from "@nextui-org/react";
import { TransactionHistory as TxHistory } from '../../TEMP/sdk/src/types';
import { formatDistance } from 'date-fns';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<TxHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_TRANSACTION_HISTORY' });
    if (response.transactions) {
      setTransactions(response.transactions);
    }
    setLoading(false);
  };

  const handleClearHistory = async () => {
    await chrome.runtime.sendMessage({ type: 'CLEAR_TRANSACTION_HISTORY' });
    setTransactions([]);
  };

  const getStatusColor = (status: TxHistory['status']) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failure': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const formatAmount = (amount?: string) => {
    if (!amount) return '';
    return `${parseFloat(amount).toLocaleString()} Ⓝ`;
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaction History</h2>
          {transactions.length > 0 && (
            <Button
              size="sm"
              color="danger"
              variant="light"
              onPress={handleClearHistory}
            >
              Clear History
            </Button>
          )}
        </div>

        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`font-medium ${getStatusColor(tx.status)}`}>
                      {tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Contract Call'}
                    </span>
                    {tx.amount && (
                      <span className="ml-2 font-bold">{formatAmount(tx.amount)}</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDistance(tx.timestamp, new Date(), { addSuffix: true })}
                  </span>
                </div>

                <div className="mt-2 text-sm">
                  <p>
                    <span className="text-gray-500">From: </span>
                    {tx.from}
                  </p>
                  <p>
                    <span className="text-gray-500">To: </span>
                    {tx.to}
                  </p>
                  {tx.methodName && (
                    <p>
                      <span className="text-gray-500">Method: </span>
                      {tx.methodName}
                    </p>
                  )}
                </div>

                {tx.errorMessage && (
                  <p className="mt-2 text-sm text-red-500">{tx.errorMessage}</p>
                )}

                <div className="mt-2 text-sm">
                  <a
                    href={`https://${tx.network === 'mainnet' ? '' : 'testnet.'}nearblocks.io/txns/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View on Explorer ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
} 