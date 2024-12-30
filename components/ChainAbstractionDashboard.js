import { Card, CardBody, Button, Tooltip, Pagination, Tabs, Tab, Chip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

// Token icon component
const TokenIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="24"
    role="presentation"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <path
      d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
      fill="currentColor"
    />
    <path
      d="M15.7125 12.75H8.2875C7.87 12.75 7.53 12.41 7.53 12C7.53 11.59 7.87 11.25 8.2875 11.25H15.7125C16.13 11.25 16.47 11.59 16.47 12C16.47 12.41 16.13 12.75 15.7125 12.75Z"
      fill="currentColor"
    />
  </svg>
);

// Activity/Transaction icon component
const ActivityIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="24"
    role="presentation"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <path
      d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM7 13.31L9.15 11.16C9.35 10.96 9.66 10.96 9.86 11.16L11.52 12.82L14.54 9.79C14.74 9.59 15.05 9.59 15.25 9.79L17.7 12.24C17.89 12.43 17.89 12.74 17.7 12.93C17.51 13.12 17.2 13.12 17.01 12.93L14.95 10.87L11.93 13.9C11.73 14.1 11.42 14.1 11.22 13.9L9.56 12.24L7.8 14C7.61 14.19 7.3 14.19 7.11 14C6.91 13.81 6.91 13.5 7.1 13.31H7Z"
      fill="currentColor"
    />
  </svg>
);

export default function ChainAbstractionDashboard({ 
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
  return (
    <>
      {/* Main Balance Card */}
      <Card>
        <CardBody className="p-8">
          <div className="text-black">
            <div className="text-sm opacity-80 mb-1">Total Balance (Chain Abstraction)</div>
            <div className="text-4xl font-bold mb-4">Coming Soon</div>
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
          isDisabled
        >
          <div className="flex flex-col items-start w-full">
            <span className="text-lg">Send</span>
            <span className="text-xs opacity-80 whitespace-nowrap">Transfer via Chain Abstraction</span>
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
            <span className="text-xs opacity-80 whitespace-nowrap">Receive via Chain Abstraction</span>
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
                  <Chip size="sm" variant="faded">
                    1
                  </Chip>
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
                  <Chip size="sm" variant="faded">
                    {transactions.length}
                  </Chip>
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