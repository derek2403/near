import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupFastAuthWallet } from 'near-fastauth-wallet';

const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'mainnet';
const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL;
const WALLET_URL = process.env.NEXT_PUBLIC_WALLET_URL;
const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID;

export async function loginWithEmail(email) {
  try {
    // Initialize wallet selector
    const selector = await setupWalletSelector({
      network: NETWORK_ID,
      modules: [
        setupFastAuthWallet({
          relayerUrl: RELAYER_URL,
          walletUrl: WALLET_URL
        })
      ]
    });

    // Get FastAuth wallet instance
    const fastAuthWallet = await selector.wallet('fast-auth-wallet');

    // Sign in with email
    const response = await fastAuthWallet.signIn({
      contractId: CONTRACT_ID,
      email: email,
      isRecovery: true // Set to false if you want to create a new account
    });

    return response;
  } catch (error) {
    console.error('Error logging in with email:', error);
    throw error;
  }
}
