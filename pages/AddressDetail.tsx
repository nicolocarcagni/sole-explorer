import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBalance, getAddressTransactions } from '../services/api';
import { BalanceResponse, ApiTransaction } from '../types';
import { formatSole, truncateHash, formatTime } from '../utils/format';
import { Wallet, ArrowLeft, History, ArrowRightCircle, Copy, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AddressDetail: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  
  const [balanceData, setBalanceData] = useState<BalanceResponse | null>(null);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      setLoading(true);
      setError(null);
      setTxError(null);
      
      try {
        // Fetch balance and transactions in parallel
        const [balRes, txsRes] = await Promise.allSettled([
          getBalance(address),
          getAddressTransactions(address)
        ]);

        // Handle Balance (Fatal Error if failed)
        if (balRes.status === 'fulfilled') {
          setBalanceData(balRes.value);
        } else {
          const msg = balRes.reason?.message || "Unknown error";
          if (msg.includes("Address not found") || msg.includes("404")) {
             throw new Error("Address not found on the network.");
          }
          throw new Error("System is unable to retrieve address balance.");
        }

        // Handle Transactions (Non-fatal Error if failed)
        if (txsRes.status === 'fulfilled') {
          // Sort transactions by timestamp desc if they have timestamps
          const sortedTxs = [...txsRes.value].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
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

  const reloadPage = () => window.location.reload();

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-night-900 hover:bg-night-800 border border-white/5 rounded-full text-night-400 hover:text-white transition shadow-lg group">
             <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sole-500 text-sm font-medium uppercase tracking-wider mb-1">
              <Wallet size={16} />
              <span>Address Details</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-white font-mono break-all tracking-tight">
                {address}
              </h1>
              <button 
                onClick={copyToClipboard}
                className="p-2 hover:bg-white/10 rounded-lg text-night-400 hover:text-white transition-colors"
                title="Copy Address"
              >
                {copied ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
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
                {/* Stats */}
                <div className="flex justify-between items-center">
                   <span className="text-xs text-night-400">Last Active</span>
                   <span className="text-sole-400 text-xs">{transactions.length > 0 ? formatTime(transactions[0].timestamp) : 'N/A'}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl min-h-[400px]">
            <div className="px-6 py-5 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
               <h3 className="font-semibold text-white flex items-center gap-2">
                 <History size={18} className="text-sole-500"/> Transaction History
               </h3>
               {txError && (
                 <button onClick={reloadPage} className="p-1.5 hover:bg-white/5 rounded-full text-night-400 hover:text-white transition">
                   <RefreshCw size={14} />
                 </button>
               )}
            </div>
            
            {txError ? (
               <div className="flex flex-col items-center justify-center h-64 text-red-400 p-8 text-center animate-in fade-in">
                  <div className="bg-red-900/20 p-3 rounded-full mb-3 border border-red-500/20">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="font-medium mb-1">{txError}</p>
                  <p className="text-xs text-red-400/70 max-w-xs">There was an issue retrieving the transaction history for this address.</p>
               </div>
            ) : transactions.length > 0 ? (
              <div className="divide-y divide-white/5">
                 {transactions.map((tx) => {
                    // Check flow direction relative to this address
                    const isSender = tx.inputs?.some(vin => vin.sender_address === address);
                    const isReceiver = tx.outputs.some(vout => vout.receiver_address === address);
                    
                    // Simple heuristic for type
                    let type = "Unknown";
                    if (isSender && isReceiver) type = "Self/Change";
                    else if (isSender) type = "Sent";
                    else if (isReceiver) type = "Received";

                    const totalValue = tx.outputs.reduce((acc, out) => acc + (out.value_sole || 0), 0);

                    return (
                       <div key={tx.id} className="p-4 hover:bg-white/[0.03] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                          <div className="flex items-center gap-4">
                             <div className={`p-2 rounded-full border ${
                                type === 'Sent' ? 'bg-night-800 text-night-400 border-white/10' :
                                type === 'Received' ? 'bg-sole-500/10 text-sole-500 border-sole-500/20' :
                                'bg-night-800 text-night-400 border-white/10'
                             }`}>
                                {type === 'Sent' ? <ArrowRight size={16} className="-rotate-45" /> : 
                                 type === 'Received' ? <ArrowRight size={16} className="rotate-135" /> :
                                 <ArrowRightCircle size={16} />}
                             </div>
                             <div>
                                <Link to={`/tx/${tx.id}`} className="text-sm font-mono text-sole-400 hover:text-sole-300 font-medium block mb-1">
                                   {truncateHash(tx.id, 12, 12)}
                                </Link>
                                <span className="text-xs text-night-500">{formatTime(tx.timestamp)}</span>
                             </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                             <span className={`text-xs font-bold uppercase px-2 py-1 rounded border ${
                                type === 'Sent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                type === 'Received' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                'bg-night-800 text-night-400 border-white/10'
                             }`}>
                                {type}
                             </span>
                             <span className="text-white font-medium">
                                {formatSole(totalValue)}
                             </span>
                          </div>
                       </div>
                    );
                 })}
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-64 text-night-500">
                  <History size={32} className="mb-3 opacity-50" />
                  <p>No transactions found for this address.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressDetail;