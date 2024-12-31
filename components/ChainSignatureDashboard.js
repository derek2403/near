import { Card, CardBody, Button, Tooltip, Pagination, Tabs, Tab, Image } from "@nextui-org/react";
import { TokenIcon } from '../public/icons/TokenIcon';
import { ActivityIcon } from '../public/icons/ActivityIcon';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';

const calculateTotalBalance = (balances) => {
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
  router,
  pagination
}) {
  const [evmAddress, setEvmAddress] = useState(null);
  const [isDerivingAddress, setIsDerivingAddress] = useState(true);
  const [derivationError, setDerivationError] = useState('');
  const [chainBalances, setChainBalances] = useState({});

  useEffect(() => {
    const deriveEvmAddress = async () => {
      try {
        setIsDerivingAddress(true);
        setDerivationError('');

        // Derive a single EVM address that will work across all chains
        const derivationPath = `evm,1`;
        const adapter = await setupAdapter({
          accountId: walletInfo?.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: derivationPath,
        });

        setEvmAddress(adapter.address);

        // Fetch balances from all supported chains
        const balances = {};
        for (const chain of chains) {
          try {
            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            const balance = await provider.getBalance(adapter.address);
            balances[chain.prefix] = ethers.formatEther(balance);
          } catch (err) {
            console.error(`Error fetching balance for ${chain.name}:`, err);
            balances[chain.prefix] = '0';
          }
        }
        setChainBalances(balances);

      } catch (err) {
        console.error('Error deriving address:', err);
        setDerivationError('Failed to derive EVM address');
      } finally {
        setIsDerivingAddress(false);
      }
    };

    if (walletInfo?.accountId) {
      deriveEvmAddress();
    }
  }, [walletInfo]);

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
          isDisabled
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
                  <span>Tokens</span>
                 
                </div>
              }
            >
              <div className="py-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <TokenIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">NEAR</div>
                      <div className="text-sm text-gray-500">Native Token</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{balance} NEAR</div>
                    <div className="text-sm text-gray-500">≈ $0.00 USD</div>
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
                {isLoadingTxns ? (
                  <div className="text-center py-4">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-4">No transactions found</div>
                ) : (
                  <div className="space-y-4">
                    {/* Transaction list */}
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div
                          key={tx.transaction_hash}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              getTransactionType(tx, walletInfo.accountId) === 'Sent' 
                                ? 'bg-pink-100' 
                                : 'bg-green-100'
                            }`}>
                              {getTransactionType(tx, walletInfo.accountId) === 'Sent' 
                                ? <ArrowUpIcon className="h-5 w-5 text-pink-500" />
                                : <ArrowDownIcon className="h-5 w-5 text-green-500" />
                              }
                            </div>
                            <div>
                              <div className="font-medium">
                                {getTransactionType(tx, walletInfo.accountId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(tx.block_timestamp)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {getTransactionAmount(tx)} NEAR
                            </div>
                            <div className="text-sm text-gray-500">
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => window.open(`https://explorer.testnet.near.org/transactions/${tx.transaction_hash}`, '_blank')}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </>
  );
} 