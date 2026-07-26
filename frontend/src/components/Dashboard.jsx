import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getNormalizedLevel } from '../services/electionHierarchy';

// Modular Subcomponents Imports
import LandingHero from '../components/LandingHero';
import LiveTurnoutScoreboard from '../components/LiveTurnoutScoreboard';
import CandidateStandingsGraph from '../components/CandidateStandingsGraph';

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

  // Loading
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
    <div id="public-landing-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 text-left">
      
      {/* 1. HEADER HERO SECTION (MODULAR) */}
      <LandingHero 
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
        onNavigateToVoterPortal={onNavigateToVoterPortal}
        votedCheckLoading={votedCheckLoading}
        hasAlreadyVoted={hasAlreadyVoted}
        liveStats={liveStats}
      />

      {/* 2. NATIONAL LIVE TURNOUT & SEATS SCOREBOARD (MODULAR) */}
      <LiveTurnoutScoreboard 
        leaderboardData={getLeaderboardData()}
      />

      {/* 3. LIVE CANDIDATES WINNING STATUS GRAPH & FILTERS (MODULAR) */}
      <CandidateStandingsGraph 
        hierarchyFilters={hierarchyFilters}
        setHierarchyFilters={setHierarchyFilters}
        filterLevel={filterLevel}
        setFilterLevel={setFilterLevel}
        filterState={filterState}
        setFilterState={setFilterState}
        filterElectionId={filterElectionId}
        setFilterElectionId={setFilterElectionId}
        elections={elections}
        uniqueStates={uniqueStates}
        leadingCandidate={leadingCandidate}
        graphCandidates={graphCandidates}
      />

    </div>
  );
}
