import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Award, Landmark, MapPin, Search, BarChart3, TrendingUp } from 'lucide-react';

export default function VoterResults() {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResultsData();
  }, []);

  const fetchResultsData = async () => {
    try {
      setLoading(true);
      const [allElecs, allCands] = await Promise.all([
        api.elections.list(),
        api.candidates.list()
      ]);
      setElections(allElecs || []);
      setCandidates(allCands || []);
    } catch (e) {
      console.error('Error fetching results:', e);
    } finally {
      setLoading(false);
    }
  };

  const completedElections = elections.filter(e => 
    e.status === 'RESULTS_PUBLISHED' || e.status === 'COUNTING'
  );

  const filteredResults = completedElections.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.state && e.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections, states, constituencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 italic">
          Loading tabulated results registry...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-400 italic bg-white rounded-2xl border">
          No active counting or finalized results matching your criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredResults.map((elec) => {
            // Get candidates for this election
            const candList = candidates.filter(c => c.electionId === elec.id);
            // Sort by vote count (simulated)
            const sortedCandidates = [...candList].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
            const winner = sortedCandidates[0];
            const totalVotes = sortedCandidates.reduce((acc, c) => acc + (c.votesCount || 0), 0);

            return (
              <div key={elec.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3">
                  <div className="space-y-1">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                      elec.status === 'RESULTS_PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                    }`}>
                      {elec.status === 'RESULTS_PUBLISHED' ? 'FINAL DECLARATION' : 'LIVE COUNTING IN PROGRESS'}
                    </span>
                    <h4 className="text-sm font-black text-gray-950">{elec.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">Constituency Assembly: {elec.constituency || 'All constituencies'}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-400 block uppercase">Total Votes Cast</span>
                    <span className="font-mono font-black text-gray-950 text-sm">{totalVotes.toLocaleString()} Votes</span>
                  </div>
                </div>

                {/* Winner announcement if published */}
                {elec.status === 'RESULTS_PUBLISHED' && winner && (
                  <div className="bg-emerald-50/50 border border-emerald-100/70 p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl select-none">{winner.partySymbol || '👑'}</span>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block">Winner Nominee Declared</span>
                        <h5 className="font-extrabold text-emerald-950 text-sm leading-tight">{winner.name}</h5>
                        <p className="text-[10px] text-emerald-700 font-bold">{winner.partyName || 'Independent'}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-bold text-emerald-600 block uppercase">Winning Votes</span>
                      <span className="font-mono font-black text-emerald-950 text-sm">{winner.votesCount?.toLocaleString()}</span>
                      <p className="text-[9px] text-emerald-700 font-bold">Margin: +{Math.max(0, (winner.votesCount || 0) - (sortedCandidates[1]?.votesCount || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Vote distribution list */}
                <div className="space-y-3.5">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Candidate Vote Distribution Share</span>
                  
                  <div className="space-y-2.5">
                    {sortedCandidates.map((cand, idx) => {
                      const sharePct = totalVotes > 0 ? ((cand.votesCount || 0) / totalVotes * 100).toFixed(1) : '0.0';
                      return (
                        <div key={cand.id} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center text-gray-800 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-400">{idx + 1}.</span>
                              <span className="select-none">{cand.partySymbol || '👤'}</span>
                              <span className="font-bold text-gray-900">{cand.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold">({cand.partyName || 'IND'})</span>
                            </div>

                            <div className="flex items-center gap-3 font-mono">
                              <span className="text-gray-500 text-[11px]">{cand.votesCount?.toLocaleString()} votes</span>
                              <span className="font-black text-gray-900">{sharePct}%</span>
                            </div>
                          </div>

                          {/* Progress share bar */}
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                idx === 0 ? 'bg-primary-600' :
                                idx === 1 ? 'bg-amber-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${sharePct}%` }}
                            ></div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
