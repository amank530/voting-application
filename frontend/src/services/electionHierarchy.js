// Centralized Position Mapping configuration and Dynamic Election Hierarchy Engine
// Election Level → Government Type → Required Filters → Available Positions

export const ELECTION_HIERARCHY = {
  'Lok Sabha (MP)': {
    governmentType: 'National',
    positions: ['MP (Member of Parliament)'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' }
    ]
  },
  'Legislative Assembly (MLA)': {
    governmentType: 'State',
    positions: ['MLA (Member of Legislative Assembly)'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' }
    ]
  },
  'Legislative council (MLC)': {
    governmentType: 'State',
    positions: ['MLC (Member of Legislative Council)'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' }
    ]
  },
  'Municipal Corporation': {
    governmentType: 'Urban area',
    positions: ['Corporator'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'city', label: 'City', type: 'select', dependentOn: 'district', placeholder: 'Select City' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'city', placeholder: 'Select Ward Number' }
    ]
  },
  'Municipal Council': {
    governmentType: 'Urban area',
    positions: ['Councillor'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'town', label: 'Town', type: 'select', dependentOn: 'district', placeholder: 'Select Town' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'town', placeholder: 'Select Ward Number' }
    ]
  },
  'Zila Parishad': {
    governmentType: 'Rural area',
    positions: ['Zila Parishad Member'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' }
    ]
  },
  'Janpad Panchayat / Block smitti': {
    governmentType: 'Rural area',
    positions: ['Janpad Panchayat Member'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' }
    ]
  },
  'Gram Panchayat Sarpanch': {
    governmentType: 'Rural area',
    positions: ['Sarpanch'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' }
    ]
  },
  'Gram Panchayat Panch': {
    governmentType: 'Rural area',
    positions: ['Panch (Ward Member)'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' },
      { name: 'wardNo', label: 'Ward', type: 'select', dependentOn: 'block', placeholder: 'Select Ward' }
    ]
  },
  'Nagar Panchayat': {
    governmentType: 'Urban area',
    positions: ['Ward Member'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'town', label: 'Town', type: 'select', dependentOn: 'district', placeholder: 'Select Town' },
      { name: 'nagarPanchayat', label: 'Nagar panchayat', type: 'select', dependentOn: 'town', placeholder: 'Select Nagar Panchayat' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'nagarPanchayat', placeholder: 'Select Ward Number' }
    ]
  },
  'Ward Panchayat': {
    governmentType: 'Rural area',
    positions: ['Ward Panch'],
    filters: [
      { name: 'state', label: 'State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'block', placeholder: 'Select Ward Number' }
    ]
  }
};

// Normalize database levels or alternative names to a standard mapping key
export function getNormalizedLevel(levelName) {
  if (!levelName) return 'Lok Sabha (MP)';
  const name = levelName.toLowerCase();
  if (name.includes('ward panchayat')) return 'Ward Panchayat';
  if (name.includes('lok sabha') || name.includes('parliament') || name.includes('mp')) return 'Lok Sabha (MP)';
  if (name.includes('legislative assembly') || name.includes('mla')) return 'Legislative Assembly (MLA)';
  if (name.includes('legislative council') || name.includes('mlc')) return 'Legislative council (MLC)';
  if (name.includes('municipal corporation') || name.includes('corporation')) return 'Municipal Corporation';
  if (name.includes('municipal council') || name.includes('council')) return 'Municipal Council';
  if (name.includes('nagar panchayat')) return 'Nagar Panchayat';
  if (name.includes('zila') || name.includes('zilla')) return 'Zila Parishad';
  if (name.includes('janpad') || name.includes('block panchayat') || name.includes('block smitti') || name.includes('smitti')) return 'Janpad Panchayat / Block smitti';
  if (name.includes('sarpanch')) return 'Gram Panchayat Sarpanch';
  if (name.includes('panch') || name.includes('gram panchayat panch')) return 'Gram Panchayat Panch';
  if (name.includes('gram panchayat') || name.includes('panchayat')) return 'Gram Panchayat Sarpanch'; // default fallback
  return 'Lok Sabha (MP)';
}

