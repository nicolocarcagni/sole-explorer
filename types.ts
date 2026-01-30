// API Response Types matching api_server.go definitions

export interface TipResponse {
  height: number;
  hash: string;
}

export interface BalanceResponse {
  address: string;
  balance: number; // int64 in Go
}

export interface ApiTxInput {
  sender_address: string;
  signature: string;
}

export interface ApiTxOutput {
  receiver_address: string;
  value: number; // int64 (photons)
  value_sole: number; // float64
}

export interface ApiTransaction {
  id: string;
  inputs: ApiTxInput[] | null; // Go might return null/empty for inputs if not initialized, usually empty array
  outputs: ApiTxOutput[];
  timestamp: number;
}

export interface ApiBlock {
  timestamp: number;
  height: number;
  prev_block_hash: string;
  hash: string;
  transactions: ApiTransaction[];
  validator: string;
  signature: string;
}

export interface PeersResponse {
  peers: string[];
}

export interface ValidatorsResponse {
  validators: string[];
}

// Re-export specific types if components rely on generic names, 
// or simply use these Api* types throughout the app.
export type Block = ApiBlock;
export type Transaction = ApiTransaction;
export type TxInput = ApiTxInput;
export type TxOutput = ApiTxOutput;