import React from 'react';
import { Link } from 'react-router-dom';
import { getKnownAddress, ADDRESS_TYPE_STYLES, AddressType } from '../config/knownAddresses';
import { truncateHash } from '../utils/format';
import { Droplets, Landmark, Zap, Wallet, Copy } from 'lucide-react';

interface AddressBadgeProps {
  address: string;
  truncate?: boolean;
  className?: string;
}

const AddressBadge: React.FC<AddressBadgeProps> = ({ address, truncate = true, className = "" }) => {
  const known = getKnownAddress(address);

  const getIcon = (type: AddressType) => {
    const iconProps = { size: 12, className: "mr-1.5 flex-shrink-0" };
    switch (type) {
      case 'faucet': return <Droplets {...iconProps} />;
      case 'foundation': return <Landmark {...iconProps} />;
      case 'coinbase': return <Zap {...iconProps} />;
    }
  };

  // Tooltip Component for Reusability
  const Tooltip = () => (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-night-950 border border-sole-500/30 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-sole-200 tracking-wider selection:bg-sole-500/30">
          {address}
        </span>
      </div>
      {/* Tooltip Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-night-950"></div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[9px] border-transparent border-t-sole-500/20 -z-10"></div>
    </div>
  );

  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      {known ? (
        <>
          <Link 
            to={`/address/${address}`}
            title={address}
            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-tight border backdrop-blur-md transition-all duration-300 hover:brightness-125 active:scale-95 leading-none overflow-hidden max-w-[150px] ${ADDRESS_TYPE_STYLES[known.type]}`}
          >
            {getIcon(known.type)}
            <span className="truncate translate-y-[0.5px]">{known.label}</span>
          </Link>
          <Tooltip />
        </>
      ) : (
        <>
          <Link 
            to={`/address/${address}`}
            className="inline-flex items-center font-mono text-sole-400/80 hover:text-sole-300 transition-all duration-200 hover:underline gap-1.5 leading-none max-w-[140px] sm:max-w-[200px]"
          >
            <Wallet size={12} className="opacity-40 flex-shrink-0" />
            <span className="truncate translate-y-[0.5px]">
              {truncate ? truncateHash(address, 6, 6) : address}
            </span>
          </Link>
          <Tooltip />
        </>
      )}
    </div>
  );
};

export default AddressBadge;