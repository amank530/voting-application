import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Election, PoliticalParty, Candidate, EciNotification, LiveStats } from '../types';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../lib/constants';
import { Search, Calendar, Landmark, Users, TrendingUp, Bell, MapPin, Award, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onOpenAuth: () => void;
  onNavigateToCandidateReg: () => void;
  currentUser: any;
}

export default function Dashboard({ onOpenAuth, onNavigateToCandidateReg, currentUser }: DashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [notifications, setNotifications] = useState<EciNotification[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats>({
    totalRegisteredVoters: 0,
    totalCandidates: 0,
    totalPoliticalParties: 0,
    totalElections: 0,
    votesCast: 0,
    turnoutPercent: 64.5
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [activeTab, setActiveTab] = useState<'elections' | 'parties' | 'candidates' | 'bulletins'>('elections');
  const [electionStatusFilter, setElectionStatusFilter] = useState<'ALL' | 'VOTING_OPEN' | 'REGISTRATION_OPEN' | 'RESULTS_PUBLISHED' | 'CREATED'>('ALL');

  // Countdown State
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchDashboardData();
    // Poll stats every 10 seconds for simulated WebSocket real-time feel
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Calculate countdown for "Lok Sabha General Elections 2026"
    const targetDate = new Date('2026-10-15T08:00:00');
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [elecList, partyList, candList, notifList] = await Promise.all([
        api.elections.list(),
        api.parties.list(),
        api.candidates.list(),
        api.notifications.list()
      ]);
      setElections(elecList);
      setParties(partyList);
      setCandidates(candList);
      setNotifications(notifList);
      await fetchStats();
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    }
  };

  const fetchStats = async () => {
    try {
      const stats = await api.stats.live();
      setLiveStats(stats);
    } catch (e) {
      console.error('Error fetching live stats:', e);
    }
  };

  // Helper lists based on state selection
  const districtsForState = INDIAN_REGIONS.find(r => r.state === selectedState)?.districts || [];
  const constituenciesForDistrict = districtsForState.find(d => d.name === selectedDistrict)?.constituencies || [];

  // Reset district/constituency on state reset
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedConstituency('');
  };

  const handleDistrictChange = (dist: string) => {
    setSelectedDistrict(dist);
    setSelectedConstituency('');
  };

  // Filter Logic
  const filteredElections = elections.filter(elec => {
    const matchesSearch = elec.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (elec.constituency && elec.constituency.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesState = !selectedState || elec.state === selectedState || elec.level === 'Lok Sabha (MP)' || elec.level === 'Rajya Sabha (MP)';
    const matchesDistrict = !selectedDistrict || elec.district === selectedDistrict || elec.level === 'Lok Sabha (MP)' || elec.level === 'Rajya Sabha (MP)';
    const matchesConstituency = !selectedConstituency || elec.constituency === selectedConstituency;
    const matchesLevel = !selectedLevel || elec.level === selectedLevel;
    const matchesStatus = electionStatusFilter === 'ALL' || elec.status === electionStatusFilter;
    
    return matchesSearch && matchesState && matchesDistrict && matchesConstituency && matchesLevel && matchesStatus;
  });

  const filteredCandidates = candidates.filter(cand => {
    const matchesSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (cand.partyName && cand.partyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          cand.constituency.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !selectedState || cand.state === selectedState;
    const matchesLevel = !selectedLevel || cand.electionLevel === selectedLevel;
    const isApproved = cand.status === 'APPROVED';
    return matchesSearch && matchesState && matchesLevel && isApproved;
  });

  const filteredParties = parties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.abbrev.toLowerCase().includes(searchTerm.toLowerCase());
    const isApproved = p.status === 'APPROVED';
    return matchesSearch && isApproved;
  });

  const statusBadges: Record<Election['status'], { text: string; bg: string; dot: string }> = {
    CREATED: { text: 'Upcoming', bg: 'bg-blue-50 text-blue-700 border border-blue-200', dot: 'bg-blue-500' },
    REGISTRATION_OPEN: { text: 'Nomination Open', bg: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
    CANDIDATE_LIST_PUBLISHED: { text: 'Candidates Decided', bg: 'bg-amber-50 text-amber-700 border border-amber-200', dot: 'bg-amber-500' },
    VOTING_OPEN: { text: 'LIVE VOTING', bg: 'bg-red-50 text-red-700 border border-red-200 animate-pulse', dot: 'bg-red-600' },
    VOTING_ENDED: { text: 'Polls Closed', bg: 'bg-gray-100 text-gray-700 border border-gray-300', dot: 'bg-gray-500' },
    RESULTS_PUBLISHED: { text: 'Results Declared', bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-600' },
    ARCHIVED: { text: 'Archived', bg: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-400' }
  };

  return (
    <div className="w-full pb-16">
      {/* Banner & Hero Section */}
      <div className="relative overflow-hidden bg-primary-800 text-white border-b-4 border-saffron-500 py-12 px-6 lg:px-12 eci-watermark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-saffron-600/20 text-saffron-500 border border-saffron-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              🇮🇳 Election Commission of India • Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white">
              National Election <span className="text-saffron-500">Management</span> & Security Core
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              Verify your eligibility, check state-wise candidates, browse active constituencies, and cast your cryptographic, AES-256 authenticated ballot. Fully compliant with democratic standards and digital identity verification.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <button 
                onClick={onOpenAuth}
                className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg font-medium transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                Cast Your Vote <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onNavigateToCandidateReg}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg font-medium transition duration-200 cursor-pointer"
              >
                Register as Candidate
              </button>
            </div>
          </div>

          {/* Election Countdown Box */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md w-full md:w-80 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-saffron-500/10 rounded-full blur-xl"></div>
            <h3 className="font-semibold text-saffron-500 text-sm tracking-wider uppercase mb-1">
              Next General Election Countdown
            </h3>
            <p className="text-xs text-gray-300 font-medium mb-4">Lok Sabha General Polls 2026</p>
            
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-primary-700/50 p-2.5 rounded-lg border border-white/10">
                <span className="block text-2xl font-bold font-display text-white">{countdown.days}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Days</span>
              </div>
              <div className="bg-primary-700/50 p-2.5 rounded-lg border border-white/10">
                <span className="block text-2xl font-bold font-display text-white">{countdown.hours}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Hrs</span>
              </div>
              <div className="bg-primary-700/50 p-2.5 rounded-lg border border-white/10">
                <span className="block text-2xl font-bold font-display text-white">{countdown.minutes}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Mins</span>
              </div>
              <div className="bg-primary-700/50 p-2.5 rounded-lg border border-white/10">
                <span className="block text-2xl font-bold font-display text-white">{countdown.seconds}</span>
                <span className="text-[10px] text-gray-400 uppercase font-medium">Secs</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-[10px] text-gray-400 border-t border-white/10 pt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ECI Certified Secure Live Rollout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Statistics Panel */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 bg-white p-5 rounded-2xl shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 p-2 border-r border-gray-100 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Voters</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.totalRegisteredVoters}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-r border-gray-100 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-saffron-50 rounded-xl text-saffron-500">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Candidates</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.totalCandidates}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-r border-gray-100 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Parties</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.totalPoliticalParties}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-r border-gray-100 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Elections</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.totalElections}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 border-r border-gray-100 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Votes Cast</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.votesCast}</h4>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 last:border-0 lg:col-span-1">
            <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Turnout</p>
              <h4 className="text-lg font-bold font-display text-primary-800">{liveStats.turnoutPercent}%</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Main Core Content / Advanced Filters Search */}
      <div className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Column - Advanced Multi-Filters & Search */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 text-base font-display flex items-center gap-2 pb-2 border-b border-gray-100">
              <Search className="w-4 h-4 text-primary-600" />
              Advanced Filters
            </h3>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Constituency, candidate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Select State</label>
              <select 
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
              >
                <option value="">-- All India State Elections --</option>
                {INDIAN_REGIONS.map((r, idx) => (
                  <option key={idx} value={r.state}>{r.state}</option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Select District</label>
              <select 
                value={selectedDistrict}
                disabled={!selectedState}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition disabled:opacity-50"
              >
                <option value="">-- Select District --</option>
                {districtsForState.map((d, idx) => (
                  <option key={idx} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Constituency Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Constituency Search</label>
              <select 
                value={selectedConstituency}
                disabled={!selectedDistrict}
                onChange={(e) => setSelectedConstituency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition disabled:opacity-50"
              >
                <option value="">-- Select Constituency --</option>
                {constituenciesForDistrict.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Level / Category Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Election Level</label>
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600 transition"
              >
                <option value="">-- All Levels --</option>
                {ELECTION_LEVELS.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(selectedState || selectedDistrict || selectedConstituency || selectedLevel || searchTerm) && (
              <button 
                onClick={() => {
                  setSelectedState('');
                  setSelectedDistrict('');
                  setSelectedConstituency('');
                  setSelectedLevel('');
                  setSearchTerm('');
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Quick Help Tip */}
          <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-primary-700 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              Role Testing Guide
            </h4>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              To simulate complete operations, switch roles in the top header menu. Try logging in with the predefined sandbox numbers listed in the dropdown tip.
            </p>
          </div>
        </div>

        {/* Right Content Column - Tabs, Lists & Tables */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('elections')}
              className={`pb-3 px-5 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${activeTab === 'elections' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Landmark className="w-4 h-4" />
              Elections Directory ({filteredElections.length})
            </button>
            <button 
              onClick={() => setActiveTab('candidates')}
              className={`pb-3 px-5 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${activeTab === 'candidates' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Users className="w-4 h-4" />
              Approved Candidates ({filteredCandidates.length})
            </button>
            <button 
              onClick={() => setActiveTab('parties')}
              className={`pb-3 px-5 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${activeTab === 'parties' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Award className="w-4 h-4" />
              Political Parties ({filteredParties.length})
            </button>
            <button 
              onClick={() => setActiveTab('bulletins')}
              className={`pb-3 px-5 font-semibold text-sm transition-all flex items-center gap-2 border-b-2 cursor-pointer ${activeTab === 'bulletins' ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Bell className="w-4 h-4" />
              ECI Bulletins ({notifications.length})
            </button>
          </div>

          {/* Tab Content Display */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'elections' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Status Toggle Filter on Top of Elections list */}
                  <div className="flex flex-wrap items-center gap-2 pb-2">
                    <span className="text-xs font-semibold text-gray-500 mr-2">Quick Status:</span>
                    {(['ALL', 'VOTING_OPEN', 'REGISTRATION_OPEN', 'RESULTS_PUBLISHED', 'CREATED'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setElectionStatusFilter(status)}
                        className={`px-3 py-1 text-xs rounded-full border transition cursor-pointer ${electionStatusFilter === status ? 'bg-primary-600 border-primary-600 text-white font-medium' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        {status === 'ALL' ? 'All Polls' : 
                         status === 'VOTING_OPEN' ? '🟢 Live Voting' :
                         status === 'REGISTRATION_OPEN' ? '🟠 Nominations' : 
                         status === 'RESULTS_PUBLISHED' ? '🔵 Results' : 'Upcoming'}
                      </button>
                    ))}
                  </div>

                  {filteredElections.length === 0 ? (
                    <div className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200">
                      <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-semibold">No Elections Found</h4>
                      <p className="text-xs text-gray-500 mt-1">Adjust filters or register a new simulated election via the ECI Super Admin console.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredElections.map((elec) => {
                        const badge = statusBadges[elec.status];
                        return (
                          <div 
                            key={elec.id} 
                            className="bg-white border border-gray-200 hover:border-primary-100 p-5 rounded-xl transition duration-200 hover:shadow-lg flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.bg}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                                  {badge.text}
                                </span>
                                <span className="text-[11px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                  {elec.level}
                                </span>
                              </div>

                              <div>
                                <h3 className="font-bold text-gray-900 text-base leading-snug hover:text-primary-700 transition">
                                  {elec.title}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                  {elec.state && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                      {elec.state} {elec.constituency && `• ${elec.constituency}`}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    Polls: {elec.votingDate}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Election Status Specific Footer Action */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-800">{elec.voteCount}</span> Votes Casted
                              </div>

                              {elec.status === 'VOTING_OPEN' && (
                                <button
                                  onClick={onOpenAuth}
                                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                                >
                                  Cast Ballot Now
                                </button>
                              )}

                              {elec.status === 'RESULTS_PUBLISHED' && (
                                <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 text-xs">
                                  🏆 Winner: <span className="font-bold">{elec.winnerName}</span> ({elec.winnerParty})
                                </div>
                              )}

                              {elec.status === 'REGISTRATION_OPEN' && (
                                <button
                                  onClick={onNavigateToCandidateReg}
                                  className="px-3.5 py-1.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                  Register Nomination
                                </button>
                              )}

                              {elec.status === 'CREATED' && (
                                <span className="text-xs text-gray-400 italic">Nomination list building</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'candidates' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredCandidates.length === 0 ? (
                    <div className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-semibold">No Approved Candidates</h4>
                      <p className="text-xs text-gray-500 mt-1">Adjust location/level filters or approve registrations in ECI Panel.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filteredCandidates.map((cand) => (
                        <div key={cand.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between">
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={cand.photo} 
                                alt={cand.name} 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-full object-cover border border-gray-200"
                              />
                              <div>
                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{cand.name}</h4>
                                <span className="text-xs text-gray-500 font-medium">Age: {cand.age} • {cand.education || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-gray-600">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Election:</span>
                                <span className="font-semibold text-gray-800 text-right max-w-[150px] truncate">{cand.electionTitle}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Constituency:</span>
                                <span className="font-semibold text-gray-800">{cand.constituency}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Affiliation:</span>
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${cand.isIndependent ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-700'}`}>
                                  {cand.isIndependent ? 'Independent' : `${cand.partyName} (${cand.partySymbol})`}
                                </span>
                              </div>
                              {cand.assets && (
                                <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
                                  <span className="text-gray-400 text-[10px]">Affidavit Assets:</span>
                                  <span className="font-semibold text-[10px] text-gray-700">{cand.assets}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                            <p className="text-[11px] text-gray-500 italic line-clamp-2">
                              "{cand.manifesto || 'No manifesto provided by candidate.'}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'parties' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {filteredParties.length === 0 ? (
                    <div className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200">
                      <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-semibold">No Registered Parties</h4>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredParties.map((p) => (
                        <div key={p.id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-xl border border-primary-100">
                              {p.symbol.includes(' ') ? p.symbol.split(' ')[1] || p.symbol[0] : p.symbol[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                                {p.name} 
                                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded font-mono font-bold">
                                  {p.abbrev}
                                </span>
                              </h3>
                              <p className="text-xs text-gray-500">Official ECI Authorized Symbol: <span className="font-medium text-gray-700">{p.symbol}</span></p>
                            </div>
                          </div>
                          
                          {p.manifesto && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs text-gray-600 leading-relaxed">
                              <span className="font-bold text-gray-700 block mb-1">Core Ideology & Manifesto:</span>
                              {p.manifesto}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'bulletins' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {notifications.length === 0 ? (
                    <div className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-gray-700 font-semibold">No Active Bulletins</h4>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`p-5 rounded-xl border flex gap-4 ${
                            notif.type === 'URGENT' 
                              ? 'bg-rose-50/50 border-rose-200' 
                              : notif.type === 'ELECTION' 
                                ? 'bg-orange-50/50 border-orange-200' 
                                : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded-lg h-fit ${
                            notif.type === 'URGENT' 
                              ? 'bg-rose-100 text-rose-700' 
                              : notif.type === 'ELECTION' 
                                ? 'bg-orange-100 text-orange-700' 
                                : 'bg-blue-100 text-blue-700'
                          }`}>
                            <Bell className="w-5 h-5" />
                          </div>

                          <div className="space-y-1 w-full">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-bold text-gray-900 text-sm">{notif.title}</h4>
                              <span className="text-[10px] font-mono text-gray-400">
                                {new Date(notif.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">{notif.content}</p>
                            {notif.type === 'URGENT' && (
                              <span className="inline-block mt-2 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded uppercase tracking-wider">
                                High Priority compliance
                              </span>
                            )}
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
    </div>
  );
}
