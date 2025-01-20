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
  router,
  pagination
}) {
  const { currentPage, totalPages, onPageChange } = pagination;

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <Card>
        <CardBody className="p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Available Balance</p>
            <h2 className="text-2xl font-bold">{balance} NEAR</h2>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              color="primary"
              startContent={<ArrowUpIcon className="h-4 w-4" />}
              onPress={() => router.push('/send')}
            >
              Send
            </Button>
            <Button
              size="sm"
              color="primary"
              startContent={<ArrowDownIcon className="h-4 w-4" />}
              onPress={() => router.push('/receive')}
            >
              Receive
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Account Info */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Account ID</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{walletInfo?.accountId}</span>
              <button onClick={() => handleCopy(walletInfo?.accountId)}>
                {copied ? (
                  <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                ) : (
                  <ClipboardIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Transactions */}
      <Card>
        <CardBody className="p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Transactions</h3>
          {isLoadingTxns ? (
            <div className="text-center text-sm text-gray-600">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-sm text-gray-600">No transactions</div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.transaction_hash} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium">{getTransactionType(tx)}</p>
                    <p className="text-gray-600">{formatDate(tx.block_timestamp)}</p>
                  </div>
                  <span className={getTransactionAmount(tx).startsWith('-') ? 'text-danger' : 'text-success'}>
                    {getTransactionAmount(tx)} NEAR
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 