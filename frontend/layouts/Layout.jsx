import React from 'react';
import { Landmark, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

export default function Layout({ children, currentUser, onOpenAuth, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl shadow-md shadow-primary-600/10 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-gray-900 tracking-tight uppercase">ECI Digital Core</span>
                <span className="bg-saffron-500 text-white text-[9px] font-bold px-1 py-0.5 rounded uppercase tracking-wider">Secure</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono block tracking-normal">Election Commission of India Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100/80 p-1.5 pr-3 rounded-xl border border-gray-100 transition">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 font-bold text-xs rounded-lg flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0) : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-bold text-gray-800 block leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] font-bold font-mono text-primary-600 uppercase tracking-wider">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  title="Logout Securely"
                  className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-lg transition cursor-pointer ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-primary-600/10"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Portal Auth Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main viewport */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Election Commission of India. Strictly for constitutional election monitoring.</p>
          <div className="flex items-center gap-4 text-[10px]">
            <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 hover:underline">Official ECI</a>
            <span>•</span>
            <span className="text-emerald-500 font-bold">● Active Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
