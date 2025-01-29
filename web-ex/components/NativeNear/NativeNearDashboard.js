import { Card, CardBody, Button, Tooltip, Pagination } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, ArrowUpIcon, ArrowDownIcon, XCircleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function NativeNearDashboard({ 
  balance = "0", 
  walletInfo = null, 
  transactions = [], 
  isLoadingTxns = true,
  formatDate = (ts) => new Date(ts).toLocaleString(),
  getTransactionType = () => "Unknown",
  getTransactionAmount = () => "0",
  pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {}
  }
}) {
  const [showCopyTick, setShowCopyTick] = useState(false);

  const handleCopyClick = async () => {
    if (!walletInfo?.accountId) return;
    
    try {
      await navigator.clipboard.writeText(walletInfo.accountId);
      setShowCopyTick(true);
      setTimeout(() => setShowCopyTick(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTransactionStatus = (tx) => {
    if (!tx || tx.status === false) {
      return { status: 'Failed', className: 'text-red-500' };
    }
    return { status: '', className: '' };
  };

  const formatNearAmount = (amount) => {
    return Number(amount || 0).toFixed(6);
  };

  const getExplorerUrl = (accountId) => {
    return `https://testnet.nearblocks.io/address/${accountId}`;
  };

  if (!walletInfo) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Account ID</h3>
            <p>{walletInfo?.accountId}</p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Balance</h3>
            <p>{balance} NEAR</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}