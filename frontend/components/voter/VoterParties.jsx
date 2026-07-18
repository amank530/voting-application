import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Landmark, Sparkles, Award, FileText, Search, Users } from 'lucide-react';

export default function VoterParties() {
  const [parties, setParties] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedParty, setSelectedParty] = useState(null);

  useEffect(() => {
    fetchPartiesAndCandidates();
  }, []);

  const fetchPartiesAndCandidates = async () => {
    try {
      setLoading(true);
      const [partyList, candidateList] = await Promise.all([
        api.parties.list(),
        api.candidates.list()
      ]);
      setParties(partyList || []);
      setCandidates(candidateList || []);
    } catch (e) {
      console.error('Error fetching parties:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.abbrev.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search registered political parties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 italic">
          Fetching registered party list and emblems...
        </div>
      ) : filteredParties.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-400 italic bg-white rounded-2xl border">
          No matching registered political parties found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xl select-none" title="Registered Emblem Symbol">{p.emblem || '🏛️'}</span>
                  <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {p.status || 'APPROVED'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-gray-950 text-sm leading-tight">{p.name} ({p.abbrev})</h4>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Est: {p.estYear || '2005'} • ECI Symbol: {p.emblem || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedParty(p)}
                  className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition"
                >
                  View Profile & Nominees
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedParty && (
        <div className="fixed inset-0 bg-primary-800/50 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 overflow-y-auto max-h-[85vh] border border-gray-100">
            
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl select-none">{selectedParty.emblem || '🏛️'}</span>
                <div>
                  <h3 className="font-black text-gray-950 text-base">{selectedParty.name}</h3>
                  <p className="text-[11px] font-bold text-primary-700">Abbreviation: {selectedParty.abbrev} • Est: {selectedParty.estYear || '1995'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedParty(null)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Party Profile */}
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Party Profile Summary</span>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 mt-1">
                  {selectedParty.profileText || 'Registered and audited national coalition committed to policy excellence, administrative accountability, civic engagement, and comprehensive local constituency development.'}
                </p>
              </div>

              {/* Manifesto */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Political Manifesto</span>
                <p className="text-gray-750 leading-relaxed bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 font-medium">
                  {selectedParty.manifestoText || 'Key pledges: 100% digital governance, rural healthcare centers, smart municipal grids, independent civic audits, and local educational scholarships.'}
                </p>
              </div>

              {/* Active Approved Candidates - Strictly Read-Only */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Finalized Candidates Nominees</span>
                
                {candidates.filter(c => (c.partyName === selectedParty.name || c.partyId === selectedParty.id) && c.status === 'APPROVED').length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No approved candidates registered for this party currently.</p>
                ) : (
                  <div className="divide-y divide-gray-100/60 max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/30">
                    {candidates.filter(c => (c.partyName === selectedParty.name || c.partyId === selectedParty.id) && c.status === 'APPROVED').map((c) => (
                      <div key={c.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-gray-50/80 transition">
                        <div className="font-bold text-gray-800">{c.name}</div>
                        <div className="text-primary-800 font-semibold text-[10px] bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
                          {c.constituency}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
