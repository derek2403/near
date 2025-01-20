import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Tooltip, Tabs, Tab } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon, Cog8ToothIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import NativeNearDashboard from '../components/NativeNear/NativeNearDashboard';
import ChainSignatureDashboard from '../components/ChainSignature/ChainSignatureDashboard';

const { connect, keyStores, providers } = nearAPI;

export default function Dashboard() {
  // Keep existing state and logic from original dashboard.js
  // Update UI for extension dimensions

  return (
    <div className="w-[400px] h-[600px] overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-4">
        {/* Header with Tabs and Settings Button */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">Wallet</h1>
            {/* Tabs component */}
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/settings')}
          >
            <Cog8ToothIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Render appropriate dashboard based on tab selection */}
        {renderDashboard()}
      </div>
    </div>
  );
} 