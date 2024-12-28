import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Form } from "@nextui-org/react";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function Send() {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState({ name: 'NEAR', icon: '₦' });
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    try {
      // Transaction logic will go here
      
      // Just set success state, no auto-redirect
      setIsSuccess(true);
      
      // Remove the auto-redirect timeout
      // setTimeout(() => {
      //   router.push('/dashboard');
      // }, 3000);
    } catch (err) {
      setError(err.message);
    }
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
        <Card className="max-w-md w-full">
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
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                color="primary"
                variant="flat"
                onClick={() => {
                  setIsSuccess(false);
                  setAmount('');
                  setRecipientAddress('');
                }}
                className="w-full"
              >
                Send Another Transaction
              </Button>
              <Button
                color="default"
                variant="light"
                onClick={() => router.push('/dashboard')}
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
              onClick={() => router.push('/dashboard')}
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
              label="Recipient Address"
              name="recipientAddress"
              placeholder="Enter wallet address"
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
              label="Amount"
              name="amount"
              placeholder={`Enter amount in ${selectedCoin.name}`}
              value={amount}
              onChange={handleAmountChange}
              variant="bordered"
              errorMessage={!amount && "Please enter amount"}
              className="w-full"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">{selectedCoin.icon}</span>
                </div>
              }
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
