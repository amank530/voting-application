import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { 
  ELECTION_HIERARCHY, 
  getNormalizedLevel, 
  getHierarchyOptions 
} from '../services/electionHierarchy';

const ELECTION_LEVEL_OPTIONS = [
  'Lok Sabha (MP)',
  'Legislative Assembly (MLA)',
  'Legislative council (MLC)',
  'Municipal Corporation',
  'Municipal Council',
  'Zila Parishad',
  'Janpad Panchayat / Block smitti',
  'Gram Panchayat Sarpanch',
  'Gram Panchayat Panch',
  'Nagar Panchayat',
  'Ward Panchayat'
];

export default function ElectionHierarchyEngine({
  level,
  formValues = {},
  onChange,
  className = ""
}) {
  const [activeLevel, setActiveLevel] = useState(level || formValues.electionLevel || formValues.level || '');
  const [approvedCandidates, setApprovedCandidates] = useState([]);
  
  // Search modal & results states
  const [showRegionPopup, setShowRegionPopup] = useState(false);
  const [tempForm, setTempForm] = useState({});
  const [searchedCandidates, setSearchedCandidates] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch verified nominees to assist dynamically registered locations
  useEffect(() => {
    api.candidates.list()
      .then(list => {
        setApprovedCandidates(list || []);
      })
      .catch(err => console.error("Error loading candidates for hierarchy mapping:", err));
  }, []);

  // Sync activeLevel with prop and formValues changes
  useEffect(() => {
    if (level) {
      setActiveLevel(level);
    }
  }, [level]);

  useEffect(() => {
    const val = formValues.electionLevel || formValues.level;
    if (val && val !== activeLevel) {
      setActiveLevel(val);
    }
  }, [formValues.electionLevel, formValues.level]);

  const normLevelName = useMemo(() => getNormalizedLevel(activeLevel), [activeLevel]);
  const levelConfig = useMemo(() => ELECTION_HIERARCHY[normLevelName], [normLevelName]);

  // Sync official position behind the scenes when level changes
  useEffect(() => {
    if (levelConfig && levelConfig.positions) {
      if (!formValues.position || !levelConfig.positions.includes(formValues.position)) {
        onChange?.({ 
          ...formValues, 
          position: levelConfig.positions[0] 
        });
      }
    }
  }, [levelConfig, normLevelName]);

  // Retrieve dynamic lists of options from cascading geo data for inline UI
  const activeOptionsRes = useMemo(() => {
    return getHierarchyOptions(activeLevel, formValues, approvedCandidates);
  }, [activeLevel, formValues, approvedCandidates]);

  // Map filter key names to corresponding dynamic lists for inline UI
  const getOptionsForFilter = (filterName) => {
    if (filterName === 'state') return activeOptionsRes.states || [];
    if (filterName === 'district') return activeOptionsRes.districts || [];
    if (filterName === 'city') return activeOptionsRes.cities || [];
    if (filterName === 'town') return activeOptionsRes.towns || [];
    if (filterName === 'block') return activeOptionsRes.blocks || [];
    if (filterName === 'nagarPanchayat') return activeOptionsRes.nagarPanchayats || [];
    if (filterName === 'wardNo') return activeOptionsRes.wardNos || [];
    return [];
  };

  // Map filter key names to corresponding dynamic lists for popup UI
  const getOptionsForPopupFilter = (filterName) => {
    const activePopupOptions = getHierarchyOptions(activeLevel, tempForm, approvedCandidates);
    if (filterName === 'state') return activePopupOptions.states || [];
    if (filterName === 'district') return activePopupOptions.districts || [];
    if (filterName === 'city') return activePopupOptions.cities || [];
    if (filterName === 'town') return activePopupOptions.towns || [];
    if (filterName === 'block') return activePopupOptions.blocks || [];
    if (filterName === 'nagarPanchayat') return activePopupOptions.nagarPanchayats || [];
    if (filterName === 'wardNo') return activePopupOptions.wardNos || [];
    return [];
  };

  // Dynamic filter value modifier for inline UI
  const handleFilterChange = (filterName, newVal) => {
    const updated = {
      ...formValues,
      [filterName]: newVal,
      level: activeLevel,
      electionLevel: activeLevel
    };

    // Cascading cleanups
    if (filterName === 'state') {
      updated.district = '';
      updated.city = '';
      updated.town = '';
      updated.block = '';
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'district') {
      updated.city = '';
      updated.town = '';
      updated.block = '';
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'block' || filterName === 'city' || filterName === 'town') {
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'nagarPanchayat') {
      updated.wardNo = '';
    }

    if (levelConfig && levelConfig.filters) {
      const filledFilters = levelConfig.filters
        .map(f => {
          if (f.name === filterName) return newVal;
          if (filterName === 'state' && f.name !== 'state') return '';
          if (filterName === 'district' && f.name !== 'state' && f.name !== 'district') return '';
          if ((filterName === 'block' || filterName === 'city' || filterName === 'town') && f.name !== 'state' && f.name !== 'district' && f.name !== 'block' && f.name !== 'city' && f.name !== 'town') return '';
          if (filterName === 'nagarPanchayat' && f.name !== 'state' && f.name !== 'district' && f.name !== 'town' && f.name !== 'nagarPanchayat') return '';
          return updated[f.name] || '';
        })
        .filter(Boolean);

      const calculatedAddress = filledFilters.join(', ');
      updated.address = calculatedAddress;
      updated.constituency = calculatedAddress;
    }

    if (levelConfig && levelConfig.positions && levelConfig.positions.length > 0) {
      updated.position = levelConfig.positions[0];
    }

    onChange?.(updated);
  };

  // Dynamic filter value modifier for popup UI
  const handlePopupFilterChange = (filterName, newVal) => {
    const updated = {
      ...tempForm,
      [filterName]: newVal
    };

    // Cascading cleanups
    if (filterName === 'state') {
      updated.district = '';
      updated.city = '';
      updated.town = '';
      updated.block = '';
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'district') {
      updated.city = '';
      updated.town = '';
      updated.block = '';
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'block' || filterName === 'city' || filterName === 'town') {
      updated.nagarPanchayat = '';
      updated.wardNo = '';
    } else if (filterName === 'nagarPanchayat') {
      updated.wardNo = '';
    }

    setTempForm(updated);
  };

  // Popup Search Handler
  const handlePopupSearch = () => {
    setHasSearched(true);
    const results = approvedCandidates.filter(c => {
      // Level matches
      const cLevel = c.electionLevel || c.level || '';
      const levelMatch = cLevel.toLowerCase() === activeLevel.toLowerCase();
      if (!levelMatch) return false;

      // Filter matches
      if (levelConfig && levelConfig.filters) {
        for (const filter of levelConfig.filters) {
          const filterVal = tempForm[filter.name] || '';
          if (filterVal) {
            const candidateVal = c[filter.name] || '';
            if (candidateVal.toLowerCase() !== filterVal.toLowerCase()) {
              return false;
            }
          }
        }
      }
      return true;
    });
    setSearchedCandidates(results);
  };

  return (
    <div className={`space-y-4 ${className}`} id="election-hierarchy-engine">
      {/* 1. Election Level filter and search button side-by-side */}
      <div className="flex flex-col sm:flex-row gap-3 items-end bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
        <div className="flex-1 space-y-1 text-left w-full">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
            Election Jurisdiction Level
          </label>
          <select
            value={activeLevel}
            onChange={(e) => {
              const newLvl = e.target.value;
              setActiveLevel(newLvl);
              onChange?.({ ...formValues, electionLevel: newLvl, level: newLvl });
            }}
            className="w-full bg-gray-50 border border-gray-250 rounded-lg py-2.5 px-3.5 text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-600 focus:bg-white transition"
          >
            <option value="">-- Select Election Level --</option>
            {ELECTION_LEVEL_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!activeLevel}
          onClick={() => {
            setTempForm({ ...formValues });
            setHasSearched(false);
            setSearchedCandidates([]);
            setShowRegionPopup(true);
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-red-800 hover:bg-red-900 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
        >
          <span>🔍 Search Region</span>
        </button>
      </div>

      {/* 2. Inline Geographic cascading filters for form filing consistency */}
      {activeLevel && levelConfig && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left space-y-3">
          <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-gray-200/50">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-400 uppercase tracking-wider">Region Filters for</span>
              <span className="font-extrabold text-primary-950 font-mono">{activeLevel}</span>
            </div>
            <span className="text-[9px] font-black text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
              {levelConfig.governmentType}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {levelConfig.filters.map((filter) => {
              const suggestions = getOptionsForFilter(filter.name);
              const currentVal = formValues[filter.name] || '';
              const datalistId = `datalist-suggestions-${filter.name}`;

              return (
                <div key={filter.name} className="space-y-1 text-left">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tight block">
                    {filter.label} <span className="text-red-500 font-bold">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      list={datalistId}
                      value={currentVal}
                      onChange={(e) => handleFilterChange(filter.name, e.target.value)}
                      placeholder={filter.placeholder || `Enter ${filter.label}...`}
                      className="w-full bg-white border border-gray-250 rounded-lg py-1.5 px-3 text-[11px] font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-600 transition placeholder:text-gray-400"
                    />
                    <datalist id={datalistId}>
                      {suggestions.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  </div>

                  {/* Suggestion pills */}
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                      {suggestions.slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleFilterChange(filter.name, opt)}
                          className={`text-[8px] px-1.5 py-0.5 rounded font-mono border transition ${
                            currentVal === opt
                              ? 'bg-primary-600 border-primary-600 text-white font-bold'
                              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-100 cursor-pointer'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Popup Region Filters Dialog Modal */}
      {showRegionPopup && activeLevel && levelConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[85vh] animate-fade-in text-left">
            {/* Modal Header */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center rounded-t-2xl">
              <div>
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Region Filters Setup</span>
                <strong className="text-sm font-extrabold text-primary-950 font-sans block">{activeLevel}</strong>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRegionPopup(false)}
                className="text-gray-400 hover:text-gray-700 font-extrabold cursor-pointer p-1.5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-gray-500">
                Configure regional parameters cascading filters to lock target constituency coordinates.
              </p>

              {/* Dynamic inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                {levelConfig.filters.map((filter) => {
                  const suggestions = getOptionsForPopupFilter(filter.name);
                  const currentVal = tempForm[filter.name] || '';
                  const datalistId = `popup-suggestions-${filter.name}`;

                  return (
                    <div key={filter.name} className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-tight block">
                        {filter.label}
                      </label>
                      <input
                        type="text"
                        list={datalistId}
                        value={currentVal}
                        onChange={(e) => handlePopupFilterChange(filter.name, e.target.value)}
                        placeholder={`e.g. Specify ${filter.label}`}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-600"
                      />
                      <datalist id={datalistId}>
                        {suggestions.map((opt) => (
                          <option key={opt} value={opt} />
                        ))}
                      </datalist>

                      {suggestions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-0.5">
                          {suggestions.slice(0, 3).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handlePopupFilterChange(filter.name, opt)}
                              className={`text-[8px] px-1.5 py-0.5 rounded font-mono border transition ${
                                currentVal === opt
                                  ? 'bg-primary-600 border-primary-600 text-white font-bold'
                                  : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-100 cursor-pointer'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Search Button */}
              <button
                type="button"
                onClick={handlePopupSearch}
                className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                🔍 Search Candidates in Region
              </button>

              {/* Candidate Results Section */}
              {hasSearched && (
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    Search Results ({searchedCandidates.length})
                  </h4>

                  {searchedCandidates.length > 0 ? (
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {searchedCandidates.map((c) => (
                        <div 
                          key={c.id} 
                          className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3"
                        >
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-lg shadow-inner overflow-hidden border border-gray-200">
                            {c.photo ? (
                              <img src={c.photo} alt={c.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span>👤</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <strong className="text-xs text-gray-950 block truncate">{c.name}</strong>
                            <span className="text-[10px] text-gray-500 block truncate">
                              {c.partySymbol || '👤'} {c.partyName || 'Independent'} • {c.constituency || 'All constituencies'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                              c.status === 'APPROVED' || c.status === 'Accepted'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : c.status === 'Rejected'
                                  ? 'bg-red-50 border-red-200 text-red-700'
                                  : 'bg-amber-50 border-amber-200 text-amber-700'
                            }`}>
                              {c.status || 'Scrutiny Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500 font-medium">
                      ⚠️ No candidates found matching the selected regional parameters.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  if (hasSearched && searchedCandidates.length > 0) {
                    // Lock popup selections back to the form if user wants to keep them
                    onChange?.({
                      ...formValues,
                      ...tempForm,
                      electionLevel: activeLevel,
                      level: activeLevel
                    });
                  }
                  setShowRegionPopup(false);
                }}
                className="px-4 py-2 bg-primary-900 hover:bg-primary-950 text-white font-extrabold rounded-lg text-[10px] uppercase cursor-pointer"
              >
                Close & apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
