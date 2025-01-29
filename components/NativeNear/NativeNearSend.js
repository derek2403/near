import { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Card, 
  CardBody, 
  Button, 
  Input, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
  Spinner 
} from "@nextui-org/react";
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import * as nearAPI from "near-api-js";
import { DotLottiePlayer } from '@dotlottie/react-player';
import { coins } from '../../data/coins.json';

const { connect, keyStores } = nearAPI;

export default function NativeNearSend() {
  const router = useRouter();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  };

  const getExplorerUrl = (hash) => {
    return `https://testnet.nearblocks.io/txns/${hash}`;
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-64 h-64 mb-6">
          <DotLottiePlayer
            src="/animations/success.lottie"
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
                <span className="font-medium">{amount} {selectedCoin.label}</span>
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
          <DotLottiePlayer
            src="/animations/fail.lottie"
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
                <span className="font-medium">{amount} {selectedCoin.label}</span>
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

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Amount Input with Coin Selector */}
            <div className="relative">
              <Input
              isRequired
                type="text"
                size="lg"
                label="Amount"
                value={amount}
                onChange={handleAmountChange}
                className="text-3xl"
                endContent={
                  <Button
                  className="min-w-fit h-full" // Changed to h-full to match input height
                  onPress={onOpen}
                  variant="flat"
                >
                    <div className="flex items-center gap-2">
                      <img 
                        src={selectedCoin.icon} 
                        alt={selectedCoin.label} 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{selectedCoin.label}</p>
                        <p className="text-sm text-default-500">{selectedCoin.symbol}</p>
                      </div>
                    </div>
                  </Button>
                }
              />
            </div>

            {/* Recipient Address */}
            <Input
              isRequired
              label="Enter wallet address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              variant="bordered"
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
              isDisabled={!amount || !recipientAddress || isLoading}
              isLoading={isLoading}
              spinner={<Spinner color="white" size="sm" />}
            >
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Coin Selection Modal */}
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Select Token</ModalHeader>
              <ModalBody className="py-6">
                <Autocomplete
                  defaultItems={coins}
                  placeholder="Search tokens"
                  className="mb-6"
                  onSelectionChange={(key) => {
                    const selected = coins.find(coin => coin.key === key);
                    if (selected) {
                      setSelectedCoin(selected);
                      onClose();
                    }
                  }}
                >
                  {(coin) => (
                    <AutocompleteItem
                      key={coin.key}
                      className="p-2"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={coin.icon} 
                          alt={coin.label} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{coin.label}</p>
                          <p className="text-sm text-default-500">{coin.symbol}</p>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                {/* Popular Tokens Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Popular tokens</h3>
                  <div className="space-y-2">
                    {coins.map((coin) => (
                      <div
                        key={coin.key}
                        className="flex items-center gap-3 p-3 hover:bg-default-100 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedCoin(coin);
                          onClose();
                        }}
                      >
                        <img 
                          src={coin.icon} 
                          alt={coin.label} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{coin.label}</p>
                          <p className="text-sm text-default-500">{coin.symbol}</p>
                        </div>
                        <p className="text-sm text-default-500 hidden sm:block">{coin.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}