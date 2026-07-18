import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  User, ShieldCheck, Award, MapPin, Calendar, Users, Landmark, 
  HelpCircle, Bell, ArrowRight, ShieldAlert, Clock, LogOut, CheckCircle2, 
  ChevronRight, Search, Filter, Volume2, Info, Check, Shield, Award as BadgeIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import electionBg from '../../src/assets/images/indian_election_voter_1784281680123.jpg';

// Modular Subcomponents Imports
import VoterProfile from '../components/voter/VoterProfile';
import VoterIdentity from '../components/voter/VoterIdentity';
import VoterInfo from '../components/voter/VoterInfo';

export default function VoterDashboard({ currentUser, onProfileUpdated, onLogout, userRoleView, setUserRoleView, onNavigateToCandidateReg }) {
  const [activeTab, setActiveTab] = useState('DASHBOARD'); 
  const [elections, setElections] = useState([]);
  const [votedStatusMap, setVotedStatusMap] = useState({});
  const [candidacyData, setCandidacyData] = useState(null);

  // Load elections, voted statuses, and candidacy details
  useEffect(() => {
    fetchElectionsAndStatus();
    loadCandidacyData();
    
    // Poll for any candidacy updates from local storage
    const interval = setInterval(() => {
      loadCandidacyData();
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const fetchElectionsAndStatus = async () => {
    try {
      const allElecs = await api.elections.list();
      setElections(allElecs || []);

      const statusMap = {};
      for (const e of allElecs) {
        const res = await api.votes.status(currentUser.id, e.id);
        statusMap[e.id] = res.hasVoted;
      }
      setVotedStatusMap(statusMap);
    } catch (e) {
      console.error('Error in VoterDashboard state sync:', e);
    }
  };

  const loadCandidacyData = () => {
    const saved = localStorage.getItem(`eci_candidacy_data_${currentUser?.id}`) || localStorage.getItem('eci_candidacy_data');
    if (saved) {
      try {
        setCandidacyData(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading candidacy state:', e);
      }
    } else {
      setCandidacyData(null);
    }
  };

  // Build the filtered menu list
  const menuItems = [
    { id: 'DASHBOARD', label: '📊 Dashboard Overview', icon: ShieldCheck, group: 'Navigation' },
    { id: 'PROFILE', label: '👤 Profile Settings', icon: User, group: 'Credentials' },
    { id: 'IDENTITY', label: '🪪 Identity Verification', icon: ShieldCheck, group: 'Credentials' },
    { id: 'INFO', label: '📄 EPIC Voter Slip', icon: Award, group: 'Credentials' },
    { id: 'VOTE', label: '🗳️ Cast Ballot / Vote', icon: CheckCircle2, group: 'Actions' },
  ];

  // Append Candidacy Notifications section only if candidate is selected / registered
  if (candidacyData) {
    menuItems.push({ 
      id: 'CANDIDACY_NOTIFS', 
      label: '📢 Candidacy Status & Alerts', 
      icon: Bell, 
      group: 'Candidacy' 
    });
  }

  const handleVoteCastFinished = () => {
    fetchElectionsAndStatus();
  };

  return (
    <div id="voter-dashboard-container" className="min-h-screen bg-gray-50 flex flex-col font-sans text-left">
      
      {/* Top Banner Header */}
      <header className="bg-gradient-to-r from-primary-900 to-primary-950 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/20">
            <ShieldCheck className="w-6 h-6 text-saffron-400" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display uppercase tracking-wider">National Voter Portal</h1>
            <p className="text-[10px] text-gray-300">Identity-authenticated secure voting terminal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right md:block hidden">
            <span className="text-xs font-bold block">{currentUser?.name || 'Voter'}</span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 inline-block mt-0.5 font-bold">
              Verified & Active Voter
            </span>
          </div>

          <button 
            onClick={onLogout}
            className="p-2 bg-white/10 hover:bg-white/20 hover:text-red-300 rounded-lg border border-white/10 transition cursor-pointer text-xs flex items-center gap-1.5 font-bold"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      {/* Mobile Horizontal Menu bar - hidden on md: */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap px-4 py-2 flex gap-2 scrollbar-none shrink-0">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-primary-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-saffron-500" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main split rail viewport */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-72 bg-white border-r border-gray-200 p-5 shrink-0 flex-col justify-between">
          <div className="space-y-6">
            <div className="p-3 bg-primary-50/50 border border-primary-100/60 rounded-xl">
              <div className="flex gap-2.5 items-center">
                <ShieldCheck className="w-5 h-5 text-primary-800" />
                <div>
                  <h2 className="text-xs font-bold text-primary-950">Voter Panel</h2>
                  <p className="text-[9px] text-primary-700 font-medium">Identity & Ballot Center</p>
                </div>
              </div>
            </div>

            <nav className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
              {['Navigation', 'Credentials', 'Actions', 'Candidacy'].map(group => {
                const groupItems = menuItems.filter(item => item.group === group);
                if (groupItems.length === 0) return null;
                
                return (
                  <div key={group} className="space-y-1">
                    <span className="text-[8px] uppercase tracking-wider font-black text-gray-400 block px-2 mb-1">{group}</span>
                    <div className="space-y-0.5">
                      {groupItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                              isActive 
                                ? 'bg-primary-900 text-white shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-saffron-300' : 'text-gray-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-saffron-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="pt-2 border-t text-center text-[10px] text-gray-400 font-mono">
            Secure Session ID • 256-bit AES
          </div>
        </aside>

        {/* Content Panel Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          <AnimatePresence mode="wait">
            
            {/* Tab 0: Home/Dashboard Overview */}
            {activeTab === 'DASHBOARD' && (
              <motion.div
                key="voter_dashboard_home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                
                {/* HERO BANNER WITH ELECTION BACKGROUND IMAGE & VOTE BUTTON */}
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 h-56 md:h-64 flex items-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${electionBg})` }}
                >
                  {/* Dark high-contrast overlay for text legibility */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40"></div>
                  
                  <div className="relative z-10 px-6 md:px-8 max-w-xl text-left space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-saffron-500 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                        National Democratic Franchise
                      </span>
                      <span className="text-[10px] text-gray-300 font-mono font-bold">18th Lok Sabha Polling Core</span>
                    </div>
                    
                    <h2 className="text-xl md:text-2xl font-black font-display text-white leading-tight">
                      Sovereign Electoral Terminal
                    </h2>
                    
                    <p className="text-xs text-gray-200 font-semibold leading-relaxed">
                      Your identity has been fully synchronized and authorized. Press below to enter the secure national polling booth and cast your biometric ballot.
                    </p>

                    <div>
                      <button
                        onClick={() => setActiveTab('VOTE')}
                        className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 active:scale-[0.98] text-white font-black uppercase tracking-wider rounded-lg text-xs transition shadow-lg shadow-saffron-500/20 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
                      >
                        🗳️ ENTER SECURE BOOTH & VOTE NOW
                      </button>
                    </div>
                  </div>
                </div>

                {/* Visual Overview grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Card 1: Profile status */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Identity Profile Status</span>
                    
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center font-bold text-sm">
                        {currentUser.name?.charAt(0) || 'V'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-gray-900 leading-tight">{currentUser.name}</h4>
                        <span className="text-[9px] text-gray-400 font-bold">Age: {currentUser.age} Yrs old</span>
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-lg text-[10px] text-emerald-800 font-extrabold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Compliance Verified
                    </div>
                  </div>

                  {/* Card 2: EPIC ID coordinates */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 text-left">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">EPIC Identity Coordinates</span>
                    
                    <div>
                      <span className="text-[8px] font-bold text-gray-400 block">VOTER CARD (EPIC)</span>
                      <span className="font-mono font-black text-gray-900 text-xs tracking-wider">
                        ECI{(currentUser.aadharNumber || '3333').slice(-4)}{currentUser.id?.toUpperCase().slice(-4) || 'VOT'}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                      Assembly constituency seat: <strong className="text-primary-800">{currentUser.constituency || 'Bhopal North'}</strong>
                    </p>
                  </div>

                  {/* Card 3: Live Voting compliance status */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block">Regional Voting Compliance</span>
                    
                    <div className="space-y-1.5 text-xs font-bold">
                      {elections.filter(e => e.status === 'VOTING_OPEN' && (!e.state || e.state === currentUser.state)).map(e => {
                        const voted = votedStatusMap[e.id];
                        return (
                          <div key={e.id} className="flex justify-between items-center text-[10px] border-b pb-1">
                            <span className="truncate max-w-[120px] text-gray-700">{e.title}</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${voted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700 animate-pulse'}`}>
                              {voted ? 'Cast Successfully' : 'Action Required'}
                            </span>
                          </div>
                        );
                      })}
                      {elections.filter(e => e.status === 'VOTING_OPEN' && (!e.state || e.state === currentUser.state)).length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">No polling booths are live right now.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* DYNAMIC CANDIDACY STATUS ALERT BOX (Shows if candidate selected) */}
                {candidacyData && (
                  <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl text-indigo-950 space-y-3 animate-fade-in text-left">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
                        <h4 className="font-black text-xs uppercase tracking-wider text-indigo-900">Active Candidacy Progress</h4>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                        candidacyData.roStatus === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : candidacyData.roStatus === 'Rejected'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        RO Scrutiny: {candidacyData.roStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-500 font-bold">Candidate ID Code:</p>
                        <strong className="text-indigo-900 font-mono text-sm block mt-0.5">{candidacyData.candidateId || 'N/A'}</strong>
                      </div>
                      <div>
                        <p className="text-gray-500 font-bold">Affidavit Nom Number:</p>
                        <strong className="text-indigo-900 font-mono text-sm block mt-0.5">{candidacyData.nominationNumber || 'Awaiting Submission'}</strong>
                      </div>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-100 text-xs text-gray-700 italic">
                      <span className="font-extrabold text-indigo-900 uppercase text-[9px] not-italic block mb-0.5">Returning Officer Remarks:</span>
                      "{candidacyData.roRemarks || 'Verification process in execution.'}"
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[11px]">
                      <span className="text-gray-500 font-semibold">Track detail records and historical communications:</span>
                      <button
                        onClick={() => setActiveTab('CANDIDACY_NOTIFS')}
                        className="text-indigo-700 font-black flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Open Candidacy Terminal <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Become a Candidate CTA Banner */}
                <div className="bg-gradient-to-r from-saffron-500 via-primary-800 to-emerald-600 p-[1.5px] rounded-2xl shadow-sm">
                  <div className="bg-white p-5 rounded-[14px] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-saffron-100 text-saffron-800 text-[9px] font-bold rounded-md">Form 26 Affidavit Filing</span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">Online System</span>
                      </div>
                      <h4 className="font-extrabold text-gray-950 text-xs">Want to run in an upcoming election?</h4>
                      <p className="text-[11px] text-gray-500 max-w-2xl leading-relaxed">
                        Become an official candidate by completing your digital Form 26 nomination affidavit online. Provide educational qualifications, declared asset disclosures, clean record credentials, and secure your political party sponsorship or register as an independent nominee.
                      </p>
                    </div>
                    <button
                      onClick={onNavigateToCandidateReg}
                      className="px-4 py-2 bg-primary-900 hover:bg-primary-950 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Become a Candidate</span>
                      <ArrowRight className="w-3.5 h-3.5 text-saffron-300" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Render Tab Subcomponents */}
            {activeTab === 'PROFILE' && <VoterProfile currentUser={currentUser} onProfileUpdated={onProfileUpdated} />}
            {activeTab === 'IDENTITY' && <VoterIdentity currentUser={currentUser} />}
            {activeTab === 'INFO' && <VoterInfo currentUser={currentUser} />}
            
            {/* VOTE: NEW HIGH FIDELITY VOTING SECTION WITH ADDRESS/WARD FILTERS AND REAL BEEP */}
            {activeTab === 'VOTE' && (
              <VoterVotingWithFilters 
                currentUser={currentUser} 
                elections={elections} 
                votedStatusMap={votedStatusMap} 
                onVoteCast={handleVoteCastFinished} 
              />
            )}

            {/* CANDIDACY_NOTIFS: DYNAMIC NOTIFICATION FEED LINKED WITH THE DETAILED FILING PROCESS */}
            {activeTab === 'CANDIDACY_NOTIFS' && candidacyData && (
              <motion.div
                key="cadd_notifs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 text-left"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase font-black">Candidacy Communication Hub</span>
                    <h2 className="text-lg font-extrabold text-gray-900">Candidacy Notifications & Alerts</h2>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem(`eci_candidacy_data_${currentUser?.id}`);
                      localStorage.removeItem('eci_candidacy_data');
                      setCandidacyData(null);
                      setActiveTab('DASHBOARD');
                    }}
                    className="px-2.5 py-1 text-red-700 bg-red-50 hover:bg-red-100 font-bold rounded-lg text-[10px] uppercase transition cursor-pointer"
                  >
                    Withdraw Candidacy Record
                  </button>
                </div>

                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-primary-700">Nominee Affiliation</span>
                    <h4 className="text-sm font-black text-gray-900">
                      {candidacyData.form?.fullName || currentUser.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      State Constituency: <strong>{candidacyData.form?.constituency || currentUser.constituency || 'Bhopal North'}</strong> • Contesting as {candidacyData.form?.contestingCategory || 'Independent'}
                    </p>
                  </div>

                  <div className="bg-white border rounded-xl p-3 text-[11px] font-mono space-y-1">
                    <p>Status Code: <strong className="text-indigo-900">{candidacyData.roStatus}</strong></p>
                    <p>ID Code: <strong className="text-emerald-700">{candidacyData.candidateId}</strong></p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Alerts History Feed</h3>
                  <div className="space-y-3">
                    {candidacyData.candidacyNotifications?.map((notif) => (
                      <div key={notif.id} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex gap-3 items-start">
                        <div className="bg-indigo-100 text-indigo-800 p-2 rounded-lg shrink-0">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-extrabold text-gray-900 text-xs">{notif.title}</h5>
                            <span className="text-[9px] text-gray-400 font-mono">{notif.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{notif.message}</p>
                        </div>
                      </div>
                    ))}

                    {(!candidacyData.candidacyNotifications || candidacyData.candidacyNotifications.length === 0) && (
                      <p className="text-xs text-gray-400 italic">No communication logs detected.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

    </div>
  );
}

// ==========================================
// CUSTOM HIGH FIDELITY FILTER-BASED VOTING COMPONENT
// ==========================================
function VoterVotingWithFilters({ currentUser, elections, votedStatusMap, onVoteCast }) {
  const [candidates, setCandidates] = useState([]);
  const [filterAddress, setFilterAddress] = useState('');
  const [filterWard, setFilterWard] = useState('');
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [voteCastingId, setVoteCastingId] = useState(null); 
  const [voteCastingStep, setVoteCastingStep] = useState('idle'); // 'idle' | 'beeping' | 'finished'
  const [lastVoteReceipt, setLastVoteReceipt] = useState(null);

  useEffect(() => {
    // Fetch nominees from ECI registry database
    api.candidates.list()
      .then(data => setCandidates(data || []))
      .catch(err => console.error("Error fetching candidate list for voting:", err));
  }, []);

  useEffect(() => {
    if (elections.length > 0 && !selectedElectionId) {
      // Find open or first election
      const open = elections.find(e => e.status === 'VOTING_OPEN');
      setSelectedElectionId(open ? open.id : elections[0].id);
    }
  }, [elections]);

  // Cryptographically realistic browser audio EVM Beep synthesizer!
  const playEvmBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      // Standard signature ECI EVM frequency is around 1050 Hz
      oscillator.frequency.setValueAtTime(1050, audioCtx.currentTime); 
      gainNode.gain.setValueAtTime(0.35, audioCtx.currentTime);
      
      // Steady sound
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 1800); // 1.8 seconds ECI standard beep
    } catch (e) {
      console.warn("Audio Context beep simulation blocked by browser sandbox policy.", e);
    }
  };

  const handleCastVote = async (cand) => {
    if (!selectedElectionId) return;
    setVoteCastingId(cand.id);
    setVoteCastingStep('beeping');
    playEvmBeep();

    // Show high-fidelity flashing red LED for 1.8 seconds, then record in database
    setTimeout(async () => {
      try {
        await api.votes.cast(selectedElectionId, currentUser.id, cand.id, cand.partyName || 'IND');
        
        // Generate mock digital cryptographic secure receipt
        const securityHash = 'sha256::' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
        setLastVoteReceipt({
          receiptId: `REC-${selectedElectionId.slice(-4).toUpperCase()}-${Math.floor(100000 + Math.random()*900000)}`,
          securityHash,
          timestamp: new Date().toLocaleString('en-IN'),
          candidateName: cand.name,
          partyName: cand.partyName,
          partySymbol: cand.partySymbol || '👤',
          constituency: cand.constituency || currentUser.constituency
        });

        setVoteCastingStep('finished');
        if (onVoteCast) {
          onVoteCast();
        }
      } catch (err) {
        console.error(err);
        alert("Electoral registry error: " + err.message);
        setVoteCastingStep('idle');
        setVoteCastingId(null);
      }
    }, 1800);
  };

  const selectedElection = elections.find(e => e.id === selectedElectionId);
  const alreadyVoted = votedStatusMap[selectedElectionId];

  // Filtering candidates by address/location AND ward/constituency number
  const filteredCandidates = candidates.filter(cand => {
    // Must match targeted election ID
    if (cand.electionId !== selectedElectionId) return false;

    // Filter by address (searches address details, city, or state)
    if (filterAddress) {
      const addrStr = `${cand.permAddress || ''} ${cand.cityGramNagar || ''} ${cand.state || ''}`.toLowerCase();
      if (!addrStr.includes(filterAddress.toLowerCase())) return false;
    }

    // Filter by Ward / Ward Number
    if (filterWard) {
      const wardStr = `${cand.wardNo || ''} ${cand.cityGramNagar || ''}`.toLowerCase();
      if (!wardStr.includes(filterWard.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <motion.div
      key="ballot_vote"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6 text-left"
    >
      
      {/* Visual EVM Flash overlay during beeping */}
      {voteCastingStep === 'beeping' && (
        <div className="fixed inset-0 bg-red-600/35 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-4 border-red-600 p-8 max-w-sm text-center shadow-2xl space-y-4 animate-bounce">
            <div className="w-8 h-8 rounded-full bg-red-600 mx-auto animate-ping"></div>
            <Volume2 className="w-12 h-12 text-red-600 mx-auto" />
            <h3 className="text-base font-black text-red-600 uppercase tracking-widest font-mono">⚠️ EVM BALLOT RECORDING</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Steady 1050Hz signature beep active. Cryptographic end-to-end ledger validation executing. Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Main Ballot header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-gray-400 block uppercase font-black">Electronic Polling Booth Terminal</span>
          <h2 className="text-base font-black text-gray-900">🗳️ ECI Secure Digital Ballot Unit</h2>
          <p className="text-xs text-gray-500 mt-1">
            Cast your statutory vote securely. Search, filter, and review asset disclosures of official nominees.
          </p>
        </div>

        {/* Election Selector Dropdown */}
        <div className="space-y-1 shrink-0">
          <label className="text-[10px] font-bold text-gray-400 uppercase block">Active Election Context</label>
          <select
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              setVoteCastingStep('idle');
              setLastVoteReceipt(null);
            }}
            className="bg-gray-150 border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-bold focus:outline-none"
          >
            {elections.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* If already voted, showcase receipt immediately */}
      {alreadyVoted && lastVoteReceipt && voteCastingStep === 'finished' && (
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 border-2 border-emerald-500/30 p-6 rounded-2xl text-emerald-950 space-y-4 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">✓</div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">BALLOT CAST CONFIRMED</span>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 block">ECI Cryptographic Receipt Code</span>
            <strong className="text-sm font-mono text-emerald-900 block select-all bg-white/60 p-2 rounded border border-emerald-100">{lastVoteReceipt.receiptId}</strong>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold pt-2 border-t border-emerald-200/50">
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Cast Nominee Name:</p>
              <p className="text-gray-900 font-bold">{lastVoteReceipt.candidateName} ({lastVoteReceipt.partyName})</p>
            </div>
            <div>
              <p className="text-gray-400 text-[10px] uppercase">Polling Session Timestamp:</p>
              <p className="text-gray-900 font-bold font-mono">{lastVoteReceipt.timestamp}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-400 text-[10px] uppercase">Ledger Integrity Seal Hash:</p>
              <p className="text-emerald-800 font-mono text-[10px] truncate select-all">{lastVoteReceipt.securityHash}</p>
            </div>
          </div>

          <p className="text-[10px] italic text-gray-400 border-t border-emerald-200/40 pt-3">
            In compliance with voter secrecy standards, ECI stores digital records in an end-to-end decoupled audit vault. Thank you for your democratic participation.
          </p>
        </motion.div>
      )}

      {alreadyVoted && !lastVoteReceipt && (
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-emerald-900 space-y-2 text-left">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <h4 className="font-extrabold text-sm">Democracy Duty Completed!</h4>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Your secure digital ballot has already been submitted and verified for <strong>{selectedElection?.title}</strong>. Your vote has been recorded securely. ECI guidelines prohibit double voting to protect electoral integrity.
          </p>
        </div>
      )}

      {/* FILTER CONTROLS & ACTIVE BALLOT SHEET (Only shown if NOT voted) */}
      {!alreadyVoted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SEARCH & FILTERS CONTROLS SIDEBAR */}
          <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-5 text-left">
            <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5 border-b pb-2">
              <Filter className="w-4 h-4 text-primary-900" />
              <span>Ballot Sheet Filters</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>Filter Candidate Address</span>
                </label>
                <input
                  type="text"
                  value={filterAddress}
                  onChange={(e) => setFilterAddress(e.target.value)}
                  placeholder="e.g. Bhopal, Arera, Mumbai"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none"
                />
                <span className="text-[9px] text-gray-400 block leading-tight">Filters nominee address declarations dynamically.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span>Filter Ward Number</span>
                </label>
                <input
                  type="text"
                  value={filterWard}
                  onChange={(e) => setFilterWard(e.target.value)}
                  placeholder="e.g. Ward 45, Ward 46"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-xs focus:bg-white focus:outline-none"
                />
                <span className="text-[9px] text-gray-400 block leading-tight">Enter ward number to check regional local nominees.</span>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-150 text-[11px] text-gray-500 space-y-1.5 leading-relaxed">
              <span className="font-bold text-gray-800 block">💡 Testing Quick Tip</span>
              Try searching <strong>"Bhopal"</strong> or <strong>"Ward 45"</strong> to view candidate listings that correspond with the mock nomination registry.
            </div>
          </div>

          {/* CANDIDATES DIRECTORY SHEET / EVM BUTTONS */}
          <div className="lg:col-span-2 space-y-4">
            
            <div className="bg-white py-3 px-4 rounded-xl border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-800">
                Nominees Matching: <strong className="text-primary-900 font-mono">{filteredCandidates.length}</strong>
              </span>
              <span className="text-[10px] text-gray-400">EPIC Voter Standard</span>
            </div>

            <div className="space-y-4">
              {filteredCandidates.map((cand) => (
                <div 
                  key={cand.id} 
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-200 transition-all text-left"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-primary-50 rounded-full border border-primary-100 flex items-center justify-center font-bold text-base text-primary-900 shrink-0">
                        {cand.partySymbol || '👤'}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-sm leading-tight">{cand.name}</h4>
                        <span className="text-[10px] bg-primary-50 text-primary-800 font-bold px-1.5 py-0.5 rounded border border-primary-200 inline-block mt-0.5">
                          {cand.partyName || 'Independent'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px] bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 font-semibold text-gray-600">
                      <div>
                        <span className="text-[9px] text-gray-400 block">WARD / SEAT</span>
                        <strong className="text-gray-800">{cand.wardNo || 'Ward 45'} • {cand.constituency || 'Bhopal'}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block">DISCLOSED ASSETS</span>
                        <strong className="text-emerald-700 font-mono">{cand.assets || '₹25,00,000'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[9px] text-gray-400 block">ADDRESS</span>
                        <strong className="text-gray-800 truncate block">{cand.permAddress || 'E-7, Arera Colony, Bhopal'}</strong>
                      </div>
                    </div>
                  </div>

                  {/* BLUE EVM CAST BALLOT BUTTON */}
                  <button
                    onClick={() => handleCastVote(cand)}
                    disabled={voteCastingId !== null}
                    className="w-full sm:w-auto px-5 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <span className="w-3 h-3 rounded-full bg-blue-300 animate-ping"></span>
                    <span>🗳️ PRESS TO VOTE</span>
                  </button>
                </div>
              ))}

              {filteredCandidates.length === 0 && (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
                  <span className="text-2xl block">🔍</span>
                  <p className="text-xs font-bold text-gray-500">No matching nominees found under your current search parameters.</p>
                  <p className="text-[11px] text-gray-400">Modify your Candidate Address or Ward Number search filters above.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </motion.div>
  );
}
