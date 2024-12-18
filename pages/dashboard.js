import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody } from "@nextui-org/react";

export default function Dashboard() {
  const router = useRouter();
  const [walletInfo, setWalletInfo] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const publicInfo = localStorage.getItem('publicWalletInfo');
    if (!publicInfo) {
      router.push('/');
      return;
    }
    setWalletInfo(JSON.parse(publicInfo));
  }, []);

  if (!walletInfo) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="mb-4">
          <p className="text-gray-600">Account ID: {walletInfo.accountId}</p>
        </div>
        {/* Add more wallet info display here */}
      </div>
    </div>
  );
}
