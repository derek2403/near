import { useState, useEffect } from 'react';
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
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ethers } from 'ethers';
import { chains } from '../data/supportedChain.json';
import { setupAdapter } from 'near-ca';

export default function ChainSignatureSend() {
  const router = useRouter();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [selectedChain, setSelectedChain] = useState(chains[0]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [senderAddress, setSenderAddress] = useState(null);

  useEffect(() => {
    const deriveSenderAddress = async () => {
      try {
        const publicInfo = localStorage.getItem('publicWalletInfo');
        if (!publicInfo) {
          throw new Error('Wallet information not found');
        }

        const parsedInfo = JSON.parse(publicInfo);
        const derivationPath = `evm,1`;
        const adapter = await setupAdapter({
          accountId: parsedInfo.accountId,
          mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID || "v1.signer-prod.testnet",
          derivationPath: derivationPath,
        });

        setSenderAddress(adapter.address);
      } catch (err) {
        console.error('Error deriving sender address:', err);
        setError('Failed to derive sender address');
      }
    };

    deriveSenderAddress();
  }, []);

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
      if (!senderAddress) {
        throw new Error('Sender address not available');
      }

      // Setup provider for selected chain
      const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
      
      // Get the signer for the sender address
      const signer = await provider.getSigner(senderAddress);
      
      // Create transaction object
      const tx = {
        from: senderAddress,
        to: recipientAddress,
        value: ethers.parseEther(amount)
      };

      // Send transaction using the signer
      const transaction = await signer.sendTransaction(tx);
      
      // Wait for transaction to be mined
      await transaction.wait();

      // Set transaction hash
      setTxHash(transaction.hash);
      
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
    return `${selectedChain.explorerUrl}tx/${hash}`;
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
                <span className="font-medium">{amount} ETH</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Network:</span>{' '}
                <span className="font-medium">{selectedChain.name}</span>
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
                <span className="font-medium">{amount} ETH</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">To:</span>{' '}
                <span className="font-medium">{recipientAddress}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Network:</span>{' '}
                <span className="font-medium">{selectedChain.name}</span>
              </p>
              <div className="mt-4 p-4 bg-danger-50 rounded-lg">
                <p className="text-danger text-sm font-medium">
                  Error: {errorMessage}
                </p>
              </div>
            </div>
            
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
          <div className="flex items-center mb-6">
            <Button
              isIconOnly
              variant="light"
              onPress={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Send via Chain Signature</h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
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
                      <img 
                        src={selectedChain.logo} 
                        alt={selectedChain.name} 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{selectedChain.name}</p>
                        <p className="text-sm text-default-500">ETH</p>
                      </div>
                    </div>
                  </Button>
                }
              />
            </div>

            <Input
              isRequired
              label="Enter recipient address"
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

      <Modal
        backdrop="opaque"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Select Network</ModalHeader>
              <ModalBody className="py-6">
                <Autocomplete
                  defaultItems={chains}
                  placeholder="Search networks"
                  className="mb-6"
                  onSelectionChange={(key) => {
                    const selected = chains.find(chain => chain.prefix === key);
                    if (selected) {
                      setSelectedChain(selected);
                      onClose();
                    }
                  }}
                >
                  {(chain) => (
                    <AutocompleteItem
                      key={chain.prefix}
                      className="p-2"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={chain.logo} 
                          alt={chain.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{chain.name}</p>
                          <p className="text-sm text-default-500">ETH</p>
                        </div>
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-500">Available Networks</h3>
                  <div className="space-y-2">
                    {chains.map((chain) => (
                      <div
                        key={chain.prefix}
                        className="flex items-center gap-3 p-3 hover:bg-default-100 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedChain(chain);
                          onClose();
                        }}
                      >
                        <img 
                          src={chain.logo} 
                          alt={chain.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-grow">
                          <p className="font-medium">{chain.name}</p>
                          <p className="text-sm text-default-500">ETH</p>
                        </div>
                        <p className="text-sm text-default-500 hidden sm:block">{chain.description}</p>
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