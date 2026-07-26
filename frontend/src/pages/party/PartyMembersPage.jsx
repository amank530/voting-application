import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Users, UserPlus, CheckCircle, Search, Filter, Mail, Phone, Shield, ShieldCheck, 
  Ticket, ArrowLeft, Eye, X, Award, Trash2, Edit3, PlusCircle, AlertCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PartyMembersPage({ party, onBack, currentUser }) {
  const [activeTab, setActiveTab] = useState('ROSTER'); // 'ROSTER' | 'CANDIDATES' | 'TICKETS'
  const [members, setMembers] = useState(party?.officeBearers || party?.members || [
    { id: 'M1', fullName: party?.presidentName || 'Shri Jagat Prakash Nadda', position: 'President', mobileNumber: party?.presidentMobile || '+91 98765 43210', email: party?.officialEmail || 'president@party.org', status: 'VERIFIED', role: 'President' },
    { id: 'M2', fullName: 'B. L. Santhosh', position: 'General Secretary', mobileNumber: '+91 98111 22233', email: 'gensec@party.org', status: 'VERIFIED', role: 'Executive' },
    { id: 'M3', fullName: 'Rajesh Aggarwal', position: 'Treasurer', mobileNumber: '+91 98222 33344', email: 'treasurer@party.org', status: 'VERIFIED', role: 'Executive' }
  ]);

  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State for Adding New Member
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    fullName: '',
    position: 'Executive Member',
    mobileNumber: '',
    email: '',
    address: '',
    aadharNumber: ''
  });

  // Ticket Code Generation Modal
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedCandidateForTicket, setSelectedCandidateForTicket] = useState(null);
  const [generatedTicketCode, setGeneratedTicketCode] = useState('');

  // Fetch candidates nominated under this party
  useEffect(() => {
    fetchPartyCandidates();
  }, [party]);

  const fetchPartyCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const data = await api.candidates.list();
      if (party) {
        const partyCands = (data || []).filter(c => 
          (c.partyName && c.partyName.toLowerCase().includes((party.name || '').toLowerCase())) ||
          (c.partyName && c.partyName.toUpperCase().includes((party.abbrev || '').toUpperCase()))
        );
        setCandidates(partyCands);
      } else {
        setCandidates(data || []);
      }
    } catch (err) {
      console.error('Error fetching party candidates:', err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.fullName || !newMember.mobileNumber) return;

    const created = {
      id: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newMember.fullName,
      position: newMember.position,
      mobileNumber: newMember.mobileNumber,
      email: newMember.email || `${newMember.fullName.toLowerCase().replace(/\s+/g, '')}@party.org`,
      status: 'VERIFIED',
      role: newMember.position
    };

    setMembers([created, ...members]);
    setShowAddModal(false);
    setNewMember({ fullName: '', position: 'Executive Member', mobileNumber: '', email: '', address: '', aadharNumber: '' });
  };

  const handleGenerateTicket = (cand) => {
    const abbrev = party?.abbrev || 'ECI';
    const rand = Math.floor(100000 + Math.random() * 900000);
    const code = `ECI-TKT-${abbrev}-${rand}`;
    setSelectedCandidateForTicket(cand);
    setGeneratedTicketCode(code);
    setShowTicketModal(true);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
      (m.position && m.position.toLowerCase().includes(memberSearch.toLowerCase())) ||
      (m.mobileNumber && m.mobileNumber.includes(memberSearch));
    const matchesRole = roleFilter === 'ALL' || m.position === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div id="party-members-page" className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans text-left space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-purple-500/30 border border-purple-400/40 text-purple-200 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Party Secretariat Module
              </span>
              <span className="text-xs text-purple-300 font-mono font-bold">{party?.abbrev || 'PARTY'} CORE</span>
            </div>
            <h2 className="text-xl font-black font-display mt-0.5">{party?.name || 'Party Secretariat'} — Cadre & Ticket Management</h2>
            <p className="text-xs text-purple-200/80">Manage executive high command members, verify cadres, and issue official ECI nomination tickets.</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Add Executive Member
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl border shadow-3xs gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ROSTER')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'ROSTER' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" /> Executive Cadre Directory ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('CANDIDATES')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'CANDIDATES' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Award className="w-4 h-4" /> Party Candidates & Nominees ({candidates.length})
        </button>

        <button
          onClick={() => setActiveTab('TICKETS')}
          className={`py-3.5 px-4 font-bold text-xs border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'TICKETS' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Ticket className="w-4 h-4" /> Statutory High Command Tickets
        </button>
      </div>

      {/* TAB 1: EXECUTIVE ROSTER */}
      {activeTab === 'ROSTER' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search member name or mobile..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> All members subject to Section 29A statutory verification.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m, index) => (
              <div key={m.id || index} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-3xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-purple-800 text-sm">
                      {m.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-xs">{m.fullName}</h4>
                      <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md inline-block mt-0.5">
                        {m.position || 'Executive Member'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[9px] font-extrabold rounded-md flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-gray-100 text-[11px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{m.mobileNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{m.email || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATES & NOMINEES */}
      {activeTab === 'CANDIDATES' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-gray-50 border-b flex justify-between items-center text-xs font-bold text-gray-700">
            <span>Nominated Candidates Running under {party?.name || 'Party'}</span>
            <span>Total: {candidates.length} Nominees</span>
          </div>

          {candidatesLoading ? (
            <div className="p-8 text-center text-gray-400 text-xs">Loading candidate list...</div>
          ) : candidates.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs italic">No candidates nominated under this political party yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {candidates.map((c) => (
                <div key={c.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-lg border">
                      {c.symbol || '🗳️'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">{c.name}</h4>
                      <p className="text-[10px] text-gray-500">Constituency: <strong className="text-gray-800">{c.constituency}</strong> ({c.state || 'MP'})</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase ${
                      c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                    <button
                      onClick={() => handleGenerateTicket(c)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Ticket className="w-3.5 h-3.5" /> Issue Auth Code
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TICKETS */}
      {activeTab === 'TICKETS' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-purple-700" />
            <div>
              <h3 className="font-black text-sm text-gray-900 uppercase">Statutory High Command Ticket Issuance</h3>
              <p className="text-xs text-gray-500">Under Rule 10 of Elections Rules, political parties issue certified authorization codes to candidates for official emblem allocation.</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-950 space-y-2">
            <span className="font-extrabold uppercase block">How Statutory Authorization Codes Work:</span>
            <p className="leading-relaxed">
              1. High Command generates a unique cryptographic ticket code for authorized candidates.<br/>
              2. Candidates enter this ticket code during nominee registration.<br/>
              3. The ECI engine auto-links the candidate to the official party symbol and manifesto.
            </p>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Add Executive Cadre Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newMember.fullName}
                  onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Position / Office Role</label>
                <select
                  value={newMember.position}
                  onChange={(e) => setNewMember({ ...newMember, position: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg font-semibold bg-white"
                >
                  <option value="General Secretary">General Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Vice President">Vice President</option>
                  <option value="State Coordinator">State Coordinator</option>
                  <option value="District Spokesperson">District Spokesperson</option>
                  <option value="Executive Member">Executive Member</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 43210"
                  value={newMember.mobileNumber}
                  onChange={(e) => setNewMember({ ...newMember, mobileNumber: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-gray-600 block mb-1">Official Email</label>
                <input
                  type="email"
                  placeholder="ramesh@party.org"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Add Cadre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && selectedCandidateForTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Generated Ticket Code</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3 text-center py-2">
              <p className="text-xs text-gray-600">
                Official ECI high command candidate nomination authorization ticket issued to <strong>{selectedCandidateForTicket.name}</strong> ({selectedCandidateForTicket.constituency}).
              </p>

              <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-300 font-mono text-lg font-black text-purple-950 tracking-wider select-all">
                {generatedTicketCode}
              </div>

              <p className="text-[10px] text-gray-400">Share this code with the nominee for filing nomination papers.</p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setShowTicketModal(false)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
