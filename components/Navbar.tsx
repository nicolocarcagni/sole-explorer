import React, { useState, useRef, useEffect } from 'react';
import { Search, Sun, Loader2, AlertCircle, FileText, Wallet, Box, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getBlock, getTransaction, getBalance } from '../services/api';

const Navbar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
    if (error) setError('');
  };

  const handleExplicitSearch = async (type: 'tx' | 'address' | 'block') => {
    const query = searchTerm.trim();
    if (!query) return;

    setIsSearching(true);
    setError('');
    setShowDropdown(false); // Hide menu immediately

    try {
      if (type === 'block') {
        // Explicitly check for block
        await getBlock(query);
        navigate(`/block/${query}`);
      } else if (type === 'tx') {
        // Explicitly check for transaction
        const tx = await getTransaction(query);
        navigate(`/tx/${query}`, { state: { transaction: tx } });
      } else if (type === 'address') {
        // Explicitly check for address (using getBalance as validation)
        await getBalance(query);
        navigate(`/address/${query}`);
      }
      setSearchTerm(''); // Clear input on success
    } catch (err: any) {
      // Specific error message based on type
      let msg = "Not found";
      if (err.message && err.message.includes("404")) {
         msg = `${type.charAt(0).toUpperCase() + type.slice(1)} not found in chain.`;
      } else {
         msg = err.message || "Connection failed";
      }
      setError(msg);
      // Re-show dropdown so they can try a different type if they made a mistake
      setShowDropdown(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Prevent default form submission from reloading or doing the old auto-search
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-night-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setError('')}>
            <div className="relative">
              <Sun size={28} className="text-sole-500 group-hover:rotate-45 transition-transform duration-500" />
              <div className="absolute inset-0 bg-sole-400 blur-lg opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              SOLE <span className="text-sole-500 font-light">Explorer</span>
            </span>
          </Link>

          {/* Search Container */}
          <div className="flex-1 max-w-lg mx-8 relative" ref={dropdownRef}>
            {/* CLEAN LOOK: Removed the background blur/gradient div here */}
            
            <form onSubmit={handleFormSubmit} className="relative z-20">
              <input
                type="text"
                placeholder="Paste Block Hash, TXID, or Address..."
                className={`w-full bg-night-900 text-night-100 border rounded-lg py-2.5 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-sole-500 placeholder-night-500 text-sm transition-all shadow-lg ${
                  error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-sole-500/50'
                }`}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => { if(searchTerm) setShowDropdown(true); }}
                disabled={isSearching}
              />
              <div className="absolute right-2 top-2.5 text-night-400">
                {isSearching ? <Loader2 size={18} className="animate-spin text-sole-500" /> : <Search size={18} />}
              </div>
            </form>

            {/* Error Toast */}
            {error && (
              <div className="absolute top-full mt-3 left-0 w-full bg-red-900/90 backdrop-blur border border-red-500/30 text-white text-xs rounded-md shadow-2xl p-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 z-50">
                <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Explicit Selection Dropdown */}
            {showDropdown && searchTerm && !isSearching && (
              <div className="absolute top-full left-0 w-full mt-2 bg-night-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2 text-[10px] uppercase tracking-wider text-night-500 font-semibold px-4 pt-3 pb-1">
                  Search As...
                </div>
                
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => handleExplicitSearch('tx')}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sole-500/10 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-night-800 rounded-lg text-night-400 group-hover:text-sole-500 group-hover:bg-sole-500/20 transition-colors border border-white/5">
                        <FileText size={16} />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white group-hover:text-sole-200">Transaction</span>
                        <span className="block text-[10px] text-night-500 group-hover:text-sole-500/70">Search by TXID</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-night-600 group-hover:text-sole-500" />
                  </button>

                  <button 
                    onClick={() => handleExplicitSearch('address')}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sole-500/10 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-night-800 rounded-lg text-night-400 group-hover:text-sole-500 group-hover:bg-sole-500/20 transition-colors border border-white/5">
                        <Wallet size={16} />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white group-hover:text-sole-200">Address</span>
                        <span className="block text-[10px] text-night-500 group-hover:text-sole-500/70">Search by Wallet Address</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-night-600 group-hover:text-sole-500" />
                  </button>

                  <button 
                    onClick={() => handleExplicitSearch('block')}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-sole-500/10 group transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-night-800 rounded-lg text-night-400 group-hover:text-sole-500 group-hover:bg-sole-500/20 transition-colors border border-white/5">
                        <Box size={16} />
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-white group-hover:text-sole-200">Block</span>
                        <span className="block text-[10px] text-night-500 group-hover:text-sole-500/70">Search by Hash or Height</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-night-600 group-hover:text-sole-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
             <div className="px-3 py-1 rounded-full bg-sole-500/10 border border-sole-500/20 text-xs font-medium text-sole-400 uppercase tracking-wide">
               Mainnet
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;