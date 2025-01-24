import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { WalletInfo, Transaction, PaginationProps } from '../../types';

interface Props {
  balance: string;
  walletInfo: WalletInfo;
  transactions: Transaction[];
  isLoadingTxns: boolean;
  copied: boolean;
  handleCopy: (text: string) => void;
  formatDate: (timestamp: number) => string;
  getTransactionType: (tx: Transaction) => string;
  getTransactionAmount: (tx: Transaction) => string;
  _pagination: PaginationProps;
  navigateTo: (page: string) => void;
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
  _pagination,
  navigateTo
}: Props) {
  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Balance</div>
              <div className="text-3xl font-bold">{balance} NEAR</div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">Account ID:</div>
              <div className="font-mono text-sm">{walletInfo?.accountId}</div>
              <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                <button
                  onClick={() => handleCopy(walletInfo?.accountId || '')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
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
          onPress={() => {
            // Check authentication before navigation
            chrome.storage.local.get(['walletInfo'], (result) => {
              if (result.walletInfo) {
                navigateTo('send?mode=native');
              } else {
                navigateTo('login');
              }
            });
          }}
          className="h-16 shadow-sm"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">Send</span>
            <span className="text-xs opacity-80">Transfer NEAR</span>
          </div>
        </Button>

        <Button
          size="lg"
          color="secondary"
          startContent={<ArrowDownIcon className="h-5 w-5" />}
          onPress={() => navigateTo('receive')}
          className="h-16 shadow-sm"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">Receive</span>
            <span className="text-xs opacity-80">Get NEAR</span>
          </div>
        </Button>
      </div>

      {/* Transactions Card */}
      <Card className="shadow-sm">
        <CardBody className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          
          {isLoadingTxns ? (
            <div className="text-center py-8 text-gray-500">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No transactions yet</div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div 
                  key={tx.transaction_hash}
                  className="flex justify-between items-center py-3 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{getTransactionType(tx)}</div>
                    <div className="text-sm text-gray-500">{formatDate(tx.block_timestamp)}</div>
                  </div>
                  <div className="font-medium">{getTransactionAmount(tx)} NEAR</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
} 