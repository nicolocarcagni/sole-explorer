import { PHOTONS_PER_SOLE } from "../constants";

// Convert Photons (int64) to SOLE string
export const formatCurrency = (photons: number): string => {
  if (!photons) return '0.00 SOLE';
  return `${(photons / PHOTONS_PER_SOLE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} SOLE`;
}

// Convert explicit float SOLE value (from API value_sole)
export const formatSole = (val: number): string => {
   if (!val) return '0.00 SOLE';
   return `${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} SOLE`;
}

// Format Unix Timestamp
export const formatTime = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleString();
}

// Truncate Hash
export const truncateHash = (hash: string, start = 6, end = 6): string => {
  if (!hash) return '';
  if (hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}...${hash.slice(-end)}`;
}
