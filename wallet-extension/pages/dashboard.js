import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      const publicInfo = localStorage.getItem('publicWalletInfo');
      
      if (!publicInfo) {
        router.push('/');
        return;
      }

      try {
        const parsedInfo = JSON.parse(publicInfo);
        setWalletInfo(parsedInfo);

        const provider = new providers.JsonRpcProvider({
          url: "https://rpc.testnet.near.org"
        });

        const accountState = await provider.query({
          request_type: 'view_account',
          finality: 'final',
          account_id: parsedInfo.accountId
        });

        const nearBalance = nearAPI.utils.format.formatNearAmount(accountState.amount);
        const formattedBalance = Number(nearBalance).toFixed(6);
        setBalance(formattedBalance);

        await fetchRecentTransactions(parsedInfo.accountId);
      } catch (err) {
        setError('Error loading wallet information');
        console.error('Wallet loading error:', err);
      }
    };

    fetchWalletInfo();
  }, [router]);

  const fetchRecentTransactions = async (accountId) => {
    try {
      setIsLoadingTxns(true);
      const response = await fetch(
        `https://api-testnet.nearblocks.io/v1/account/${accountId}/txns?limit=5`
      );
      const data = await response.json();
      if (data && data.txns) {
        setTransactions(data.txns);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoadingTxns(false);
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

  if (!walletInfo) {
    return <div className="extension-container bg-gray-50 flex items-center justify-center">
      <Card>
        <CardBody>
          {error || 'Loading...'}
        </CardBody>
      </Card>
    </div>;
  }

  return (
    <div className="extension-container bg-gray-50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/settings')}
          >
            <Cog8ToothIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Balance Card */}
        <Card>
          <CardBody className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold">{balance} NEAR</p>
            </div>
            
            <div className="flex justify-center gap-2 mt-4">
              <Button
                color="primary"
                startContent={<ArrowUpIcon className="h-4 w-4" />}
                onPress={() => router.push('/send')}
                size="sm"
              >
                Send
              </Button>
              <Button
                color="primary"
                variant="bordered"
                startContent={<ArrowDownIcon className="h-4 w-4" />}
                size="sm"
              >
                Receive
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Account Info */}
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account ID</span>
              <div className="flex items-center gap-2">
                <span className="text-sm">{walletInfo.accountId}</span>
                <Tooltip content={copied ? "Copied!" : "Copy"}>
                  <button onClick={() => handleCopy(walletInfo.accountId)}>
                    {copied ? (
                      <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                    ) : (
                      <ClipboardIcon className="h-4 w-4" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardBody className="p-4">
            <h2 className="text-sm font-medium mb-3">Recent Transactions</h2>
            {isLoadingTxns ? (
              <p className="text-sm text-gray-600">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between text-sm">
                    <span>{tx.type}</span>
                    <span>{nearAPI.utils.format.formatNearAmount(tx.deposit)} NEAR</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No recent transactions</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 