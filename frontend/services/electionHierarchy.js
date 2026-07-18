// Centralized Position Mapping configuration and Dynamic Election Hierarchy Engine
// Election Level → Government Type → Required Filters → Available Positions

export const ELECTION_HIERARCHY = {
  'Lok Sabha': {
    governmentType: 'National',
    positions: ['MP (Member of Parliament)'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'constituency', label: 'Parliamentary Constituency', type: 'select', dependentOn: 'state', placeholder: 'Select Parliamentary Constituency' }
    ]
  },
  'Legislative Assembly': {
    governmentType: 'State',
    positions: ['MLA (Member of Legislative Assembly)'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'constituency', label: 'Assembly Constituency', type: 'select', dependentOn: 'district', placeholder: 'Select Assembly Constituency' }
    ]
  },
  'Municipal Corporation': {
    governmentType: 'Urban Local Body',
    positions: ['Corporator'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'city', label: 'City', type: 'select', dependentOn: 'district', placeholder: 'Select City' },
      { name: 'municipalCorporation', label: 'Municipal Corporation', type: 'select', dependentOn: 'city', placeholder: 'Select Corporation' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'municipalCorporation', placeholder: 'Select Ward' }
    ]
  },
  'Municipal Council': {
    governmentType: 'Urban Local Body',
    positions: ['Councillor'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'town', label: 'Town', type: 'select', dependentOn: 'district', placeholder: 'Select Town' },
      { name: 'municipalCouncil', label: 'Municipal Council', type: 'select', dependentOn: 'town', placeholder: 'Select Council' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'municipalCouncil', placeholder: 'Select Ward' }
    ]
  },
  'Nagar Panchayat': {
    governmentType: 'Urban Local Body',
    positions: ['Ward Member'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'town', label: 'Town', type: 'select', dependentOn: 'district', placeholder: 'Select Town' },
      { name: 'nagarPanchayat', label: 'Nagar Panchayat', type: 'select', dependentOn: 'town', placeholder: 'Select Nagar Panchayat' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'nagarPanchayat', placeholder: 'Select Ward' }
    ]
  },
  'Zila Parishad': {
    governmentType: 'Rural Local Body',
    positions: ['Zila Parishad Member'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'constituency', label: 'Zila Parishad Constituency', type: 'select', dependentOn: 'district', placeholder: 'Select ZP Constituency' }
    ]
  },
  'Janpad Panchayat / Block Panchayat': {
    governmentType: 'Rural Local Body',
    positions: ['Janpad Panchayat Member'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' },
      { name: 'constituency', label: 'Janpad Constituency', type: 'select', dependentOn: 'block', placeholder: 'Select Janpad Constituency' }
    ]
  },
  'Gram Panchayat': {
    governmentType: 'Rural Local Body',
    positions: ['Sarpanch', 'Panch (Ward Member)'],
    filters: [
      { name: 'state', label: 'Contesting State', type: 'select', dependentOn: null, placeholder: 'Select State' },
      { name: 'district', label: 'District', type: 'select', dependentOn: 'state', placeholder: 'Select District' },
      { name: 'block', label: 'Block', type: 'select', dependentOn: 'district', placeholder: 'Select Block' },
      { name: 'gramPanchayat', label: 'Gram Panchayat', type: 'select', dependentOn: 'block', placeholder: 'Select Gram Panchayat' },
      { name: 'wardNo', label: 'Ward Number', type: 'select', dependentOn: 'gramPanchayat', placeholder: 'Select Ward', condition: (form) => form.position === 'Panch (Ward Member)' }
    ]
  }
};

// Normalize database levels or alternative names to a standard mapping key
export function getNormalizedLevel(levelName) {
  if (!levelName) return 'Lok Sabha';
  const name = levelName.toLowerCase();
  if (name.includes('lok sabha') || name.includes('mp') || name.includes('parliament')) return 'Lok Sabha';
  if (name.includes('legislative assembly') || name.includes('mla') || name.includes('state legislative')) return 'Legislative Assembly';
  if (name.includes('municipal corporation') || name.includes('corporation')) return 'Municipal Corporation';
  if (name.includes('municipal council') || name.includes('council')) return 'Municipal Council';
  if (name.includes('nagar panchayat')) return 'Nagar Panchayat';
  if (name.includes('zila') || name.includes('zilla')) return 'Zila Parishad';
  if (name.includes('janpad') || name.includes('block panchayat')) return 'Janpad Panchayat / Block Panchayat';
  if (name.includes('gram panchayat') || name.includes('panchayat')) return 'Gram Panchayat';
  return 'Lok Sabha';
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
export function getHierarchyOptions(level, formValues) {
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
  const stateData = HIERARCHY_DATA[state] || HIERARCHY_DATA['Madhya Pradesh'];
  const districtData = (stateData && stateData.districts[district]) || 
                       (HIERARCHY_DATA['Madhya Pradesh']?.districts['Bhopal']);

  const response = {
    states: getAvailableStates(),
    districts: getDistrictsForState(state),
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

  if (!districtData) {
    // Return empty / placeholder results if no district is selected yet
    return response;
  }

  // Map option properties based on level configuration
  if (normLevel === 'Lok Sabha') {
    response.constituencies = districtData.parliamentaryConstituencies || ['Bhopal Lok Sabha Seat', 'Mumbai South Parliamentary Seat'];
  } else if (normLevel === 'Legislative Assembly') {
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
  } else if (normLevel === 'Janpad Panchayat / Block Panchayat') {
    response.blocks = districtData.blocks || ['Phanda Block'];
    response.constituencies = districtData.janpadConstituencies || ['Block Ward 1', 'Block Ward 2'];
  } else if (normLevel === 'Gram Panchayat') {
    response.blocks = districtData.blocks || ['Phanda Block'];
    response.gramPanchayats = Object.keys(districtData.gramPanchayats || { 'Gram Panchayat Rampur': [] });
    
    if (gramPanchayat && districtData.gramPanchayats && districtData.gramPanchayats[gramPanchayat]) {
      response.wardNos = districtData.gramPanchayats[gramPanchayat];
    } else {
      // Default wards for GP
      response.wardNos = ['Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5'];
    }
  }

  return response;
}
