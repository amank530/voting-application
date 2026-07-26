// Regional and organizational constants for Indian Election Levels

export const ELECTION_LEVELS = [
  'Gram Panchayat',
  'Nagar Panchayat',
  'Municipal Council',
  'Municipal Corporation',
  'Zila Parishad',
  'State Legislative Assembly (MLA)',
  'State Legislative Council (MLC)',
  'Lok Sabha (MP)',
  'Rajya Sabha (MP)',
  'Ward Panchayat'
];

export const INDIAN_REGIONS = [
  {
    state: 'Madhya Pradesh',
    districts: [
      {
        name: 'Bhopal',
        constituencies: ['Bhopal North', 'Bhopal South', 'Bhopal Central', 'Narela', 'Huzur']
      },
      {
        name: 'Indore',
        constituencies: ['Indore-1', 'Indore-2', 'Indore-3', 'Indore-4', 'Rau']
      },
      {
        name: 'Gwalior',
        constituencies: ['Gwalior Rural', 'Gwalior East', 'Gwalior South']
      }
    ]
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        name: 'Mumbai',
        constituencies: ['Ward 45', 'Ward 46', 'Ward 47', 'Mumbai South', 'Mumbai North-East']
      },
      {
        name: 'Pune',
        constituencies: ['Pune Cantonment', 'Shivaji Nagar', 'Kothrud', 'Hadapsar']
      },
      {
        name: 'Nagpur',
        constituencies: ['Nagpur South', 'Nagpur West', 'Nagpur East']
      }
    ]
  },
  {
    state: 'Delhi',
    districts: [
      {
        name: 'New Delhi',
        constituencies: ['New Delhi Seat', 'Delhi Cantt', 'Rajinder Nagar']
      },
      {
        name: 'East Delhi',
        constituencies: ['East Delhi Seat', 'Preet Vihar', 'Laxmi Nagar', 'Krishna Nagar']
      },
      {
        name: 'South Delhi',
        constituencies: ['South Delhi Seat', 'Saket', 'Kalkaji', 'Mehrauli']
      }
    ]
  },
  {
    state: 'Uttar Pradesh',
    districts: [
      {
        name: 'Lucknow',
        constituencies: ['Lucknow East', 'Lucknow West', 'Lucknow Central', 'Sarojini Nagar']
      },
      {
        name: 'Varanasi',
        constituencies: ['Varanasi North', 'Varanasi South', 'Varanasi Cantt', 'Sevapuri']
      },
      {
        name: 'Noida',
        constituencies: ['Noida Sector 15', 'Noida Sector 62', 'Dadri']
      }
    ]
  },
  {
    state: 'Karnataka',
    districts: [
      {
        name: 'Bengaluru',
        constituencies: ['Bengaluru Central', 'Bengaluru South', 'Bengaluru North', 'Malleshwaram']
      },
      {
        name: 'Mysuru',
        constituencies: ['Mysuru North', 'Chamaraja', 'Krishnaraja']
      }
    ]
  }
];

export const STATE_LIST = [
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

// Auto-populate any missing states into INDIAN_REGIONS for seamless dropdown coverage
STATE_LIST.forEach(st => {
  if (!INDIAN_REGIONS.some(r => r.state === st)) {
    const distName = defaultDistrictForState(st);
    INDIAN_REGIONS.push({
      state: st,
      districts: [
        {
          name: distName,
          constituencies: [`${distName} Constituency 1`, `${distName} Constituency 2`]
        }
      ]
    });
  }
});