// Cascading Geographic Database of Indian States & Districts with deep granular units
export const HIERARCHY_DATA = {
  'Madhya Pradesh': {
    districts: {
      'Bhopal': {
        constituencies: ['Bhopal North', 'Bhopal South', 'Bhopal Central', 'Narela', 'Huzur'], // assembly
        parliamentaryConstituencies: ['Bhopal Lok Sabha Seat', 'Rajgarh Lok Sabha Seat'],
        cities: ['Bhopal Metro'],
        towns: ['Bairagarh Town', 'Kolar Town'],
        municipalCorporations: ['Bhopal Municipal Corporation'],
        municipalCouncils: ['Kolar Municipal Council'],
        nagarPanchayats: ['Bairagarh Nagar Panchayat'],
        blocks: ['Phanda Block', 'Berasia Block'],
        zilaParishadConstituencies: ['Bhopal ZP Zone 1', 'Bhopal ZP Zone 2', 'Bhopal ZP Zone 3'],
        janpadConstituencies: ['Phanda Janpad Ward 1', 'Phanda Janpad Ward 2', 'Berasia Janpad Ward 1'],
        gramPanchayats: {
          'Gram Panchayat Rampur': ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'],
          'Gram Panchayat Berasia': ['Ward A', 'Ward B', 'Ward C', 'Ward D'],
          'Gram Panchayat Phanda': ['Ward X', 'Ward Y']
        }
      },
      'Indore': {
        constituencies: ['Indore-1', 'Indore-2', 'Indore-3', 'Indore-4', 'Rau'],
        parliamentaryConstituencies: ['Indore Lok Sabha Seat', 'Dhar Lok Sabha Seat'],
        cities: ['Indore Metro'],
        towns: ['Mhow Town', 'Sanwer Town', 'Depalpur Town'],
        municipalCorporations: ['Indore Municipal Corporation'],
        municipalCouncils: ['Mhow Municipal Council', 'Depalpur Municipal Council'],
        nagarPanchayats: ['Sanwer Nagar Panchayat'],
        blocks: ['Mhow Block', 'Sanwer Block', 'Depalpur Block'],
        zilaParishadConstituencies: ['Indore ZP Zone 1', 'Indore ZP Zone 2'],
        janpadConstituencies: ['Mhow Janpad Ward 5', 'Sanwer Janpad Ward 8'],
        gramPanchayats: {
          'Gram Panchayat Harsola': ['Ward 1', 'Ward 2', 'Ward 3'],
          'Gram Panchayat Depalpur': ['Ward A', 'Ward B', 'Ward C']
        }
      },
      'Gwalior': {
        constituencies: ['Gwalior Rural', 'Gwalior East', 'Gwalior South'],
        parliamentaryConstituencies: ['Gwalior Lok Sabha Seat', 'Bhind Lok Sabha Seat'],
        cities: ['Gwalior City'],
        towns: ['Dabra Town', 'Bhitarwar Town'],
        municipalCorporations: ['Gwalior Municipal Corporation'],
        municipalCouncils: ['Dabra Municipal Council'],
        nagarPanchayats: ['Bhitarwar Nagar Panchayat'],
        blocks: ['Dabra Block', 'Bhitarwar Block'],
        zilaParishadConstituencies: ['Gwalior ZP Zone 1', 'Gwalior ZP Zone 2'],
        janpadConstituencies: ['Dabra Janpad Ward 3', 'Bhitarwar Janpad Ward 10'],
        gramPanchayats: {
          'Gram Panchayat Dabra': ['Ward 1', 'Ward 2'],
          'Gram Panchayat Bhitarwar': ['Ward A', 'Ward B']
        }
      }
    }
  },
  'Maharashtra': {
    districts: {
      'Mumbai': {
        constituencies: ['Mumbai South', 'Mumbai North-East', 'Mumbai North', 'Mumbai Central'],
        parliamentaryConstituencies: ['Mumbai South Parliamentary Seat', 'Mumbai North Parliamentary Seat'],
        cities: ['Mumbai Metropolitan City'],
        towns: ['Colaba Area', 'Dharavi Area'],
        municipalCorporations: ['Brihanmumbai Municipal Corporation (BMC)'],
        municipalCouncils: ['Mumbai Suburban Municipal Council'],
        nagarPanchayats: ['Sion Nagar Panchayat'],
        blocks: ['BMC Ward A Block', 'BMC Ward B Block'],
        zilaParishadConstituencies: ['Mumbai Suburban ZP Area'],
        janpadConstituencies: ['Mumbai Local Ward 1', 'Mumbai Local Ward 2'],
        gramPanchayats: {
          'Gram Panchayat Gorai': ['Ward 1', 'Ward 2', 'Ward 3']
        }
      },
      'Pune': {
        constituencies: ['Pune Cantonment', 'Shivaji Nagar', 'Kothrud', 'Hadapsar'],
        parliamentaryConstituencies: ['Pune Lok Sabha Seat', 'Baramati Lok Sabha Seat'],
        cities: ['Pune City'],
        towns: ['Lonavala Town', 'Mulshi Town'],
        municipalCorporations: ['Pune Municipal Corporation (PMC)'],
        municipalCouncils: ['Lonavala Municipal Council'],
        nagarPanchayats: ['Mulshi Nagar Panchayat'],
        blocks: ['Mulshi Block', 'Haveli Block'],
        zilaParishadConstituencies: ['Pune ZP Zone A', 'Pune ZP Zone B'],
        janpadConstituencies: ['Mulshi Janpad Ward 4', 'Haveli Janpad Ward 12'],
        gramPanchayats: {
          'Gram Panchayat Lonavala Rural': ['Ward 1', 'Ward 2'],
          'Gram Panchayat Lavasa': ['Ward A', 'Ward B', 'Ward C']
        }
      }
    }
  },
  'Delhi': {
    districts: {
      'New Delhi': {
        constituencies: ['New Delhi Seat', 'Delhi Cantt', 'Rajinder Nagar'],
        parliamentaryConstituencies: ['New Delhi Lok Sabha', 'Chandni Chowk Lok Sabha'],
        cities: ['New Delhi Municipal Area'],
        towns: ['Connaught Place', 'Chanakyapuri'],
        municipalCorporations: ['Municipal Corporation of Delhi (MCD)'],
        municipalCouncils: ['New Delhi Municipal Council (NDMC)'],
        nagarPanchayats: ['Narela Nagar Panchayat'],
        blocks: ['Delhi Block A', 'Delhi Block B'],
        zilaParishadConstituencies: ['Delhi Rural ZP Zone 1'],
        janpadConstituencies: ['Delhi Rural Ward 4'],
        gramPanchayats: {
          'Gram Panchayat Narela Village': ['Ward 1', 'Ward 2', 'Ward 3']
        }
      }
    }
  }
};

