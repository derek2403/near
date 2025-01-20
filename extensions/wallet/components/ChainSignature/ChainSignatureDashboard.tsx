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
  evmAddress: string;
  isDerivingAddress: boolean;
  derivationError: string;
  chainBalances: Record<string, string>;
  navigateTo: (page: Page | `${Page}?${string}`) => void;
}

export default function ChainSignatureDashboard({
  balance,
  walletInfo,
  transactions,
  isLoadingTxns,
  copied,
  handleCopy,
  evmAddress,
  isDerivingAddress,
  derivationError,
  chainBalances,
  navigateTo
}: Props) {
  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-6">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Chain Signature Wallet</div>
            
            {isDerivingAddress ? (
              <div className="text-center py-4">Deriving EVM address...</div>
            ) : derivationError ? (
              <div className="text-red-500">{derivationError}</div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium mb-2">Your EVM Address</div>
                    <div className="text-sm font-mono text-gray-600 flex items-center">
                      {evmAddress}
                      <button
                        onClick={() => handleCopy(evmAddress)}
                        className="ml-2 text-gray-500 hover:text-gray-700"
                      >
                        {copied ? (
                          <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ClipboardIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Add action buttons similar to the main app */}
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
            <span className="text-xs opacity-80">Transfer via Chain Signature</span>
          </div>
        </Button>

        <Button
          size="lg"
          color="secondary"
          startContent={<ArrowDownIcon className="h-5 w-5" />}
          onPress={() => navigateTo('receive')}
          className="h-16"
          isDisabled
        >
          <div className="flex flex-col items-start">
            <span>Receive</span>
            <span className="text-xs opacity-80">Receive via Chain Signature</span>
          </div>
        </Button>
      </div>

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