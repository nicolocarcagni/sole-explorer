import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ApiTransaction, ApiTxOutput } from '../types';
import { truncateHash, formatSole } from '../utils/format';
import { getTransaction } from '../services/api';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  AlertTriangle, 
  ArrowRightCircle, 
  CornerDownLeft, 
  Wallet, 
  CheckCircle2,
  Coins
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const TransactionDetail: React.FC = () => {
  const { txid } = useParams<{ txid: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const navState = location.state as { transaction: ApiTransaction, blockHeight: number } | null;
  
  const [tx, setTx] = useState<ApiTransaction | null>(navState?.transaction || null);
  const [loading, setLoading] = useState(!navState?.transaction);
  const [error, setError] = useState<string | null>(null);
  const blockHeight = navState?.blockHeight;

  useEffect(() => {
    if (navState?.transaction) {
      setLoading(false);
      return;
    }

    const fetchTx = async () => {
      if (!txid) return;
      try {
        setLoading(true);
        const data = await getTransaction(txid);
        setTx(data);
      } catch (err) {
        console.error(err);
        setError("Transaction not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, [txid, navState]);

  if (loading) return <LoadingSpinner />;

  if (error || !tx) {
    return (
      <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-2xl text-center max-w-lg mx-auto mt-10">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-red-400 font-bold text-xl mb-2">Transaction Not Found</h2>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition">
           Return Home
        </button>
      </div>
    );
  }

  // Determine if Coinbase based on "sender_address"
  const isCoinbase = tx.inputs && tx.inputs.length > 0 && tx.inputs[0].sender_address === "COINBASE";
  const totalOutput = tx.outputs.reduce((sum, v) => sum + (v.value_sole || 0), 0);

  // Heuristic Logic for UX:
  // Using the new API structure: `sender_address` vs `receiver_address`.
  const senderAddress = isCoinbase ? null : tx.inputs?.[0]?.sender_address;

  const isChangeOutput = (vout: ApiTxOutput) => {
    if (isCoinbase || !senderAddress) return false;
    // Direct comparison of addresses provided by the API
    return vout.receiver_address === senderAddress; 
  };

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
              <FileText size={16} />
              <span>Transaction Details</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white font-mono break-all tracking-tight">{truncateHash(tx.id, 12, 12)}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {blockHeight && (
             <div className="hidden md:flex flex-col items-end">
                <span className="text-xs text-night-400 uppercase">Included in Block</span>
                <Link to={`/block/${blockHeight}`} className="text-sole-500 font-bold hover:underline">#{blockHeight}</Link>
             </div>
          )}
        </div>
      </div>

      {/* Main UTXO Visualizer Layout */}
      <div className="relative grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INPUTS (Sources) */}
        <div className="xl:col-span-4 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold text-night-300 uppercase text-xs tracking-wider">Inputs (From)</h3>
              <span className="text-xs text-night-500">{tx.inputs ? tx.inputs.length : 0} Input{tx.inputs?.length !== 1 && 's'}</span>
           </div>
           
           <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden min-h-[150px] shadow-inner">
              {isCoinbase ? (
                 <div className="p-8 flex flex-col items-center justify-center text-center h-full space-y-4 py-12">
                    <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                       <Coins size={32} />
                    </div>
                    <div>
                       <p className="text-white font-bold text-lg">New Generation</p>
                       <p className="text-sm text-night-400 max-w-[200px] mx-auto mt-1">Newly minted coins awarded to the miner.</p>
                    </div>
                 </div>
              ) : (
                 <div className="p-4 space-y-3">
                    {tx.inputs && tx.inputs.map((vin, idx) => (
                       <div key={idx} className="p-4 bg-night-950 border border-white/5 rounded-xl hover:border-white/10 transition group relative overflow-hidden">
                          {/* Decorative accent */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-night-700"></div>
                          
                          <div className="flex justify-between items-start mb-2 pl-2">
                             <div className="flex items-center gap-2">
                                <Wallet size={14} className="text-night-500" />
                                <span className="text-xs text-night-400 font-mono">Input #{idx}</span>
                             </div>
                          </div>
                          
                          <div className="pl-2 space-y-1">
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] text-night-600 uppercase tracking-wider font-bold">Sender</span>
                               <Link to={`/address/${vin.sender_address}`} className="text-xs font-mono text-sole-400 break-all truncate group-hover:text-sole-300 transition-colors hover:underline">
                                  {vin.sender_address}
                               </Link>
                            </div>
                            <div className="flex flex-col gap-1 mt-1">
                               <span className="text-[10px] text-night-600 uppercase tracking-wider font-bold">Sign</span>
                               <span className="text-xs text-night-500 font-mono truncate">
                                  {truncateHash(vin.signature, 8, 8)}...
                               </span>
                            </div>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* CENTER COLUMN: PROCESS FLOW (Visual only) */}
        <div className="xl:col-span-1 flex flex-col items-center justify-center py-4 xl:py-20 xl:h-full">
            <div className="bg-night-950 p-3 rounded-full border border-sole-500/30 text-sole-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] z-10">
               <ArrowRight size={24} className="rotate-90 xl:rotate-0" />
            </div>
            <div className="hidden xl:block h-full w-px bg-gradient-to-b from-transparent via-sole-500/20 to-transparent absolute top-0 bottom-0 left-1/2 -z-0"></div>
        </div>

        {/* RIGHT COLUMN: OUTPUTS (Destinations) */}
        <div className="xl:col-span-7 space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold text-night-300 uppercase text-xs tracking-wider">Outputs (To)</h3>
              <span className="text-xs text-night-500">Total: <span className="text-white font-medium">{formatSole(totalOutput)}</span></span>
           </div>

           <div className="space-y-4">
              {tx.outputs.map((vout, idx) => {
                const isChange = isChangeOutput(vout);
                
                return (
                  <div 
                    key={idx} 
                    className={`relative p-5 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden group
                      ${isChange 
                        ? 'bg-night-950/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20 border-dashed' 
                        : 'bg-gradient-to-br from-sole-900/30 to-night-900 border-sole-500/40 hover:border-sole-400 shadow-lg shadow-sole-900/10'
                      }`}
                  >
                     {/* Background Glow for Transfer */}
                     {!isChange && <div className="absolute top-0 right-0 w-64 h-64 bg-sole-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-sole-500/20 transition-all"></div>}

                     <div className="flex items-start gap-4 z-10 min-w-0 flex-1">
                        {/* Status Icon */}
                        <div className={`p-3 rounded-xl border flex-shrink-0 transition-colors ${
                            isChange 
                            ? 'bg-night-900 text-night-500 border-white/5' 
                            : 'bg-sole-500 text-night-950 border-sole-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                        }`}>
                           {isChange ? <CornerDownLeft size={20} /> : <ArrowRightCircle size={20} />}
                        </div>

                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2 mb-1.5">
                              {isChange ? (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-night-500 bg-night-900 px-2 py-0.5 rounded border border-white/5">Change</span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-widest text-sole-200 bg-sole-500/20 px-2 py-0.5 rounded border border-sole-500/30 shadow-sm">Transfer</span>
                              )}
                              <span className="text-xs text-night-500 font-mono opacity-50">#{idx}</span>
                           </div>
                           
                           <Link to={`/address/${vout.receiver_address}`} className={`font-mono text-sm truncate pr-4 block hover:underline ${isChange ? 'text-night-400' : 'text-white font-medium'}`} title={vout.receiver_address}>
                              {vout.receiver_address}
                           </Link>
                           
                           {isChange && (
                             <p className="text-xs text-night-600 mt-1 flex items-center gap-1">
                               <CheckCircle2 size={12} /> Returned to sender wallet
                             </p>
                           )}
                        </div>
                     </div>

                     {/* Amount Display */}
                     <div className="text-right z-10 flex-shrink-0">
                        <p className="text-xs text-night-500 uppercase tracking-wider mb-0.5">Amount</p>
                        <div className={`text-xl font-bold tracking-tight ${isChange ? 'text-night-500' : 'text-sole-400'}`}>
                           {formatSole(vout.value_sole)}
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;