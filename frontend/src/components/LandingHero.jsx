import React from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export default function LandingHero({
  currentUser,
  onOpenAuth,
  onNavigateToVoterPortal,
  votedCheckLoading,
  hasAlreadyVoted,
  liveStats
}) {
  return (
    <section id="landing-hero-section" className="bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-xl shadow-md text-white overflow-hidden border border-gray-800 relative">
      <div className="absolute top-0 right-0 p-2 opacity-5 font-black text-4xl sm:text-5xl tracking-tighter select-none pointer-events-none font-sans">ECI</div>
      <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-4">
          <div className="space-y-1 max-w-3xl text-left">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="bg-saffron-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                ECI Digital Registry
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-gray-400 font-mono">Live Sync Engine v3.2</span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl font-black font-display tracking-tight text-white leading-tight">
              Election Commission of India National Lander
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-300 leading-snug font-semibold line-clamp-2 sm:line-clamp-none">
              Welcome to the sovereign, identity-authenticated central monitoring node displaying live national turnouts, margin scoreboards, and audited candidate disclosures.
            </p>
          </div>

          {/* COMPACT MOBILE-FRIENDLY LIVE STATS BAR */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-2 sm:p-2.5 w-full lg:w-auto min-w-0 sm:min-w-[220px] text-[10px] sm:text-[11px] text-left shrink-0">
            <span className="text-[8px] font-black text-saffron-400 uppercase tracking-widest block border-b border-white/10 pb-0.5 mb-1 sm:mb-0">
              Sovereign Cloud Health
            </span>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 sm:gap-1 font-semibold items-center text-[9.5px] sm:text-[11px]">
              <div className="flex flex-col lg:flex-row justify-between">
                <span className="text-gray-400 text-[8.5px] sm:text-[10px] lg:text-[11px]">Core:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  ONLINE
                </span>
              </div>
              <div className="flex flex-col lg:flex-row justify-between">
                <span className="text-gray-400 text-[8.5px] sm:text-[10px] lg:text-[11px]">Ballots:</span>
                <span className="text-white font-mono font-bold">{liveStats.votesCast.toLocaleString()}</span>
              </div>
              <div className="flex flex-col lg:flex-row justify-between">
                <span className="text-gray-400 text-[8.5px] sm:text-[10px] lg:text-[11px]">Turnout:</span>
                <span className="text-saffron-300 font-mono font-bold">{liveStats.turnoutPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC VOTE ENFORCEMENT & BUTTON */}
        <div className="bg-slate-900/80 border border-slate-800 p-2.5 sm:p-3 rounded-lg max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 shadow-md text-left">
          <div className="space-y-0.5 text-center sm:text-left flex-1 min-w-0">
            <h3 className="text-[10px] sm:text-[11px] font-black text-white font-display flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-3.5 h-3.5 text-saffron-500 shrink-0" />
              <span className="truncate">Constitutional Security Protocol</span>
            </h3>
            <p className="text-[9.5px] sm:text-[10px] text-gray-400 leading-tight max-w-md hidden xs:block sm:block">
              Every Indian citizen is protected under Article 326. Regional servers dynamically enforce single-vote integrity.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {votedCheckLoading ? (
              <div className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-[9.5px] sm:text-[10px] font-bold flex items-center gap-1 justify-center">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Checking credentials...
              </div>
            ) : !currentUser ? (
              <button
                id="landing-login-btn"
                onClick={onOpenAuth}
                className="w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-saffron-50 hover:bg-saffron-600 active:scale-[0.98] text-white font-extrabold uppercase tracking-wider rounded-lg text-[9px] sm:text-[9.5px] transition shadow-md shadow-saffron-500/20 cursor-pointer flex items-center justify-center gap-1"
                style={{ backgroundColor: '#f97316' }}
              >
                🔐 Login & Vote
              </button>
            ) : hasAlreadyVoted ? (
              <div className="px-3 py-1.5 sm:py-2 bg-emerald-950/70 border border-emerald-800/80 rounded-lg text-[9px] sm:text-[9.5px] font-black text-emerald-400 text-center flex items-center gap-1 justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>🗳️ BALLOT RECORDED (1/1)</span>
              </div>
            ) : (
              <button
                id="landing-vote-now-btn"
                onClick={onNavigateToVoterPortal}
                className="w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-black uppercase tracking-wider rounded-lg text-[9px] sm:text-[9.5px] transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1 animate-pulse"
              >
                🗳️ PRESS TO CAST BALLOT NOW
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
