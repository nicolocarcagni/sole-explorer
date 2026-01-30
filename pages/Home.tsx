import React, { useEffect, useState } from 'react';
import { getLastBlocks, getTip, getPeers, getValidators } from '../services/api';
import { ApiBlock, TipResponse } from '../types';
import BlockList from '../components/BlockList';
import Modal from '../components/Modal';
import { Activity, HardDrive, Server, ShieldCheck, Copy, CheckCircle2, Network, Globe } from 'lucide-react';
import { API_BASE_URL } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const [blocks, setBlocks] = useState<ApiBlock[]>([]);
  const [tip, setTip] = useState<TipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [peersModalOpen, setPeersModalOpen] = useState(false);
  const [validatorsModalOpen, setValidatorsModalOpen] = useState(false);
  
  // Modal Data
  const [peers, setPeers] = useState<string[]>([]);
  const [validators, setValidators] = useState<string[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [copiedValidator, setCopiedValidator] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel fetch for Tip and Recent Blocks list
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
    // Poll every 10 seconds
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Network Dashboard</h1>
        <p className="text-night-400">Real-time explorer for the SOLE blockchain.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Block Height (Non-interactive) */}
        <div className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-sole-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-night-800 rounded-xl text-sole-500 border border-white/5 shadow-inner">
              <Server size={24} />
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-sole-400 uppercase tracking-wider mb-1">Current Height</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {tip?.height?.toLocaleString() ?? '-'}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Network Status (Interactive) */}
        <button 
          onClick={handleOpenPeers}
          className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-emerald-500/40 hover:bg-white/[0.02] transition-all duration-300 text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div className="flex justify-between relative z-10 w-full">
            {/* Left Column: Icon + Label */}
            <div className="flex flex-col items-start gap-3">
              <div className="p-3 bg-night-800 rounded-xl text-emerald-500 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <Activity size={24} />
              </div>
              <div className="text-[10px] text-emerald-500/70 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Peers
              </div>
            </div>

            {/* Right Column: Data */}
            <div className="text-right">
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Network Status</p>
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center justify-end gap-2">
                {error ? (
                  <span className="text-red-500">Offline</span>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Operational
                  </>
                )}
              </h3>
            </div>
          </div>
        </button>

        {/* Card 3: Consensus (Interactive) */}
        <button 
          onClick={handleOpenValidators}
          className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-purple-500/40 hover:bg-white/[0.02] transition-all duration-300 text-left w-full cursor-pointer"
        >
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          
          <div className="flex justify-between relative z-10 w-full">
            {/* Left Column: Icon + Label */}
            <div className="flex flex-col items-start gap-3">
              <div className="p-3 bg-night-800 rounded-xl text-purple-500 border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <HardDrive size={24} />
              </div>
              <div className="text-[10px] text-purple-500/70 font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                View Validators
              </div>
            </div>

            {/* Right Column: Data */}
            <div className="text-right">
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">Consensus</p>
              <h3 className="text-xl font-bold text-white tracking-tight">Proof of Authority</h3>
            </div>
          </div>
        </button>
      </div>

      {error && (
         <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-xl flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-full">
              <Activity size={16} className="text-red-500" />
            </div>
            <p className="text-sm text-red-300">{error}</p>
         </div>
      )}

      {/* Blocks Table */}
      <BlockList blocks={blocks} loading={loading} />

      {/* ---------------- MODALS ---------------- */}

      {/* Peers Modal */}
      <Modal 
        isOpen={peersModalOpen} 
        onClose={() => setPeersModalOpen(false)} 
        title="Public Nodes"
      >
        {loadingModal ? (
          <div className="py-12"><LoadingSpinner /></div>
        ) : peers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-night-400 text-center">
            <Network size={48} className="mb-4 opacity-20" />
            <p>No peers connected currently.</p>
          </div>
        ) : (
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-4 px-2">
                <Globe size={16} className="text-emerald-500"/>
                <span className="text-sm text-night-300">Total Peers: <strong className="text-white">{peers.length}</strong></span>
             </div>
             {peers.map((peer, idx) => (
               <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-night-950/50 border border-white/5 hover:border-emerald-500/30 transition-colors group">
                 <div className="p-2 bg-night-900 rounded-lg text-emerald-500/50 group-hover:text-emerald-500 transition-colors">
                   <Server size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-mono text-night-200 truncate">{peer}</p>
                 </div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
               </div>
             ))}
          </div>
        )}
      </Modal>

      {/* Validators Modal */}
      <Modal 
        isOpen={validatorsModalOpen} 
        onClose={() => setValidatorsModalOpen(false)} 
        title="Authority Set"
      >
        {loadingModal ? (
           <div className="py-12"><LoadingSpinner /></div>
        ) : validators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-night-400 text-center">
            <ShieldCheck size={48} className="mb-4 opacity-20" />
            <p>No active validators found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-xs text-night-500 uppercase tracking-wider mb-2 px-1">Active Validators ({validators.length})</div>
            {validators.map((val, idx) => (
              <div 
                key={idx} 
                className="group relative flex items-center justify-between p-4 rounded-xl bg-night-950/50 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer"
                onClick={() => handleCopy(val)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="p-2 bg-night-900 rounded-lg text-purple-500/50 group-hover:text-purple-500 transition-colors">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-night-200 truncate pr-4">{val}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                       <span className="text-[10px] text-green-500 font-medium uppercase tracking-wide">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-night-500 group-hover:text-white transition-colors pl-2">
                   {copiedValidator === val ? <CheckCircle2 size={18} className="text-emerald-500"/> : <Copy size={18} />}
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