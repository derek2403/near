import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { TokenIcon } from '../../public/icons/TokenIcon';
import { ActivityIcon } from '../../public/icons/ActivityIcon';
import { chains } from '../../data/supportedChain.json';
import Image from 'next/image';
import { Page } from '../../utils/navigation';

interface Props {
  balance: string;
  walletInfo: {
    accountId: string;
    publicKey: string;
  };
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

const calculateTotalBalance = (balances: Record<string, string>) => {
  return Object.values(balances)
    .reduce((total, balance) => total + parseFloat(balance), 0)
    .toFixed(4);
};

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
  navigateTo,
  pagination,
  evmAddress,
  isDerivingAddress,
  derivationError,
  chainBalances
}: Props) {
  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Chain Signature Wallet</div>
            
            {isDerivingAddress ? (
              <div className="text-center py-4">Deriving EVM address...</div>
            ) : derivationError ? (
              <div className="text-red-500">{derivationError}</div>
            ) : (
              <div className="space-y-4">
                {/* EVM Address Card */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-[2fr_1fr_auto] gap-4">
                    {/* EVM Address Section */}
                    <div>
                      <div className="font-medium mb-2">Your EVM Address</div>
                      <div className="text-sm font-mono text-gray-600 flex items-center">
                        {evmAddress}
                        <button
                          onClick={() => handleCopy(evmAddress)}
                          className="ml-2 text-gray-500 hover:text-gray-700 inline-flex items-center"
                        >
                          {copied ? (
                            <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            <ClipboardIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Balance Section */}
                    <div>
                      <div className="font-medium mb-2">Total Balance</div>
                      <div className="text-sm text-gray-600">
                        {calculateTotalBalance(chainBalances)} ETH
                      </div>
                    </div>

                    {/* Chain Logos Section */}
                    <div className="flex items-start gap-2">
                      {chains.map((chain) => (
                        <Tooltip 
                          key={chain.prefix}
                          content={chain.name}
                        >
                          <Image
                            src={chain.logo}
                            alt={chain.name}
                            width={24}
                            height={24}
                            className="cursor-pointer transition-transform hover:scale-110"
                            onClick={() => window.open(`${chain.explorerUrl}${evmAddress}`, '_blank')}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-2">
              <div className="text-sm opacity-80">NEAR Account ID:</div>
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
          onPress={() => navigateTo('send?mode=chain')}
          className="h-20"
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-lg">Send</span>
            <span className="text-xs opacity-80 whitespace-nowrap">Transfer via Chain Signature</span>
          </div>
        </Button>

        <Button
          size="lg"
          color="secondary"
          startContent={<ArrowDownIcon className="h-5 w-5" />}
          onPress={() => navigateTo('receive')}
          className="h-20"
          isDisabled
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-lg">Receive</span>
            <span className="text-xs opacity-80 whitespace-nowrap">Receive via Chain Signature</span>
          </div>
        </Button>
      </div>

      {/* Transactions Card with Tabs */}
      <Card>
        <CardBody>
          <Tabs
            aria-label="Transaction options"
            classNames={{
              tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-[#22d3ee]",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-[#06b6d4]",
            }}
            color="primary"
            variant="underlined"
          >
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
                {chains.map((chain) => (
                  <div key={chain.prefix} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center gap-3">
                      <Image
                        src={chain.logo}
                        alt={chain.name}
                        width={24}
                        height={24}
                        className="cursor-pointer transition-transform hover:scale-110"
                      />
                      <div>
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-sm text-gray-500">{chain.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {chainBalances[chain.prefix] || '0.0000'} {chain.symbol}
                      </div>
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => window.open(`${chain.explorerUrl}${evmAddress}`, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
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
                  <div className="text-sm text-gray-400">
                    Your EVM chain transactions will be displayed in this section once you start making transfers
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