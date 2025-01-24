import { Card, CardBody, Button, Tooltip, Pagination, Tabs, Tab, Image } from "@nextui-org/react";
import { TokenIcon } from '../../public/icons/TokenIcon';
import { ActivityIcon } from '../../public/icons/ActivityIcon';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { chains } from '../../data/supportedChain.json';
import { useChainBalances } from '../../hooks/useChainBalances';

// Added new helper function
const formatBalance = (balance) => {
  return balance ? Number(balance).toFixed(4) : '0.0000';
};

export default function ChainSignatureDashboard({ 
  walletInfo, 
  transactions, 
  isLoadingTxns,
  copied,
  handleCopy,
  formatDate,
  getTransactionType,
  getTransactionAmount,
  router,
  pagination,
  evmAddress,
  isDerivingAddress,
  derivationError,
}) {
  const { 
    balances: chainBalances, 
    totalBalance,
    refreshBalances,
    isLoading: isLoadingBalances 
  } = useChainBalances(evmAddress);

  // Added new function for explorer URL
  const getExplorerUrl = (address, chain) => {
    return `${chain.explorerUrl}${address}`;
  };

  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Chain Signature Wallet</div>
            
            {isDerivingAddress || isLoadingBalances ? (
              <div className="text-center py-4">
                {isDerivingAddress ? "Deriving EVM address..." : "Loading balances..."}
              </div>
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
                      <div className="text-sm font-mono text-gray-600 flex items-center gap-2">
                        <span className="truncate">{evmAddress}</span>
                        <Tooltip content={copied ? "Copied!" : "Copy address"}>
                          <button
                            onClick={() => handleCopy(evmAddress)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {copied ? (
                              <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <ClipboardIcon className="h-4 w-4" />
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Balance Section */}
                    <div>
                      <div className="font-medium mb-2">Total Balance</div>
                      <div className="text-sm text-gray-600">
                        {formatBalance(totalBalance)} ETH
                      </div>
                    </div>

                    {/* Chain Logos Section */}
                    <div className="flex items-start gap-2">
                      {chains.map((chain) => (
                        <Tooltip 
                          key={chain.prefix}
                          content={`${chain.name}: ${formatBalance(chainBalances[chain.prefix])} ETH`}
                        >
                          <Button
                            isIconOnly
                            variant="light"
                            className="min-w-unit-10 w-10 h-10"
                            onPress={() => window.open(getExplorerUrl(evmAddress, chain), '_blank')}
                          >
                            <Image
                              src={chain.logo}
                              alt={chain.name}
                              width={24}
                              height={24}
                              className="transition-transform hover:scale-110"
                            />
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEAR Account Section */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm opacity-80">NEAR Account ID:</span>
              <span className="font-mono">{walletInfo?.accountId}</span>
              <Tooltip content={copied ? "Copied!" : "Copy ID"}>
                <button
                  onClick={() => handleCopy(walletInfo?.accountId)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4" />
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
          onPress={() => router.push('/send?mode=chain')}
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
          onPress={() => router.push('/receive')}
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
                      <img 
                        src={chain.logo} 
                        alt={chain.name} 
                        className="w-8 h-8"
                      />
                      <div>
                        <div className="font-medium">{chain.name}</div>
                        <div className="text-sm text-gray-500">{chain.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {(chainBalances[chain.prefix] || '0.0000')} {chain.symbol}
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