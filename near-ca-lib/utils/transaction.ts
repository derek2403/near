import {
  Hash,
  Hex,
  PublicClient,
  TransactionSerializable,
  isBytes,
  keccak256,
  parseTransaction,
  serializeTransaction,
  toBytes,
  toHex,
} from "viem";
import { BaseTx, TransactionWithSignature } from "../types";
import { Network } from "../network";

export function toPayload(msgHash: Hex | Uint8Array): number[] {
  const bytes = isBytes(msgHash) ? msgHash : toBytes(msgHash);
  if (bytes.length !== 32) {
    throw new Error(`Payload must have 32 bytes: ${msgHash}`);
  }
  return Array.from(bytes);
}

export function fromPayload(payload: number[]): Hex {
  if (payload.length !== 32) {
    throw new Error(`Payload must have 32 bytes: ${payload}`);
  }
  // Convert number[] back to Uint8Array
  return toHex(new Uint8Array(payload));
}

export function buildTxPayload(serializedTx: `0x${string}`): number[] {
  return toPayload(keccak256(serializedTx));
}

export async function populateTx(
  tx: BaseTx,
  from: Hex,
  client?: PublicClient
): Promise<TransactionSerializable> {
  const provider = client || Network.fromChainId(tx.chainId).client;
  const chainId = await provider.getChainId();
  if (chainId !== tx.chainId) {
    // Can only happen when client is provided.
    throw new Error(
      `client chainId=${chainId} mismatch with tx.chainId=${tx.chainId}`
    );
  }
  const transactionData = {
    nonce: tx.nonce ?? (await provider.getTransactionCount({ address: from })),
    account: from,
    to: tx.to,
    value: tx.value ?? 0n,
    data: tx.data ?? "0x",
  };
  const [estimatedGas, { maxFeePerGas, maxPriorityFeePerGas }] =
    await Promise.all([
      // Only estimate gas if not provided.
      tx.gas || provider.estimateGas(transactionData),
      provider.estimateFeesPerGas(),
    ]);
  return {
    ...transactionData,
    gas: estimatedGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    chainId,
  };
}

export function addSignature({
  transaction,
  signature,
}: TransactionWithSignature): Hex {
  const txData = parseTransaction(transaction);
  const signedTx = {
    ...signature,
    ...txData,
  };
  return serializeTransaction(signedTx);
}

/**
 * Relays signed transaction to Ethereum mem-pool for execution.
 * @param serializedTransaction - Signed Ethereum transaction.
 * @returns Transaction Hash of relayed transaction.
 */
export async function relaySignedTransaction(
  serializedTransaction: Hex,
  wait: boolean = true
): Promise<Hash> {
  const tx = parseTransaction(serializedTransaction);
  const network = Network.fromChainId(tx.chainId!);
  if (wait) {
    const hash = await network.client.sendRawTransaction({
      serializedTransaction,
    });
    console.log(`Transaction Confirmed: ${network.scanUrl}/tx/${hash}`);
    return hash;
  } else {
    network.client.sendRawTransaction({
      serializedTransaction,
    });
    return keccak256(serializedTransaction);
  }
}

/**
 * Relays valid representation of signed transaction to Etherem mempool for execution.
 *
 * @param {TransactionWithSignature} tx - Signed Ethereum transaction.
 * @returns Hash of relayed transaction.
 */
export async function broadcastSignedTransaction(
  tx: TransactionWithSignature
): Promise<Hash> {
  const signedTx = addSignature(tx);
  return relaySignedTransaction(signedTx);
}
