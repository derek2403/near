import { useState, useEffect } from 'react';
import { Button, Card, CardBody, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { navigateTo } from '../utils/navigation';
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignature/ChainSignatureDashboard';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';
import NearIcon from '../public/icons/near.svg';
import ChainIcon from '../public/icons/chain.svg';

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
  const [mode, setMode] = useState<'native' | 'chain'>('native');
  const [evmAddress, setEvmAddress] = useState('');
  const [isDerivingAddress, setIsDerivingAddress] = useState(false);
  const [derivationError, setDerivationError] = useState('');
  const [chainBalances, setChainBalances] = useState<Record<string, string>>({});

  // Load saved mode preference
  useEffect(() => {
    chrome.storage.local.get(['dashboardMode'], (result) => {
      if (result.dashboardMode) {
        setMode(result.dashboardMode);
      }
    });
  }, []);

  // Save mode preference when changed
  useEffect(() => {
    chrome.storage.local.set({ dashboardMode: mode });
  }, [mode]);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const result = await chrome.storage.local.get(['walletInfo']);
        if (!result.walletInfo) {
          navigateTo('home');
          return;
        }

        setWalletInfo(result.walletInfo);

        // Create JSON RPC provider
        const provider = new providers.JsonRpcProvider({
          url: "https://rpc.testnet.near.org"
        });

        // Get account balance
        const accountState = await provider.query({
          request_type: 'view_account',
          finality: 'final',
          account_id: result.walletInfo.accountId
        }) as AccountState;

        // Convert and format balance
        const nearBalance = nearAPI.utils.format.formatNearAmount(accountState.amount);
        const formattedBalance = Number(nearBalance).toFixed(6);
        setBalance(formattedBalance);

        // Fetch transactions
        await fetchRecentTransactions(result.walletInfo.accountId);

        // If in chain mode, derive EVM address
        if (mode === 'chain') {
          await deriveEvmAddress(result.walletInfo.accountId);
        }

      } catch (err) {
        setError('Error loading wallet information');
        console.error('Wallet loading error:', err);
      }
    };

    fetchWalletInfo();
  }, [mode]);

  const deriveEvmAddress = async (accountId: string) => {
    try {
      setIsDerivingAddress(true);
      setDerivationError('');

      const derivationPath = `evm,1`;
      const adapter = await setupAdapter({
        accountId,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
        derivationPath,
      });

      setEvmAddress(adapter.address);

      // Fetch balances from supported chains
      const balances: Record<string, string> = {};
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

  const fetchRecentTransactions = async (accountId: string) => {
    try {
      setIsLoadingTxns(true);
      const response = await fetch(
        `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns-only?per_page=25&order=desc`
      );
      const data = await response.json();
      
      if (data && data.txns) {
        const uniqueTxns = new Map<string, Transaction>();
        
        data.txns.forEach((tx: Transaction) => {
          if (!uniqueTxns.has(tx.transaction_hash)) {
            uniqueTxns.set(tx.transaction_hash, tx);
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
    return tx.signer_account_id === walletInfo?.accountId ? 'Sent' : 'Received';
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

  const baseProps = {
    balance,
    walletInfo,
    transactions: transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
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
    navigateTo
  };

  return (
    <div className="min-h-[600px] p-6 bg-gray-50 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold">Wallet</h1>
          <Tabs 
            selectedKey={mode}
            onSelectionChange={(key) => setMode(key as 'native' | 'chain')}
            variant="bordered"
            size="sm"
            classNames={{
              tabList: "gap-4",
              cursor: "w-full bg-primary",
              tab: "h-8 px-3",
              tabContent: "group-data-[selected=true]:text-white"
            }}
          >
            <Tab
              key="native"
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
          onPress={() => navigateTo('settings')}
          className="hover:bg-gray-100"
        >
          <Cog8ToothIcon className="h-5 w-5 text-gray-600" />
        </Button>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        {mode === 'native' ? (
          <NativeNearDashboard {...baseProps} />
        ) : (
          <ChainSignatureDashboard 
            {...baseProps}
            evmAddress={evmAddress}
            isDerivingAddress={isDerivingAddress}
            derivationError={derivationError}
            chainBalances={chainBalances}
          />
        )}
      </div>
    </div>
  );
} 