import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import NearIconSvg from '../public/icons/NearIcon.svg';
import { storage } from '../utils/storage';

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState("0");
  const [yoctoBalance, setYoctoBalance] = useState("0");
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const checkWallet = async () => {
      try {
        setLoading(true);
        const publicInfo = await storage.get('publicWalletInfo');
        
        if (!publicInfo) {
          window.location.href = chrome.runtime.getURL('index.html');
          return;
        }
        
        setWalletInfo(publicInfo);
        
        const provider = new providers.JsonRpcProvider({
          url: "https://rpc.testnet.near.org"
        });

        const accountState = await provider.query({
          request_type: 'view_account',
          finality: 'final',
          account_id: publicInfo.accountId
        });

        const nearBalance = nearAPI.utils.format.formatNearAmount(accountState.amount);
        setBalance(Number(nearBalance).toFixed(6));
        setYoctoBalance(accountState.amount);
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking wallet:', error);
        setLoading(false);
      }
    };

    checkWallet();
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp / 1_000_000).toLocaleString();
  };

  const getTransactionType = (tx, accountId) => {
    return tx.signer_id === accountId ? 'Sent' : 'Received';
  };

  const getTransactionAmount = (tx) => {
    return nearAPI.utils.format.formatNearAmount(tx.actions[0]?.args?.deposit || "0");
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
          <Button
            isIconOnly
            variant="light"
            onPress={() => {
              window.location.href = chrome.runtime.getURL('settings.html');
            }}
          >
            <Cog8ToothIcon className="h-6 w-6" />
          </Button>
        </div>

        <NativeNearDashboard 
          balance={balance}
          walletInfo={walletInfo}
          transactions={transactions}
          isLoadingTxns={isLoadingTxns}
          formatDate={formatDate}
          getTransactionType={getTransactionType}
          getTransactionAmount={getTransactionAmount}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage
          }}
        />
      </div>
    </div>
  );
}
