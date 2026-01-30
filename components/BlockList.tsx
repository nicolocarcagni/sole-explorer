import React from 'react';
import { Link } from 'react-router-dom';
import { ApiBlock } from '../types';
import { formatTime, truncateHash } from '../utils/format';
import { Box, Layers } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface BlockListProps {
  blocks: ApiBlock[];
  loading: boolean;
}

const BlockList: React.FC<BlockListProps> = ({ blocks, loading }) => {
  if (loading) {
    return (
      <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-12 text-center">
        <div className="w-16 h-16 bg-night-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
          <Layers size={32} className="text-night-500" />
        </div>
        <h3 className="text-lg font-medium text-white">No Blocks Found</h3>
        <p className="text-night-400 mt-2">The chain appears to be empty or unreachable.</p>
      </div>
    );
  }

  return (
    <div className="bg-night-900/50 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Box className="text-sole-500" size={20} />
          Latest Blocks
        </h2>
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sole-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sole-500"></span>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-night-400 uppercase bg-white/[0.02] border-b border-white/5">
            <tr>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Height</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Hash</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider">Time</th>
              <th scope="col" className="px-6 py-4 font-medium tracking-wider text-right">Txs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blocks.map((block) => (
              <tr key={block.hash} className="group hover:bg-white/[0.03] transition-colors duration-200">
                <td className="px-6 py-4 font-bold text-sole-500">
                  <Link to={`/block/${block.hash}`} className="hover:text-sole-400 transition-colors">
                    #{block.height?.toLocaleString() ?? 'N/A'}
                  </Link>
                </td>
                <td className="px-6 py-4 font-mono text-night-300">
                  <div className="flex items-center gap-2 group/hash">
                    <Link to={`/block/${block.hash}`} className="hover:text-white transition-colors relative" title={block.hash}>
                      {truncateHash(block.hash, 8, 8)}
                    </Link>
                  </div>
                </td>
                <td className="px-6 py-4 text-night-400">
                  {formatTime(block.timestamp)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-night-800 text-night-300 border border-white/5 group-hover:border-sole-500/30 group-hover:text-sole-400 transition-all">
                    {block.transactions?.length || 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BlockList;