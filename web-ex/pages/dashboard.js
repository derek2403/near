import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Tabs, Tab } from "@nextui-org/react";
import { Cog8ToothIcon } from '@heroicons/react/24/outline';
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
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);
  const [isVertical, setIsVertical] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const stored = localStorage.getItem('selectedTab');
    if (stored) {
      setIsVertical(stored === 'near');
    }
  }, []);

  const handleTabChange = (key) => {
    const isNearTab = key === "near";
    setIsVertical(isNearTab);
    localStorage.setItem('selectedTab', key);
  };

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

        await fetchRecentTransactions(publicInfo.accountId);
      } catch (error) {
        console.error('Error checking wallet:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    checkWallet();
  }, []);

  const renderDashboard = () => {
    if (loading) {
      return (
        <Card>
          <CardBody>
            <div className="flex justify-center items-center h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardBody>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardBody>
            <div className="text-center text-danger">{error}</div>
          </CardBody>
        </Card>
      );
    }

    const props = {
      walletInfo,
      balance,
      yoctoBalance,
      copied,
      setCopied,
      transactions,
      isLoadingTxns,
      currentPage,
      totalPages,
      onPageChange: setCurrentPage
    };

    return <NativeNearDashboard {...props} />;
  };

  return (
    <div className="min-h-[600px] p-4 bg-gray-50">
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
            </Tabs>
          </div>
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

        {renderDashboard()}
      </div>
    </div>
  );
}
