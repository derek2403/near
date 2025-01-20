import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ClipboardIcon, ClipboardDocumentCheckIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import Layout from '../components/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignature/ChainSignatureDashboard';

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  // Keep existing state and logic from original dashboard.js
  // Update UI for extension dimensions

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">Wallet</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('near')}
                className={`px-3 py-1 rounded-lg ${
                  selectedTab === 'near' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
              >
                Native NEAR
              </button>
              <button
                onClick={() => setSelectedTab('chain')}
                className={`px-3 py-1 rounded-lg ${
                  selectedTab === 'chain' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
              >
                Chain Signature
              </button>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push('/settings')}
            className="p-2"
          >
            <Cog8ToothIcon className="h-5 w-5" />
          </Button>
        </div>

        {selectedTab === 'near' ? (
          <NativeNearDashboard
            balance={balance}
            walletInfo={walletInfo}
            transactions={transactions}
            isLoadingTxns={isLoadingTxns}
            copied={copied}
            handleCopy={handleCopy}
            formatDate={formatDate}
            getTransactionType={getTransactionType}
            getTransactionAmount={getTransactionAmount}
            router={router}
          />
        ) : (
          <ChainSignatureDashboard
            evmAddress={evmAddress}
            isDerivingAddress={isDerivingAddress}
            derivationError={derivationError}
            chainBalances={chainBalances}
            copied={copied}
            handleCopy={handleCopy}
          />
        )}
      </div>
    </Layout>
  );
} 