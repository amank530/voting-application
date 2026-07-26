import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function LiveTurnoutScoreboard({ leaderboardData }) {
  return (
    <section id="live-turnout-scoreboard" className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
      <div className="flex items-center gap-2 border-b pb-3.5 text-left">
        <TrendingUp className="w-5 h-5 text-emerald-600" />
        <div>
          <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider">National Live Turnout & Win Margin Scoreboard</h2>
          <p className="text-[11px] text-gray-400">Aggregated seat declarations and leads captured in real-time across all state spheres.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Seats breakdown (semi-circle bar) */}
        <div className="lg:col-span-5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-6 text-left">
          <div className="space-y-1 text-center lg:text-left">
            <span className="text-[9px] font-black text-gray-400 block uppercase font-mono">18th Lok Sabha Coalition Ledger</span>
            <h4 className="font-extrabold text-sm text-gray-950">Lok Sabha Consolidated Seat Shares</h4>
            <p className="text-[10px] text-gray-500 leading-normal">Simulated representation of 543 total parliamentary constituencies. Majority target is 272.</p>
          </div>

          <div className="flex flex-col items-center justify-center relative">
            {/* Semi-circular progressive bar */}
            <div className="w-full max-w-[260px] h-32 flex items-end justify-center relative overflow-hidden">
              <div className="w-full h-52 border-[18px] border-gray-200 rounded-full flex items-center justify-center absolute bottom-[-100px]">
                {/* Saffron and Blue arcs representation */}
                <div className="w-full h-full border-[18px] border-saffron-500 rounded-full absolute clip-half rotate-45 opacity-90"></div>
              </div>
              
              <div className="absolute bottom-0 text-center flex flex-col items-center">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">MAJORITY LEVEL</span>
                <span className="text-2xl font-black text-gray-950 font-mono">543 SEATS</span>
                <span className="text-[10px] bg-primary-900 text-white font-extrabold px-2 py-0.5 rounded-full mt-1.5" style={{ backgroundColor: '#1e3a8a' }}>
                  Target: 272 Wins
                </span>
              </div>
            </div>

            {/* Legends */}
            <div className="grid grid-cols-3 gap-2.5 w-full pt-4 text-center text-[10px] font-bold text-gray-600">
              <div className="p-2 bg-saffron-50 rounded-lg border border-saffron-100 text-saffron-900">
                <span className="block text-xs font-mono font-black" style={{ color: '#ea580c' }}>Saffron Coalition</span>
                <span>NDA Alliance</span>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                <span className="block text-xs font-mono font-black" style={{ color: '#2563eb' }}>Blue Alliance</span>
                <span>INDIA Alliance</span>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-800">
                <span className="block text-xs font-mono font-black">Others</span>
                <span>Independents</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seats scoreboard table */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
          <div className="grid grid-cols-4 gap-2 bg-gray-50 border-b border-gray-100 px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center select-none">
            <div className="text-left font-black">Political Alliance / Party</div>
            <div className="font-black">Confirmed Wins</div>
            <div className="font-black">Active Leads</div>
            <div className="text-right font-black">Total Seats</div>
          </div>

          <div className="divide-y divide-gray-150/70 flex-1 max-h-[250px] overflow-y-auto text-left">
            {leaderboardData.map((p, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 px-4 py-3 items-center text-center text-xs font-bold hover:bg-gray-50/50 transition">
                <div className="text-left font-black text-gray-900 truncate flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                  <span className="truncate">{p.fullName} ({p.name})</span>
                </div>
                <div className="text-emerald-700 font-mono text-sm font-black">{p.wins}</div>
                <div className="text-amber-600 font-mono text-sm font-black">{p.leads}</div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-lg font-mono font-black text-white text-xs shadow-3xs" style={{ backgroundColor: p.color }}>
                    {p.seats}
                  </span>
                </div>
              </div>
            ))}

            {leaderboardData.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold italic">
                No active seats reported. Simulated results trigger upon votes submission.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
