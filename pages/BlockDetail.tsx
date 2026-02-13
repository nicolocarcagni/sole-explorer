import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBlock } from '../services/api';
import { ApiBlock } from '../types';
import { formatTime, truncateHash, formatSole } from '../utils/format';
import { ArrowLeft, Box, Hash, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AddressBadge from '../components/AddressBadge';

const BlockDetail: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [block, setBlock] = useState<ApiBlock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlock = async () => {
      if (!hash) return;
      try {
        setLoading(true);
        const data = await getBlock(hash);
        setBlock(data);
        setError(null);
      } catch (err) {
        setError("Block not found or invalid hash.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [hash]);

  const handleTxClick = (txId: string, txData: any) => {
    navigate(`/tx/${txId}`, { state: { transaction: txData, blockHeight: block?.height } });
  };

  if (loading) return <LoadingSpinner />;

  if (error || !block) return (
    <div className="bg-red-950/20 border border-red-500/20 p-8 rounded-2xl text-center max-w-lg mx-auto mt-10">
      <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
      <h2 className="text-red-400 font-bold text-xl mb-2">Block Not Found</h2>
      <p className="text-red-300/80 mb-6">{error || "Unknown error"}</p>
      <Link to="/" className="px-6 py-2 bg-red-900/50 hover:bg-red-900 text-red-200 rounded-lg transition">Return Home</Link>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-night-900 hover:bg-night-800 border border-white/5 rounded-full text-night-400 hover:text-white transition shadow-lg">
             <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-sole-500 text-sm font-medium uppercase tracking-wider mb-1">
              <Box size={16} />
              <span>Block Details</span>
            </div>
            <h1 className="text-3xl font-bold text-white">#{block.height?.toLocaleString() ?? 'N/A'}</h1>
          </div>
        </div>
        <div className="text-right hidden md:block">
           <span className="px-4 py-2 bg-sole-500/10 border border-sole-500/20 rounded-full text-sole-400 text-sm font-medium">
             Confirmed
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <div className="px-6 py-5 bg-white/[0.02] border-b border-white/5">
               <h3 className="font-semibold text-white flex items-center gap-2">
                 <Hash size={18} className="text-sole-500"/> Header Information
               </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="group">
                <div className="text-xs font-medium text-night-400 uppercase tracking-wider mb-2">Block Hash</div>
                <div className="font-mono text-sm break-all text-white bg-night-950 p-4 rounded-lg border border-white/5 group-hover:border-sole-500/30 transition-colors">
                  {block.hash}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <div className="text-xs font-medium text-night-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                     <Clock size={14}/> Timestamp
                   </div>
                   <div className="text-white text-lg">{formatTime(block.timestamp)}</div>
                </div>
                <div>
                   <div className="text-xs font-medium text-night-400 uppercase tracking-wider mb-2">Transactions</div>
                   <div className="text-white text-lg">{block.transactions?.length || 0}</div>
                </div>
              </div>

              <div className="group">
                 <div className="text-xs font-medium text-night-400 uppercase tracking-wider mb-2">Previous Hash</div>
                 <div className="font-mono text-sm break-all">
                   {block.prev_block_hash ? (
                     <Link to={`/block/${block.prev_block_hash}`} className="text-sole-400 hover:text-sole-300 hover:underline transition">
                       {block.prev_block_hash}
                     </Link>
                   ) : <span className="text-night-500 italic">Genesis Block</span>}
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-xl">
            <div className="px-6 py-5 border-b border-white/5">
              <h3 className="font-semibold text-white">Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/[0.02] text-night-400 uppercase text-xs border-b border-white/5">
                  <tr>
                    <th className="px-6 py-3 font-medium">TXID</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium text-right">Total Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {block.transactions && block.transactions.length > 0 ? (
                    block.transactions.map((tx) => {
                      const isCoinbase = tx.inputs && tx.inputs.length > 0 && tx.inputs[0].sender_address === "COINBASE";
                      const totalValue = tx.outputs.reduce((acc, out) => acc + (out.value_sole || 0), 0);

                      return (
                        <tr key={tx.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => handleTxClick(tx.id, tx)}>
                          <td className="px-6 py-4 font-mono text-sole-400 hover:text-sole-300">
                            {truncateHash(tx.id, 16, 16)}
                          </td>
                          <td className="px-6 py-4">
                             {isCoinbase ? (
                               <span className="bg-sole-500/10 text-sole-400 border border-sole-500/20 text-xs px-2.5 py-1 rounded-full font-medium">Coinbase</span>
                             ) : (
                               <span className="bg-night-800 text-night-300 border border-white/10 text-xs px-2.5 py-1 rounded-full">Standard</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-white">
                            {formatSole(totalValue)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                       <td colSpan={3} className="px-6 py-8 text-center text-night-500 italic">No transactions in this block.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-night-900 to-night-950 p-6 rounded-2xl border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="text-emerald-500" size={24} />
                 <h3 className="font-semibold text-white">Validator</h3>
              </div>
              <div className="p-3 bg-night-950 rounded-lg border border-white/5 mb-4">
                 <AddressBadge address={block.validator} truncate={false} className="text-[11px] leading-relaxed break-all" />
              </div>
              <p className="text-xs text-night-500">The validator responsible for proposing and signing this block.</p>
           </div>
           
           <div className="bg-night-900/50 p-6 rounded-2xl border border-white/5">
              <h4 className="text-xs font-medium text-night-400 uppercase tracking-wider mb-3">Technical Details</h4>
              <ul className="space-y-3 text-sm">
                 <li className="flex justify-between">
                    <span className="text-night-500">Nonce</span>
                    <span className="text-night-300 font-mono">0</span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-night-500">Difficulty</span>
                    <span className="text-night-300">1</span>
                 </li>
                 <li className="flex justify-between">
                    <span className="text-night-500">Version</span>
                    <span className="text-night-300">1.0</span>
                 </li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetail;