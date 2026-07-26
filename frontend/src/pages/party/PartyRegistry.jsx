import React, { useState } from 'react';
import { Search, ShieldCheck, Landmark, Eye, PlusCircle, Lock, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

export default function PartyRegistry({ 
  parties = [], 
  loading = false, 
  searchTerm = '', 
  setSearchTerm, 
  onNavigateToLogin, 
  onNavigateToRegister,
  onSelectParty
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredParties = parties.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (p.abbrev || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Banner & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Electoral Party Registry</h3>
              <p className="text-[10px] text-gray-400 font-medium">Search ECI approved & registered political parties</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Packed Status Filter Menu Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {statusFilter === 'ALL' ? `All (${parties.length})` : statusFilter === 'PENDING' ? `Pending (${parties.filter(p => p.status === 'PENDING').length})` : `Approved (${parties.filter(p => p.status === 'APPROVED').length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              {showFilterMenu && (
                <div className="absolute left-0 md:left-auto md:right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                  <div className="px-3 py-1 border-b border-gray-100 font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">
                    Filter Parties
                  </div>
                  <button
                    onClick={() => { setStatusFilter('ALL'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-gray-50 transition cursor-pointer ${statusFilter === 'ALL' ? 'text-purple-600 bg-purple-50/60' : 'text-gray-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      All
                    </span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-mono">{parties.length}</span>
                  </button>

                  <button
                    onClick={() => { setStatusFilter('APPROVED'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-purple-50/50 transition cursor-pointer ${statusFilter === 'APPROVED' ? 'text-purple-700 bg-purple-50' : 'text-gray-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      Approved
                    </span>
                    <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded-full text-purple-800 font-mono">{parties.filter(p => p.status === 'APPROVED').length}</span>
                  </button>

                  <button
                    onClick={() => { setStatusFilter('PENDING'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-amber-50/50 transition cursor-pointer ${statusFilter === 'PENDING' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Pending
                    </span>
                    <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800 font-mono">{parties.filter(p => p.status === 'PENDING').length}</span>
                  </button>
                </div>
              )}
            </div>

            <input 
              type="text" 
              placeholder="Search party name or abbreviation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
              className="w-full md:w-56 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-100 flex items-start justify-between gap-3 shadow-3xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-purple-700 mt-0.5 shrink-0" />
            <div className="text-[11px] text-purple-950 space-y-1">
              <span className="font-extrabold uppercase block tracking-wider text-xs">Section 29A RPA Registry</span>
              <p className="leading-relaxed text-[10px]">
                Political parties registered with the Election Commission of India can access their High Command secretariat panel or apply for new authorization.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            {onNavigateToLogin && (
              <button
                onClick={onNavigateToLogin}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1"
              >
                <Lock className="w-3 h-3" /> Party Login
              </button>
            )}
            {onNavigateToRegister && (
              <button
                onClick={onNavigateToRegister}
                className="px-3 py-1 bg-white hover:bg-purple-100 text-purple-800 font-bold text-[10px] rounded-lg border border-purple-200 transition cursor-pointer flex items-center gap-1"
              >
                <PlusCircle className="w-3 h-3" /> Register Party
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Parties Grid */}
      {loading ? (
        <div className="bg-white py-16 text-center rounded-2xl border border-gray-200 text-gray-400 text-xs font-medium">
          Loading authorized party portfolios from ECI records...
        </div>
      ) : filteredParties.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl border border-gray-200 text-gray-400 text-xs italic">
          No registered political parties found matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParties.map((party) => {
            const symbolStr = party.symbol || '🗳️';
            const displaySymbol = symbolStr.includes(' ') ? symbolStr.split(' ')[1] : symbolStr;
            return (
              <div 
                key={party.id} 
                className="bg-white rounded-2xl border border-gray-200 shadow-3xs p-5 flex flex-col justify-between hover:border-purple-300 hover:shadow-md transition duration-200"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 text-2xl flex items-center justify-center font-bold shadow-2xs shrink-0">
                        {displaySymbol}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-gray-950 text-sm font-display leading-tight">{party.name}</h4>
                        <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider block mt-0.5">
                          {party.abbrev} Secretariat
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border tracking-wider ${
                      party.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {party.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 border-t border-gray-100 pt-3 text-xs">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">President:</span>
                      <span className="font-bold text-gray-800">{party.presidentName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Category:</span>
                      <span className="font-bold text-gray-800">{party.category || 'Recognized Party'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-400">Registration Code:</span>
                      <span className="font-mono text-gray-700 font-semibold">{party.registrationNumber || party.id}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] text-gray-600 italic leading-relaxed">
                    "{party.manifesto || party.agenda || 'Promoting democratic governance, socio-economic welfare, and political accountability.'}"
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-400">ECI ID: {party.id}</span>
                  {onSelectParty && (
                    <button
                      onClick={() => onSelectParty(party)}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] rounded-lg border border-purple-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> Inspect Portfolio
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
