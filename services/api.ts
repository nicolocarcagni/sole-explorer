import { API_BASE_URL } from "../constants";
import { ApiBlock, ApiTransaction, TipResponse, BalanceResponse, PeersResponse, ValidatorsResponse } from "../types";

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
    if (response.status === 404) throw new Error("Address not found");
    throw new Error(`Failed to fetch balance: ${response.statusText}`);
  }
  return response.json();
};

export const getAddressTransactions = async (address: string): Promise<ApiTransaction[]> => {
  const response = await fetch(`${API_BASE_URL}/transactions/${address}`);
  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  const data = await response.json();
  // Ensure the returned data is an array
  return Array.isArray(data) ? data : [];
};

export const getPeers = async (): Promise<PeersResponse> => {
  const response = await fetch(`${API_BASE_URL}/network/peers`);
  if (!response.ok) {
    if (response.status === 404) return { peers: [] };
    throw new Error("Failed to fetch peers");
  }
  return response.json();
};

export const getValidators = async (): Promise<ValidatorsResponse> => {
  const response = await fetch(`${API_BASE_URL}/consensus/validators`);
  if (!response.ok) {
    if (response.status === 404) return { validators: [] };
    throw new Error("Failed to fetch validators");
  }
  return response.json();
};

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
      
      if (block.height === 0 || !currentHash) break;
    }
    
    return blocks;
  } catch (error) {
    console.error("Error fetching last blocks:", error);
    return [];
  }
};