import { Card, CardBody, Button, Tooltip, Pagination, Tabs, Tab, Image } from "@nextui-org/react";
import { TokenIcon } from '../public/icons/TokenIcon';
import { ActivityIcon } from '../public/icons/ActivityIcon';
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';

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
  const [derivedAddresses, setDerivedAddresses] = useState({});
  const [isDerivingAddress, setIsDerivingAddress] = useState(true);
  const [derivationError, setDerivationError] = useState('');

  useEffect(() => {
    const deriveOptimismAddress = async () => {
      try {
        setIsDerivingAddress(true);
        setDerivationError('');

        // Use index 1 for the first address
        const derivationPath = `optimism,1`;
        const adapter = await setupAdapter({
          accountId: walletInfo?.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: derivationPath,
        });

        // Connect to Optimism Sepolia
        const provider = new ethers.JsonRpcProvider("https://sepolia.optimism.io");
        const balance = await provider.getBalance(adapter.address);

        setDerivedAddresses({
          optimism: {
            address: adapter.address,
            balance: ethers.formatEther(balance),
            derivationPath
          }
        });

      } catch (err) {
        console.error('Error deriving address:', err);
        setDerivationError('Failed to derive Optimism address');
      } finally {
        setIsDerivingAddress(false);
      }
    };

    if (walletInfo?.accountId) {
      deriveOptimismAddress();
    }
  }, [walletInfo]);

  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Chain Signature Wallets</div>
            
            {isDerivingAddress ? (
              <div className="text-center py-4">Deriving addresses...</div>
            ) : derivationError ? (
              <div className="text-red-500">{derivationError}</div>
            ) : (
              <div className="space-y-4">
                {/* Optimism Address Card */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image
                      src="https://cryptologos.cc/logos/optimism-ethereum-op-logo.png"
                      alt="Optimism"
                      width={32}
                      height={32}
                    />
                    <div>
                      <div className="font-medium">Optimism</div>
                      <div className="text-xs text-gray-500 font-mono">
                        {derivedAddresses.optimism?.address}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {derivedAddresses.optimism?.balance || '0'} ETH
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => window.open(`https://sepolia-optimism.etherscan.io/address/${derivedAddresses.optimism?.address}`, '_blank')}
                    >
                      View
                    </Button>
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