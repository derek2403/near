import { useState } from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Form } from "@nextui-org/react";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";

export default function Send() {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState({ name: 'NEAR', icon: '₦' });
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(null);

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

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    setSubmitted(data);
    // Will add transaction logic here later
  };

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
              label={
                <div className="flex">
                  Recipient Address
                  <span className="text-danger ml-1">*</span>
                </div>
              }
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
              label={
                <div className="flex">
                  Amount
                  <span className="text-danger ml-1">*</span>
                </div>
              }
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

          {submitted && (
            <div className="mt-4 p-3 bg-default-100 rounded-lg">
              <p className="text-sm text-default-700">
                Submitted data: <code>{JSON.stringify(submitted)}</code>
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
