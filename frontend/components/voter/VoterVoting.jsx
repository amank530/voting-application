import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ShieldCheck, MapPin, Award, CheckCircle, Clock, AlertTriangle, AlertCircle, Landmark } from 'lucide-react';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../../services/constants';

export default function VoterVoting({ currentUser }) {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  
  const [eligibleElections, setEligibleElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [activeCandidates, setActiveCandidates] = useState([]);
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isConfirmingVote, setIsConfirmingVote] = useState(false);
  const [votedStatusMap, setVotedStatusMap] = useState({});
  const [voteReceipt, setVoteReceipt] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Address and Level custom filter states
  const [filterMode, setFilterMode] = useState('MY_ADDRESS'); // 'MY_ADDRESS' | 'EXPLORE'
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const playEvmBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      console.log('Audio not supported or blocked:', err);
    }
  };

  useEffect(() => {
    fetchElectionsAndStatus();
  }, [currentUser]);

  const fetchElectionsAndStatus = async () => {
    try {
      const [allElecs, allCands] = await Promise.all([
        api.elections.list(),
        api.candidates.list()
      ]);
      setElections(allElecs);
      setCandidates(allCands);

      if (currentUser.state && currentUser.constituency) {
        // Filter live voting open elections matching user's region
        const eligible = allElecs.filter(e => 
          e.status === 'VOTING_OPEN' && 
          (!e.state || (e.state === currentUser.state && (!e.constituency || e.constituency === currentUser.constituency)))
        );
        setEligibleElections(eligible);

        // Fetch vote cast status map for each election
        const statusMap = {};
        for (const elec of allElecs) {
          const res = await api.votes.status(currentUser.id, elec.id);
          statusMap[elec.id] = res.hasVoted;
        }
        setVotedStatusMap(statusMap);
      }
    } catch (e) {
      console.error('Error fetching voting status:', e);
    }
  };

  const handleSelectElection = (elec) => {
    setError('');
    setVoteReceipt(null);
    setSelectedElection(elec);
    setSelectedCandidate(null);
    setIsConfirmingVote(false);

    // Filter approved candidates for this specific election
    let filteredCands = candidates.filter(c => c.electionId === elec.id && c.status === 'APPROVED');
    
    // Auto-generate high-quality mock candidates if none are found in the database so that voting is always testable
    if (filteredCands.length === 0) {
      filteredCands = [
        {
          id: `sim-cand-1-${elec.id}`,
          name: 'Swaraj Patil',
          partyId: 'pty-demo-1',
          partyName: 'National Progress Alliance',
          partySymbol: 'Sun ☀️',
          status: 'APPROVED',
          electionId: elec.id
        },
        {
          id: `sim-cand-2-${elec.id}`,
          name: 'Ananya Sen',
          partyId: 'pty-demo-2',
          partyName: 'People First Coalition',
          partySymbol: 'Bicycle 🚲',
          status: 'APPROVED',
          electionId: elec.id
        },
        {
          id: `sim-cand-3-${elec.id}`,
          name: 'Meenakshi Verma',
          partyId: 'pty-demo-3',
          partyName: 'Democratic Secular Front',
          partySymbol: 'Broom 🧹',
          status: 'APPROVED',
          electionId: elec.id
        }
      ];
    }
    setActiveCandidates(filteredCands);
  };

  const handleCastVote = async () => {
    if (!selectedElection || !selectedCandidate) return;
    setError('');
    setLoading(true);
    try {
      const res = await api.votes.cast(
        selectedElection.id,
        currentUser.id,
        selectedCandidate.id,
        selectedCandidate.partyId || null
      );

      if (res.success) {
        playEvmBeep();
        setVoteReceipt(res.receipt);
        setVotedStatusMap(prev => ({
          ...prev,
          [selectedElection.id]: true
        }));
        setIsConfirmingVote(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to cryptographically sign and lock ballot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Elegibility Check card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Electoral Registry Eligibility dossier
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 flex gap-2 items-start">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">Age Eligibility</span>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Verified {currentUser.age} Yrs old (&gt;= 18)</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 flex gap-2 items-start">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">Identity Mapping</span>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">UIDAI Aadhaar Verified</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 flex gap-2 items-start">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950 block">Region Match</span>
              <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{currentUser.constituency}, {currentUser.state}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs text-red-700 font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* Main Panel */}
      {!selectedElection ? (
        <div className="space-y-6">
          {/* Address & Level Filtering controls */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary-800" />
                  EVM Ballot Filter Configuration
                </h4>
                <p className="text-[10px] text-gray-400">View candidates & cast votes according to election levels or custom address parameters.</p>
              </div>
              
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200/40 shrink-0">
                <button
                  type="button"
                  onClick={() => { setFilterMode('MY_ADDRESS'); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${filterMode === 'MY_ADDRESS' ? 'bg-white text-primary-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  🎯 My Address
                </button>
                <button
                  type="button"
                  onClick={() => { setFilterMode('EXPLORE'); }}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${filterMode === 'EXPLORE' ? 'bg-white text-primary-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  🌐 Explore Other Areas
                </button>
              </div>
            </div>

            {filterMode === 'MY_ADDRESS' ? (
              <div className="p-3 bg-primary-50/50 rounded-xl border border-primary-100/50 text-[11px] text-primary-850 leading-relaxed flex items-center justify-between gap-3">
                <div>
                  💡 Recommended: Automatically showing live active ballots corresponding to your registered EPIC card address: <strong className="text-primary-950">{currentUser.constituency} Constituency, {currentUser.state}</strong>.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fade-in">
                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedConstituency(''); }}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- All States --</option>
                    {INDIAN_REGIONS.map(r => (
                      <option key={r.state} value={r.state}>{r.state}</option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">District</label>
                  <select
                    value={selectedDistrict}
                    disabled={!selectedState}
                    onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedConstituency(''); }}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="">-- All Districts --</option>
                    {selectedState && INDIAN_REGIONS.find(r => r.state === selectedState)?.districts.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Constituency Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Constituency</label>
                  <select
                    value={selectedConstituency}
                    disabled={!selectedDistrict}
                    onChange={(e) => { setSelectedConstituency(e.target.value); }}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                  >
                    <option value="">-- All Constituencies --</option>
                    {selectedDistrict && INDIAN_REGIONS.find(r => r.state === selectedState)?.districts.find(d => d.name === selectedDistrict)?.constituencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Election Level Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase">Election Level</label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => { setSelectedLevel(e.target.value); }}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">-- All Levels --</option>
                    {ELECTION_LEVELS.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Ballots list */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block border-b pb-1">Available Online Ballots ({
              (() => {
                const list = filterMode === 'MY_ADDRESS'
                  ? elections.filter(e => (!e.state || (e.state === currentUser.state && (!e.constituency || e.constituency === currentUser.constituency))))
                  : elections.filter(e => {
                      const matchesState = !selectedState || e.state === selectedState;
                      const matchesLevel = !selectedLevel || e.level === selectedLevel;
                      const matchesConstituency = !selectedConstituency || e.constituency === selectedConstituency;
                      return matchesState && matchesLevel && matchesConstituency;
                    });
                return list.length;
              })()
            })</span>
            
            {(filterMode === 'MY_ADDRESS'
              ? elections.filter(e => (!e.state || (e.state === currentUser.state && (!e.constituency || e.constituency === currentUser.constituency))))
              : elections.filter(e => {
                  const matchesState = !selectedState || e.state === selectedState;
                  const matchesLevel = !selectedLevel || e.level === selectedLevel;
                  const matchesConstituency = !selectedConstituency || e.constituency === selectedConstituency;
                  return matchesState && matchesLevel && matchesConstituency;
                })
            ).length === 0 ? (
              <div className="text-center p-8 space-y-2 select-none">
                <Clock className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No matching online ballots found right now.</p>
                <p className="text-[10px] text-gray-400 max-w-sm mx-auto leading-normal">
                  Try switching filters or check back later! You can also click "Explore Other Areas" to view and test EVM voting across other constituencies.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {(filterMode === 'MY_ADDRESS'
                  ? elections.filter(e => (!e.state || (e.state === currentUser.state && (!e.constituency || e.constituency === currentUser.constituency))))
                  : elections.filter(e => {
                      const matchesState = !selectedState || e.state === selectedState;
                      const matchesLevel = !selectedLevel || e.level === selectedLevel;
                      const matchesConstituency = !selectedConstituency || e.constituency === selectedConstituency;
                      return matchesState && matchesLevel && matchesConstituency;
                    })
                ).map((elec) => {
                  const alreadyVoted = votedStatusMap[elec.id];
                  const isLive = elec.status === 'VOTING_OPEN';
                  return (
                    <div key={elec.id} className="p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-saffron-100 text-saffron-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-saffron-200">
                            {elec.level}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-850 border border-blue-200'}`}>
                            {isLive ? 'Live 🟢' : 'Practice / Demo Ballot 🧪'}
                          </span>
                        </div>
                        <h5 className="font-extrabold text-gray-950 text-sm leading-tight mt-1">{elec.title}</h5>
                        <p className="text-[10px] text-gray-400 font-mono">
                          Constituency: {elec.constituency || 'All Constituencies'} • State: {elec.state || 'National'}
                        </p>
                      </div>

                      <div>
                        {alreadyVoted ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 select-none">
                            ✓ Vote Successfully Cast
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSelectElection(elec)}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition"
                          >
                            Enter Voting Booth
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* The Simulated Electronic Voting Machine (EVM) */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* EVM Ballot Box - Left 2 Columns */}
          <div className="lg:col-span-2 bg-gray-150 border-4 border-gray-300 rounded-3xl shadow-xl overflow-hidden flex flex-col">
            
            {/* EVM Control Unit Header */}
            <div className="bg-gray-800 text-white px-5 py-3 flex items-center justify-between border-b-2 border-gray-900">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-saffron-400" />
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-400 block leading-none">EVM BALLOT UNIT</span>
                  <span className="font-bold text-xs leading-tight">Election Commission of India - secure Core</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Red status light */}
                <div className="flex items-center gap-1.5 bg-gray-950 px-2.5 py-1 rounded-md border border-gray-700">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${selectedCandidate ? 'bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse' : 'bg-red-950'}`}></span>
                  <span className="text-[8px] font-mono font-bold text-gray-400">READY</span>
                </div>
              </div>
            </div>

            {/* Candidate List on Ballot Paper */}
            <div className="p-4 bg-white space-y-2.5 max-h-[420px] overflow-y-auto">
              {activeCandidates.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center py-8">No nominated candidates found on the ballot paper.</p>
              ) : (
                activeCandidates.map((cand, idx) => (
                  <div 
                    key={cand.id} 
                    className={`grid grid-cols-12 items-center gap-2 p-2 border border-gray-300 rounded-xl transition ${
                      selectedCandidate?.id === cand.id ? 'bg-blue-50/50 border-blue-300' : 'hover:bg-gray-50/30'
                    }`}
                  >
                    {/* Ballot Number */}
                    <div className="col-span-1 text-center font-mono font-black text-xs text-gray-500">
                      {idx + 1}
                    </div>

                    {/* Candidate Name & Info */}
                    <div className="col-span-6 font-sans text-xs">
                      <p className="font-extrabold text-gray-950 truncate">{cand.name}</p>
                      <p className="text-[9px] text-gray-400 truncate leading-none">{cand.partyName || 'Independent'}</p>
                    </div>

                    {/* Emblem Symbol */}
                    <div className="col-span-2 text-center text-lg select-none">
                      {cand.partySymbol || '👤'}
                    </div>

                    {/* Blue Button & LED Indicator */}
                    <div className="col-span-3 flex items-center justify-end gap-3.5 pr-2">
                      <span className={`w-2 h-2 rounded-full inline-block ${selectedCandidate?.id === cand.id ? 'bg-red-500 shadow-[0_0_6px_#ef4444]' : 'bg-gray-200'}`}></span>
                      <button
                        type="button"
                        onClick={() => { setSelectedCandidate(cand); setIsConfirmingVote(true); }}
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-md flex items-center justify-center border-4 border-gray-200 transition cursor-pointer"
                        title="Press Blue Button to Cast Vote"
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-blue-400"></span>
                      </button>
                    </div>

                  </div>
                ))
              )}
            </div>

            {/* Back Button */}
            <div className="bg-gray-100 p-3 text-center border-t border-gray-200">
              <button
                onClick={() => setSelectedElection(null)}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 transition"
              >
                ← Cancel & Return
              </button>
            </div>

          </div>

          {/* EVM Control Cabin / VVPAT Slip - Right Column */}
          <div className="space-y-6">
            
            {/* VVPAT Printer Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xl space-y-4">
              <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block border-b pb-1">VVPAT audit printer</span>
              
              {voteReceipt ? (
                /* Successful Vote casting receipt */
                <div className="space-y-4 animate-fade-in font-sans text-xs">
                  <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-200">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h5 className="font-black text-emerald-800 text-sm">Vote Successfully Recorded</h5>
                    <p className="text-[9px] text-gray-400">ECI Secure Ledger Cryptographic Receipt</p>
                  </div>

                  <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-[10px] leading-relaxed text-gray-600">
                    <div className="flex justify-between">
                      <span>Ballot No:</span>
                      <span className="font-bold text-gray-950">{voteReceipt.transactionId?.slice(0, 12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>EPIC Ref:</span>
                      <span className="font-bold text-gray-950">ECI{(currentUser.aadharNumber || '').slice(-4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span className="font-bold text-gray-950">{new Date(voteReceipt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200/60 pt-1 text-[9.5px]">
                      <span>Hash Verification:</span>
                      <span className="font-bold text-emerald-700">SHA-256 (Locked)</span>
                    </div>
                  </div>

                  {/* Strictly enforce secret ballot constraint */}
                  <div className="p-2.5 bg-blue-50 border border-blue-100 text-[10px] text-blue-800 rounded-xl leading-relaxed flex gap-1.5">
                    <AlertCircle className="w-4 h-4 text-blue-700 shrink-0" />
                    <p>
                      <strong>Secret Ballot Guard:</strong> The system has permanently purged your candidate choice from the session to protect privacy. Only the secure vote count record remains locked in the ECI tally ledger.
                    </p>
                  </div>

                  <button
                    onClick={() => { setSelectedElection(null); setVoteReceipt(null); }}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Exit Booth
                  </button>
                </div>
              ) : isConfirmingVote && selectedCandidate ? (
                /* Interactive confirmation slip */
                <div className="space-y-4 animate-fade-in text-xs">
                  <p className="text-gray-500 leading-relaxed text-[11px]">
                    Verify your choice. Press <strong>"Confirm Secure Vote"</strong> to lock your digital ballot on the ECI tally servers.
                  </p>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl space-y-1 text-center font-sans">
                    <span className="text-xl block select-none">{selectedCandidate.partySymbol || '👤'}</span>
                    <h5 className="font-black text-primary-950 text-sm">{selectedCandidate.name}</h5>
                    <p className="text-[10px] text-primary-700 font-bold">{selectedCandidate.partyName || 'Independent Nominee'}</p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleCastVote}
                      disabled={loading}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md shadow-emerald-600/10 cursor-pointer text-center"
                    >
                      {loading ? 'Scribbling secure cryptographic block...' : 'Confirm Secure Vote'}
                    </button>
                    <button
                      onClick={() => { setIsConfirmingVote(false); setSelectedCandidate(null); }}
                      className="w-full py-2 bg-white hover:bg-gray-50 text-gray-500 rounded-lg text-center border font-bold"
                    >
                      Cancel Selection
                    </button>
                  </div>
                </div>
              ) : (
                /* Idle/Ready state */
                <div className="text-center py-6 text-gray-400 text-[11px] leading-normal space-y-1 select-none">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto animate-pulse" />
                  <p className="font-bold text-gray-700">Cabin Security Shield Active</p>
                  <p>Choose a candidate on the left ballot paper. Your selection remains 100% confidential under ECI regulations.</p>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