const STATE_LIST = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Maharashtra",
  "Madhya Pradesh",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Tripura",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar (UT)",
  "Chandigarh (UT)",
  "Dadra & Nagar Haveli (UT)",
  "Daman & Diu (UT)",
  "Jammu & Kashmir(UT)",
  "Lakshadweep (UT)",
  "Ladakh (UT)",
  "Puducherry (UT)"
];

const defaultDistrictForState = (stateName) => {
  switch(stateName) {
    case 'Andhra Pradesh': return 'Visakhapatnam';
    case 'Arunachal Pradesh': return 'Itanagar';
    case 'Assam': return 'Guwahati';
    case 'Bihar': return 'Patna';
    case 'Chhattisgarh': return 'Raipur';
    case 'Goa': return 'Panaji';
    case 'Gujarat': return 'Ahmedabad';
    case 'Haryana': return 'Gurugram';
    case 'Himachal Pradesh': return 'Shimla';
    case 'Jharkhand': return 'Ranchi';
    case 'Karnataka': return 'Bengaluru';
    case 'Kerala': return 'Thiruvananthapuram';
    case 'Manipur': return 'Imphal';
    case 'Meghalaya': return 'Shillong';
    case 'Mizoram': return 'Aizawl';
    case 'Nagaland': return 'Kohima';
    case 'Odisha': return 'Bhubaneswar';
    case 'Punjab': return 'Amritsar';
    case 'Rajasthan': return 'Jaipur';
    case 'Sikkim': return 'Gangtok';
    case 'Tamil Nadu': return 'Chennai';
    case 'Tripura': return 'Agartala';
    case 'Telangana': return 'Hyderabad';
    case 'Uttar Pradesh': return 'Lucknow';
    case 'Uttarakhand': return 'Dehradun';
    case 'West Bengal': return 'Kolkata';
    case 'Andaman & Nicobar (UT)': return 'Port Blair';
    case 'Chandigarh (UT)': return 'Chandigarh';
    case 'Dadra & Nagar Haveli (UT)': return 'Silvassa';
    case 'Daman & Diu (UT)': return 'Daman';
    case 'Jammu & Kashmir(UT)': return 'Srinagar';
    case 'Lakshadweep (UT)': return 'Kavaratti';
    case 'Ladakh (UT)': return 'Leh';
    case 'Puducherry (UT)': return 'Puducherry';
    default: return 'Central District';
  }
};

