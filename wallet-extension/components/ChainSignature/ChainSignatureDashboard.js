import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { ClipboardIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function ChainSignatureDashboard({
  evmAddress,
  isDerivingAddress,
  derivationError,
  chainBalances,
  copied,
  handleCopy
}) {
  return (
    <div className="space-y-4">
      {/* EVM Address Card */}
      <Card>
        <CardBody className="p-4">
          {isDerivingAddress ? (
            <div className="text-center text-sm">Deriving address...</div>
          ) : derivationError ? (
            <div className="text-danger text-sm">{derivationError}</div>
          ) : (
            <div>
              <p className="text-sm text-gray-600 mb-2">EVM Address</p>
              <div className="flex items-center justify-between">
                <span className="text-sm break-all">{evmAddress}</span>
                <button onClick={() => handleCopy(evmAddress)}>
                  {copied ? (
                    <ClipboardDocumentCheckIcon className="h-4 w-4 text-success" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Chain Balances */}
      <Card>
        <CardBody className="p-4">
          <h3 className="text-sm font-semibold mb-3">Chain Balances</h3>
          <div className="space-y-2">
            {Object.entries(chainBalances).map(([chain, balance]) => (
              <div key={chain} className="flex justify-between items-center text-sm">
                <span>{chain}</span>
                <span>{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 