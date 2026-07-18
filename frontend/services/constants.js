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
  'President',
  'Vice President'
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
