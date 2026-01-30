import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-night-950">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-sole-900/10 via-night-900/50 to-night-950 pointer-events-none z-0" />
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-sole-600/10 rounded-full blur-3xl pointer-events-none z-0" />
      
      <Navbar />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10 relative">
        {children}
      </main>
      
      <footer className="border-t border-white/5 py-8 mt-8 bg-night-950 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-night-400 text-sm">© 2026 Università del Salento</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-night-600">
            <span className="w-1.5 h-1.5 rounded-full bg-sole-500"></span>
            <span>SOLE Blockchain Explorer • v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;