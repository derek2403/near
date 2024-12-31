import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { coins } from '../data/coins.json';
import NativeNearDashboard from '../components/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignatureDashboard';
import { NearIcon } from '../public/icons/NearIcon';
import { ChainIcon } from '../public/icons/ChainIcon';

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState("0");
  const [yoctoBalance, setYoctoBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [isVertical, setIsVertical] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchWalletInfo = async () => {
      // Check if user is logged in
      const publicInfo = localStorage.getItem('publicWalletInfo');
      
      if (!publicInfo) {
        router.push('/');
        return;
      }

      try {
        const parsedInfo = JSON.parse(publicInfo);
        setWalletInfo(parsedInfo);

        // Create JSON RPC provider
        const provider = new providers.JsonRpcProvider({
          url: "https://rpc.testnet.near.org"
        });

        // Get account balance using RPC
        const accountState = await provider.query({
          request_type: 'view_account',
          finality: 'final',
          account_id: parsedInfo.accountId
        });

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
        await fetchRecentTransactions(parsedInfo.accountId);

      } catch (err) {
        setError('Error loading wallet information');
        console.error('Wallet loading error:', err);
      }
    };

    fetchWalletInfo();
  }, []);

  const fetchRecentTransactions = async (accountId) => {
    try {
      setIsLoadingTxns(true);
      const response = await fetch(
        `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns-only?per_page=25&order=desc`
      );
      const data = await response.json();
      
      if (data && data.txns) {
        const uniqueTxns = new Map();
        
        data.txns.forEach(tx => {
          if (!uniqueTxns.has(tx.transaction_hash)) {
            uniqueTxns.set(tx.transaction_hash, {
              transaction_hash: tx.transaction_hash,
              signer_account_id: tx.signer_account_id,
              receiver_account_id: tx.receiver_account_id,
              block_timestamp: tx.block_timestamp,
              deposit: tx.actions_agg?.deposit || "0",
              status: tx.outcomes?.status
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

  const formatDate = (timestamp) => {
    // Convert NEAR timestamp (nanoseconds) to milliseconds
    const date = new Date(timestamp / 1000000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionType = (tx, accountId) => {
    if (tx.signer_account_id === accountId) {
      return 'Sent';
    }
    return 'Received';
  };

  const getTransactionAmount = (tx) => {
    try {
      if (!tx.deposit) return "0";
      const amount = nearAPI.utils.format.formatNearAmount(tx.deposit);
      // Add minus sign if the user is the sender
      const sign = tx.signer_account_id === walletInfo?.accountId ? '-' : '+';
      return `${sign}${Number(amount).toFixed(2)}`;
    } catch {
      return "0";
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
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
      router,
      pagination: {
        currentPage,
        totalPages,
        onPageChange: setCurrentPage
      }
    };

    return isVertical ? 
      <NativeNearDashboard {...props} /> : 
      <ChainSignatureDashboard {...props} />;
  };

  if (!walletInfo) {
    return <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
      <Card>
        <CardBody>
          {error || 'Loading...'}
        </CardBody>
      </Card>
    </div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Tabs and Settings Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
            <Tabs 
              aria-label="Wallet Mode" 
              selectedKey={isVertical ? "near" : "chain"}
              onSelectionChange={(key) => setIsVertical(key === "near")}
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
                title={
                  <div className="flex items-center space-x-2">
                    <NearIcon className="w-4 h-4" />
                    <span className="text-sm">Native NEAR</span>
                  </div>
                }
              />
              <Tab
                key="chain"
                title={
                  <div className="flex items-center space-x-2">
                    <ChainIcon className="w-4 h-4" />
                    <span className="text-sm">Chain Signature</span>
                  </div>
                }
              />
            </Tabs>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/settings')}
          >
            <Cog8ToothIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Render appropriate dashboard based on tab selection */}
        {renderDashboard()}
      </div>
    </div>
  );
}
