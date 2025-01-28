import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignature/ChainSignatureDashboard';
import NearIconSvg from '../public/icons/NearIcon.svg';
import ChainIconSvg from '../public/icons/ChainIcon.svg';
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard({ router }) {
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
  const [evmAddress, setEvmAddress] = useState(null);
  const [isDerivingAddress, setIsDerivingAddress] = useState(true);
  const [derivationError, setDerivationError] = useState('');
  const [chainBalances, setChainBalances] = useState({});

  useEffect(() => {
    chrome.storage.local.get('selectedTab', (result) => {
      if (result.selectedTab) {
        setIsVertical(result.selectedTab === 'near');
      }
    });
  }, []);

  const handleTabChange = (key) => {
    const isNearTab = key === "near";
    setIsVertical(isNearTab);
    chrome.storage.local.set({ selectedTab: key });
  };

  useEffect(() => {
    const fetchWalletInfo = async () => {
      chrome.storage.local.get('publicWalletInfo', async (result) => {
        if (!result.publicWalletInfo) {
          router.push('');
          return;
        }

        try {
          const parsedInfo = JSON.parse(result.publicWalletInfo);
          setWalletInfo(parsedInfo);

          const provider = new providers.JsonRpcProvider({
            url: "https://rpc.testnet.near.org"
          });

          const accountState = await provider.query({
            request_type: 'view_account',
            finality: 'final',
            account_id: parsedInfo.accountId
          });

          const yoctoNearBalance = accountState.amount;
          const nearBalance = nearAPI.utils.format.formatNearAmount(yoctoNearBalance);
          const formattedBalance = Number(nearBalance).toFixed(6);
          setBalance(formattedBalance);

          await fetchRecentTransactions(parsedInfo.accountId);

        } catch (err) {
          setError('Error loading wallet information');
          console.error('Wallet loading error:', err);
        }
      });
    };

    fetchWalletInfo();
  }, [router]);

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

  useEffect(() => {
    const deriveEvmAddress = async () => {
      if (!walletInfo?.accountId || evmAddress) return;

      try {
        setIsDerivingAddress(true);
        setDerivationError('');

        const derivationPath = `evm,1`;
        const adapter = await setupAdapter({
          accountId: walletInfo.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: derivationPath,
        });

        setEvmAddress(adapter.address);

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

    deriveEvmAddress();
  }, [walletInfo, evmAddress]);

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
      },
      evmAddress,
      isDerivingAddress,
      derivationError,
      chainBalances
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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
            <Tabs 
              aria-label="Wallet Mode" 
              selectedKey={isVertical ? "near" : "chain"}
              onSelectionChange={handleTabChange}
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
                    <NearIconSvg className="w-4 h-4" />
                    <span className="text-sm">Native NEAR</span>
                  </div>
                }
              />
              <Tab
                key="chain"
                title={
                  <div className="flex items-center space-x-2">
                    <ChainIconSvg className="w-4 h-4" />
                    <span className="text-sm">Chain Signature</span>
                  </div>
                }
              />
            </Tabs>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('settings')}
          >
            <Cog8ToothIcon className="h-6 w-6" />
          </Button>
        </div>

        {renderDashboard()}
      </div>
    </div>
  );
}
