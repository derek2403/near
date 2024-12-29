import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

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
  router
}) {
  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Total Balance</div>
            <div className="text-4xl font-bold mb-4">{balance} NEAR</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm opacity-80">Account ID:</div>
              <div className="font-mono">{walletInfo?.accountId}</div>
              <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                <button
                  onPress={() => handleCopy(walletInfo?.accountId)}
                  className="text-black opacity-80 hover:opacity-100"
                >
                  {copied ? (
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
          onPress={() => router.push('/send')}
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

      {/* Recent Transactions Card */}
      <Card>
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          {isLoadingTxns ? (
            <div className="text-center text-gray-500 py-8">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No recent transactions
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.transaction_hash}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      getTransactionType(tx, walletInfo?.accountId) === 'Sent' 
                        ? 'bg-danger-100 text-danger-500'
                        : 'bg-success-100 text-success-500'
                    }`}>
                      {getTransactionType(tx, walletInfo?.accountId) === 'Sent' 
                        ? <ArrowUpIcon className="h-5 w-5" />
                        : <ArrowDownIcon className="h-5 w-5" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        {getTransactionType(tx, walletInfo?.accountId)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(tx.block_timestamp)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {getTransactionAmount(tx)} NEAR
                    </p>
                    <Button
                      size="sm"
                      variant="light"
                      className="text-sm text-default-400"
                      onPress={() => window.open(`https://testnet.nearblocks.io/txns/${tx.transaction_hash}`, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
} 