import React from 'react';
import { Sun } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-sole-500">
      <div className="relative">
        <Sun size={48} className="animate-spin-slow text-sole-400" />
        <div className="absolute inset-0 bg-sole-400 blur-xl opacity-20 rounded-full"></div>
      </div>
      <span className="mt-4 text-xs font-medium tracking-[0.2em] text-sole-500/70 uppercase">Syncing with SOLE</span>
    </div>
  );
};

export default LoadingSpinner;