STATE_LIST.forEach(st => {
  if (!HIERARCHY_DATA[st]) {
    const mainDist = defaultDistrictForState(st);
    HIERARCHY_DATA[st] = {
      districts: {
        [mainDist]: {
          constituencies: [`${mainDist} Assembly Constituency A`, `${mainDist} Assembly Constituency B`],
          parliamentaryConstituencies: [`${mainDist} Lok Sabha Seat`],
          cities: [`${mainDist} City`],
          towns: [`${mainDist} Town`],
          municipalCorporations: [`${mainDist} Municipal Corporation`],
          municipalCouncils: [`${mainDist} Municipal Council`],
          nagarPanchayats: [`${mainDist} Nagar Panchayat`],
          blocks: [`${mainDist} Block`],
          zilaParishadConstituencies: [`${mainDist} ZP Zone 1`],
          janpadConstituencies: [`${mainDist} Janpad Ward 1`],
          gramPanchayats: {
            [`Gram Panchayat ${mainDist}`]: ['Ward 1', 'Ward 2', 'Ward 3']
          }
        }
      }
    };
  }
});

// Return a list of available states
export function getAvailableStates() {
  return Object.keys(HIERARCHY_DATA);
}

// Return districts for a selected state
export function getDistrictsForState(state) {
  if (!state || !HIERARCHY_DATA[state]) {
    // Fallback if state is not explicitly listed in hierarchy data
    return ['Bhopal', 'Indore', 'Mumbai', 'Pune', 'New Delhi'];
  }
  return Object.keys(HIERARCHY_DATA[state].districts);
}

