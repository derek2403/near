import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    const storedWalletInfo = localStorage.getItem('nearWalletInfo');
    if (storedWalletInfo) {
      setWalletInfo(JSON.parse(storedWalletInfo));
    }
  }, []);

  if (!walletInfo) {
    return (
      <div className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <h1 className="text-2xl font-bold mb-4">No Wallet Found</h1>
          <p className="text-gray-600 mb-4">You need to create a wallet first.</p>
          <button
            onClick={() => router.push('/createWallet')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Create Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="mb-4">
          <p className="text-gray-600">Account ID: {walletInfo.accountId}</p>
        </div>
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
}
