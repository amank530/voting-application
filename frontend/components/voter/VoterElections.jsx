import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar, Clock, Landmark, MapPin, Search, Filter } from 'lucide-react';

export default function VoterElections({ currentUser }) {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const list = await api.elections.list();
      setElections(list || []);
    } catch (e) {
      console.error('Error fetching voter elections:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredElections = elections.filter(elec => {
    const matchesSearch = elec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (elec.state && elec.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (elec.constituency && elec.constituency.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'ALL' || elec.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search elections, states, seats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:outline-none"
          >
            <option value="ALL">All Levels</option>
            <option value="Lok Sabha">Lok Sabha (National)</option>
            <option value="Vidhan Sabha">Vidhan Sabha (State)</option>
            <option value="Nagar Panchayat">Nagar Panchayat (Local)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 italic">
          Loading synchronized electoral schedule...
        </div>
      ) : filteredElections.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-400 italic bg-white rounded-2xl border">
          No matching scheduled elections found for your selection.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredElections.map((elec) => (
            <div key={elec.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              
              {/* Header */}
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    elec.level === 'Lok Sabha' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                    elec.level === 'Vidhan Sabha' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {elec.level}
                  </span>

                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                    elec.status === 'VOTING_OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse' :
                    elec.status === 'REGISTRATION_OPEN' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}>
                    ● {elec.status?.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-sm font-black text-gray-950 font-display leading-tight">{elec.title}</h4>
              </div>

              {/* Geographic Scope */}
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl text-[11px] text-gray-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>State: <strong>{elec.state || 'All States'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-gray-400" />
                  <span>Seat: <strong>{elec.constituency || 'All Constituencies'}</strong></span>
                </div>
              </div>

              {/* Milestones Schedule */}
              <div className="space-y-2 border-t border-gray-100 pt-3 text-[11px]">
                <div className="flex justify-between text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-saffron-500" />
                    Voting Date:
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {elec.votingDate ? new Date(elec.votingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'October 15, 2026'}
                  </span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    Counting Date:
                  </span>
                  <span className="font-mono font-bold text-gray-900">
                    {elec.countingDate ? new Date(elec.countingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'October 18, 2026'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
