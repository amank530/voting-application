import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, Election, Candidate, Vote } from '../types';
import { INDIAN_REGIONS } from '../lib/constants';
import { 
  ShieldCheck, Landmark, CheckCircle, AlertCircle, Sparkles, MapPin, 
  UserCheck, Heart, Award, ArrowRight, Printer, AlertTriangle, BadgeAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoterDashboardProps {
  currentUser: User;
  onProfileUpdated: (user: User) => void;
}

export default function VoterDashboard({ currentUser, onProfileUpdated }: VoterDashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [eligibleElections, setEligibleElections] = useState<Election[]>([]);
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  
  // Voting states
  const [votedStatusMap, setVotedStatusMap] = useState<Record<string, boolean>>({});
  const [activeCandidates, setActiveCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isConfirmingVote, setIsConfirmingVote] = useState(false);
  const [voteReceipt, setVoteReceipt] = useState<Vote | null>(null);

  // Profile Update Form
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    age: currentUser.age?.toString() || '18',
    state: currentUser.state || '',
    district: currentUser.district || '',
    constituency: currentUser.constituency || ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVoterElections();
  }, [currentUser]);

  const fetchVoterElections = async () => {
    try {
      const [allElecs, allCands] = await Promise.all([
        api.elections.list(),
        api.candidates.list()
      ]);
      setElections(allElecs);
      setCandidates(allCands);

      // Map eligible elections based on voter's set constituency
      if (currentUser.state && currentUser.constituency) {
        const eligible = allElecs.filter(e => 
          e.status === 'VOTING_OPEN' && 
          (!e.state || (e.state === currentUser.state && (!e.constituency || e.constituency === currentUser.constituency)))
        );
        setEligibleElections(eligible);

        // Fetch vote status for these elections
        const statusMap: Record<string, boolean> = {};
        for (const elec of allElecs) {
          const res = await api.votes.status(currentUser.id, elec.id);
          statusMap[elec.id] = res.hasVoted;
        }
        setVotedStatusMap(statusMap);
      }
    } catch (e) {
      console.error('Error fetching voter elections:', e);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.auth.updateProfile(currentUser.id, {
        name: profileForm.name,
        age: Number(profileForm.age),
        state: profileForm.state,
        district: profileForm.district,
        constituency: profileForm.constituency
      });

      if (res.success) {
        onProfileUpdated(res.user);
        setMessage('Your voter registry polling constituency has been successfully registered.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update voter region.');
    }
  };

  const handleSelectElection = (elec: Election) => {
    setError('');
    setVoteReceipt(null);
    setSelectedCandidate(null);

    // Verify age limit
    if (!currentUser.age || currentUser.age < 18) {
      setError('Eligibility Denied: You must be at least 18 years old to cast your digital ballot.');
      return;
    }

    // Verify constituency match
    if (elec.state && (elec.state !== currentUser.state || elec.constituency !== currentUser.constituency)) {
      setError(`Constituency Mismatch: Your profile is registered in "${currentUser.constituency || 'N/A'}", but this election is scheduled for "${elec.constituency || 'N/A'}".`);
      return;
    }

    // Filter approved candidates for this election
    const filteredCands = candidates.filter(c => c.electionId === elec.id && c.status === 'APPROVED');
    setActiveCandidates(filteredCands);
    setSelectedElection(elec);
  };

  const handleInitiateVote = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setIsConfirmingVote(true);
  };

  const handleConfirmVoteCast = async () => {
    if (!selectedElection || !selectedCandidate) return;
    setError('');
    setLoading(true);

    try {
      const res = await api.votes.cast(
        selectedElection.id,
        currentUser.id,
        selectedCandidate.id,
        selectedCandidate.partyId
      );

      if (res.success) {
        setVoteReceipt(res.receipt);
        // Play simulated EVM confirmation Beep!
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(1200, audioCtx.currentTime); // High pitched beep
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.8); // 800ms beep
        } catch (e) {
          console.log('AudioContext beep not allowed or supported by iframe browser:', e);
        }

        // Update local map to prevent voting again
        setVotedStatusMap(prev => ({ ...prev, [selectedElection.id]: true }));
        setIsConfirmingVote(false);
      }
    } catch (err: any) {
      setError(err.message || 'Verification token expired. Failed to store encrypted vote.');
      setIsConfirmingVote(false);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  // Onboarding dropdown selectors
  const statesAvailable = INDIAN_REGIONS.map(r => r.state);
  const districtsAvailable = INDIAN_REGIONS.find(r => r.state === profileForm.state)?.districts || [];
  const constituenciesAvailable = districtsAvailable.find(d => d.name === profileForm.district)?.constituencies || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Onboarding block if region is missing */}
      {(!currentUser.state || !currentUser.constituency) ? (
        <div className="max-w-xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden text-sm">
          <div className="bg-primary-800 text-white p-6 eci-watermark">
            <h3 className="font-extrabold text-xl font-display flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-saffron-500" />
              Register Polling Constituency
            </h3>
            <p className="text-xs text-gray-300 mt-1">To verify your eligibility and fetch valid regional ballots, declare your age and local polling booth region.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Full Name</label>
              <input 
                type="text"
                required
                placeholder="Aman Patel"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Age Verification</label>
                <input 
                  type="number"
                  required
                  min={1}
                  value={profileForm.age}
                  onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm font-semibold text-primary-800 focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Select State</label>
                <select 
                  required
                  value={profileForm.state}
                  onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value, district: '', constituency: '' })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:bg-white"
                >
                  <option value="">-- Select State --</option>
                  {statesAvailable.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Select District</label>
                <select 
                  required
                  disabled={!profileForm.state}
                  value={profileForm.district}
                  onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value, constituency: '' })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:bg-white disabled:opacity-50"
                >
                  <option value="">-- Choose District --</option>
                  {districtsAvailable.map((d, i) => (
                    <option key={i} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Polling Constituency (Booth)</label>
                <select 
                  required
                  disabled={!profileForm.district}
                  value={profileForm.constituency}
                  onChange={(e) => setProfileForm({ ...profileForm, constituency: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:bg-white disabled:opacity-50"
                >
                  <option value="">-- Choose Constituency --</option>
                  {constituenciesAvailable.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg font-bold transition shadow-md"
            >
              Verify Identity & Open Ballots
            </button>
          </form>
        </div>
      ) : (
        // Active voter dashboard with loaded regional ballots
        <div className="space-y-8">
          
          {/* Quick Citizenship card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 text-base leading-snug">Verified ECI Voter Node</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Citizen: <strong className="text-gray-800">{currentUser.name}</strong> • Age: {currentUser.age} Yrs • Polling: <span className="text-primary-700 font-semibold">{currentUser.constituency} ({currentUser.state})</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
                Active KYC Confirmed
              </span>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left sidebar - Eligible Elections */}
            <div className="lg:col-span-1 space-y-4">
              <h4 className="font-bold text-gray-900 text-sm font-display flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-primary-700" />
                Eligible Local Polls
              </h4>

              {eligibleElections.length === 0 ? (
                <div className="bg-gray-50 p-6 text-center border rounded-xl italic text-xs text-gray-400">
                  No elections are currently voting in your constituency. Change your constituency inside simulation if you wish to try casting a vote!
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibleElections.map((elec) => {
                    const voted = votedStatusMap[elec.id];
                    return (
                      <button
                        key={elec.id}
                        onClick={() => handleSelectElection(elec)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition flex justify-between items-start cursor-pointer ${selectedElection?.id === elec.id ? 'border-primary-600 bg-primary-50/20' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <div className="max-w-[75%] space-y-1">
                          <p className="font-bold text-gray-900 text-xs leading-snug">{elec.title}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{elec.level}</p>
                        </div>

                        {voted ? (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">voted</span>
                        ) : (
                          <span className="text-[9px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">LIVE</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right main column - Interactive EVM Ballot machine or Verification receipt */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* 1. Cast vote EVM Ballot panel */}
                {selectedElection && !votedStatusMap[selectedElection.id] && !voteReceipt && (
                  <motion.div
                    key="evm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-zinc-800 text-white rounded-2xl border-4 border-zinc-900 p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between h-[480px]"
                  >
                    {/* EVM header */}
                    <div className="border-b border-white/10 pb-3 flex justify-between items-center text-xs text-zinc-400 font-bold">
                      <span className="tracking-wider uppercase">ECI Electronic Ballot System</span>
                      <span className="text-emerald-500 animate-pulse">🟢 READY</span>
                    </div>

                    {/* Candidates select rows */}
                    <div className="my-4 overflow-y-auto space-y-2 pr-1 h-[320px]">
                      {activeCandidates.length === 0 ? (
                        <div className="text-center py-12 text-zinc-400 italic text-xs">
                          Nominations approved list is empty for this constituency. Add approved candidates as ECI Admin to enable ballot voting.
                        </div>
                      ) : (
                        activeCandidates.map((cand) => (
                          <div 
                            key={cand.id} 
                            className="bg-zinc-700/50 p-3 rounded-lg border border-white/5 flex items-center justify-between hover:bg-zinc-700/80 transition"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-zinc-400 font-bold text-xs">{cand.isIndependent ? 'IND' : cand.partyName?.substring(0,3).toUpperCase()}</span>
                              <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center text-lg">
                                {cand.partySymbol?.includes(' ') ? cand.partySymbol.split(' ')[1] || cand.partySymbol[0] : cand.partySymbol || '👤'}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-xs">{cand.name}</h4>
                                <span className="text-[10px] text-zinc-400 font-semibold">{cand.partyName || 'Independent Candidate'}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleInitiateVote(cand)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded font-bold text-[10px] transition cursor-pointer uppercase tracking-wider flex items-center gap-1"
                            >
                              Blue Button
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* EVM visual hint footer */}
                    <div className="border-t border-white/10 pt-3 text-[10px] text-zinc-500 font-semibold flex items-center justify-between">
                      <span>Constituency: {selectedElection.constituency}</span>
                      <span>Cryptographic voting AES-256</span>
                    </div>
                  </motion.div>
                )}

                {/* Already voted notice */}
                {selectedElection && votedStatusMap[selectedElection.id] && !voteReceipt && (
                  <motion.div
                    key="voted"
                    className="bg-white p-8 rounded-2xl border text-center space-y-4 shadow-sm"
                  >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Your Vote is Recorded</h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                        You have already successfully cast your electronic ballot in <strong className="text-gray-800">"{selectedElection.title}"</strong>. To secure civic integrity, each voter is limited to exactly one ballot per election.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 2. Cryptographic Vote Verification Receipt */}
                {voteReceipt && (
                  <motion.div
                    key="receipt"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-2xl shadow-xl space-y-6 max-w-md mx-auto print:border-none print:shadow-none"
                  >
                    <div className="text-center space-y-1.5 pb-4 border-b">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        🇮🇳 Cryptographic Ballot Receipt
                      </div>
                      <h3 className="font-extrabold text-gray-900 font-display text-base">Election Commission of India</h3>
                      <p className="text-[10px] text-gray-400">Verifiable Electronic Voting Record</p>
                    </div>

                    <div className="space-y-3 font-mono text-[11px] text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Receipt ID:</span>
                        <span className="font-bold text-gray-900">{voteReceipt.receiptId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Election context:</span>
                        <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">{selectedElection?.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Voter credentials:</span>
                        <span className="font-bold text-gray-900">VERIFIED (+91 {currentUser.mobileNumber.substring(6)}...)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp logged:</span>
                        <span className="font-bold text-gray-900">{new Date(voteReceipt.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="space-y-1 pt-3 border-t">
                        <span className="text-gray-400 block text-[10px]">Verifiable Encryption signature:</span>
                        <p className="bg-gray-50 p-2 rounded text-[9px] text-gray-500 break-all leading-normal font-mono select-all">
                          {voteReceipt.encryptionSignature}
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs flex gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                      <p className="leading-relaxed">
                        Your vote has been signed using <strong>AES-256</strong>, logged securely on the ECI server. Thank you for voting!
                      </p>
                    </div>

                    <div className="flex justify-center gap-2 pt-2 border-t print:hidden">
                      <button 
                        onClick={printReceipt}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                      </button>
                      <button 
                        onClick={() => setVoteReceipt(null)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Return to Polls
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* No election chosen yet banner */}
                {!selectedElection && (
                  <motion.div
                    key="empty"
                    className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center h-[350px]"
                  >
                    <Landmark className="w-12 h-12 text-gray-300 mb-3" />
                    <h4 className="text-gray-700 font-semibold">Select an Active Election</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-normal">
                      Choose one of your eligible live local polls on the left sidebar to cast your ballot.
                    </p>
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
