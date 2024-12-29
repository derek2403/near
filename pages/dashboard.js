import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);
  const [balance, setBalance] = useState("0");
  const [yoctoBalance, setYoctoBalance] = useState("0");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

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

      } catch (err) {
        setError('Error loading wallet information');
        console.error('Wallet loading error:', err);
      }
    };

    fetchWalletInfo();
  }, []);

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
        {/* Header with Settings Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/settings')}
          >
            <Cog8ToothIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Main Balance Card */}
        <Card>
          <CardBody className="p-8">
            <div className="text-black">
              <div className="text-sm opacity-80 mb-1">Total Balance</div>
              <div className="text-4xl font-bold mb-4">{balance} NEAR</div>
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
          >
            <div className="flex flex-col items-start">
              <span className="text-lg">Send</span>
              <span className="text-xs opacity-80">Transfer NEAR</span>
            </div>
          </Button>

          <Button
            size="lg"
            color="secondary"
            startContent={<ArrowDownIcon className="h-5 w-5" />}
            onPress={() => router.push('/receive')}
            className="h-20"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg">Receive</span>
              <span className="text-xs opacity-80">Get NEAR</span>
            </div>
          </Button>
        </div>

        {/* Recent Transactions Card */}
        <Card>
          <CardBody className="p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="text-center text-gray-500 py-8">
              No recent transactions
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
