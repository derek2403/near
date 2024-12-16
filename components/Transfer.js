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

// Update the setupKeyPair helper function
const setupKeyPair = async (accountId, privateKey) => {
  try {
    // Create a new keyStore for this specific transaction
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = nearAPI.KeyPair.fromString(privateKey);
    
    // Clear any existing keys and set the new one
    await keyStore.clear();
    await keyStore.setKey("testnet", accountId, keyPair);
    
    // Create a new connection config
    const connectionConfig = {
      networkId: "testnet",
      keyStore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://testnet.mynearwallet.com/",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://testnet.nearblocks.io",
      headers: {}
    };

    // Create new connection
    const near = await connect(connectionConfig);
    
    // Create account with the connection
    const account = await near.account(accountId);
    
    // Verify account exists and has the key
    const state = await account.state();
    console.log('Account state verified:', state);

    // Verify access keys
    const accessKeys = await account.getAccessKeys();
    console.log('Access keys:', accessKeys);

    // Store the private key for later use
    account.privateKey = privateKey;

    return { account, keyStore, keyPair, near };
  } catch (err) {
    console.error('Error setting up key pair:', err);
    throw err;
  }
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

// Add this helper function to get public key
const getPublicKey = async (accountId) => {
  const response = await fetch('https://rpc.testnet.near.org', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'view_access_key_list',
        finality: 'final',
        account_id: accountId
      }
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result.keys[0].public_key;
};

// Update the SCHEMA constant
const SCHEMA = nearAPI.transactions.SCHEMA;

// Update the callContract function
const callContract = async (account, method, args) => {
  try {
    // For view methods, use view call
    if (method === 'public_key') {
      const result = await account.viewFunction({
        contractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        methodName: method,
        args: args || {}
      });
      return result;
    }

    // Get all access keys and find the full access key
    const accessKeys = await account.getAccessKeys();
    console.log('Available access keys:', accessKeys);

    // Create key pair from the full private key
    const keyPair = nearAPI.KeyPair.fromString(
      'ed25519:tnK82FhpXJLK5x3ESePfHqYQ9Jxm5LH7xfrCVqkMFTxPokqc62z1ow8CC2XpFg2hpATS8SVdUbLiSA5J9ELW8eu'
    );
    console.log('Created key pair with public key:', keyPair.getPublicKey().toString());

    // Set the key pair in the account's key store
    await account.connection.signer.keyStore.setKey(
      account.connection.networkId,
      account.accountId,
      keyPair
    );

    // Use the account's signAndSendTransaction method with deposit
    const result = await account.signAndSendTransaction({
      receiverId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
      actions: [
        nearAPI.transactions.functionCall(
          method,
          args,
          '300000000000000', // gas
          method === 'sign' ? '1' : '0' // attach 1 yoctoNEAR deposit for sign method
        )
      ]
    });

    if (result.status && result.status.SuccessValue) {
      const value = Buffer.from(result.status.SuccessValue, 'base64').toString();
      return JSON.parse(value);
    }
    
    return result;
  } catch (err) {
    console.error('Contract call error:', err);
    throw err;
  }
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
        
        // Clear any existing keys first
        await keyStore.clear();
        
        // Store the key in keyStore
        await keyStore.setKey("testnet", accountId, keyPair);

        // Create new connection with the keyStore
        const connectionConfig = {
          networkId: "testnet",
          keyStore,
          nodeUrl: "https://rpc.testnet.near.org",
          walletUrl: "https://testnet.mynearwallet.com/",
          helperUrl: "https://helper.testnet.near.org",
          explorerUrl: "https://testnet.nearblocks.io"
        };

        const near = await connect(connectionConfig);
        const account = await near.account(accountId);

        // Verify key is stored
        const storedKey = await keyStore.getKey("testnet", accountId);
        if (!storedKey) {
          throw new Error('Failed to store key pair');
        }
        console.log('Key verification:', !!storedKey);

        // Store account and private key
        setNearAccount(account);
        setPrivateKey(accountPrivateKey);
        
        // Check account balance
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

  // Update executeTransaction function
  const executeTransaction = async () => {
    setIsLoading(true);
    setProgressValue(40);
    setError('');
    setTxHash('');

    try {
      console.log('Starting transaction execution...');
      
      // Set up fresh account connection with key pair
      const { account, keyPair, near } = await setupKeyPair(nearAccount.accountId, privateKey);
      console.log('Account setup complete');
      
      // Verify the account state
      const accountState = await account.state();
      console.log('Account state:', accountState);
      
      // Verify the key is properly set
      const accessKeys = await account.getAccessKeys();
      console.log('Access keys:', accessKeys);
      
      const derivationPath = `${selectedChain.name.toLowerCase()},1`;
      
      // Set up the adapter first
      const adapter = await setupAdapter({
        accountId: account.accountId,
        privateKey: privateKey,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });
      console.log('Adapter setup complete:', adapter.address);
      
      // Create the unsigned transaction first
      const provider = createProviderWithRetry(selectedChain.rpcUrl);
      const amountWei = ethers.parseEther(amount);

      // Get latest nonce and gas price with retries
      const nonce = await withRetry(() => provider.getTransactionCount(adapter.address));
      const feeData = await withRetry(() => provider.getFeeData());

      const txPayload = {
        to: recipientAddress,
        value: amountWei,
        chainId: selectedChain.chainId,
        nonce: nonce,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        gasLimit: 21000,
        type: 2
      };

      const unsignedTx = ethers.Transaction.from(txPayload);
      const payload = ethers.getBytes(unsignedTx.unsignedHash);
      
      console.log('Requesting signature for payload:', Array.from(payload));

      // Get MPC public key first
      const mpcPublicKey = await callContract(account, 'public_key', {});
      console.log('MPC public key:', mpcPublicKey);

      // Request signature
      const signResult = await callContract(account, 'sign', {
        request: {
          payload: Array.from(payload),
          path: derivationPath,
          key_version: 0
        }
      });

      console.log('Sign result:', signResult);

      // Extract signature components
      const { big_r, s, recovery_id } = signResult;
      const r = Buffer.from(big_r.affine_point.substring(2), 'hex');
      const s_value = Buffer.from(s.scalar, 'hex');

      // Create signed transaction
      const signedTx = ethers.Transaction.from({
        ...txPayload,
        signature: {
          r: `0x${r.toString('hex')}`,
          s: `0x${s_value.toString('hex')}`,
          v: recovery_id
        }
      });

      // Broadcast the transaction
      const tx = await provider.broadcastTransaction(signedTx.serialized);
      console.log('Transaction sent:', tx.hash);
      setTxHash(tx.hash);
      setProgressValue(70);

      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      setProgressValue(100);
      
      onCloseModal();
      if (onClose) onClose();

    } catch (err) {
      console.error('Transaction failed:', err);
      setError(`Transaction failed: ${err.message}`);
      setProgressValue(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Update showEVMAddress to match your working code
  const showEVMAddress = async () => {
    if (!nearAccount || !privateKey) {
      console.log('Account not loaded yet');
      return;
    }

    try {
      const derivationPath = `${selectedChain.name.toLowerCase()},1`;
      const adapter = await setupAdapter({
        accountId: nearAccount.accountId,
        privateKey: privateKey,
        mpcContractId: process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath: derivationPath,
      });

      console.log('Checking balance for address:', adapter.address);
      const balance = await checkEVMBalance(selectedChain, adapter.address);
      setSourceBalance(balance);
      setDerivedAddress(adapter.address);

      if (parseFloat(balance) > 0) {
        console.log('Balance available, executing transfer...');
        await executeTransaction();
      } else {
        console.log('Zero balance, initiating funding...');
        await fundDerivedAddress();
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    }
  };

  // Add this useEffect to trigger the transaction
  useEffect(() => {
    if (nearAccount && privateKey && selectedChain && amount && recipientAddress) {
      console.log('Conditions met, showing EVM address...');
      showEVMAddress();
    }
  }, [nearAccount, privateKey, selectedChain, amount, recipientAddress]);

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