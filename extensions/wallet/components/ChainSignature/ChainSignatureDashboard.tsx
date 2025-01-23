import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { navigateTo, Page } from '../../utils/navigation';

// You'll need to create these icons or import from a library
const TokenIcon = () => <div>T</div>;
const ActivityIcon = () => <div>A</div>;

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
  evmAddress: string;
  isDerivingAddress: boolean;
  derivationError: string;
  chainBalances: Record<string, string>;
}

export default function ChainSignatureDashboard({
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
  navigateTo,
  evmAddress,
  isDerivingAddress,
  derivationError,
  chainBalances
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
              <div className="text-sm opacity-80">EVM Address:</div>
              <div className="font-mono">{evmAddress || 'Deriving...'}</div>
              {evmAddress && (
                <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                  <button
                    onClick={() => handleCopy(evmAddress)}
                    className="text-black opacity-80 hover:opacity-100"
                  >
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="h-5 w-5" />
                    ) : (
                      <ClipboardIcon className="h-5 w-5" />
                    )}
                  </button>
                </Tooltip>
              )}
            </div>
            {derivationError && (
              <div className="text-danger text-sm mt-2">{derivationError}</div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          size="lg"
          color="primary"
          startContent={<ArrowUpIcon className="h-5 w-5" />}
          onPress={() => navigateTo('send?mode=chain' as const)}
          className="h-16"
        >
          <div className="flex flex-col items-start">
            <span>Send</span>
            <span className="text-xs opacity-80">Transfer Tokens</span>
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
            <span className="text-xs opacity-80">Get Tokens</span>
          </div>
        </Button>
      </div>

      {/* Chain Balances */}
      <Card>
        <CardBody>
          <h2 className="text-lg font-semibold mb-4">Chain Balances</h2>
          {Object.entries(chainBalances).map(([chain, balance]) => (
            <div key={chain} className="flex justify-between items-center py-2">
              <span>{chain}</span>
              <span className="font-medium">{balance}</span>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Transactions Card with Tabs */}
      <Card>
        <CardBody>
          <Tabs aria-label="Options">
            <Tab
              key="tokens"
              title={
                <div className="flex items-center space-x-2">
                  <TokenIcon />
                  <span>Chain Balances</span>
                </div>
              }
            >
              <div className="py-4">
                <div className="text-center py-8">
                  <div className="mb-4 text-gray-500">
                    Chain balances will appear here
                  </div>
                </div>
              </div>
            </Tab>
            <Tab
              key="transactions"
              title={
                <div className="flex items-center space-x-2">
                  <ActivityIcon />
                  <span>Recent Transactions</span>
                </div>
              }
            >
              <div className="py-4">
                <div className="text-center py-8">
                  <div className="mb-4 text-gray-500">
                    Chain Signature transactions will appear here
                  </div>
                </div>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </>
  );
} 