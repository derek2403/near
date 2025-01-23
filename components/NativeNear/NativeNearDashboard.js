import { Card, CardBody, Button, Tooltip, Pagination } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function NativeNearDashboard({ 
  balance, 
  walletInfo, 
  transactions, 
  isLoadingTxns,
  copied,
  handleCopy,
  formatDate,
  getTransactionType,
  getTransactionAmount,
  router,
  pagination
}) {
  // Add state for copy icon
  const [showCopyTick, setShowCopyTick] = useState(false);

  // Modified copy handler
  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(walletInfo?.accountId);
      setShowCopyTick(true);
      setTimeout(() => {
        setShowCopyTick(false);
      }, 1000); // Change back after 1 second
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Update helper function to check transaction status
  const getTransactionStatus = (tx) => {
    if (tx.status === false) {
      return { status: 'Failed', className: 'text-red-500' };
    }
    return { status: '', className: '' };
  };

  // Add helper function to format NEAR amount
  const formatNearAmount = (amount) => {
    // Convert to number and fix to 6 decimal places
    return Number(amount).toFixed(6);
  };

  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Total Balance</div>
            <div className="text-4xl font-bold mb-4">{formatNearAmount(balance)} NEAR</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm opacity-80">Account ID:</div>
              <div className="font-mono">{walletInfo?.accountId}</div>
              <Tooltip content={showCopyTick ? "Copied!" : "Copy to clipboard"}>
                <button
                  onClick={handleCopyClick}
                  className="text-black opacity-80 hover:opacity-100"
                >
                  {showCopyTick ? (
                    <ClipboardDocumentCheckIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          color="primary"
          startContent={<ArrowUpIcon className="h-5 w-5" />}
          onPress={() => router.push('/send?mode=native')}
          className="h-20"
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-lg">Send</span>
            <span className="text-xs opacity-80 whitespace-nowrap">Transfer NEAR</span>
          </div>
        </Button>

        <Button
          size="lg"
          color="secondary"
          startContent={<ArrowDownIcon className="h-5 w-5" />}
          onPress={() => router.push('/receive')}
          className="h-20"
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-lg">Receive</span>
            <span className="text-xs opacity-80 whitespace-nowrap">Get NEAR</span>
          </div>
        </Button>
      </div>

      {/* Transactions Card */}
      <Card>
        <CardBody>
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          
          {isLoadingTxns ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4">No transactions found</div>
          ) : (
            <div className="space-y-4">
              {/* Transaction list */}
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const txStatus = getTransactionStatus(tx);
                  const isFailed = txStatus.status === 'Failed';
                  
                  return (
                    <div
                      key={tx.transaction_hash}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          isFailed 
                            ? 'bg-red-100' 
                            : getTransactionType(tx, walletInfo.accountId) === 'Sent'
                              ? 'bg-pink-100' 
                              : 'bg-green-100'
                        }`}>
                          {isFailed ? (
                            <XCircleIcon className="h-5 w-5 text-red-500" />
                          ) : getTransactionType(tx, walletInfo.accountId) === 'Sent' ? (
                            <ArrowUpIcon className="h-5 w-5 text-pink-500" />
                          ) : (
                            <ArrowDownIcon className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {getTransactionType(tx, walletInfo.accountId)}
                            {txStatus.status && (
                              <span className={`text-sm ${txStatus.className}`}>
                                ({txStatus.status})
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(tx.block_timestamp)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {!isFailed && (
                          <div className={`font-medium ${txStatus.className}`}>
                            {formatNearAmount(getTransactionAmount(tx))} NEAR
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          <Button
                            size="sm"
                            variant="light"
                            onPress={() => window.open(`https://testnet.nearblocks.io/txns/${tx.transaction_hash}`, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-4">
                <Pagination
                  total={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={pagination.onPageChange}
                  showControls
                />
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
} 