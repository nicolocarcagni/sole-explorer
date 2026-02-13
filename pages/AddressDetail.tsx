import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBalance, getAddressTransactions } from '../services/api';
import { BalanceResponse, ApiTransaction } from '../types';
import { formatSole, truncateHash, formatTime } from '../utils/format';
import { Wallet, ArrowLeft, History, ArrowRightCircle, Copy, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AddressBadge from '../components/AddressBadge';
import { getKnownAddress } from '../config/knownAddresses';

const AddressDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentAddress = address || '';
  const known = address ? getKnownAddress(address) : null;

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      setLoading(true);
      setError(null);
      setTxError(null);
      
      try {
        const [balRes, txsRes] = await Promise.allSettled([
          getBalance(address),
          getAddressTransactions(address)
        ]);

        if (balRes.status === 'fulfilled') {
          setBalanceData(balRes.value);
        } else {
          const msg = balRes.reason?.message || "Unknown error";
          if (msg.includes("Address not found") || msg.includes("404")) {
             throw new Error("Address not found on the network.");
          }
          throw new Error("System is unable to retrieve address balance.");
        }

        if (txsRes.status === 'fulfilled') {
          // Defensive check: Ensure txsRes.value is an array before sorting
          const txList = Array.isArray(txsRes.value) ? txsRes.value : [];
          const sortedTxs = [...txList].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setTransactions(sortedTxs);
        } else {
          console.error("Tx fetch failed:", txsRes.reason);
          setTxError("Unable to load transaction history.");
        }
        
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load address data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !balanceData) {
    return (
      <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-red-400 font-bold text-xl mb-2">Address Error</h2>
        <p className="text-red-300/80 mb-6">{error || "The address you are looking for does not exist on this chain."}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition">
           Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-night-900 hover:bg-night-800 border border-white/5 rounded-full text-night-400 hover:text-white transition shadow-lg group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sole-500 text-sm font-medium uppercase tracking-wider mb-1">
              <Wallet size={16} />
              <span>Address Details {known && <span className="ml-1 opacity-60">— {known.label}</span>}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white font-mono break-all tracking-tight">
                {currentAddress}
              </h1>
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg text-night-400 hover:text-white transition-colors flex-shrink-0"
                title="Copy Address"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-sole-900/40 to-night-950 p-6 rounded-2xl border border-sole-500/30 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-sole-500/10 rounded-full blur-3xl pointer-events-none"></div>
             
             <h3 className="text-sm font-medium text-sole-200 uppercase tracking-wider mb-2">Current Balance</h3>
             <div className="text-3xl font-bold text-white mb-6 tracking-tight">
               {formatSole(balanceData.balance / 100000000)}
             </div>

             <div className="p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-xs text-night-400">Total Transactions</span>
                   <span className="text-white font-mono font-medium">{transactions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-xs text-night-400">Last Active</span>
                   <span className="text-sole-400 text-xs font-medium">
                     {transactions.length > 0 ? formatTime(transactions[0].timestamp) : 'N/A'}
                   </span>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-night-900/50 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden shadow-2xl min-h-[400px]">
            <div className="px-8 py-6 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
               <h3 className="font-bold text-white flex items-center gap-3">
                 <div className="p-2 bg-sole-500/10 rounded-lg text-sole-500 border border-sole-500/20">
                   <History size={18} />
                 </div>
                 Transaction History
               </h3>
               {txError && (
                 <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/5 rounded-xl text-night-400 hover:text-white transition-all">
                   <RefreshCw size={16} />
                 </button>
               )}
            </div>
            
            {txError ? (
               <div className="flex flex-col items-center justify-center h-80 text-red-400 p-8 text-center animate-in fade-in">
                  <div className="bg-red-900/20 p-4 rounded-full mb-4 border border-red-500/20 shadow-lg">
                    <AlertTriangle size={32} />
                  </div>
                  <p className="font-bold text-lg mb-2">{txError}</p>
                  <p className="text-sm text-red-400/60 max-w-xs mx-auto">Network request failed. Please check your connection or the node status.</p>
               </div>
            ) : transactions.length > 0 ? (
              <div className="divide-y divide-white/5">
                 {transactions.map((tx) => {
                    const isSender = tx.inputs && tx.inputs.length > 0 && tx.inputs[0].sender_address === currentAddress;
                    const isReceiver = tx.outputs.some(vout => vout.receiver_address === currentAddress);
                    
                    // Logic for Direction and Value
                    let txType: 'IN' | 'OUT' | 'SELF' = isSender ? 'OUT' : 'IN';
                    if (isSender && isReceiver && tx.outputs.length === 1) txType = 'SELF';

                    let calculatedValue = 0;
                    let counterparty = '';

                    if (txType === 'OUT') {
                      // Sum outputs that are NOT going to sender (excluding change)
                      calculatedValue = tx.outputs
                        .filter(out => out.receiver_address !== currentAddress)
                        .reduce((sum, out) => sum + out.value_sole, 0);
                      
                      // Counterparty is the first recipient (that isn't self)
                      const primaryRecipient = tx.outputs.find(out => out.receiver_address !== currentAddress);
                      counterparty = primaryRecipient?.receiver_address || 'Multiple';
                    } else if (txType === 'IN') {
                      // Sum outputs that ARE going to the current address
                      calculatedValue = tx.outputs
                        .filter(out => out.receiver_address === currentAddress)
                        .reduce((sum, out) => sum + out.value_sole, 0);
                      
                      // Counterparty is the sender
                      counterparty = tx.inputs?.[0]?.sender_address || 'COINBASE';
                    } else {
                      // SELF transaction
                      calculatedValue = tx.outputs.reduce((sum, out) => sum + out.value_sole, 0);
                      counterparty = currentAddress;
                    }

                    return (
                       <div key={tx.id} className="px-6 py-5 hover:bg-white/[0.03] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                             {/* Indicator Icon */}
                             <div className={`p-3 rounded-2xl border flex-shrink-0 transition-transform group-hover:scale-110 duration-300 ${
                                txType === 'OUT' ? 'bg-night-800 text-rose-400 border-rose-500/20' :
                                txType === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                'bg-sole-500/10 text-sole-500 border-sole-500/20'
                             }`}>
                                {txType === 'OUT' ? <ArrowUpRight size={20} /> : 
                                 txType === 'IN' ? <ArrowDownLeft size={20} /> :
                                 <ArrowRightCircle size={20} />}
                             </div>

                             <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-3 mb-1.5">
                                   <Link to={`/tx/${tx.id}`} className="text-sm font-mono font-bold text-white hover:text-sole-400 transition-colors truncate">
                                      {truncateHash(tx.id, 12, 12)}
                                   </Link>
                                   <span className={`text-[9px] font-black tracking-[0.1em] px-2 py-0.5 rounded-lg border ${
                                      txType === 'OUT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                      txType === 'IN' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                      'bg-sole-500/10 text-sole-400 border-sole-500/20'
                                   }`}>
                                      {txType}
                                   </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-night-500">
                                   <span>{formatTime(tx.timestamp)}</span>
                                   <span className="opacity-30">•</span>
                                   <div className="flex items-center gap-1.5 truncate">
                                      <span className="opacity-60">{txType === 'OUT' ? 'to' : 'from'}</span>
                                      <AddressBadge address={counterparty} truncate={true} className="opacity-90" />
                                   </div>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-end flex-shrink-0">
                             <div className={`text-lg font-black tracking-tighter ${
                                txType === 'OUT' ? 'text-rose-400' : 
                                txType === 'IN' ? 'text-emerald-500' : 
                                'text-sole-400'
                             }`}>
                                {txType === 'OUT' ? '-' : txType === 'IN' ? '+' : ''} {formatSole(calculatedValue)}
                             </div>
                             <div className="text-[10px] font-bold text-night-600 uppercase tracking-widest mt-0.5">
                                Transaction Value
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-80 text-night-500 animate-in fade-in duration-700">
                  <div className="bg-night-800 p-5 rounded-full mb-4 border border-white/5 opacity-50">
                    <History size={40} />
                  </div>
                  <p className="font-medium text-lg">Clean History</p>
                  <p className="text-sm opacity-60 mt-1">No transaction movements recorded for this address.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressDetail;