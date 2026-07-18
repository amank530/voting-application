import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../services/constants';
import ElectionHierarchyEngine from '../components/ElectionHierarchyEngine';
import { getNormalizedLevel } from '../services/electionHierarchy';
import { 
  Search, Calendar, Landmark, Users, TrendingUp, Bell, MapPin, 
  Award, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, RefreshCw, Sparkles, Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

export default function Dashboard({ 
  onOpenAuth, 
  onNavigateToCandidateReg, 
  onNavigateToCandidates, 
  onNavigateToParties, 
  onNavigateToVoterPortal, 
  currentUser 
}) {
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [liveStats, setLiveStats] = useState({
    totalRegisteredVoters: 953400200,
    totalCandidates: 8400,
    totalPoliticalParties: 54,
    totalElections: 12,
    votesCast: 618452000,
    turnoutPercent: 67.4
  });

  // Loading & error
  const [loading, setLoading] = useState(true);

  // Voted Check Status
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [votedCheckLoading, setVotedCheckLoading] = useState(false);

  // Filters for Live Candidates Standings Graph
  const [filterElectionId, setFilterElectionId] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [hierarchyFilters, setHierarchyFilters] = useState({
    level: 'all',
    state: '',
    district: '',
    constituency: '',
    city: '',
    town: '',
    municipalCorporation: '',
    municipalCouncil: '',
    nagarPanchayat: '',
    block: '',
    gramPanchayat: '',
    wardNo: '',
    position: ''
  });

  useEffect(() => {
    fetchDashboardData();
    // Simulate real-time ticking for counts
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        votesCast: prev.votesCast + Math.floor(Math.random() * 5)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser && elections.length > 0) {
      checkVotedStatus();
    }
  }, [currentUser, elections]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [elecList, partyList, candList] = await Promise.all([
        api.elections.list().catch(() => []),
        api.parties.list().catch(() => []),
        api.candidates.list().catch(() => [])
      ]);
      setElections(elecList || []);
      setParties(partyList || []);
      setCandidates(candList || []);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  const checkVotedStatus = async () => {
    setVotedCheckLoading(true);
    try {
      let votedAny = false;
      for (const e of elections) {
        const res = await api.votes.status(currentUser.id, e.id).catch(() => ({ hasVoted: false }));
        if (res && res.hasVoted) {
          votedAny = true;
          break;
        }
      }
      setHasAlreadyVoted(votedAny);
    } catch (e) {
      console.error('Error in voted check:', e);
    } finally {
      setVotedCheckLoading(false);
    }
  };

  // Turnout & Seats calculation from database
  const getLeaderboardData = () => {
    const partyWinsCount = {};
    const partyLeadsCount = {};
    
    parties.forEach(p => {
      partyWinsCount[p.name] = 0;
      partyLeadsCount[p.name] = 0;
    });
    partyWinsCount['Independent'] = 0;
    partyLeadsCount['Independent'] = 0;

    elections.forEach(elec => {
      if (elec.status === 'RESULTS_PUBLISHED' && elec.winnerParty) {
        const pName = elec.winnerParty;
        partyWinsCount[pName] = (partyWinsCount[pName] || 0) + 1;
      } else {
        const elecCands = candidates.filter(c => c.electionId === elec.id && c.status === 'APPROVED');
        if (elecCands.length > 0) {
          let topCand = elecCands[0];
          let topVotes = -1;
          elecCands.forEach(c => {
            const cVotes = c.votesCount || 0;
            if (cVotes > topVotes) {
              topVotes = cVotes;
              topCand = c;
            }
          });
          const pName = topCand.isIndependent ? 'Independent' : (topCand.partyName || 'Independent');
          partyLeadsCount[pName] = (partyLeadsCount[pName] || 0) + 1;
        }
      }
    });

    const allParties = Array.from(new Set([...Object.keys(partyWinsCount), ...Object.keys(partyLeadsCount)]));

    return allParties.map(pName => {
      const partyObj = parties.find(p => p.name === pName);
      const wins = partyWinsCount[pName] || 0;
      const leads = partyLeadsCount[pName] || 0;
      const seats = wins + leads;
      return {
        name: partyObj ? partyObj.abbrev : pName.substring(0, 3).toUpperCase(),
        fullName: pName,
        wins,
        leads,
        seats,
        color: pName.includes('Bharatiya') ? '#f97316' : 
               pName.includes('Congress') ? '#2563eb' : 
               pName.includes('Aam') ? '#059669' : '#6b7280'
      };
    }).filter(p => p.seats > 0).sort((a, b) => b.seats - a.seats);
  };

  // Fetch approved candidates and apply Address / Level / Election filters
  const getFilteredCandidatesForGraph = () => {
    return candidates.filter(cand => {
      // Must be approved nominee
      if (cand.status !== 'APPROVED') return false;

      // Filter by Address (State)
      if (filterState !== 'all' && cand.state !== filterState) return false;

      // Filter by Election ID
      if (filterElectionId !== 'all' && cand.electionId !== filterElectionId) return false;

      // Filter by Election level
      if (filterLevel !== 'all' && cand.electionLevel !== filterLevel) return false;

      // Filter by unified cascading hierarchy filters
      if (hierarchyFilters.level !== 'all') {
        const normFilterLvl = getNormalizedLevel(hierarchyFilters.level);
        const normCandLvl = getNormalizedLevel(cand.electionLevel);
        if (normFilterLvl !== normCandLvl) return false;

        // Apply cascading geographical limits if active
        if (hierarchyFilters.state && cand.state !== hierarchyFilters.state) return false;
        if (hierarchyFilters.district && cand.district !== hierarchyFilters.district) return false;
        if (hierarchyFilters.constituency && cand.constituency !== hierarchyFilters.constituency) return false;
        if (hierarchyFilters.city && cand.city !== hierarchyFilters.city) return false;
        if (hierarchyFilters.town && cand.town !== hierarchyFilters.town) return false;
        if (hierarchyFilters.municipalCorporation && cand.municipalCorporation !== hierarchyFilters.municipalCorporation) return false;
        if (hierarchyFilters.municipalCouncil && cand.municipalCouncil !== hierarchyFilters.municipalCouncil) return false;
        if (hierarchyFilters.nagarPanchayat && cand.nagarPanchayat !== hierarchyFilters.nagarPanchayat) return false;
        if (hierarchyFilters.block && cand.block !== hierarchyFilters.block) return false;
        if (hierarchyFilters.gramPanchayat && cand.gramPanchayat !== hierarchyFilters.gramPanchayat) return false;
        if (hierarchyFilters.wardNo && cand.wardNo !== hierarchyFilters.wardNo) return false;
        if (hierarchyFilters.position && cand.position !== hierarchyFilters.position) return false;
      }

      return true;
    }).map(c => ({
      name: c.name,
      party: c.partyName || 'Independent',
      symbol: c.partySymbol || '👤',
      votes: c.votesCount || 0,
      constituency: c.constituency,
      state: c.state,
      level: c.electionLevel
    })).sort((a, b) => b.votes - a.votes);
  };

  const graphCandidates = getFilteredCandidatesForGraph();
  const leadingCandidate = graphCandidates.length > 0 ? graphCandidates[0] : null;

  // Extract unique states from approved candidates for filters
  const uniqueStates = [...new Set(candidates.filter(c => c.status === 'APPROVED' && c.state).map(c => c.state))];

  return (
    <div id="public-landing-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 animate-fade-in text-left">
      
      {/* HEADER HERO SECTION */}
      <section className="bg-gradient-to-br from-gray-900 via-slate-950 to-black rounded-xl shadow-md text-white overflow-hidden border border-gray-800 relative">
        <div className="absolute top-0 right-0 p-2 opacity-5 font-black text-5xl tracking-tighter select-none pointer-events-none font-sans">ECI</div>
        <div className="p-4 md:p-5 space-y-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-saffron-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  ECI Digital Registry Node
                </span>
                <span className="text-[9px] text-gray-400 font-mono">Live Sync Engine v3.2</span>
              </div>
              <h1 className="text-lg md:text-xl font-black font-display tracking-tight text-white">
                Election Commission of India National Lander
              </h1>
              <p className="text-[11px] text-gray-300 leading-relaxed font-semibold">
                Welcome to the sovereign, identity-authenticated central monitoring node. This portal displays live national voter turnouts, win margin scoreboards, and audited Form 26 candidate disclosures.
              </p>
            </div>

            {/* LIVE SYSTEM TIME & SECURE STATS */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-1 min-w-[220px] text-[11px]">
              <span className="text-[8px] font-black text-saffron-400 uppercase tracking-widest block border-b border-white/10 pb-0.5">Sovereign Cloud Health</span>
              <div className="space-y-1 font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-400">Database Core:</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Simulated Ballots:</span>
                  <span className="text-white font-mono font-bold">{liveStats.votesCast.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg. Turnout:</span>
                  <span className="text-saffron-300 font-mono font-bold">{liveStats.turnoutPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC VOTE ENFORCEMENT & BUTTON */}
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-lg max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5 text-center sm:text-left flex-1">
              <h3 className="text-[11px] font-black text-white font-display flex items-center gap-1.5 justify-center sm:justify-start">
                <ShieldCheck className="w-3.5 h-3.5 text-saffron-500" />
                <span>Constitutional Security Protocol</span>
              </h3>
              <p className="text-[10px] text-gray-400 leading-normal max-w-md">
                Every Indian citizen is protected by Article 326 of the Constitution. Double-voting checks are dynamically enforced by regional servers.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              {votedCheckLoading ? (
                <div className="px-3 py-1.5 bg-gray-800 text-gray-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Checking credentials...
                </div>
              ) : !currentUser ? (
                <button
                  onClick={onOpenAuth}
                  className="w-full sm:w-auto px-4 py-2 bg-saffron-500 hover:bg-saffron-600 active:scale-[0.98] text-white font-extrabold uppercase tracking-wider rounded-lg text-[9px] transition shadow-md shadow-saffron-500/20 cursor-pointer flex items-center justify-center gap-1"
                >
                  🔐 Aadhaar Login & Vote
                </button>
              ) : hasAlreadyVoted ? (
                <div className="px-3 py-2 bg-emerald-950/70 border border-emerald-800/80 rounded-lg text-[9px] font-black text-emerald-400 text-center flex items-center gap-1 justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>🗳️ BALLOT RECORDED (1/1)</span>
                </div>
              ) : (
                <button
                  onClick={onNavigateToVoterPortal}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.97] text-white font-black uppercase tracking-wider rounded-lg text-[9px] transition shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1 animate-pulse"
                >
                  🗳️ PRESS TO CAST BALLOT NOW
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: NATIONAL LIVE TURNOUT & SEATS SCOREBOARD */}
      <section className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
        <div className="flex items-center gap-2 border-b pb-3.5">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <div>
            <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider">National Live Turnout & Win Margin Scoreboard</h2>
            <p className="text-[11px] text-gray-400">Aggregated seat declarations and leads captured in real-time across all state spheres.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Seats breakdown (semi-circle bar) */}
          <div className="lg:col-span-5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-6">
            <div className="space-y-1 text-center lg:text-left">
              <span className="text-[9px] font-black text-gray-400 block uppercase font-mono">18th Lok Sabha Coalition Ledger</span>
              <h4 className="font-extrabold text-sm text-gray-950">Lok Sabha Consolidated Seat Shares</h4>
              <p className="text-[10px] text-gray-500 leading-normal">Simulated representation of 543 total parliamentary constituencies. Majority target is 272.</p>
            </div>

            <div className="flex flex-col items-center justify-center relative">
              {/* Semi-circular progressive bar */}
              <div className="w-full max-w-[260px] h-32 flex items-end justify-center relative overflow-hidden">
                <div className="w-full h-52 border-[18px] border-gray-200 rounded-full flex items-center justify-center absolute bottom-[-100px]">
                  {/* Saffron and Blue arcs representation */}
                  <div className="w-full h-full border-[18px] border-saffron-500 rounded-full absolute clip-half rotate-45 opacity-90"></div>
                </div>
                
                <div className="absolute bottom-0 text-center flex flex-col items-center">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">MAJORITY LEVEL</span>
                  <span className="text-2xl font-black text-gray-950 font-mono">543 SEATS</span>
                  <span className="text-[10px] bg-primary-900 text-white font-extrabold px-2 py-0.5 rounded-full mt-1.5">
                    Target: 272 Wins
                  </span>
                </div>
              </div>

              {/* Legends */}
              <div className="grid grid-cols-3 gap-2.5 w-full pt-4 text-center text-[10px] font-bold text-gray-600">
                <div className="p-2 bg-saffron-50 rounded-lg border border-saffron-100 text-saffron-900">
                  <span className="block text-xs font-mono font-black">Saffron Coalition</span>
                  <span>NDA Alliance</span>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100 text-blue-900">
                  <span className="block text-xs font-mono font-black">Blue Alliance</span>
                  <span>INDIA Alliance</span>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-800">
                  <span className="block text-xs font-mono font-black">Others</span>
                  <span>Independents</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seats scoreboard table */}
          <div className="lg:col-span-7 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
            <div className="grid grid-cols-4 gap-2 bg-gray-50 border-b border-gray-100 px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center select-none">
              <div className="text-left">Political Alliance / Party</div>
              <div>Confirmed Wins</div>
              <div>Active Leads</div>
              <div className="text-right">Total Seats</div>
            </div>

            <div className="divide-y divide-gray-150/70 flex-1 max-h-[250px] overflow-y-auto">
              {getLeaderboardData().map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 px-4 py-3 items-center text-center text-xs font-bold hover:bg-gray-50/50 transition">
                  <div className="text-left font-black text-gray-900 truncate flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }}></span>
                    <span className="truncate">{p.fullName} ({p.name})</span>
                  </div>
                  <div className="text-emerald-700 font-mono text-sm">{p.wins}</div>
                  <div className="text-amber-600 font-mono text-sm">{p.leads}</div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-lg font-mono font-black text-white text-xs shadow-3xs" style={{ backgroundColor: p.color }}>
                      {p.seats}
                    </span>
                  </div>
                </div>
              ))}

              {getLeaderboardData().length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400 font-semibold italic">
                  No active seats reported. Simulated results trigger upon votes submission.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: LIVE CANDIDATES WINNING STATUS GRAPH */}
      <section className="bg-white p-6 rounded-2xl border border-gray-150 shadow-xs space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-saffron-600" />
            <div>
              <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider">Live Nominee Standing & Winning Status</h2>
              <p className="text-[11px] text-gray-400">Audited live votes count matching your selected regional filters.</p>
            </div>
          </div>

          <div className="text-xs font-black text-saffron-700 bg-saffron-50 px-3 py-1 rounded border border-saffron-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>ECI Official Count Server</span>
          </div>
        </div>

        {/* CONTROLS FILTERS */}
        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-150 space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Election Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Filter className="w-3 h-3 text-gray-400" /> Filter Election Level
              </label>
              <select
                value={hierarchyFilters.level}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterLevel(val);
                  setFilterElectionId('all');
                  setHierarchyFilters({
                    level: val,
                    state: '',
                    district: '',
                    constituency: '',
                    city: '',
                    town: '',
                    municipalCorporation: '',
                    municipalCouncil: '',
                    nagarPanchayat: '',
                    block: '',
                    gramPanchayat: '',
                    wardNo: '',
                    position: ''
                  });
                }}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-gray-800"
              >
                <option value="all">All Election Levels</option>
                {ELECTION_LEVELS.map((level, idx) => (
                  <option key={idx} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Address Filter (State) */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" /> Filter State Address
              </label>
              <select
                value={filterState}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterState(val);
                  setHierarchyFilters(h => ({ ...h, state: val === 'all' ? '' : val }));
                }}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-gray-800"
              >
                <option value="all">All States</option>
                {uniqueStates.map((state, idx) => (
                  <option key={idx} value={state}>{state}</option>
                ))}
              </select>
            </div>

            {/* Specific Election Poll */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" /> Filter Active Election
              </label>
              <select
                value={filterElectionId}
                onChange={(e) => setFilterElectionId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 font-bold text-gray-800"
              >
                <option value="all">All Active Elections</option>
                {elections.map((elec, idx) => (
                  <option key={idx} value={elec.id}>{elec.title}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Render cascading filters if a level is selected */}
          {hierarchyFilters.level !== 'all' && (
            <div className="border-t border-gray-200/60 pt-4 bg-white/40 p-3 rounded-lg transition-all">
              <span className="text-[9px] font-black uppercase text-gray-400 block mb-2">
                Faceted Cascading Search Parameters
              </span>
              <ElectionHierarchyEngine
                level={hierarchyFilters.level}
                formValues={hierarchyFilters}
                onChange={(updated) => setHierarchyFilters(updated)}
                showBreadcrumbs={true}
              />
            </div>
          )}

        </div>

        {/* RESULTS LEADING CORNER HIGHLIGHT CARD */}
        {leadingCandidate && (
          <div className="bg-gradient-to-r from-saffron-500/10 via-amber-500/5 to-white p-4.5 rounded-2xl border border-saffron-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-saffron-500 rounded-full animate-ping"></span>
                <span className="text-[9px] font-black uppercase tracking-wider text-saffron-800">Constituency Front-runner</span>
              </div>
              <h3 className="text-base font-black text-gray-950 font-display flex items-center gap-2">
                <span>{leadingCandidate.symbol}</span>
                <span>{leadingCandidate.name}</span>
                <span className="text-xs font-normal text-gray-400">({leadingCandidate.party})</span>
              </h3>
              <p className="text-[11px] text-gray-500">
                Currently leading in <strong>{leadingCandidate.constituency} ({leadingCandidate.state})</strong> seat target under <strong>{leadingCandidate.level}</strong>.
              </p>
            </div>

            <div className="bg-white border border-saffron-100 p-3 rounded-xl shadow-3xs text-center min-w-[150px]">
              <span className="text-[9px] font-black text-gray-400 block uppercase">Audited Votes Count</span>
              <strong className="text-lg font-mono font-black text-emerald-700">{leadingCandidate.votes.toLocaleString()}</strong>
              <span className="text-[9px] text-gray-400 block leading-tight mt-0.5">Live Core Sync</span>
            </div>
          </div>
        )}

        {/* GRAPH VIEW */}
        <div className="space-y-4">
          {graphCandidates.length > 0 ? (
            <div className="space-y-6">
              
              {/* RECHARTS VISUALIZATION */}
              <div className="h-72 w-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={graphCandidates.slice(0, 8)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fontWeight: 'bold', fill: '#4b5563' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 9, fontWeight: 'bold', fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', fontSize: '11px', textAlign: 'left' }}
                      formatter={(value, name, props) => [`${value.toLocaleString()} Votes`, 'Audited Ballots']}
                      labelFormatter={(name) => `Nominee: ${name}`}
                    />
                    <Bar dataKey="votes" radius={[10, 10, 0, 0]}>
                      {graphCandidates.slice(0, 8).map((entry, index) => {
                        const pName = entry.party;
                        const barColor = pName.includes('Bharatiya') ? '#f97316' : 
                                         pName.includes('Congress') ? '#2563eb' : 
                                         pName.includes('Aam') ? '#059669' : '#3b82f6';
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* DETAILED STATS LIST */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Nominee Standings Registry (Filtered)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {graphCandidates.map((cand, idx) => (
                    <div 
                      key={idx} 
                      className="bg-white p-4 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between hover:border-gray-250 transition text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center font-black text-sm text-gray-700 border border-gray-150 shrink-0 select-none">
                          {cand.symbol}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-gray-950 truncate leading-snug flex items-center gap-1">
                            <span>{cand.name}</span>
                            {idx === 0 && <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-200">Leading</span>}
                          </h4>
                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide block truncate">{cand.party} • {cand.constituency}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs font-black text-gray-900 shrink-0">
                        {cand.votes.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal font-sans">votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-gray-50/50 py-16 text-center rounded-2xl border border-dashed border-gray-200/80 space-y-3">
              <span className="text-2xl block select-none">🔍</span>
              <p className="text-xs font-black text-gray-500">No active candidate records match your current filters.</p>
              <p className="text-[10px] text-gray-400">Try changing the State Address or Election Level filters above.</p>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