// Retrieve cascading dropdown options dynamically for a given location path
export function getHierarchyOptions(level, formValues, approvedCandidates = []) {
  const normLevel = getNormalizedLevel(level);
  const state = formValues.state;
  const district = formValues.district;
  const block = formValues.block;
  const city = formValues.city;
  const town = formValues.town;
  const municipalCorporation = formValues.municipalCorporation;
  const municipalCouncil = formValues.municipalCouncil;
  const nagarPanchayat = formValues.nagarPanchayat;
  const gramPanchayat = formValues.gramPanchayat;

  // Setup dynamic fallbacks to prevent crash and preserve rich experience
  const stateData = HIERARCHY_DATA[state];
  const districtData = stateData && stateData.districts[district];

  const response = {
    states: getAvailableStates(),
    districts: state ? getDistrictsForState(state) : [],
    constituencies: [],
    cities: [],
    towns: [],
    municipalCorporations: [],
    municipalCouncils: [],
    nagarPanchayats: [],
    blocks: [],
    zilaParishadConstituencies: [],
    janpadConstituencies: [],
    gramPanchayats: [],
    wardNos: []
  };

  // Map standard option properties based on level configuration if standard data exists
  if (districtData) {
    if (normLevel === 'Lok Sabha (MP)' || normLevel === 'Legislative council (MLC)') {
      response.constituencies = districtData.parliamentaryConstituencies || ['Bhopal Lok Sabha Seat', 'Mumbai South Parliamentary Seat'];
    } else if (normLevel === 'Legislative Assembly (MLA)') {
      response.constituencies = districtData.constituencies || [];
    } else if (normLevel === 'Municipal Corporation') {
      response.cities = districtData.cities || ['Bhopal Metro'];
      response.municipalCorporations = districtData.municipalCorporations || ['Bhopal Municipal Corporation'];
      response.wardNos = districtData.wards || ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
    } else if (normLevel === 'Municipal Council') {
      response.towns = districtData.towns || ['Kolar Town'];
      response.municipalCouncils = districtData.municipalCouncils || ['Kolar Municipal Council'];
      response.wardNos = districtData.wards || ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
    } else if (normLevel === 'Nagar Panchayat') {
      response.towns = districtData.towns || ['Bairagarh Town'];
      response.nagarPanchayats = districtData.nagarPanchayats || ['Bairagarh Nagar Panchayat'];
      response.wardNos = districtData.wards || ['Ward 1', 'Ward 2', 'Ward 3'];
    } else if (normLevel === 'Zila Parishad') {
      response.constituencies = districtData.zilaParishadConstituencies || ['Zone A Circle', 'Zone B Circle'];
    } else if (normLevel === 'Janpad Panchayat / Block smitti') {
      response.blocks = districtData.blocks || ['Phanda Block'];
      response.constituencies = districtData.janpadConstituencies || ['Block Ward 1', 'Block Ward 2'];
    } else if (normLevel === 'Gram Panchayat Sarpanch' || normLevel === 'Gram Panchayat Panch' || normLevel === 'Ward Panchayat') {
      response.blocks = districtData.blocks || ['Phanda Block'];
      response.gramPanchayats = Object.keys(districtData.gramPanchayats || {});
      
      if (gramPanchayat && districtData.gramPanchayats && districtData.gramPanchayats[gramPanchayat]) {
        response.wardNos = districtData.gramPanchayats[gramPanchayat];
      } else {
        response.wardNos = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];
      }
    }
  } else {
    // Graceful fallbacks if selecting from a custom-written region
    if (normLevel === 'Gram Panchayat') {
      response.wardNos = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];
    } else {
      response.wardNos = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4'];
    }
  }

  // Merge custom states, districts, and other geo hierarchies from confirmed candidates
  const extraStates = approvedCandidates.map(c => c.state).filter(Boolean);
  response.states = [...new Set([...response.states, ...extraStates])];

  if (state) {
    const extraDists = approvedCandidates.filter(c => c.state === state).map(c => c.district).filter(Boolean);
    response.districts = [...new Set([...response.districts, ...extraDists])];
  }

  if (state && district) {
    const extraConsts = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.constituency).filter(Boolean);
    response.constituencies = [...new Set([...response.constituencies, ...extraConsts])];

    const extraCities = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.city).filter(Boolean);
    response.cities = [...new Set([...response.cities, ...extraCities])];

    const extraTowns = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.town).filter(Boolean);
    response.towns = [...new Set([...response.towns, ...extraTowns])];

    const extraCorps = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.municipalCorporation).filter(Boolean);
    response.municipalCorporations = [...new Set([...response.municipalCorporations, ...extraCorps])];

    const extraCouncils = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.municipalCouncil).filter(Boolean);
    response.municipalCouncils = [...new Set([...response.municipalCouncils, ...extraCouncils])];

    const extraNagars = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.nagarPanchayat).filter(Boolean);
    response.nagarPanchayats = [...new Set([...response.nagarPanchayats, ...extraNagars])];

    const extraBlocks = approvedCandidates.filter(c => c.state === state && c.district === district).map(c => c.block).filter(Boolean);
    response.blocks = [...new Set([...response.blocks, ...extraBlocks])];

    const extraGps = approvedCandidates.filter(c => c.state === state && c.district === district && c.block === block).map(c => c.gramPanchayat).filter(Boolean);
    response.gramPanchayats = [...new Set([...response.gramPanchayats, ...extraGps])];

    const extraWards = approvedCandidates.filter(c => {
      const matchStateDist = c.state === state && c.district === district;
      if (!matchStateDist) return false;
      if (gramPanchayat && c.gramPanchayat === gramPanchayat) return true;
      if (municipalCorporation && c.municipalCorporation === municipalCorporation) return true;
      if (municipalCouncil && c.municipalCouncil === municipalCouncil) return true;
      if (nagarPanchayat && c.nagarPanchayat === nagarPanchayat) return true;
      return true;
    }).map(c => c.wardNo).filter(Boolean);
    response.wardNos = [...new Set([...response.wardNos, ...extraWards])];
  }

  return response;
}
