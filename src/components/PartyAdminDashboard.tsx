import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PoliticalParty, CandidateCode, Election, User, Candidate } from '../types';
import { Landmark, Plus, Ticket, Copy, Users, CheckCircle, Award, FileText, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PartyAdminDashboardProps {
  currentUser: User;
}

export default function PartyAdminDashboard({ currentUser }: PartyAdminDashboardProps) {
  const [party, setParty] = useState<PoliticalParty | null>(null);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [elections, setElections] = useState<Election[]>([]);
  const [codes, setCodes] = useState<CandidateCode[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Sub Tab
  const [activeTab, setActiveTab] = useState<'profile' | 'codes' | 'candidates'>('profile');

  // Party Registration Form
  const [partyForm, setPartyForm] = useState({
    name: '',
    abbrev: '',
    symbol: 'Lotus 🪷', // default options
    manifesto: ''
  });

  // Code Generation Form
  const [codeForm, setCodeForm] = useState({
    constituency: '',
    electionId: '',
    position: 'Member of Legislative Assembly (MLA)'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchPartyAdminData();
  }, [activeTab]);

  const fetchPartyAdminData = async () => {
    try {
      const partyList = await api.parties.list();
      setParties(partyList);
      
      // Look for a party owned by this admin
      const ownedParty = partyList.find(p => p.adminId === currentUser.id);
      if (ownedParty) {
        setParty(ownedParty);
        // If party exists, fetch associated elections & codes
        const [elecs, allCodes, allCands] = await Promise.all([
          api.elections.list(),
          api.codes.list(),
          api.candidates.list()
        ]);
        
        // Filter elements specific to this party
        setElections(elecs.filter(e => e.status === 'REGISTRATION_OPEN' || e.status === 'CREATED'));
        setCodes(allCodes.filter(c => c.partyId === ownedParty.id));
        setCandidates(allCands.filter(cand => cand.partyId === ownedParty.id));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch party dashboard details.');
    }
  };

  const handleRegisterParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.parties.create({
        ...partyForm,
        adminId: currentUser.id
      });
      if (res.success) {
        setMessage('Your political party registration request was submitted to the Election Commission. Pending review.');
        fetchPartyAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit party registration.');
    }
  };

  const handleGenerateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!party) return;

    const selectedElec = elections.find(el => el.id === codeForm.electionId);
    if (!selectedElec) {
      setError('Please select a valid election to issue authorization codes.');
      return;
    }

    try {
      const res = await api.codes.generate({
        partyId: party.id,
        partyAbbrev: party.abbrev,
        constituency: codeForm.constituency || selectedElec.constituency || 'General',
        electionLevel: selectedElec.level,
        position: codeForm.position,
        electionId: selectedElec.id,
        adminId: currentUser.id
      });

      if (res.success) {
        setMessage(`Unique candidate authorization code generated successfully: ${res.code.code}`);
        setCodeForm({ constituency: '', electionId: '', position: 'MLA' });
        fetchPartyAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate candidate authorization code.');
    }
  };

  const handleCopyCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCode(codeStr);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const SYMBOL_PRESETS = [
    'Lotus 🪷', 'Hand ✋', 'Broom 🧹', 'Elephant 🐘', 'Cycle 🚲', 'Clock ⏰', 'Book 📖', 'Rising Sun 🌅'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Messages */}
      {message && (
        <div className="mb-6 bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 text-red-800 border border-red-100 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      {/* No Party Registered Banner */}
      {!party ? (
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-primary-800 text-white p-6 eci-watermark">
            <h3 className="font-extrabold text-xl font-display">Simulate Political Party Registry</h3>
            <p className="text-xs text-gray-300 mt-1">Submit your nomination guidelines, party symbols, and digital manifesto to ECI super administrators.</p>
          </div>

          <form onSubmit={handleRegisterParty} className="p-6 space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Full Political Party Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Lok Vikas Sangathan"
                  value={partyForm.name}
                  onChange={(e) => setPartyForm({ ...partyForm, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:bg-white focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Party Abbreviation (e.g. BJP, INC)</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="LVS"
                  value={partyForm.abbrev}
                  onChange={(e) => setPartyForm({ ...partyForm, abbrev: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:bg-white focus:outline-none transition font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Request Party Symbol</label>
                <select 
                  value={partyForm.symbol}
                  onChange={(e) => setPartyForm({ ...partyForm, symbol: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:bg-white focus:outline-none transition"
                >
                  {SYMBOL_PRESETS.map((sym, idx) => (
                    <option key={idx} value={sym}>{sym}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Official National Manifesto Summary</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Outline core party policies, economic strategies, and rural development pledges..."
                  value={partyForm.manifesto}
                  onChange={(e) => setPartyForm({ ...partyForm, manifesto: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg font-bold transition shadow"
            >
              Request Party Credentials from ECI
            </button>
          </form>
        </div>
      ) : (
        // Registered Party Admin Layout
        <div className="space-y-8">
          
          {/* Party Header Overview */}
          <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-3xl border border-primary-100 shadow-inner">
                {party.symbol.includes(' ') ? party.symbol.split(' ')[1] || party.symbol[0] : party.symbol[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-gray-900 font-display">{party.name}</h2>
                  <span className="text-xs bg-primary-100 text-primary-800 font-bold px-2 py-0.5 rounded font-mono">
                    {party.abbrev}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ECI Registry Symbol: <strong className="text-gray-800">{party.symbol}</strong> • Managed by: {currentUser.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                party.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              }`}>
                ● Party status: {party.status}
              </span>
              {party.status !== 'APPROVED' && (
                <span className="text-[10px] text-gray-400 italic mt-0.5">Contact ECI Super Admin to authorize party state</span>
              )}
            </div>
          </div>

          {/* Party Main Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Navigation tab links */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left p-4 text-xs font-bold flex items-center gap-3 transition cursor-pointer ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Award className="w-4 h-4" />
                  Party Profile Overview
                </button>
                <button 
                  onClick={() => setActiveTab('codes')}
                  disabled={party.status !== 'APPROVED'}
                  className={`w-full text-left p-4 text-xs font-bold flex items-center gap-3 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'codes' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Ticket className="w-4 h-4" />
                  Issue Candidate Codes
                </button>
                <button 
                  onClick={() => setActiveTab('candidates')}
                  disabled={party.status !== 'APPROVED'}
                  className={`w-full text-left p-4 text-xs font-bold flex items-center gap-3 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === 'candidates' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Users className="w-4 h-4" />
                  Active Candidates ({candidates.length})
                </button>
              </div>

              <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-primary-700 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-saffron-500" />
                  Candidate Code Guide
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Before candidates can register on behalf of your party, they must acquire a unique, single-use Authorization Code. Generate codes for your target constituencies to allow candidate signups.
                </p>
              </div>
            </div>

            {/* Content pane */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {activeTab === 'profile' && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4"
                  >
                    <h3 className="font-bold text-gray-900 text-lg font-display flex items-center gap-2 pb-2 border-b border-gray-100">
                      <FileText className="w-5 h-5 text-primary-600" />
                      Political Party Manifesto
                    </h3>
                    
                    <div className="space-y-4 text-xs text-gray-700 leading-relaxed">
                      <div>
                        <span className="font-bold text-gray-800 block text-sm mb-1.5">Economic & Social Policies Pledges</span>
                        <p className="bg-gray-50 p-3.5 rounded-xl italic font-medium">"{party.manifesto || 'No manifesto details entered.'}"</p>
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2 text-blue-800">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[11px]">ECI Compliance Warning</span>
                          <span>Candidate nomination codes generated under this party are audited by the central Election Commission to prevent illegal registration.</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'codes' && (
                  <motion.div 
                    key="codes"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Code Generator Form */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <h3 className="font-bold text-gray-900 text-sm font-display">Generate Candidate Authorization Code</h3>
                      
                      <form onSubmit={handleGenerateCode} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Select Election Context</label>
                          <select 
                            required
                            value={codeForm.electionId}
                            onChange={(e) => setCodeForm({ ...codeForm, electionId: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                          >
                            <option value="">-- Choose Nomination-Open Election --</option>
                            {elections.map((elec) => (
                              <option key={elec.id} value={elec.id}>{elec.title} ({elec.level})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-600">Target Constituency Name</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. Bhopal North"
                            value={codeForm.constituency}
                            onChange={(e) => setCodeForm({ ...codeForm, constituency: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-semibold text-gray-600">Target Candidate Position</label>
                          <input 
                            type="text"
                            required
                            placeholder="e.g. MLA"
                            value={codeForm.position}
                            onChange={(e) => setCodeForm({ ...codeForm, position: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Generate One-Time Code
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Codes List */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="p-4 bg-gray-50 font-bold text-xs text-gray-600 uppercase border-b border-gray-200">
                        Active Authorization Codes
                      </div>
                      
                      {codes.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">No codes generated yet.</div>
                      ) : (
                        <div className="divide-y divide-gray-100 font-mono text-xs">
                          {codes.map((c, i) => (
                            <div key={i} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary-800 text-sm tracking-wider">{c.code}</span>
                                  <button
                                    onClick={() => handleCopyCode(c.code)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  {copiedCode === c.code && (
                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">Copied!</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 font-sans leading-relaxed">
                                  Issued for: {c.position} ({c.constituency})
                                </p>
                              </div>

                              <div className="shrink-0">
                                {c.isUsed ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">
                                    Claimed by: {c.candidateName}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-full font-sans font-bold text-[10px]">
                                    Unused (Valid)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'candidates' && (
                  <motion.div 
                    key="candidates"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <h3 className="font-bold text-gray-900 text-sm font-display mb-3">Party Candidates Roster</h3>
                    
                    {candidates.length === 0 ? (
                      <div className="bg-white p-8 text-center text-gray-400 italic rounded-2xl border">
                        No candidates have registered using your codes yet. Share a code to register candidates.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map((cand) => (
                          <div key={cand.id} className="bg-white border border-gray-200 p-4 rounded-xl flex gap-3 shadow-sm">
                            <img 
                              src={cand.photo} 
                              alt={cand.name} 
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-full object-cover border"
                            />
                            <div className="space-y-1 text-xs">
                              <h4 className="font-bold text-gray-900 text-sm">{cand.name}</h4>
                              <p className="text-gray-500">{cand.electionLevel} • {cand.constituency}</p>
                              <div className="flex items-center gap-2 pt-1">
                                <span className={`px-2 py-0.5 rounded-full font-semibold text-[9px] ${
                                  cand.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                  cand.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {cand.status}
                                </span>
                                <span className="text-[10px] text-gray-400">Age: {cand.age}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
