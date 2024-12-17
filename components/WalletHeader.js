import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import * as nearAPI from "near-api-js";

const { connect, keyStores } = nearAPI;

export default function WalletHeader() {
  const [accountId, setAccountId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkConnection = async () => {
      const storedAccountId = localStorage.getItem('nearAccountId');
      if (storedAccountId) {
        setAccountId(storedAccountId);
        
        // Get balance
        try {
          const connectionConfig = {
            networkId: "testnet",
            keyStore: new keyStores.BrowserLocalStorageKeyStore(),
            nodeUrl: "https://rpc.testnet.near.org",
          };
          const near = await connect(connectionConfig);
          const account = await near.account(storedAccountId);
          const balanceData = await account.getAccountBalance();
          setBalance(nearAPI.utils.format.formatNearAmount(balanceData.available, 2));
        } catch (err) {
          console.error('Error fetching balance:', err);
        }
      }
    };

    checkConnection();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('nearAccountId');
    localStorage.removeItem('nearPrivateKey');
    setAccountId(null);
    setBalance(null);
    setIsDropdownOpen(false);
    router.push('/login');
  };

  if (!accountId) return null;

  return (
    <div className="fixed top-0 right-0 m-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-2 flex items-center space-x-2 hover:bg-gray-50"
        >
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <div className="text-left">
            <div className="font-medium text-sm">{accountId}</div>
            {balance && (
              <div className="text-xs text-gray-500">{balance} NEAR</div>
            )}
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 