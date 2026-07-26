import React, { useState } from 'react';
import { Users, Sparkles, Filter, MapPin, Calendar, Search } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { ELECTION_LEVELS } from '../services/constants';
import ElectionHierarchyEngine from './ElectionHierarchyEngine';

export default function CandidateStandingsGraph({
  hierarchyFilters,
  setHierarchyFilters,
  filterLevel,
  setFilterLevel,
  filterState,
  setFilterState,
  filterElectionId,
  setFilterElectionId,
  elections,
  uniqueStates,
  leadingCandidate,
  graphCandidates
}) {
  const [showRegionPopup, setShowRegionPopup] = useState(false);
  const [tempHierarchyFilters, setTempHierarchyFilters] = useState(hierarchyFilters);

  return (
    <section id="candidate-standings-section" className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6 text-left relative">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-saffron-600" />
          <div>
            <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider">Live Nominee Standing & Winning Status</h2>
            <p className="text-[11px] text-gray-400">Audited live votes count matching your selected regional filters.</p>
          </div>
        </div>

        <div className="text-xs font-black text-saffron-700 bg-saffron-50 px-3 py-1 rounded border border-saffron-200 flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>ECI Official Count Server</span>
        </div>
      </div>

      {/* CONTROLS FILTERS */}
      <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-150 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          
          {/* Election Filter with Search button beside it */}
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-gray-400" /> Filter Election Level
              </label>
              <select
                value={hierarchyFilters.level}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterLevel(val);
                  setFilterElectionId('all');
                  const resetFilters = {
                    level: val,
                    state: '',
                    district: '',
                    constituency: '',
                    city: '',
                    town: '',
                    municipalCorporation: '',
                    municipalCouncil: '',
                    nagarPanchayat: '',
                    block: '',
                    gramPanchayat: '',
                    wardNo: '',
                    position: ''
                  };
                  setHierarchyFilters(resetFilters);
                  setTempHierarchyFilters(resetFilters);
                }}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-gray-800 h-[38px]"
              >
                <option value="all">All Election Levels</option>
                {ELECTION_LEVELS.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                if (hierarchyFilters.level === 'all') {
                  alert("Please select an election level first, then search region filters.");
                  return;
                }
                setTempHierarchyFilters({ ...hierarchyFilters });
                setShowRegionPopup(true);
              }}
              className="px-5 py-2 bg-red-800 hover:bg-red-950 text-white text-xs font-black rounded-lg shadow-sm transition duration-200 cursor-pointer h-[38px] flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>

        </div>
      </div>

      {/* Region Filters Pop-up Modal */}
      {showRegionPopup && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-250 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-saffron-600" />
                <h3 className="text-sm font-black text-gray-900 uppercase">Region Filters</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowRegionPopup(false)} 
                className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Please specify target geographical locations to look up registered candidate nominations for <strong className="text-gray-800 font-mono">{hierarchyFilters.level}</strong> level.
            </p>

            <div className="py-1">
              <ElectionHierarchyEngine
                level={hierarchyFilters.level}
                formValues={tempHierarchyFilters}
                onChange={(updated) => setTempHierarchyFilters(updated)}
                showBreadcrumbs={true}
              />
            </div>

            <div className="pt-4 border-t flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowRegionPopup(false)}
                className="px-4 py-2 border border-gray-200 text-gray-750 hover:bg-gray-50 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setHierarchyFilters(tempHierarchyFilters);
                  setShowRegionPopup(false);
                }}
                className="px-5 py-2 bg-saffron-600 hover:bg-saffron-700 text-white font-bold rounded-lg text-xs transition shadow-md shadow-saffron-600/15 cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS LEADING CORNER HIGHLIGHT CARD */}
      {leadingCandidate && (
        <div className="bg-gradient-to-r from-saffron-500/10 via-amber-500/5 to-white p-4.5 rounded-2xl border border-saffron-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-saffron-500 rounded-full animate-ping"></span>
              <span className="text-[9px] font-black uppercase tracking-wider text-saffron-800">Constituency Front-runner</span>
            </div>
            <h3 className="text-base font-black text-gray-950 font-display flex items-center gap-2">
              <span className="select-none">{leadingCandidate.symbol}</span>
              <span>{leadingCandidate.name}</span>
              <span className="text-xs font-normal text-gray-400 font-sans">({leadingCandidate.party})</span>
            </h3>
            <p className="text-[11px] text-gray-500">
              Currently leading in <strong>{leadingCandidate.constituency} ({leadingCandidate.state})</strong> seat target under <strong>{leadingCandidate.level}</strong>.
            </p>
          </div>

          <div className="bg-white border border-saffron-100 p-3 rounded-xl shadow-3xs text-center min-w-[150px] self-start md:self-auto">
            <span className="text-[9px] font-black text-gray-400 block uppercase">Audited Votes Count</span>
            <strong className="text-lg font-mono font-black text-emerald-700">{leadingCandidate.votes.toLocaleString()}</strong>
            <span className="text-[9px] text-gray-400 block leading-tight mt-0.5">Live Core Sync</span>
          </div>
        </div>
      )}

      {/* GRAPH VIEW */}
      <div className="space-y-4">
        {graphCandidates.length > 0 ? (
          <div className="space-y-6">
            
            {/* RECHARTS VISUALIZATION */}
            <div className="h-72 w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={graphCandidates.slice(0, 8)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#4b5563' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '11px', textAlign: 'left' }}
                    formatter={(value) => [`${value.toLocaleString()} Votes`, 'Audited Ballots']}
                    labelFormatter={(name) => `Nominee: ${name}`}
                  />
                  <Bar dataKey="votes" radius={[10, 10, 0, 0]}>
                    {graphCandidates.slice(0, 8).map((entry, index) => {
                      const pName = entry.party;
                      const barColor = pName.includes('Bharatiya') ? '#f97316' : 
                                       pName.includes('Congress') ? '#2563eb' : 
                                       pName.includes('Aam') ? '#059669' : '#3b82f6';
                      return <Cell key={`cell-${index}`} fill={barColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* DETAILED STATS LIST */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Nominee Standings Registry (Filtered)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {graphCandidates.map((cand, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between hover:border-gray-250 transition text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center font-black text-sm text-gray-700 border border-gray-150 shrink-0 select-none">
                        {cand.symbol}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-gray-950 truncate leading-snug flex items-center gap-1">
                          <span>{cand.name}</span>
                          {idx === 0 && <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-200">Leading</span>}
                        </h4>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide block truncate">{cand.party} • {cand.constituency}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs font-black text-gray-900 shrink-0 pl-2">
                      {cand.votes.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal font-sans">votes</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-gray-50/50 py-16 text-center rounded-2xl border border-dashed border-gray-200/80 space-y-3">
            <span className="text-2xl block select-none">🔍</span>
            <p className="text-xs font-black text-gray-500">No active candidate records match your current filters.</p>
            <p className="text-[10px] text-gray-400">Try changing the State Address or Election Level filters above.</p>
          </div>
        )}
      </div>

    </section>
  );
}
