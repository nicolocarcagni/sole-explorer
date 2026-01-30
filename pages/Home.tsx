import React, { useEffect, useState } from 'react';
import { getLastBlocks, getTip } from '../services/api';
import { ApiBlock, TipResponse } from '../types';
import BlockList from '../components/BlockList';
import { Activity, HardDrive, Server } from 'lucide-react';
import { API_BASE_URL } from '../constants';

const Home: React.FC = () => {
  const [blocks, setBlocks] = useState<ApiBlock[]>([]);
  const [tip, setTip] = useState<TipResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Network Dashboard</h1>
        <p className="text-night-400">Real-time explorer for the SOLE blockchain.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-sole-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-sole-500/10 rounded-full blur-2xl group-hover:bg-sole-500/20 transition-all"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-night-800 rounded-xl text-sole-500 border border-white/5 shadow-inner">
              <Server size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-sole-400 uppercase tracking-wider mb-1">Current Height</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {tip?.height?.toLocaleString() ?? '-'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-night-800 rounded-xl text-emerald-500 border border-white/5 shadow-inner">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">Network Status</p>
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {error ? (
                  <span className="text-red-500">Offline</span>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Operational
                  </>
                )}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-night-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5 relative overflow-hidden group hover:border-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-night-800 rounded-xl text-purple-500 border border-white/5 shadow-inner">
              <HardDrive size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider mb-1">Consensus</p>
              <h3 className="text-xl font-bold text-white tracking-tight">Proof of Authority</h3>
            </div>
          </div>
        </div>
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
    </div>
  );
};

export default Home;