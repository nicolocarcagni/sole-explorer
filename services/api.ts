import { API_BASE_URL } from "../constants";
import { ApiBlock, ApiTransaction, TipResponse, BalanceResponse } from "../types";

export const getTip = async (): Promise<TipResponse> => {
  const response = await fetch(`${API_BASE_URL}/blocks/tip`);
  if (!response.ok) throw new Error("Failed to fetch tip");
  return response.json();
};

export const getBlock = async (hash: string): Promise<ApiBlock> => {
  const response = await fetch(`${API_BASE_URL}/blocks/${hash}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Block not found");
    throw new Error(`Failed to fetch block: ${response.statusText}`);
  }
  return response.json();
};

export const getTransaction = async (txid: string): Promise<ApiTransaction> => {
  const response = await fetch(`${API_BASE_URL}/transaction/${txid}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Transaction not found");
    throw new Error(`Failed to fetch transaction: ${response.statusText}`);
  }
  return response.json();
};

export const getBalance = async (address: string): Promise<BalanceResponse> => {
  const response = await fetch(`${API_BASE_URL}/balance/${address}`);
  if (!response.ok) {
    throw new Error("Failed to fetch balance");
  }
  return response.json();
};

// Assuming the API supports fetching transactions by address
export const getAddressTransactions = async (address: string): Promise<ApiTransaction[]> => {
  // Construct the endpoint. If the real API uses a different path, this should be updated.
  const response = await fetch(`${API_BASE_URL}/address/${address}/transactions`);
  if (!response.ok) {
    if (response.status === 404) return []; // Return empty if not found or no txs
    // For now, if the endpoint doesn't exist on the server, we just return empty array
    // to avoid breaking the UI.
    console.warn("Failed to fetch address transactions, endpoint might not exist.");
    return [];
  }
  return response.json();
};

// Chain requests to get the last N blocks starting from tip
export const getLastBlocks = async (count: number = 10): Promise<ApiBlock[]> => {
  try {
    const tip = await getTip();
    const blocks: ApiBlock[] = [];
    
    let currentHash = tip.hash;
    
    for (let i = 0; i < count; i++) {
      if (!currentHash) break;
      
      const block = await getBlock(currentHash);
      blocks.push(block);
      
      currentHash = block.prev_block_hash;
      
      // Stop if genesis (height 0) or no prev hash
      if (block.height === 0 || !currentHash) break;
    }
    
    return blocks;
  } catch (error) {
    console.error("Error fetching last blocks:", error);
    return [];
  }
};