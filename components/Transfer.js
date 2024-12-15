import React, { useEffect, useState } from "react";
import { setupAdapter } from 'near-ca';
import { ethers } from 'ethers';
import { Input, Progress, CircularProgress, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import supportedChains from '../data/supportedChain.json';
import * as nearAPI from "near-api-js";

const { connect, keyStores } = nearAPI;
const FUNDING_AMOUNT = "0.1"; // Amount to fund the derived address with
const getDerivationPath = (chainName, index = 1) => `${chainName.toLowerCase()},${index}`;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const withRetry = async (fn, maxRetries = 3, delayMs = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.message.includes('exceeded its requests per second capacity')) {
        console.log(`Rate limited, attempt ${i + 1}/${maxRetries}, waiting ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
};

// Add this helper function at the top
const setupKeyPair = async (accountId, privateKey) => {
  const keyStore = new keyStores.BrowserLocalStorageKeyStore();
  const keyPair = nearAPI.KeyPair.fromString(privateKey);
  await keyStore.setKey("testnet", accountId, keyPair);
  return keyStore;
};

// Add this helper function
const ensureKeyPair = async (account, privateKey) => {
  const keyPair = nearAPI.KeyPair.fromString(privateKey);
  await account.connection.signer.keyStore.setKey(
    "testnet",
    account.accountId,
    keyPair
  );
  return keyPair;
};

// Add this helper at the top
const createProviderWithRetry = (rpcUrl) => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  // Wrap provider methods with retry logic
  const originalSend = provider.send.bind(provider);
  provider.send = async (...args) => {
    let lastError;
    for (let i = 0; i < 3; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, i * 1000)); // Increasing delay
        return await originalSend(...args);
      } catch (err) {
        lastError = err;
        if (!err.message.includes('exceeded its requests per second capacity')) {
          throw err;
        }
        console.log(`Rate limited, retrying in ${(i + 1) * 1000}ms...`);
      }
    }
    throw lastError;
  };
  
  return provider;
};

export default function Transfer({ transferParams, onClose, onRetry }) {
  const [isLoading, setIsLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [sourceBalance, setSourceBalance] = useState('');
  const [selectedChain, setSelectedChain] = useState(supportedChains.chains[0]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [nearAccount, setNearAccount] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [derivedAddress, setDerivedAddress] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const { isOpen, onOpen, onClose: onCloseModal } = useDisclosure();
  const [pendingTx, setPendingTx] = useState(null);

  useEffect(() => {
    // Update the loadNearAccount function
    const loadNearAccount = async () => {
      const accountId = localStorage.getItem('nearAccountId');
      const accountPrivateKey = localStorage.getItem('nearPrivateKey');
      
      if (!accountId || !accountPrivateKey) {
        setError('No NEAR account found. Please login first.');
        return;
      }

      console.log('Connected NEAR Account:', accountId);
      console.log('Account Private Key:', accountPrivateKey);

      try {
        // Create keyStore and keyPair
        const keyStore = new keyStores.BrowserLocalStorageKeyStore();
        const keyPair = nearAPI.KeyPair.fromString(accountPrivateKey);
        
        // Store the key in keyStore
        await keyStore.setKey("testnet", accountId, keyPair);

        const connectionConfig = {
          networkId: "testnet",
          keyStore: keyStore, // Use the keyStore with the stored key
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://testnet.mynearwallet.com/",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://testnet.nearblocks.io"
        };

        const near = await connect(connectionConfig);
        const account = await near.account(accountId);

        // Store the keyPair in the account's signer
        await account.connection.signer.keyStore.setKey(
          "testnet",
          accountId,
          keyPair
        );

        // Verify the key is stored
        const storedKey = await account.connection.signer.keyStore.getKey(
          "testnet",
          accountId
        );
        console.log('Key verification:', !!storedKey);

        setNearAccount(account);
        setPrivateKey(accountPrivateKey);
        
        const balance = await account.getAccountBalance();
        console.log('Account Balance:', nearAPI.utils.format.formatNearAmount(balance.available), 'NEAR');
      } catch (err) {
        console.error('Failed to load NEAR account:', err);
        setError('Failed to load NEAR account: ' + err.message);
      }
    };

    loadNearAccount();
  }, []);

  // Function to check the balance of the source wallet
  const checkBalance = async () => {
    if (!nearAccount) {
      setError('NEAR account not loaded');
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setError('');

    try {
      const balance = await nearAccount.getAccountBalance();
      setSourceBalance(nearAPI.utils.format.formatNearAmount(balance.available));
      setProgressValue(30);
    } catch (err) {
      setError(`Error checking balance: ${err.message}`);
      setProgressValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to check EVM balance
  const checkEVMBalance = async (chain, address) => {
    try {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (err) {
      console.error('Error checking EVM balance:', err);
      return '0';
    }
  };

  // Use transferParams if provided
  useEffect(() => {
    if (transferParams) {
      setAmount(transferParams.amount.toString());
      setRecipientAddress(transferParams.destwallet);
      const chain = supportedChains.chains.find(c => c.name === transferParams.destchain);
      if (chain) setSelectedChain(chain);
    }
  }, [transferParams]);

  // Add this useEffect after your other imports and constants
  useEffect(() => {
    console.log('Environment check:', {
      mpcContract: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
      hasFunderKey: !!process.env.NEXT_PUBLIC_FUNDER_PRIVATE_KEY,
      chainRpc: selectedChain.rpcUrl
    });
  }, [selectedChain]);

  // Update the fundDerivedAddress function
  const fundDerivedAddress = async () => {
    if (!nearAccount || !privateKey) {
      setError('NEAR account not loaded');
      return;
    }

    setIsLoading(true);
    setProgressValue(20);
    setError('');
    setProgressMessage('Initializing funding process...');

    try {
      // Get the derived address
      const adapter = await setupAdapter({
        accountId: nearAccount.accountId,
        privateKey: privateKey,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: `${selectedChain.name.toLowerCase()},1`,
      });

      setProgressMessage('Setting up funder wallet...');
      console.log('Setting up funding transaction for address:', adapter.address);
      
      // Create funder wallet
      const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
      const funder = new ethers.Wallet(process.env.NEXT_PUBLIC_FUNDER_PRIVATE_KEY, provider);
      
      // Check funder's balance first
      const funderBalance = await provider.getBalance(funder.address);
      console.log('Funder wallet details:', {
        address: funder.address,
        balance: ethers.formatEther(funderBalance),
        network: selectedChain.name,
        rpcUrl: selectedChain.rpcUrl
      });

      if (funderBalance < ethers.parseEther(FUNDING_AMOUNT)) {
        throw new Error(`Funder wallet has insufficient balance. Has: ${ethers.formatEther(funderBalance)} ETH, needs: ${FUNDING_AMOUNT} ETH`);
      }

      setProgressMessage('Sending funding transaction...');
      // Send funding transaction
      const tx = await funder.sendTransaction({
        to: adapter.address,
        value: ethers.parseEther(FUNDING_AMOUNT),
        chainId: selectedChain.chainId,
      });

      console.log('Funding transaction details:', {
        hash: tx.hash,
        from: funder.address,
        to: adapter.address,
        value: FUNDING_AMOUNT,
        chainId: selectedChain.chainId
      });

      setProgressMessage('Waiting for transaction confirmation...');
      await tx.wait();
      console.log('Funding transaction confirmed');

      setProgressMessage('Checking new balance...');
      // Check new balance
      const newBalance = await checkEVMBalance(selectedChain, adapter.address);
      setSourceBalance(newBalance);
      console.log('Funding complete:', {
        address: adapter.address,
        oldBalance: '0',
        newBalance: newBalance,
        fundingAmount: FUNDING_AMOUNT
      });

      setProgressMessage('Funding successful! Proceeding with transfer...');

      // Automatically execute the transfer after funding
      if (transferParams) {
        // Wait a bit for the funding to be confirmed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Execute the transfer
        const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
        const tx = {
          nonce: await provider.getTransactionCount(adapter.address),
          gasLimit: 21000,
          to: recipientAddress,
          value: ethers.parseEther(amount),
          chainId: selectedChain.chainId,
        };

        const feeData = await provider.getFeeData();
        tx.maxFeePerGas = feeData.maxFeePerGas;
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

        const payload = ethers.getBytes(ethers.Transaction.from(tx).unsignedHash);
        
        const signatureResult = await nearAccount.functionCall({
          contractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
          methodName: 'sign',
          args: {
            request: {
              payload: Array.from(payload),
              path: `${selectedChain.name.toLowerCase()},1`,
              key_version: 0
            }
          },
          gas: '250000000000000'
        });

        const { big_r, s, recovery_id } = signatureResult;
        const r = Buffer.from(big_r.affine_point.substring(2), 'hex');
        const s_value = Buffer.from(s.scalar, 'hex');
        
        const signedTx = ethers.Transaction.from({
          ...tx,
          signature: {
            r,
            s: s_value,
            v: recovery_id
          }
        });

        const sentTx = await provider.broadcastTransaction(signedTx.serialized);
        await sentTx.wait();

        setTxHash(sentTx.hash);
        console.log('Transfer successful:', sentTx.hash);
      }

      return true;
    } catch (err) {
      console.error('Operation error:', err);
      setError(`Operation failed: ${err.message}`);
      setProgressMessage('Operation failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add this confirmation dialog component
  const TransactionConfirmDialog = ({ isOpen, onClose, tx, onConfirm }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Transaction</ModalHeader>
          <ModalBody>
            <div className="space-y-2">
              <p>Please confirm the transaction details:</p>
              <div className="bg-gray-100 p-3 rounded">
                <p><strong>To:</strong> {tx?.to}</p>
                <p><strong>Amount:</strong> {tx?.amount} {tx?.symbol}</p>
                <p><strong>Network:</strong> {tx?.network}</p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={onConfirm}>
              Confirm & Sign
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Update the sendFunds function
  const sendFunds = async (e) => {
    e.preventDefault();
    
    // Show confirmation dialog first
    setPendingTx({
      to: recipientAddress,
      amount: amount,
      symbol: selectedChain.symbol,
      network: selectedChain.name
    });
    onOpen();
  };

  // Update the executeTransaction function
  const executeTransaction = async () => {
    if (!nearAccount || !privateKey) {
      setError('NEAR account not loaded');
      return;
    }

    setIsLoading(true);
    setProgressValue(10);
    setError('');
    setTxHash('');

    try {
      // Create the adapter
      const adapter = await setupAdapter({
        accountId: nearAccount.accountId,
        privateKey: privateKey,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: `${selectedChain.name.toLowerCase()},1`,
      });

      console.log('Executing transaction with adapter:', adapter.address);

      // Create provider
      const provider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
      console.log('Created provider');

      // Get nonce
      const nonce = await provider.getTransactionCount(adapter.address);
      console.log('Got nonce:', nonce);

      // Create transaction
      const tx = {
        nonce: nonce,
        gasLimit: 21000,
        to: recipientAddress,
        value: ethers.parseEther(amount),
        chainId: selectedChain.chainId,
        maxFeePerGas: ethers.parseUnits("0.1", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("0.1", "gwei")
      };

      console.log('Transaction prepared:', tx);

      // Get transaction hash and create payload
      const unsignedTx = ethers.Transaction.from(tx);
      const messageHash = unsignedTx.unsignedHash;

      // Create a fixed-size payload
      const hashBytes = ethers.getBytes(messageHash);
      const payload = new Uint8Array(32);
      for (let i = 0; i < hashBytes.length; i++) {
        payload[i] = hashBytes[i];
      }

      console.log('Transaction details:', {
        tx,
        messageHash,
        hashBytes,
        payload: Array.from(payload)
      });

      // Sign using adapter's sign method
      console.log('Getting signature from adapter...');
      const signature = await adapter.signAndSendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(amount),
        chainId: selectedChain.chainId,
        nonce: nonce,
        maxFeePerGas: ethers.parseUnits("0.1", "gwei"),
        maxPriorityFeePerGas: ethers.parseUnits("0.1", "gwei"),
        gasLimit: 21000
      });

      console.log('Got signature:', signature);
      setTxHash(signature);

      // Wait for confirmation
      const receipt = await provider.waitForTransaction(signature);
      console.log('Transaction confirmed:', receipt);

      onCloseModal();
      if (onClose) onClose();

    } catch (err) {
      console.error('Transfer error:', err);
      setError(`Transfer failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the showEVMAddress function
  useEffect(() => {
    const showEVMAddress = async () => {
      if (nearAccount && privateKey && selectedChain.name !== "NEAR" && amount && recipientAddress) {
        try {
          if (!nearAccount.accountId) {
            console.error('Missing account ID');
            return;
          }

          console.log('Attempting to setup adapter with account:', nearAccount.accountId);
          
          const adapter = await setupAdapter({
            accountId: nearAccount.accountId,
            privateKey: privateKey,
            mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
            derivationPath: `${selectedChain.name.toLowerCase()},1`,
          });
          
          setDerivedAddress(adapter.address);
          const balance = await checkEVMBalance(selectedChain, adapter.address);
          setSourceBalance(balance);
          console.log(`Your ${selectedChain.name} address: ${adapter.address}`);
          console.log(`Balance: ${balance} ${selectedChain.symbol}`);

          // Execute transfer if we have a balance
          if (parseFloat(balance) > 0) {
            console.log('Balance available, executing transfer...');
            // Execute transaction directly instead of showing dialog
            await executeTransaction();
          }
          // If no balance, fund first
          else {
            console.log('Zero balance detected, initiating funding...');
            await fundDerivedAddress();
          }
        } catch (err) {
          console.error('Error in automatic process:', err);
          setError(err.message);
        }
      }
    };

    showEVMAddress();
  }, [selectedChain, nearAccount, privateKey, amount, recipientAddress]);

  // Add this useEffect to debug the button visibility conditions
  useEffect(() => {
    console.log('Button visibility check:', {
      chainName: selectedChain.name,
      sourceBalance,
      shouldShow: selectedChain.name !== "NEAR" && parseFloat(sourceBalance) === 0
    });
  }, [selectedChain.name, sourceBalance]);

  // Only render the form if no transferParams or if there was an error
  if (transferParams && !error) {
    return (
      <div className="container mx-auto p-8 max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Processing Transfer</h1>
        <Progress 
          value={progressValue} 
          className="max-w-md mx-auto"
          aria-label="Transfer progress"
        />
        {txHash && (
          <div className="mt-6 text-center">
            <p className="text-green-600">Transfer successful!</p>
            <p className="break-all mt-2">Transaction Hash: {txHash}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Transfer Funds</h1>

      {selectedChain.name !== "NEAR" && (
        <>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Important:</p>
            <p>To make transfers on {selectedChain.name}, you need to have some {selectedChain.symbol} in your wallet for gas fees.</p>
          </div>

          {derivedAddress && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Your {selectedChain.name} Address:</p>
              <p className="break-all">{derivedAddress}</p>
              <p className="mt-2">Balance: {sourceBalance} {selectedChain.symbol}</p>
              {sourceBalance === '0' && (
                <div className="mt-2">
                  <p className="text-sm">To get testnet funds:</p>
                  {selectedChain.name === "Optimism" && (
                    <a 
                      href={`https://www.alchemy.com/faucets/optimism-sepolia`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Get Optimism Sepolia ETH from Faucet
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selectedChain.name !== "NEAR" && (sourceBalance === '0' || sourceBalance === '0.0' || parseFloat(sourceBalance) === 0) && (
        <div className="mb-4">
          <button
            onClick={fundDerivedAddress}
            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            disabled={isLoading}
          >
            {isLoading ? 'Funding...' : `Fund Wallet with ${FUNDING_AMOUNT} ${selectedChain.symbol}`}
          </button>
          {isLoading && (
            <div className="mt-4 flex flex-col items-center">
              <CircularProgress
                aria-label="Loading..."
                size="lg"
                value={progressValue}
                color="success"
                showValueLabel={true}
              />
              <p className="mt-2 text-sm text-gray-600">{progressMessage}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={sendFunds} className="space-y-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Chain
          </label>
          <select
            value={selectedChain.name}
            onChange={(e) => setSelectedChain(supportedChains.chains.find(c => c.name === e.target.value))}
            className="w-full p-2 border rounded"
          >
            {supportedChains.chains.map((chain) => (
              <option key={chain.chainId} value={chain.name}>
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder={`Enter ${selectedChain.name} address`}
          className="max-w-xs"
        />

        <Input
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`Amount in ${selectedChain.symbol}`}
          type="number"
          step="0.000001"
          className="max-w-xs"
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Processing...' : 'Send Funds'}
        </button>
      </form>

      {isLoading && (
        <div className="mt-6">
          <Progress 
            aria-label="Loading progress" 
            value={progressValue} 
            className="max-w-md" 
          />
        </div>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {txHash && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Transaction Successful</h2>
          <p className="break-all">Transaction Hash: {txHash}</p>
        </div>
      )}

      {sourceBalance && (
        <p className="mt-6">Source Wallet Balance: {sourceBalance} {selectedChain.symbol}</p>
      )}

      <TransactionConfirmDialog 
        isOpen={isOpen} 
        onClose={onCloseModal}
        tx={pendingTx}
        onConfirm={executeTransaction}
      />
    </div>
  );
} 