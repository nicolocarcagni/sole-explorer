import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-modal="true" role="dialog">
      {/* Backdrop with intense blur */}
      <div 
        className="absolute inset-0 bg-night-950/60 backdrop-blur-xl transition-opacity duration-500 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Container with Glass effect */}
      <div className="relative w-full max-w-lg bg-night-900/90 border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all duration-500 animate-in zoom-in-95 scale-100 flex flex-col max-h-[85vh] backdrop-blur-2xl">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-3xl ring-1 ring-inset ring-white/5"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.03]">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 bg-sole-500 rounded-full animate-pulse"></span>
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-night-400 hover:text-white transition-all duration-200 active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar scroll-smooth">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;