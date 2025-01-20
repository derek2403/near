import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Page } from '../../utils/navigation';

interface Props {
  balance: string;
  walletInfo: any;
  transactions: any[];
  isLoadingTxns: boolean;
  copied: boolean;
  handleCopy: (text: string) => void;
  formatDate: (timestamp: number) => string;
  getTransactionType: (tx: any) => string;
  getTransactionAmount: (tx: any) => string;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  navigateTo: (page: Page | `${Page}?${string}`) => void;
}

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
  pagination,
  navigateTo
}: Props) {
  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-6">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Total Balance</div>
            <div className="text-2xl font-bold mb-4">{balance} NEAR</div>
            <div className="flex items-center space-x-2">
              <div className="text-sm opacity-80">Account ID:</div>
              <div className="font-mono">{walletInfo?.accountId}</div>
              <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                <button
                  onClick={() => handleCopy(walletInfo?.accountId)}
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
          onPress={() => navigateTo('send?mode=native' as const)}
          className="h-16"
        >
          <div className="flex flex-col items-start">
            <span>Send</span>
            <span className="text-xs opacity-80">Transfer NEAR</span>
          </div>
        </Button>

        <Button
          size="lg"
          color="secondary"
          startContent={<ArrowDownIcon className="h-5 w-5" />}
          onPress={() => navigateTo('receive')}
          className="h-16"
        >
          <div className="flex flex-col items-start">
            <span>Receive</span>
            <span className="text-xs opacity-80">Get NEAR</span>
          </div>
        </Button>
      </div>

      {/* Transactions Card */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          
          {isLoadingTxns ? (
            <div className="text-center py-4">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-4">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <Card key={tx.transaction_hash} className="bg-gray-50">
                  <CardBody className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {getTransactionType(tx)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(tx.block_timestamp)}
                        </p>
                      </div>
                      <p className={`font-medium ${
                        getTransactionAmount(tx).startsWith('+') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {getTransactionAmount(tx)} NEAR
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={pagination.currentPage === page ? "solid" : "bordered"}
                      onPress={() => pagination.onPageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
} 