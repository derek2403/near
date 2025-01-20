import { useEffect, useState } from 'react'
import { Button, Card, CardBody } from '@nextui-org/react'

export default function Home() {
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    setLoading(true)
    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1000))
      setWallet({
        address: '0x1234...5678',
        balance: '1.234 ETH'
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
  }

  return (
    <div className="p-4 min-h-screen bg-gray-100">
      <Card className="max-w-sm mx-auto">
        <CardBody>
          <h1 className="text-2xl font-bold text-center mb-4">Wallet Extension</h1>
          {wallet ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-mono">{wallet.address}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Balance</p>
                <p className="font-mono">{wallet.balance}</p>
              </div>
              <Button 
                color="danger" 
                className="w-full"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              color="primary"
              className="w-full"
              onClick={connectWallet}
              isLoading={loading}
            >
              Connect Wallet
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  )
} 