import { useEffect, useState } from 'react';
import { Card, CardBody, Button, Switch } from "@nextui-org/react";
import { ConnectionState, ConnectionInfo } from '../../sdk/src/types';

export default function ConnectionDetails() {
  const [state, setState] = useState<ConnectionState | null>(null);
  const [info, setInfo] = useState<ConnectionInfo | null>(null);

  useEffect(() => {
    loadConnectionDetails();
  }, []);

  const loadConnectionDetails = async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (response.state) {
      setState(response.state);
      setInfo(response.info);
    }
  };

  const handlePermissionChange = async (permission: keyof ConnectionState['permissions']) => {
    await chrome.runtime.sendMessage({
      type: 'UPDATE_PERMISSIONS',
      permissions: {
        [permission]: !state?.permissions[permission]
      }
    });
    loadConnectionDetails();
  };

  const handleNetworkChange = async (network: 'mainnet' | 'testnet') => {
    await chrome.runtime.sendMessage({
      type: 'SWITCH_NETWORK',
      network
    });
    loadConnectionDetails();
  };

  if (!state || !info) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardBody className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Connected to {info.dapp.name}</h2>
            <p className="text-sm text-gray-600">{info.dapp.url}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Network</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                color={state.network === 'testnet' ? 'primary' : 'default'}
                onPress={() => handleNetworkChange('testnet')}
              >
                Testnet
              </Button>
              <Button
                size="sm"
                color={state.network === 'mainnet' ? 'primary' : 'default'}
                onPress={() => handleNetworkChange('mainnet')}
              >
                Mainnet
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">Permissions</h3>
            <div className="space-y-2">
              <Switch
                isSelected={state.permissions.viewAccount}
                onValueChange={() => handlePermissionChange('viewAccount')}
              >
                View Account
              </Switch>
              <Switch
                isSelected={state.permissions.sendTransactions}
                onValueChange={() => handlePermissionChange('sendTransactions')}
              >
                Send Transactions
              </Switch>
              <Switch
                isSelected={state.permissions.signMessages}
                onValueChange={() => handlePermissionChange('signMessages')}
              >
                Sign Messages
              </Switch>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>Connected: {new Date(info.connectedAt).toLocaleString()}</p>
            <p>Last Active: {new Date(info.lastActive).toLocaleString()}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
} 