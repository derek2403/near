import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { navigateTo, Page } from '../utils/navigation';
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignature/ChainSignatureDashboard';
import { Selection } from "@nextui-org/react";

const { providers } = nearAPI;

interface WalletInfo {
  accountId: string;
  publicKey: string;
  secretKey: string;
  seedPhrase?: string;
}

interface Transaction {
  transaction_hash: string;
  signer_account_id: string;
  receiver_account_id: string;
  block_timestamp: number;
  deposit: string;
  status: string;
}

// Add interface for account state
interface AccountState {
  amount: string;
  locked: string;
  code_hash: string;
  storage_usage: number;
  storage_paid_at: number;
  block_height: number;
  block_hash: string;
}

export default function Dashboard() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const [isVertical, setIsVertical] = useState(true);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        // Get wallet info from extension storage
        chrome.storage.local.get(['walletInfo'], async (result) => {
          if (!result.walletInfo) {
            navigateTo('home');
            return;
          }

          setWalletInfo(result.walletInfo);

          // Create JSON RPC provider
          const provider = new providers.JsonRpcProvider({
            url: "https://rpc.testnet.near.org"
          });

          // Get account balance using RPC
          const accountState = await provider.query({
            request_type: 'view_account',
            finality: 'final',
            account_id: result.walletInfo.accountId
          }) as AccountState; // Type assertion here

          console.log('Account State:', accountState);
          
          // Store yoctoNEAR balance for logs
          const yoctoNearBalance = accountState.amount;
          console.log('Balance in yoctoNEAR:', yoctoNearBalance);

          // Convert to NEAR and format to 6 decimal places
          const nearBalance = nearAPI.utils.format.formatNearAmount(yoctoNearBalance);
          const formattedBalance = Number(nearBalance).toFixed(6);
          setBalance(formattedBalance);
          console.log('Balance in NEAR:', formattedBalance);

          // Fetch recent transactions
          await fetchRecentTransactions(result.walletInfo.accountId);
        });
      } catch (err) {
        setError('Error loading wallet information');
        console.error('Wallet loading error:', err);
      }
    };

    fetchWalletInfo();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('selectedTab');
    if (stored) {
      setIsVertical(stored === 'near');
    }
  }, []);

  const fetchRecentTransactions = async (accountId: string) => {
    try {
      setIsLoadingTxns(true);
      const response = await fetch(
        `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns-only?per_page=25&order=desc`
      );
      const data = await response.json();
      
      if (data && data.txns) {
        const uniqueTxns = new Map();
        
        data.txns.forEach((tx: Transaction) => {
          if (!uniqueTxns.has(tx.transaction_hash)) {
            uniqueTxns.set(tx.transaction_hash, {
              transaction_hash: tx.transaction_hash,
              signer_account_id: tx.signer_account_id,
              receiver_account_id: tx.receiver_account_id,
              block_timestamp: tx.block_timestamp,
              deposit: tx.deposit,
              status: tx.status
            });
          }
        });
        
        const formattedTxns = Array.from(uniqueTxns.values());
        setTransactions(formattedTxns);
        setTotalPages(Math.ceil(formattedTxns.length / ITEMS_PER_PAGE));
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTxns(false);
    }
  };

  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return transactions.slice(startIndex, endIndex);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (tx: Transaction) => {
    if (tx.signer_account_id === walletInfo?.accountId) {
      return 'Sent';
    }
    return 'Received';
  };

  const getTransactionAmount = (tx: Transaction) => {
    try {
      if (!tx.deposit) return "0";
      const amount = nearAPI.utils.format.formatNearAmount(tx.deposit);
      const sign = tx.signer_account_id === walletInfo?.accountId ? '-' : '+';
      return `${sign}${Number(amount).toFixed(2)}`;
    } catch {
      return "0";
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['walletInfo'], () => {
      navigateTo('home');
    });
  };

  const handleTabChange = (key: "near" | "chain") => {
    const isNearTab = key === "near";
    setIsVertical(isNearTab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTab', key);
    }
  };

  const renderDashboard = () => {
    const props = {
      balance,
      walletInfo,
      transactions: getPaginatedTransactions(),
      isLoadingTxns,
      copied,
      handleCopy,
      formatDate,
      getTransactionType,
      getTransactionAmount,
      pagination: {
        currentPage,
        totalPages,
        onPageChange: setCurrentPage
      },
      navigateTo: (page: Page | `${Page}?${string}`) => navigateTo(page)
    };

    return isVertical ? 
      <NativeNearDashboard {...props} /> : 
      <ChainSignatureDashboard 
        {...props}
        evmAddress="0x..."
        isDerivingAddress={false}
        derivationError=""
        chainBalances={{}}
      />;
  };

  if (!walletInfo) {
    return (
      <div className="min-h-[600px] p-4 bg-gray-50 flex items-center justify-center">
        <Card>
          <CardBody>
            {error || 'Loading...'}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <div className="space-y-4">
        {/* Header with Tabs */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Wallet Dashboard</h1>
            <Tabs 
              aria-label="Wallet Mode"
              selectedKey={isVertical ? "near" : "chain"}
              onSelectionChange={(key) => handleTabChange(key as "near" | "chain")}
              variant="bordered"
              classNames={{
                tabList: "gap-4",
                cursor: "w-full bg-primary",
                tab: "h-8 px-3",
                tabContent: "group-data-[selected=true]:text-white"
              }}
            >
              <Tab
                key="near"
                title="Native NEAR"
              />
              <Tab
                key="chain"
                title="Chain Signature"
              />
            </Tabs>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={() => navigateTo('settings')}
          >
            <Cog8ToothIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Render appropriate dashboard based on tab selection */}
        {renderDashboard()}
      </div>
    </div>
  );
} 