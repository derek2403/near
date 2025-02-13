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
import { chains } from '../../data/supportedChain.json';
import { useEvmSend } from '../../hooks/useEvmSend';

const { connect, keyStores } = nearAPI;

// Add this constant for ETH token
const ETH_TOKEN = {
  key: 'eth',
  label: 'Ethereum',
  symbol: 'ETH',
  icon: '/icons/eth.svg'  // Make sure you have this icon
};

const getTokenDescription = (chain) => {
  return `Native ETH on ${chain.name}`;
};

// Add a helper function to truncate hash
const truncateHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 20)}...`;
};

export default function ChainSignatureSend() {
  const router = useRouter();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedCoin, setSelectedCoin] = useState(ETH_TOKEN);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState(chains[0]);

  const { 
    sendTransaction, 
    isLoading: isSending, 
    error: sendError, 
    txHash: evmTxHash,
    getExplorerUrl 
  } = useEvmSend();

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
      const publicInfo = localStorage.getItem('publicWalletInfo');
      const encryptedWallet = localStorage.getItem('encryptedWallet');
      
      if (!publicInfo || !encryptedWallet) {
        throw new Error('Wallet information not found');
      }

      const parsedInfo = JSON.parse(publicInfo);
      const decryptedWallet = JSON.parse(atob(encryptedWallet));

      const result = await sendTransaction({
        accountId: parsedInfo.accountId,
        secretKey: decryptedWallet.data.secretKey,
        recipientAddress,
        amount,
        selectedChain
      });

      if (result.success) {
        setTxHash(result.hash);
        setIsSuccess(true);
      } else {
        setIsError(true);
        setErrorMessage(result.error || 'Transaction failed');
      }

    } catch (err) {
      console.error('Transaction error:', err);
      setIsError(true);
      setErrorMessage(err.message || 'Failed to send transaction');
    }
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
                <span className="font-medium">{amount} ETH</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              <p className="text-sm flex items-center justify-center gap-2">
                <span className="text-gray-500">Transaction Hash:</span>{' '}
                <span className="font-medium">{truncateHash(txHash)}</span>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => window.open(getExplorerUrl(txHash, selectedChain), '_blank')}
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
                <span className="font-medium">{amount} ETH</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              {errorMessage && (
                <div className="mt-4 p-4 bg-danger-50 rounded-lg">
                  <p className="text-danger text-sm font-medium">
                    Error: {errorMessage}
                  </p>
                </div>
              )}
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
            {/* Amount Input with Chain Selector */}
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
                    className="min-w-fit h-full"
                    onPress={onOpen}
                    variant="flat"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        {/* Main Chain Logo */}
                        <img 
                          src={selectedChain.logo} 
                          alt={selectedChain.name} 
                          className="w-10 h-10"
                        />
                        {/* ETH Logo */}
                        <img 
                          src={ETH_TOKEN.icon} 
                          alt={ETH_TOKEN.label} 
                          className="w-6 h-6 rounded-full absolute -bottom-1 -right-1"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-left">
                          {selectedChain.name}
                        </p>
                        <p className="text-sm text-default-500 text-left">
                          ETH
                        </p>
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
              isDisabled={!amount || !recipientAddress || isSending}
              isLoading={isSending}
              spinner={<Spinner color="white" size="sm" />}
            >
              {isSending ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Modified Modal for Chain Selection Only */}
      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="outside"
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Select Chain</ModalHeader>
              <ModalBody className="p-6">
                <div className="space-y-2">
                  {chains.map((chain) => (
                    <div
                      key={chain.prefix}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedChain.prefix === chain.prefix 
                          ? 'bg-primary-100 border border-primary' 
                          : 'hover:bg-default-100'
                      }`}
                      onClick={() => {
                        setSelectedChain(chain);
                        onClose();
                      }}
                    >
                      <div className="relative">
                        <img 
                          src={chain.logo} 
                          alt={chain.name} 
                          className="w-8 h-8"
                        />
                        <img 
                          src={ETH_TOKEN.icon}
                          alt="ETH"
                          className="w-5 h-5 rounded-full absolute -bottom-1 -right-1"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium">{chain.name}</p>
                        <p className="text-sm text-default-500">
                          {getTokenDescription(chain)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}