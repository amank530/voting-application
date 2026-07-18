import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../services/constants';
import { Search, MapPin, ArrowLeft, RefreshCw, Award, Users, CheckCircle, FileSpreadsheet, ShieldAlert, Sparkles, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

export default function CandidateProfilesPage({ currentUser, onNavigateToHome, onNavigateToReg, onOpenAuth }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedConstituency, setSelectedConstituency] = useState('');
  const [selectedCityGramNagar, setSelectedCityGramNagar] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const list = await api.candidates.list();
      setCandidates(list);
    } catch (e) {
      console.error('Error fetching candidates:', e);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic runtime location lists aggregated from static INDIAN_REGIONS and live candidate profiles
  const availableStates = [...new Set([
    ...INDIAN_REGIONS.map(r => r.state),
    ...candidates.map(c => c.state).filter(Boolean)
  ])];

  const availableDistricts = selectedState 
    ? [...new Set([
        ...(INDIAN_REGIONS.find(r => r.state === selectedState)?.districts.map(d => d.name) || []),
        ...candidates.filter(c => c.state === selectedState).map(c => c.district).filter(Boolean)
      ])]
    : [];

  const availableConstituencies = selectedDistrict
    ? [...new Set([
        ...(INDIAN_REGIONS.find(r => r.state === selectedState)?.districts.find(d => d.name === selectedDistrict)?.constituencies || []),
        ...candidates.filter(c => c.state === selectedState && c.district === selectedDistrict).map(c => c.constituency).filter(Boolean)
      ])]
    : [];

  const availableCitiesGrams = selectedDistrict
    ? [...new Set([
        ...candidates.filter(c => c.state === selectedState && c.district === selectedDistrict).map(c => c.cityGramNagar).filter(Boolean)
      ])]
    : [];

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedConstituency('');
    setSelectedCityGramNagar('');
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedConstituency('');
    setSelectedCityGramNagar('');
  };

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    setSelectedConstituency('');
    setSelectedCityGramNagar('');
  };

  const isNagarPanchayat = selectedLevel === 'Nagar Panchayat';
  const isWorkflowSatisfied = (() => {
    if (!selectedLevel) return false;
    if (isNagarPanchayat) {
      return !!(selectedState && selectedDistrict && selectedCityGramNagar);
    } else {
      return !!(selectedState && selectedDistrict && selectedConstituency);
    }
  })();

  // Filter approved candidates based on dynamic levels & location details
  const filteredCandidates = candidates.filter((cand) => {
    // Show approved candidates
    if (cand.status !== 'APPROVED') return false;

    const matchesSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (cand.partyName && cand.partyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (cand.constituency && cand.constituency.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (cand.cityGramNagar && cand.cityGramNagar.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = !selectedLevel || cand.electionLevel === selectedLevel;
    const matchesState = !selectedState || cand.state === selectedState;
    const matchesDistrict = !selectedDistrict || cand.district === selectedDistrict;
    
    if (selectedLevel === 'Nagar Panchayat') {
      const matchesCityGram = !selectedCityGramNagar || cand.cityGramNagar === selectedCityGramNagar;
      return matchesSearch && matchesLevel && matchesState && matchesDistrict && matchesCityGram;
    } else {
      const matchesConstituency = !selectedConstituency || cand.constituency === selectedConstituency;
      return matchesSearch && matchesLevel && matchesState && matchesDistrict && matchesConstituency;
    }
  });

  // Check if currentUser already has an active nomination
  const userNomination = currentUser ? candidates.find(c => c.mobileNumber === currentUser.mobileNumber) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToHome}
            className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition cursor-pointer"
            title="Go to National Lander"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-saffron-600" />
              <h1 className="text-xl font-bold font-display text-gray-950">Approved Candidate Files</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Verify statutory affidavits, asset declarations, and official candidate tickets in accordance with ECI guidelines.
            </p>
          </div>
        </div>

        <button
          onClick={fetchCandidates}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Registry</span>
        </button>
      </div>

      {/* Dynamic Candidate console banner for guests/unauthenticated users */}
      {!currentUser && (
        <div className="bg-gradient-to-r from-gray-50 to-slate-100 rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-extrabold text-gray-900 font-display flex items-center gap-2 justify-center sm:justify-start">
              <Sparkles className="w-4 h-4 text-saffron-500 animate-pulse" />
              <span>Are you interested in contesting the 2026 Elections?</span>
            </h3>
            <p className="text-xs text-gray-500">Sign in to your Citizen/Voter profile with Aadhaar to unlock the ECI 7-Step Nomination Form 26 Wizard.</p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-lg text-xs shadow-md transition whitespace-nowrap cursor-pointer"
          >
            🔑 Log In to File Nomination
          </button>
        </div>
      )}

      {/* Dynamic Candidate console banner for logged in users */}
      {currentUser && (
        <div className="bg-gradient-to-r from-primary-800 to-primary-950 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 translate-x-12 -translate-y-6">
            <Award className="w-64 h-64" />
          </div>

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-saffron-500 text-primary-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">
                Electoral Console
              </span>
              <span className="text-[10px] text-gray-300 font-mono">Mobile Auth Verified</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-extrabold font-display">Namaste, {currentUser.name}</h2>
              <p className="text-xs text-gray-300 leading-relaxed">
                As a registered citizen on the ECI Core server, you can view the active candidate registers or file an official nomination form for open parliamentary seats.
              </p>
            </div>

            {userNomination ? (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Active Nomination Filed: Form 26 Affidavit Locked</span>
                  </div>
                  <p className="text-[10px] text-gray-300 font-mono">
                    Election: {userNomination.electionTitle} • Constituency: {userNomination.constituency}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  userNomination.status === 'APPROVED' ? 'bg-emerald-500 text-white' : 'bg-saffron-500 text-gray-950 animate-pulse'
                }`}>
                  Status: {userNomination.status}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onNavigateToReg}
                  className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-gray-950 font-black rounded-lg text-xs shadow-md shadow-saffron-500/20 transition cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>📝 Fill Form 26 Nomination Form</span>
                </button>
                <div className="text-[10px] text-gray-400">
                  Must be at least 25 years of age and meet Indian legal requirements.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Location Filters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          
          {/* 1. Election Level - FIRST STEP REQUIREMENT */}
          <div className="space-y-1 md:col-span-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1">
              <span className="text-saffron-600">★</span> 1. Election Level (Required First)
            </label>
            <select 
              value={selectedLevel} 
              onChange={(e) => handleLevelChange(e.target.value)}
              className="w-full bg-saffron-50/30 border border-saffron-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
            >
              <option value="">-- Choose level first --</option>
              {ELECTION_LEVELS.map((level, idx) => (
                <option key={idx} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* 2. Keyword Search */}
          <div className="space-y-1 md:col-span-3">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Name, party, seat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Location Filters - ONLY VISIBLE IF ELECTION LEVEL FILLED */}
          {selectedLevel ? (
            <>
              {/* 3. State */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none focus:ring-1"
                >
                  <option value="">All States</option>
                  {availableStates.map((state, idx) => (
                    <option key={idx} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* 4. District */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase">District</label>
                <select 
                  value={selectedDistrict} 
                  disabled={!selectedState}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none disabled:opacity-50"
                >
                  <option value="">{selectedState ? 'All Districts' : 'Select State First'}</option>
                  {availableDistricts.map((dist, idx) => (
                    <option key={idx} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* 5. Level Dependent Field (State + District + City/Gram/Nagar for Nagar Panchayat, otherwise State + District + Constituency) */}
              {selectedLevel === 'Nagar Panchayat' ? (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
                    City / Gram / Nagar
                  </label>
                  <select 
                    value={selectedCityGramNagar} 
                    disabled={!selectedDistrict}
                    onChange={(e) => setSelectedCityGramNagar(e.target.value)}
                    className="w-full bg-amber-50/40 border border-amber-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none disabled:opacity-50 font-medium text-amber-900"
                  >
                    <option value="">{selectedDistrict ? 'All Cities/Grams' : 'Select District First'}</option>
                    {availableCitiesGrams.map((cg, idx) => (
                      <option key={idx} value={cg}>{cg}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-primary-600 uppercase flex items-center gap-1">
                    Constituency Seat
                  </label>
                  <select 
                    value={selectedConstituency} 
                    disabled={!selectedDistrict}
                    onChange={(e) => setSelectedConstituency(e.target.value)}
                    className="w-full bg-primary-50/40 border border-primary-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none disabled:opacity-50 font-medium text-primary-900"
                  >
                    <option value="">{selectedDistrict ? 'All Constituencies' : 'Select District First'}</option>
                    {availableConstituencies.map((constit, idx) => (
                      <option key={idx} value={constit}>{constit}</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="md:col-span-6 flex items-center justify-center bg-saffron-50/20 border border-dashed border-saffron-200/50 rounded-xl p-3 text-[11px] text-saffron-800">
              <Sparkles className="w-3.5 h-3.5 text-saffron-500 mr-2 animate-pulse" />
              <span>Please select an <strong>Election Level</strong> first to unlock precise location filter options.</span>
            </div>
          )}

        </div>

        {!isWorkflowSatisfied && (
          <div className="text-[11px] text-primary-700 bg-primary-50/50 rounded-lg p-3 border border-primary-100/50 flex flex-col items-center gap-1.5 justify-center text-center">
            <div className="flex items-center gap-1.5 font-bold text-primary-900">
              <Sparkles className="w-3.5 h-3.5 text-saffron-500 animate-pulse" />
              <span>Search Workflow Progress Indicator</span>
            </div>
            {!selectedLevel ? (
              <span className="text-gray-600">Please choose an <strong>Election Level</strong> first to begin your search.</span>
            ) : isNagarPanchayat ? (
              <span className="text-gray-600">
                To view candidate files for <strong>Nagar Panchayat</strong>, please select all mandatory fields: <strong className="text-saffron-700">State</strong> &rarr; <strong className="text-saffron-700">District</strong> &rarr; <strong className="text-saffron-700">City / Gram / Nagar</strong>.
              </span>
            ) : (
              <span className="text-gray-600">
                To view candidate files for <strong>{selectedLevel}</strong>, please select all mandatory fields: <strong className="text-primary-700">State</strong> &rarr; <strong className="text-primary-700">District</strong> &rarr; <strong className="text-primary-700">Constituency Seat</strong>.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Approved Candidate Registers */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">Approved Candidates List ({filteredCandidates.length})</h2>
        
        {loading ? (
          <div className="bg-white py-12 text-center rounded-2xl border border-gray-100 text-gray-400 text-xs">
            Loading candidate portfolios from the ECI central database...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-400 text-xs space-y-2">
            <ShieldAlert className="w-8 h-8 text-saffron-500 mx-auto" />
            <p>No verified candidate registers match the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((cand) => (
              <div key={cand.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden hover:shadow-md hover:border-primary-100 transition flex flex-col justify-between">
                <div className="p-5 space-y-4">
                  <div className="flex gap-4">
                    <img 
                      src={cand.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                      alt={cand.name}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-extrabold text-gray-950 text-sm font-display leading-tight">{cand.name}</h4>
                      <span className="text-[10px] font-mono font-bold text-primary-600 block mt-0.5">
                        {cand.isIndependent ? 'Independent Candidate' : `${cand.partyName} (${cand.partySymbol})`}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded uppercase">
                          Age: {cand.age}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          cand.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-saffron-50 text-saffron-700'
                        }`}>
                          {cand.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs border-t border-gray-50 pt-3">
                    <div className="flex justify-between text-gray-400">
                      <span>Election Level</span>
                      <span className="text-gray-900 font-medium">{cand.electionLevel}</span>
                    </div>
                    {cand.cityGramNagar ? (
                      <div className="flex justify-between text-gray-400">
                        <span>City / Gram / Nagar</span>
                        <span className="text-gray-900 font-bold text-saffron-700">{cand.cityGramNagar}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-gray-400">
                        <span>Constituency Sector</span>
                        <span className="text-gray-900 font-bold">{cand.constituency}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-400">
                      <span>Educational affidavit</span>
                      <span className="text-gray-900 font-medium">{cand.education || 'Declared'}</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-mono text-[11px]">
                      <span>Declared Assets Value</span>
                      <span className="text-gray-900 font-bold">{cand.assets || 'Declared'}</span>
                    </div>
                  </div>

                  {cand.manifesto && (
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider block mb-1">Affidavit Manifesto Pledge</span>
                      <p className="text-[10px] text-gray-600 leading-relaxed line-clamp-3 italic">
                        "{cand.manifesto}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50/50 border-t border-gray-50 p-3 flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span>ECI Ref: {cand.id}</span>
                  <span className="text-emerald-600 font-bold">● verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
