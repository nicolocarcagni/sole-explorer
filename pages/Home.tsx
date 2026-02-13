import React, { useEffect, useState } from 'react';
import { getLastBlocks, getTip, getPeers, getValidators } from '../services/api';
import { ApiBlock, TipResponse } from '../types';
import BlockList from '../components/BlockList';
import Modal from '../components/Modal';
import { Activity, HardDrive, Server, ShieldCheck, Copy, CheckCircle2, Network, Globe, Maximize2, Cpu } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const [blocks, setBlocks] = useState<ApiBlock[]>([]);
  const [tip, setTip] = useState<TipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [peersModalOpen, setPeersModalOpen] = useState(false);
  const [validatorsModalOpen, setValidatorsModalOpen] = useState(false);
  
  const [peers, setPeers] = useState<string[]>([]);
  const [validators, setValidators] = useState<string[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [copiedValidator, setCopiedValidator] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tipData, blocksData] = await Promise.all([
          getTip(),
          getLastBlocks(10)
        ]);
        setTip(tipData);
        setBlocks(blocksData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(`Failed to connect to SOLE node at ${API_BASE_URL}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenPeers = async () => {
    setPeersModalOpen(true);
    setLoadingModal(true);
    try {
      const data = await getPeers();
      setPeers(data.peers || []);
    } catch (e) {
      console.error(e);
      setPeers([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleOpenValidators = async () => {
    setValidatorsModalOpen(true);
    setLoadingModal(true);
    try {
      const data = await getValidators();
      setValidators(data.validators || []);
    } catch (e) {
      console.error(e);
      setValidators([]);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedValidator(val);
    setTimeout(() => setCopiedValidator(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Network Dashboard Header Removed */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Block Height */}
        <div className="bg-night-900/50 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-sole-500/10 rounded-full blur-2xl group-hover:bg-sole-500/20 transition-all duration-500"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3.5 bg-night-800 rounded-2xl text-sole-500 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Cpu size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-sole-500/60 uppercase tracking-[0.2em] mb-1">Chain Height</p>
              <h3 className="text-3xl font-black text-white tracking-tighter">
                {tip?.height?.toLocaleString() ?? '-'}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Network Status */}
        <button 
          onClick={handleOpenPeers}
          className="bg-night-900/50 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-emerald-500/40 hover:bg-white/[0.02] hover:scale-[1.02] transition-all duration-500 text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
          <div className="absolute top-4 right-4 text-emerald-500/0 group-hover:text-emerald-500/40 transition-all duration-300">
             <Maximize2 size={16} />
          </div>
          
          <div className="flex justify-between relative z-10 w-full">
            <div className="flex flex-col items-start gap-4">
              <div className="p-3.5 bg-night-800 rounded-2xl text-emerald-500 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Activity size={24} />
              </div>
              <div className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                View Peers
              </div>
            </div>

            <div className="text-right flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-[0.2em] mb-1">Status</p>
                <h3 className="text-2xl font-black text-white tracking-tighter flex items-center justify-end gap-2">
                  {error ? (
                    <span className="text-red-500">Offline</span>
                  ) : (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></span>
                      Active
                    </>
                  )}
                </h3>
              </div>
            </div>
          </div>
        </button>

        {/* Card 3: Consensus */}
        <button 
          onClick={handleOpenValidators}
          className="bg-night-900/50 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-purple-500/40 hover:bg-white/[0.02] hover:scale-[1.02] transition-all duration-500 text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>
          <div className="absolute top-4 right-4 text-purple-500/0 group-hover:text-purple-500/40 transition-all duration-300">
             <Maximize2 size={16} />
          </div>
          
          <div className="flex justify-between relative z-10 w-full">
            <div className="flex flex-col items-start gap-4">
              <div className="p-3.5 bg-night-800 rounded-2xl text-purple-500 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck size={24} />
              </div>
              <div className="text-[10px] text-purple-500 font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-lg bg-purple-500/5 border border-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                Validators
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-purple-500/60 uppercase tracking-[0.2em] mb-1">Consensus</p>
              <h3 className="text-xl font-black text-white tracking-tighter">Proof of Authority</h3>
            </div>
          </div>
        </button>
      </div>

      {error && (
         <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="bg-red-500/20 p-2.5 rounded-full">
              <Activity size={18} className="text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-300">{error}</p>
         </div>
      )}

      <BlockList blocks={blocks} loading={loading} />

      {/* Peers Modal */}
      <Modal 
        isOpen={peersModalOpen} 
        onClose={() => setPeersModalOpen(false)} 
        title="Network Peers"
      >
        {loadingModal ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : peers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-night-400 text-center">
            <Network size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No peers connected</p>
            <p className="text-sm text-night-500 mt-1">The node is operating in isolation.</p>
          </div>
        ) : (
          <div className="space-y-2">
             <div className="flex items-center justify-between mb-4 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-emerald-500"/>
                  <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Active Discovery</span>
                </div>
                <span className="text-xs font-mono text-emerald-500">{peers.length} Nodes</span>
             </div>
             {peers.map((peer, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group">
                 <div className="p-2.5 bg-night-950 rounded-xl text-night-400 group-hover:text-emerald-500 transition-colors border border-white/5">
                   <Server size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-mono text-night-200 truncate group-hover:text-white transition-colors">{peer}</p>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:animate-ping"></div>
               </div>
             ))}
          </div>
        )}
      </Modal>

      {/* Validators Modal */}
      <Modal 
        isOpen={validatorsModalOpen} 
        onClose={() => setValidatorsModalOpen(false)} 
        title="Active Authority"
      >
        {loadingModal ? (
           <div className="py-12"><LoadingSpinner /></div>
        ) : validators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-night-400 text-center">
            <ShieldCheck size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No validators found</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4 px-3 py-2 bg-purple-500/5 border border-purple-500/20 rounded-xl">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={16} className="text-purple-500"/>
                 <span className="text-xs font-bold text-purple-200 uppercase tracking-widest">Authority Set</span>
               </div>
               <span className="text-xs font-mono text-purple-500">{validators.length} Validators</span>
            </div>
            {validators.map((val, idx) => (
              <div 
                key={idx} 
                className="group relative flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => handleCopy(val)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="p-2.5 bg-night-950 rounded-xl text-night-400 group-hover:text-purple-500 transition-colors border border-white/5">
                    <HardDrive size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-night-200 truncate pr-4 group-hover:text-white transition-colors">{val}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)]"></span>
                       <span className="text-[9px] text-emerald-500/80 font-black uppercase tracking-widest">Authorized</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-night-500 group-hover:text-purple-400 transition-all duration-300 pl-2">
                   {copiedValidator === val ? <CheckCircle2 size={18} className="text-emerald-500 animate-in zoom-in"/> : <Copy size={18} className="group-hover:scale-110 active:scale-90" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Home;