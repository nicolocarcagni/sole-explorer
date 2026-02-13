export type AddressType = 'faucet' | 'foundation' | 'coinbase';

export interface KnownAddress {
  label: string;
  type: AddressType;
}

/**
 * Centralized styles for the 'Dark Cyberpunk Gold' design system.
 * Uses Glassmorphism, inner rings, and type-specific glows.
 */
export const ADDRESS_TYPE_STYLES: Record<AddressType, string> = {
  faucet: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]",
  foundation: "bg-sole-500/10 text-sole-400 border-sole-500/30 ring-1 ring-sole-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  coinbase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
};

export const KNOWN_ADDRESSES: Record<string, KnownAddress> = {
  "1FaUcBN9b72SGmf4tCXXJGYvJTaB9evVqA": {
    label: "Faucet",
    type: 'faucet',
  },
  "1SoLErUCu4pL7qrTAouiY4TfWwzAwBsnn": {
    label: "Foundation",
    type: 'foundation',
  },
  "1HSYNy8yXUuUZrkBCnzSc34Lqr8soPAKQL": {
    label: "Genesis",
    type: 'foundation',
  },
  "COINBASE": {
    label: "Coinbase",
    type: 'coinbase',
  }
};

export const getKnownAddress = (address: string): KnownAddress | null => {
  if (!address) return null;
  const entry = Object.entries(KNOWN_ADDRESSES).find(
    ([addr]) => addr.toLowerCase() === address.toLowerCase()
  );
  return entry ? entry[1] : null;
};