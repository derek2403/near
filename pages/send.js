import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Form } from "@nextui-org/react";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const { connect, keyStores } = nearAPI;

export default function Send() {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState({ name: 'NEAR', icon: '₦' });
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Available coins (can be expanded)
  const coins = [
    { name: 'NEAR', icon: '₦' },
    { name: 'USDC', icon: '$' },
  ];

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsError(false);
    setErrorMessage('');
    
    try {
      // Get sender's wallet info from localStorage
      const publicInfo = localStorage.getItem('publicWalletInfo');
      const encryptedWallet = localStorage.getItem('encryptedWallet');
      
      if (!publicInfo || !encryptedWallet) {
        throw new Error('Wallet information not found');
      }

      const parsedInfo = JSON.parse(publicInfo);
      const decryptedWallet = JSON.parse(atob(encryptedWallet));
      
      // Setup connection to NEAR
      const connectionConfig = {
        networkId: "testnet",
        keyStore: new keyStores.InMemoryKeyStore(),
        nodeUrl: "https://rpc.testnet.near.org",
      };

      // Connect to NEAR
      const near = await connect(connectionConfig);
      
      // Create keyPair from private key
      const keyPair = nearAPI.utils.KeyPair.fromString(decryptedWallet.data.secretKey);
      await connectionConfig.keyStore.setKey("testnet", parsedInfo.accountId, keyPair);

      // Get account object
      const account = await near.account(parsedInfo.accountId);

      // Convert NEAR amount to yoctoNEAR
      const yoctoAmount = nearAPI.utils.format.parseNearAmount(amount);

      // Send transaction
      const result = await account.sendMoney(
        recipientAddress, // receiver account
        yoctoAmount // amount in yoctoNEAR
      );

      // Get transaction hash
      const txHash = result.transaction.hash;
      setTxHash(txHash);
      
      // Set success state
      setIsSuccess(true);

    } catch (err) {
      console.error('Transaction error:', err);
      setErrorMessage(err.message || 'Failed to send transaction');
      setIsError(true);
    }
  };

  const getExplorerUrl = (hash) => {
    return `https://testnet.nearblocks.io/txns/${hash}`;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-64 h-64 mb-6">
          <DotLottieReact
            src="https://lottie.host/de3a77dc-d723-4462-a832-e2928836c922/7LKOuBzujP.lottie"
            autoplay
            loop={false}
          />
        </div>
        <Card className="max-w-2xl w-full">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-success mb-2">
              Transaction Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your transaction has been submitted successfully.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm">
                <span className="text-gray-500">Amount:</span>{' '}
                <span className="font-medium">{amount} {selectedCoin.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              <p className="text-sm flex items-center justify-center gap-2">
                <span className="text-gray-500">Transaction Hash:</span>{' '}
                <span className="font-medium">{txHash}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => window.open(getExplorerUrl(txHash), '_blank')}
                  className="min-w-unit-8 w-8 h-8"
                >
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </Button>
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setIsSuccess(false);
                  setAmount('');
                  setRecipientAddress('');
                  setTxHash('');
                }}
                className="w-full"
              >
                Send Another Transaction
              </Button>
              <Button
                color="default"
                variant="light"
                onPress={() => router.push('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-64 h-64 mb-6">
          <DotLottieReact
            src="https://lottie.host/f971bfe3-8fe1-4deb-affa-1c78011f4daa/VNtlmMxARH.lottie"
            autoplay
            loop={false}
          />
        </div>
        <Card className="max-w-2xl w-full">
          <CardBody className="p-8 text-center">
            <h2 className="text-2xl font-bold text-danger mb-2">
              Transaction Failed
            </h2>
            <p className="text-gray-600 mb-4">
              Your transaction could not be completed.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm">
                <span className="text-gray-500">Amount:</span>{' '}
                <span className="font-medium">{amount} {selectedCoin.name}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              <div className="mt-4 p-4 bg-danger-50 rounded-lg">
                <p className="text-danger text-sm font-medium">
                  Error: {errorMessage}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                color="primary"
                variant="flat"
                onPress={() => {
                  setIsError(false);
                  setErrorMessage('');
                }}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                color="default"
                variant="light"
                onPress={() => router.push('/dashboard')}
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <Card className="max-w-md mx-auto">
        <CardBody className="p-8">
          {/* Header with Back Button */}
          <div className="flex items-center mb-6">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Send</h1>
          </div>

          <Form 
            className="space-y-6"
            validationBehavior="native" 
            onSubmit={onSubmit}
          >
            {/* Coin Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Coin
              </label>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="w-full justify-start"
                  >
                    <span className="mr-2">{selectedCoin.icon}</span>
                    {selectedCoin.name}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Select coin"
                  onAction={(key) => {
                    const coin = coins.find(c => c.name === key);
                    if (coin) setSelectedCoin(coin);
                  }}
                >
                  {coins.map((coin) => (
                    <DropdownItem key={coin.name}>
                      <span className="mr-2">{coin.icon}</span>
                      {coin.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            {/* Recipient Address */}
            <Input
              isRequired
              label="Enter wallet address"
              name="recipientAddress"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              variant="bordered"
              errorMessage={!recipientAddress && "Please enter recipient address"}
              className="w-full"
            />

            {/* Amount */}
            <Input
              isRequired
              type="text"
              label={`Enter amount in ${selectedCoin.name}`}
              name="amount"
              value={amount}
              onChange={handleAmountChange}
              variant="bordered"
              errorMessage={!amount && "Please enter amount"}
              className="w-full"
            
            />

            {error && (
              <div className="p-3 bg-danger-50 text-danger rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isDisabled={!amount || !recipientAddress}
            >
              Continue
            </Button>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
}
