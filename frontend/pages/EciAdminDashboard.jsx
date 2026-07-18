import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../services/constants';
import ElectionHierarchyEngine from '../components/ElectionHierarchyEngine';
import { 
  Landmark, Plus, Edit, Trash2, CheckCircle, Ban, Play, Square, Award, Users, 
  ShieldAlert, RefreshCw, AlertTriangle, FileText, Download, Sparkles, Check, X, Eye,
  UserCheck, MapPin, Bell, Lock, Fingerprint, Search, TrendingUp, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the 14 ECI Administrative Core Tabs grouped into intuitive sections
const TABS_CONFIG = [
  { id: 'election_mgmt', label: '1. Election Management', icon: Landmark, group: 'Core Lifecycle' },
  { id: 'nomination_mgmt', label: '2. Nomination Management', icon: Award, group: 'Core Lifecycle' },
  { id: 'result_mgmt', label: '3. Result Management', icon: FileText, group: 'Core Lifecycle' },
  
  { id: 'party_mgmt', label: '4. Political Party Management', icon: Sparkles, group: 'Registry Records' },
  { id: 'candidate_mgmt', label: '5. Candidate Management', icon: Users, group: 'Registry Records' },
  { id: 'voter_mgmt', label: '6. Voter Management', icon: Users, group: 'Registry Records' },
  
  { id: 'officer_mgmt', label: '7. Election Officer Management', icon: UserCheck, group: 'Deployments & Symbols' },
  { id: 'station_mgmt', label: '8. Polling Station Management', icon: MapPin, group: 'Deployments & Symbols' },
  { id: 'symbol_mgmt', label: '9. Election Symbol Management', icon: Award, group: 'Deployments & Symbols' },
  
  { id: 'reports_analytics', label: '10. Reports & Analytics', icon: TrendingUp, group: 'Compliance & Audits' },
  { id: 'notification_center', label: '11. Notification Center', icon: Bell, group: 'Compliance & Audits' },
  { id: 'document_verification', label: '12. Document Verification', icon: Fingerprint, group: 'Compliance & Audits' },
  { id: 'user_management', label: '13. User Management', icon: Users, group: 'Compliance & Audits' },
  { id: 'system_settings', label: '14. System Settings', icon: ShieldAlert, group: 'Compliance & Audits' }
];

export default function EciAdminDashboard({ currentUser, onNavigateToHome }) {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [voters, setVoters] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Active tab inside ECI core
  const [adminTab, setAdminTab] = useState('election_mgmt');

  // Search states
  const [voterSearch, setVoterSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [partySearch, setPartySearch] = useState('');

  // Form toggles and states
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '', level: ELECTION_LEVELS[0], state: '', district: '', constituency: '', cityGramNagar: '', votingDate: '', countingDate: ''
  });

  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', content: '', type: 'UPDATE' });

  // Mock states for additional simulation modules
  const [officers, setOfficers] = useState([
    { id: 'off-824', name: 'Dr. Rajesh Vardhan', station: 'Government Boys Higher Secondary School, Room 1', district: 'Bhopal', state: 'Madhya Pradesh', contact: '+91 9445214081', status: 'DEPLOYED' },
    { id: 'off-155', name: 'Smt. Shalini Sharma', station: 'BMC Municipal School, Room A', district: 'Mumbai', state: 'Maharashtra', contact: '+91 9884511210', status: 'STANDBY' },
    { id: 'off-290', name: 'Shri Amit Kumar', station: 'New Delhi Seat Primary School', district: 'New Delhi', state: 'Delhi', contact: '+91 9771122045', status: 'DEPLOYED' },
    { id: 'off-312', name: 'Km. Pooja Hegde', station: 'Varanasi Cantt Booth 5', district: 'Varanasi', state: 'Uttar Pradesh', contact: '+91 9555661122', status: 'DEPLOYED' }
  ]);

  const [stations, setStations] = useState([
    { id: 'PS-BPL-014', name: 'Government Boys Higher Secondary School, Room 1', district: 'Bhopal', state: 'Madhya Pradesh', officersCount: 2, registeredVoters: 1420, status: 'ACTIVE' },
    { id: 'PS-BPL-015', name: 'Community Health Center, Arera Colony', district: 'Bhopal', state: 'Madhya Pradesh', officersCount: 1, registeredVoters: 980, status: 'ACTIVE' },
    { id: 'PS-MUM-045', name: 'BMC Municipal School, Dada Saheb Phalke Marg', district: 'Mumbai', state: 'Maharashtra', officersCount: 3, registeredVoters: 2150, status: 'ACTIVE' },
    { id: 'PS-DEL-101', name: 'New Delhi Central Kendriya Vidyalaya, Hall A', district: 'New Delhi', state: 'Delhi', officersCount: 2, registeredVoters: 1850, status: 'ACTIVE' }
  ]);

  const [symbols, setSymbols] = useState([
    { id: 'sym-1', name: 'Lotus 🪷', status: 'RESERVED', party: 'Bharatiya Janata Party (BJP)' },
    { id: 'sym-2', name: 'Hand ✋', status: 'RESERVED', party: 'Indian National Congress (INC)' },
    { id: 'sym-3', name: 'Broom 🧹', status: 'RESERVED', party: 'Aam Aadmi Party (AAP)' },
    { id: 'sym-4', name: 'Kite 🪁', status: 'FREE', party: null },
    { id: 'sym-5', name: 'Umbrella ☂️', status: 'FREE', party: null },
    { id: 'sym-6', name: 'Balloon 🎈', status: 'FREE', party: null },
    { id: 'sym-7', name: 'Clock ⏰', status: 'FREE', party: null },
    { id: 'sym-8', name: 'Bicycle 🚲', status: 'FREE', party: null },
    { id: 'sym-9', name: 'Bow & Arrow 🏹', status: 'FREE', party: null },
    { id: 'sym-10', name: 'Trumpet 🎺', status: 'FREE', party: null }
  ]);

  // Modals inside specific tabs
  const [showDeployOfficer, setShowDeployOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', district: '', state: '', contact: '', station: '' });

  const [showAddStation, setShowAddStation] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', district: '', state: '', registeredVoters: '' });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Detect super admin level
  const isSuperAdmin = currentUser && currentUser.role === 'ELECTION_COMMISSION';

  // Safeguard write actions
  const ensureAdminPrivilege = (actionName) => {
    if (!isSuperAdmin) {
      setError(`Access Denied: Cannot perform "${actionName}". You are in Observer mode. Only authenticated ECI Super Admins have permission to modify system state.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setError(''), 6000);
      return false;
    }
    return true;
  };

  useEffect(() => {
    fetchAdminData();
  }, [adminTab]);

  const fetchAdminData = async () => {
    try {
      setError('');
      setMessage('');
      
      // Dynamic fetches depending on selected administrative tab
      if (adminTab === 'election_mgmt' || adminTab === 'result_mgmt' || adminTab === 'reports_analytics') {
        const data = await api.elections.list();
        setElections(data || []);
      }
      
      if (adminTab === 'nomination_mgmt' || adminTab === 'candidate_mgmt' || adminTab === 'symbol_mgmt') {
        const data = await api.candidates.list();
        setCandidates(data || []);
      }
      
      if (adminTab === 'party_mgmt' || adminTab === 'symbol_mgmt') {
        const data = await api.parties.list();
        setParties(data || []);
      }
      
      if (adminTab === 'voter_mgmt' || adminTab === 'user_management') {
        setVoters([
          { id: 'usr-voter-aman', mobileNumber: '9999999999', name: 'Aman Patel', role: 'VOTER', isVerified: true, age: 26, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
          { id: 'usr-cand-rahul', mobileNumber: '7777777777', name: 'Rahul Sharma', role: 'CANDIDATE', isVerified: true, age: 45, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
          { id: 'usr-sim-v-2', mobileNumber: '9123456780', name: 'Priya Nair', role: 'VOTER', isVerified: true, age: 17, state: 'Maharashtra', district: 'Mumbai', constituency: 'Ward 45', isBlocked: false },
          { id: 'usr-sim-v-3', mobileNumber: '9888877777', name: 'Rajesh Kumar', role: 'VOTER', isVerified: true, age: 62, state: 'Delhi', district: 'New Delhi', constituency: 'New Delhi Seat', isBlocked: true }
        ]);
      }
      
      if (adminTab === 'notification_center') {
        const data = await api.notifications.list();
        setNotifications(data || []);
      }
      
      if (adminTab === 'system_settings' || adminTab === 'document_verification') {
        const data = await api.stats.logs(currentUser ? currentUser.id : 'usr-ec-admin');
        setLogs(data || []);
      }
    } catch (e) {
      setError(e.message || 'Error synchronization of ECI data.');
    }
  };

  // 1. Election Mgmt Actions
  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!ensureAdminPrivilege('Create Election Context')) return;
    try {
      const res = await api.elections.create({ ...newElection, adminId: currentUser.id });
      if (res.success) {
        setMessage(`New election context "${newElection.title}" created successfully!`);
        setShowCreateElection(false);
        setNewElection({
          title: '',
          level: ELECTION_LEVELS[0],
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
          position: '',
          cityGramNagar: '',
          votingDate: '',
          countingDate: ''
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateElectionStatus = async (id, status) => {
    if (!ensureAdminPrivilege('Advance Election Phase')) return;
    try {
      const res = await api.elections.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Election phase advanced to: ${status.replace('_', ' ')}.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteElection = async (id) => {
    if (!ensureAdminPrivilege('Drop Election Context')) return;
    if (!confirm('Are you sure you want to terminate this election context? All votes will be deleted.')) return;
    try {
      const res = await api.elections.delete(id, currentUser.id);
      if (res.success) {
        setMessage('Election context terminated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. Nomination & Party Status
  const handleUpdateCandidateStatus = async (id, status) => {
    if (!ensureAdminPrivilege('Audit Candidate nomination')) return;
    try {
      const res = await api.candidates.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Candidate nomination audit finalized: ${status}.`);
        setSelectedCandidate(null);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePartyStatus = async (id, status) => {
    if (!ensureAdminPrivilege('Modify Party Registration Status')) return;
    try {
      const res = await api.parties.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Party registration updated to ${status}.`);
        setSelectedParty(null);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. Voter Mgmt
  const handleToggleBlockVoter = async (id, currentlyBlocked) => {
    if (!ensureAdminPrivilege('Modify Voter Node Compliance')) return;
    try {
      const res = await api.auth.blockUser(id, !currentlyBlocked, currentUser.id);
      if (res.success) {
        setMessage(`Voter profile ${currentlyBlocked ? 'reinstated' : 'suspended'} successfully.`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 4. Notification Mgmt
  const handleCreateNotif = async (e) => {
    e.preventDefault();
    if (!ensureAdminPrivilege('Broadcast gazette')) return;
    try {
      const res = await api.notifications.create({ ...newNotif, adminId: currentUser.id });
      if (res.success) {
        setMessage('Official ECI bulletin bulletin bulletin announcement posted successfully!');
        setShowCreateNotif(false);
        setNewNotif({ title: '', content: '', type: 'UPDATE' });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // 5. Officer and Station deployments (Simulated state)
  const handleDeployOfficer = (e) => {
    e.preventDefault();
    if (!ensureAdminPrivilege('Deploy Election Officer')) return;
    if (!newOfficer.name || !newOfficer.district || !newOfficer.station) {
      setError('Please fill in officer deployment details.');
      return;
    }
    const newlyAdded = {
      id: `off-${Math.floor(100 + Math.random() * 900)}`,
      name: newOfficer.name,
      district: newOfficer.district,
      state: newOfficer.state || 'Madhya Pradesh',
      contact: newOfficer.contact || '+91 9999900000',
      station: newOfficer.station,
      status: 'DEPLOYED'
    };
    setOfficers([...officers, newlyAdded]);
    setNewOfficer({ name: '', district: '', state: '', contact: '', station: '' });
    setShowDeployOfficer(false);
    setMessage(`Election Officer "${newlyAdded.name}" deployed to "${newlyAdded.station}" successfully!`);
  };

  const handleAddStation = (e) => {
    e.preventDefault();
    if (!ensureAdminPrivilege('Register Polling Station')) return;
    if (!newStation.name || !newStation.district) {
      setError('Please fill in polling station details.');
      return;
    }
    const newlyAdded = {
      id: `PS-${newStation.district.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newStation.name,
      district: newStation.district,
      state: newStation.state || 'Madhya Pradesh',
      officersCount: 0,
      registeredVoters: Number(newStation.registeredVoters) || 1200,
      status: 'ACTIVE'
    };
    setStations([...stations, newlyAdded]);
    setNewStation({ name: '', district: '', state: '', registeredVoters: '' });
    setShowAddStation(false);
    setMessage(`Polling Station "${newlyAdded.name}" registered successfully under ID ${newlyAdded.id}!`);
  };

  const handleAllocateSymbol = (candId, symbolObj) => {
    if (!ensureAdminPrivilege('Allocate Election Symbol')) return;
    
    const updatedCandidates = candidates.map(c => {
      if (c.id === candId) return { ...c, partySymbol: symbolObj.name };
      return c;
    });
    setCandidates(updatedCandidates);

    const updatedSymbols = symbols.map(s => {
      if (s.id === symbolObj.id) {
        return { ...s, status: 'ALLOCATED', party: `Nominee: ${candidates.find(cand => cand.id === candId)?.name || candId}` };
      }
      return s;
    });
    setSymbols(updatedSymbols);
    setMessage(`Electoral Symbol "${symbolObj.name}" allocated successfully!`);
  };

  // 6. System backups
  const handleBackup = async () => {
    if (!ensureAdminPrivilege('Create System Backup')) return;
    try {
      const res = await api.admin.backup(currentUser.id);
      if (res.success) setMessage('Full system schema snapshot and database backup created successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async () => {
    if (!ensureAdminPrivilege('Restore Default Database')) return;
    if (!confirm('WARNING: This will wipe out all user-added entries and restore ECI core simulation to factory default. Proceed?')) return;
    try {
      const res = await api.admin.restore(currentUser.id);
      if (res.success) {
        setMessage('System database wiped and restored to default seed values.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter lists based on search bars
  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(voterSearch.toLowerCase()) || 
    v.mobileNumber.includes(voterSearch) ||
    v.district.toLowerCase().includes(voterSearch.toLowerCase())
  );

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(candidateSearch.toLowerCase()) || 
    c.constituency.toLowerCase().includes(candidateSearch.toLowerCase()) || 
    (c.partyName && c.partyName.toLowerCase().includes(candidateSearch.toLowerCase()))
  );

  const filteredParties = parties.filter(p => 
    p.name.toLowerCase().includes(partySearch.toLowerCase()) || 
    p.abbrev.toLowerCase().includes(partySearch.toLowerCase())
  );

  return (
    <div id="eci-admin-dashboard" className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Header of the Administration Console */}
      <header className="bg-gradient-to-r from-red-900 to-red-950 text-white py-4 px-6 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/20">
            <Landmark className="w-6 h-6 text-saffron-400" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display uppercase tracking-wider">Election Commission of India</h1>
            <p className="text-[10px] text-gray-300">Administrative Cyber Control Core • ECI Secure Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right md:block hidden">
            <span className="text-xs font-bold block">{currentUser?.name || 'Public Observer'}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full inline-block mt-0.5 ${isSuperAdmin ? 'bg-saffron-500 text-red-950 font-bold' : 'bg-gray-700 text-gray-300'}`}>
              {isSuperAdmin ? 'Super Admin (ECI)' : 'Public Visitor Mode'}
            </span>
          </div>
          
          {onNavigateToHome && (
            <button 
              onClick={onNavigateToHome}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg border border-white/10 transition cursor-pointer"
            >
              ← Leave Console
            </button>
          )}
        </div>
      </header>

      {/* Mobile Horizontal Menu bar - hidden on md: */}
      <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto whitespace-nowrap px-4 py-2 flex gap-2 scrollbar-none shrink-0">
        {TABS_CONFIG.map(item => {
          const Icon = item.icon;
          const isSelected = adminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setAdminTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-red-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-saffron-500" />
              <span>{item.label.substring(item.label.indexOf('.') + 2)}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Left Navigation Rail (Crimson Styled Sidebar for 14 tabs) */}
        <aside className="hidden md:flex w-80 bg-white border-r border-gray-200 p-4 shrink-0 flex-col gap-6">
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex gap-2.5 items-center">
              <ShieldAlert className="w-5 h-5 text-red-800" />
              <div>
                <h2 className="text-xs font-bold text-red-950">Administrative Portal</h2>
                <p className="text-[9px] text-red-700 font-medium">14 Core Lifecycle Jurisdictions</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[calc(100vh-220px)]">
            {['Core Lifecycle', 'Registry Records', 'Deployments & Symbols', 'Compliance & Audits'].map(group => (
              <div key={group} className="space-y-1">
                <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 block px-2 mb-1.5">{group}</span>
                <div className="space-y-0.5">
                  {TABS_CONFIG.filter(tab => tab.group === group).map(tab => {
                    const Icon = tab.icon;
                    const isActive = adminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                          isActive 
                            ? 'bg-red-800 text-white shadow-md shadow-red-900/10' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-saffron-300' : 'text-gray-400'}`} />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="pt-2 border-t text-center text-[10px] text-gray-400 font-mono">
            IP Compliance Secured • SSL 256
          </div>
        </aside>

        {/* Right Tab Content Canvas */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 max-h-[calc(100vh-80px)]">
          
          {/* Read-only Alert Warning for Non-Admins */}
          {!isSuperAdmin && (
            <div className="mb-6 bg-gradient-to-r from-red-900 to-red-950 text-white p-4 rounded-xl shadow-md border-l-4 border-saffron-500 flex gap-3.5 items-center">
              <Lock className="w-5 h-5 text-saffron-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-saffron-300">Public Read-Only Access Mode</h4>
                <p className="text-[11px] text-gray-200 mt-0.5">
                  You are exploring the live ECI Administrative Dashboard with public view-only credentials. 
                  All writing modules (e.g. creating elections, approving candidates, blocking voter logs, or triggering backups) are simulated as locked. 
                  Log in as <span className="font-bold underline text-white font-mono">ELECTION_COMMISSION</span> inside "Officer Auth" to gain write privileges.
                </p>
              </div>
            </div>
          )}

          {/* Action Notices (Messages & Errors) */}
          {message && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-green-50 border border-green-200 text-green-800 p-3.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" /> {message}
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-lg text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" /> {error}
            </motion.div>
          )}

          {/* Render Active Tab Area */}
          <div className="space-y-6">
            
            {/* 1. Election Management Tab */}
            {adminTab === 'election_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Election Lifecycle Control</h3>
                    <p className="text-xs text-gray-400">Launch and control scheduled civic or federal elections</p>
                  </div>
                  <button
                    onClick={() => setShowCreateElection(true)}
                    className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {!isSuperAdmin && <Lock className="w-3.5 h-3.5" />}
                    <Plus className="w-4 h-4" /> Setup New Election Context
                  </button>
                </div>

                {/* Create Election Inline Form Panel */}
                {showCreateElection && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white p-5 rounded-xl border border-gray-200 shadow-lg space-y-4">
                    <div className="flex justify-between border-b pb-2">
                      <h4 className="text-xs font-bold text-gray-800 uppercase">Create New Election Constituency State</h4>
                      <button onClick={() => setShowCreateElection(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">✕ Close</button>
                    </div>
                    <form onSubmit={handleCreateElection} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 col-span-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Election Event Title</label>
                        <input type="text" placeholder="e.g. Bihar Legislative Assembly Elections 2026" className="w-full text-xs p-2.5 border rounded-lg" value={newElection.title} onChange={e => setNewElection({ ...newElection, title: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Election Category Level</label>
                        <select
                          className="w-full text-xs p-2.5 border bg-white rounded-lg font-bold"
                          value={newElection.level}
                          onChange={e => {
                            const selectedLvl = e.target.value;
                            setNewElection({
                              ...newElection,
                              level: selectedLvl,
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
                        >
                          {ELECTION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>

                      <div className="col-span-1 md:col-span-3 border-t border-gray-100 pt-3">
                        <ElectionHierarchyEngine
                          level={newElection.level}
                          formValues={newElection}
                          onChange={updated => setNewElection(updated)}
                          showBreadcrumbs={true}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Voting Date</label>
                        <input type="date" className="w-full text-xs p-2.5 border rounded-lg" value={newElection.votingDate} onChange={e => setNewElection({ ...newElection, votingDate: e.target.value })} required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Counting Date</label>
                        <input type="date" className="w-full text-xs p-2.5 border rounded-lg" value={newElection.countingDate} onChange={e => setNewElection({ ...newElection, countingDate: e.target.value })} required />
                      </div>
                      <div className="flex items-end">
                        <button type="submit" className="w-full py-2.5 bg-red-800 text-white font-bold text-xs rounded-lg cursor-pointer">
                          Publish Official Context
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Elections List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase">Active Electoral Contests</div>
                  <div className="divide-y divide-gray-100">
                    {elections.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">No scheduled elections found. Click "Setup New Election" to launch.</div>
                    ) : (
                      elections.map(elec => (
                        <div key={elec.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-red-50 text-red-800 rounded-full">{elec.level}</span>
                            <h4 className="text-xs font-extrabold text-gray-900">{elec.title}</h4>
                            <p className="text-[10px] text-gray-400 font-mono">Constituency: {elec.constituency || 'All Nation'} | State: {elec.state || 'National'}</p>
                            <p className="text-[10px] text-gray-500">🗓️ Voting: <span className="font-semibold text-gray-800">{elec.votingDate}</span> | Counting: <span className="font-semibold text-gray-800">{elec.countingDate}</span></p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 mr-2 font-bold uppercase">Status: <span className="text-red-950 underline">{elec.status}</span></span>
                            
                            {elec.status === 'CREATED' && (
                              <button onClick={() => handleUpdateElectionStatus(elec.id, 'REGISTRATION_OPEN')} className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[10px] font-bold rounded flex items-center gap-1 transition">
                                Open Regs
                              </button>
                            )}
                            
                            {elec.status === 'REGISTRATION_OPEN' && (
                              <button onClick={() => handleUpdateElectionStatus(elec.id, 'VOTING_OPEN')} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded flex items-center gap-1 transition">
                                <Play className="w-3 h-3" /> Start Voting
                              </button>
                            )}

                            {elec.status === 'VOTING_OPEN' && (
                              <button onClick={() => handleUpdateElectionStatus(elec.id, 'RESULTS_PUBLISHED')} className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold rounded flex items-center gap-1 transition">
                                <Square className="w-3 h-3" /> Count & Publish
                              </button>
                            )}

                            <button onClick={() => handleDeleteElection(elec.id)} className="p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded transition" title="Delete Context">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Nomination Management Tab */}
            {adminTab === 'nomination_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Candidate Affidavit Audit (Form 26)</h3>
                  <p className="text-xs text-gray-400">Perform statutory background verification on self-declared assets, criminal logs, and educational certificates of nominees</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between gap-4">
                    <span className="font-bold text-xs text-gray-500 uppercase">Incoming Affidavits Registry</span>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                      <input type="text" placeholder="Search nominees..." className="pl-8 pr-3 py-1.5 border text-xs rounded-lg w-56" value={candidateSearch} onChange={e => setCandidateSearch(e.target.value)} />
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredCandidates.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400">No candidate nomination affidavits currently require review.</div>
                    ) : (
                      filteredCandidates.map(c => (
                        <div key={c.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={c.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} className="w-10 h-10 rounded-lg object-cover border" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="text-xs font-extrabold text-gray-900">{c.name}</h4>
                              <p className="text-[10px] text-gray-500">Constituency: <span className="font-semibold text-gray-700">{c.constituency}</span> | Party: <span className="font-semibold text-gray-700">{c.isIndependent ? 'Independent' : c.partyName}</span></p>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : c.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                STATUS: {c.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedCandidate(c)}
                              className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white font-bold text-[10px] rounded transition flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Audit Affidavit
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Candidate Affidavit Detail Verification Modal */}
                {selectedCandidate && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
                      <div className="flex justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-red-800" />
                          <h4 className="text-sm font-extrabold text-gray-900 uppercase">Statutory Form 26 Audit: {selectedCandidate.name}</h4>
                        </div>
                        <button onClick={() => setSelectedCandidate(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕ Close</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Basic Details</p>
                          <p><strong>Age:</strong> {selectedCandidate.age || 'Not specified'}</p>
                          <p><strong>Education:</strong> {selectedCandidate.education || 'No declared degree'}</p>
                          <p><strong>Mobile:</strong> {selectedCandidate.mobileNumber || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Electoral Alignment</p>
                          <p><strong>Election:</strong> {selectedCandidate.electionTitle}</p>
                          <p><strong>Constituency:</strong> {selectedCandidate.constituency}</p>
                          <p><strong>Affiliation:</strong> {selectedCandidate.isIndependent ? 'Independent' : selectedCandidate.partyName}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg col-span-2 space-y-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Declared Financial Assets & Net Worth</p>
                          <p className="text-red-950 font-bold text-sm">{selectedCandidate.assets || '₹0.00'}</p>
                          <p className="text-[10px] text-gray-400">Self-attested and submitted with the District Returning Officer (DRO).</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg col-span-2 space-y-1">
                          <p className="text-[9px] text-gray-400 font-bold uppercase">Affidavit Narrative / Manifesto</p>
                          <p className="italic text-gray-600">"{selectedCandidate.manifesto || 'No manifesto submitted.'}"</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t flex justify-end gap-3">
                        <button
                          onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'REJECTED')}
                          className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-lg transition"
                        >
                          Reject Nomination
                        </button>
                        <button
                          onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'APPROVED')}
                          className="px-4 py-2 bg-green-700 text-white hover:bg-green-800 font-bold text-xs rounded-lg transition"
                        >
                          Approve Nomination
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Result Management Tab */}
            {adminTab === 'result_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Ballot Counting & Results Core</h3>
                  <p className="text-xs text-gray-400">Compile cryptographic votes and publish gazetted results</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {elections.map(elec => {
                    const isPublished = elec.status === 'RESULTS_PUBLISHED';
                    return (
                      <div key={elec.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-800 rounded font-bold">{elec.level}</span>
                            <h4 className="text-xs font-extrabold text-red-950 mt-1">{elec.title}</h4>
                          </div>
                          <span className={`text-[10px] font-bold ${isPublished ? 'text-green-600' : 'text-amber-500'}`}>
                            {elec.status}
                          </span>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg text-xs space-y-1 font-mono">
                          <p><strong>Total Voters Base:</strong> {elec.totalVotersInConstituency?.toLocaleString() || '250,000'}</p>
                          <p><strong>Total Ballots Logged:</strong> {elec.voteCount?.toLocaleString() || '0'}</p>
                          <p><strong>Nominees Registered:</strong> {elec.candidateCount || '0'}</p>
                        </div>

                        {isPublished ? (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs space-y-1">
                            <p className="font-bold text-green-900">🏆 ECI DECLARATION WINNER:</p>
                            <p><strong>Candidate:</strong> {elec.winnerName}</p>
                            <p><strong>Party:</strong> {elec.winnerParty}</p>
                            <p><strong>Polled Votes:</strong> {elec.winnerVotes?.toLocaleString()} / Turnout: {Math.round((elec.winnerVotes / elec.voteCount) * 100) || 100}%</p>
                          </div>
                        ) : (
                          <div className="pt-2">
                            <button
                              onClick={() => handleUpdateElectionStatus(elec.id, 'RESULTS_PUBLISHED')}
                              className="w-full py-2 bg-gradient-to-r from-red-800 to-red-900 text-white font-bold text-xs rounded-lg shadow cursor-pointer"
                            >
                              Compile & Publish Gazetted Winner
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Political Party Management Tab */}
            {adminTab === 'party_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Political Party Registry Core</h3>
                    <p className="text-xs text-gray-400">View registered high-commands and verify system symbols</p>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Search parties..." className="pl-8 pr-3 py-1.5 border text-xs rounded-lg w-56 animate-fade-in" value={partySearch} onChange={e => setPartySearch(e.target.value)} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase">National & State Recognized Parties</div>
                  <div className="divide-y divide-gray-100">
                    {filteredParties.map(p => (
                      <div key={p.id} className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-bold border">
                            {p.symbol?.split(' ')[1] || '🏛️'}
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-gray-900">{p.name} ({p.abbrev})</h4>
                            <p className="text-[10px] text-gray-400">Reserved Symbol: <span className="font-semibold text-gray-700">{p.symbol}</span> | Registration: <span className="font-semibold text-gray-700">{p.registrationNumber || 'PENDING'}</span></p>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-bold inline-block mt-1 ${p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              STATUS: {p.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          {p.status === 'PENDING' && (
                            <button onClick={() => handleUpdatePartyStatus(p.id, 'APPROVED')} className="px-2.5 py-1 bg-green-600 text-white font-bold text-[10px] rounded transition">
                              Approve Registration
                            </button>
                          )}
                          {p.status === 'APPROVED' ? (
                            <button onClick={() => handleUpdatePartyStatus(p.id, 'SUSPENDED')} className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-[10px] rounded hover:bg-rose-100 transition">
                              Suspend Party
                            </button>
                          ) : (
                            <button onClick={() => handleUpdatePartyStatus(p.id, 'APPROVED')} className="px-2.5 py-1 bg-green-50 text-green-700 font-bold text-[10px] rounded hover:bg-green-100 transition">
                              Reinstate Party
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. Candidate Management Tab */}
            {adminTab === 'candidate_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Candidate Profiles Directory</h3>
                  <p className="text-xs text-gray-400">View details of approved nominees campaigning across active constituencies</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidates.filter(c => c.status === 'APPROVED').map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                      <img src={c.photo} className="w-16 h-16 rounded-lg object-cover border shrink-0" referrerPolicy="no-referrer" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-900">{c.name}</h4>
                        <p className="text-[10px] text-gray-500"><strong>Constituency:</strong> {c.constituency} ({c.state})</p>
                        <p className="text-[10px] text-gray-500"><strong>Declared Worth:</strong> {c.netWorth || c.assets}</p>
                        <p className="text-[10px] text-gray-500"><strong>Symbol:</strong> {c.partySymbol || 'None Allocated'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Voter Management Tab */}
            {adminTab === 'voter_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">National Voter Registry & Compliance</h3>
                    <p className="text-xs text-gray-400">Audit demographic profiles and lock suspicious credentials</p>
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                    <input type="text" placeholder="Search voter logs..." className="pl-8 pr-3 py-1.5 border text-xs rounded-lg w-56" value={voterSearch} onChange={e => setVoterSearch(e.target.value)} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="divide-y divide-gray-100 text-xs">
                    {filteredVoters.map(v => (
                      <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-extrabold text-gray-900">{v.name}</h4>
                          <p className="text-[10px] text-gray-400 font-mono">Mobile ID: +91 {v.mobileNumber} | State: {v.state || 'N/A'}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold inline-block mt-1 ${v.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800'}`}>
                            {v.isBlocked ? 'Suspended for Security' : 'Verified voter'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleBlockVoter(v.id, v.isBlocked)}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded transition cursor-pointer ${
                            v.isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {v.isBlocked ? 'Reinstate Access' : 'Suspend Node'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7. Election Officer Management Tab */}
            {adminTab === 'officer_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Election Officer Deployments</h3>
                    <p className="text-xs text-gray-400">Deploy ECI returning officers to manage polling stations</p>
                  </div>
                  <button
                    onClick={() => setShowDeployOfficer(true)}
                    className="px-4 py-2 bg-red-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Deploy Returning Officer
                  </button>
                </div>

                {showDeployOfficer && (
                  <motion.div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-800 border-b pb-2">Deploy Officer Form</h4>
                    <form onSubmit={handleDeployOfficer} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Full Name</label>
                        <input type="text" className="w-full p-2 border rounded-lg mt-1" required value={newOfficer.name} onChange={e => setNewOfficer({ ...newOfficer, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">District Location</label>
                        <input type="text" className="w-full p-2 border rounded-lg mt-1" required value={newOfficer.district} onChange={e => setNewOfficer({ ...newOfficer, district: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Assigned Polling Booth Station Name</label>
                        <input type="text" className="w-full p-2 border rounded-lg mt-1" required value={newOfficer.station} onChange={e => setNewOfficer({ ...newOfficer, station: e.target.value })} />
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowDeployOfficer(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-red-800 text-white font-bold rounded-lg">Authorize Deploy</button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b uppercase font-bold text-gray-400 text-[10px]">
                      <tr>
                        <th className="p-3">Officer ID</th>
                        <th className="p-3">Officer Name</th>
                        <th className="p-3">District / State</th>
                        <th className="p-3">Polling Station</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {officers.map(off => (
                        <tr key={off.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-mono font-bold text-gray-500">{off.id}</td>
                          <td className="p-3 font-bold text-gray-900">{off.name}</td>
                          <td className="p-3">{off.district}, {off.state}</td>
                          <td className="p-3 text-gray-500 font-medium">{off.station}</td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[9px]">
                              {off.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. Polling Station Management Tab */}
            {adminTab === 'station_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Polling Station & Booth Register</h3>
                    <p className="text-xs text-gray-400">Map local municipal school and health centers as statutory polling rooms</p>
                  </div>
                  <button
                    onClick={() => setShowAddStation(true)}
                    className="px-4 py-2 bg-red-800 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Register New Polling Booth
                  </button>
                </div>

                {showAddStation && (
                  <motion.div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-800 border-b pb-2">Add Polling Station</h4>
                    <form onSubmit={handleAddStation} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Station School/Center Name</label>
                        <input type="text" className="w-full p-2 border rounded-lg mt-1" required value={newStation.name} onChange={e => setNewStation({ ...newStation, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">District Location</label>
                        <input type="text" className="w-full p-2 border rounded-lg mt-1" required value={newStation.district} onChange={e => setNewStation({ ...newStation, district: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Total Registered Voters Allocation</label>
                        <input type="number" className="w-full p-2 border rounded-lg mt-1" required value={newStation.registeredVoters} onChange={e => setNewStation({ ...newStation, registeredVoters: e.target.value })} />
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button type="button" onClick={() => setShowAddStation(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-red-800 text-white font-bold rounded-lg">Register Booth</button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 border-b uppercase font-bold text-gray-400 text-[10px]">
                      <tr>
                        <th className="p-3">Booth ID</th>
                        <th className="p-3">Station Name</th>
                        <th className="p-3">District Location</th>
                        <th className="p-3">Assigned Officers</th>
                        <th className="p-3">Voter Count</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {stations.map(st => (
                        <tr key={st.id} className="hover:bg-gray-50/50">
                          <td className="p-3 font-mono font-bold text-gray-500">{st.id}</td>
                          <td className="p-3 font-bold text-gray-900">{st.name}</td>
                          <td className="p-3">{st.district}, {st.state}</td>
                          <td className="p-3 font-medium text-red-900">{st.officersCount || '1'} Officers</td>
                          <td className="p-3 font-mono">{st.registeredVoters?.toLocaleString()} Voters</td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[9px]">
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 9. Election Symbol Management Tab */}
            {adminTab === 'symbol_mgmt' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Electoral Symbol Reservation & Allocation</h3>
                  <p className="text-xs text-gray-400">Allocate free symbols to independent candidates or lock national party logos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free Symbol Pool */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-2">ECI Free Symbol Pool</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {symbols.map(sym => (
                        <div key={sym.id} className="p-3 bg-gray-50 rounded-lg border flex items-center justify-between">
                          <div>
                            <span className="text-xl mr-2">{sym.name.split(' ')[1] || sym.name}</span>
                            <span className="text-[10px] font-bold text-gray-700">{sym.name.split(' ')[0]}</span>
                          </div>
                          <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ${sym.status === 'RESERVED' ? 'bg-red-100 text-red-800' : sym.status === 'ALLOCATED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                            {sym.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allocate Free Symbol Form */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-2">Assign Free Symbol to Independent Nominee</h4>
                    <div className="space-y-3 text-xs">
                      <p className="text-gray-400">Choose an approved nominee currently lacking symbol allocation:</p>
                      <div className="divide-y divide-gray-100">
                        {candidates.filter(c => c.status === 'APPROVED' && !c.partySymbol).map(c => (
                          <div key={c.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <p className="font-bold">{c.name}</p>
                              <p className="text-[10px] text-gray-400">Constituency: {c.constituency}</p>
                            </div>
                            <div className="flex gap-1.5">
                              {symbols.filter(s => s.status === 'FREE').slice(0, 3).map(s => (
                                <button
                                  key={s.id}
                                  onClick={() => handleAllocateSymbol(c.id, s)}
                                  className="p-1 bg-red-50 hover:bg-red-100 border text-xs rounded"
                                  title={`Allocate ${s.name}`}
                                >
                                  {s.name.split(' ')[1]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. Reports & Analytics Tab */}
            {adminTab === 'reports_analytics' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Administrative Reports & Turnout Analytics</h3>
                  <p className="text-xs text-gray-400">Real-time statistics compiled across digital ballot registers</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400">National Turnout</span>
                    <p className="text-2xl font-extrabold text-red-950 font-mono mt-1">67.4%</p>
                    <span className="text-[9px] text-green-600 font-medium">↑ +1.2% vs 2024</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Voters Enrolled</span>
                    <p className="text-2xl font-extrabold text-red-950 font-mono mt-1">942M</p>
                    <span className="text-[9px] text-gray-500 font-medium">98.2% Coverage</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400">EVM Audits Completed</span>
                    <p className="text-2xl font-extrabold text-red-950 font-mono mt-1">100%</p>
                    <span className="text-[9px] text-green-600 font-medium">Complies with ECI standards</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                    <span className="text-[9px] uppercase font-bold text-gray-400">Active Ballots Cashed</span>
                    <p className="text-2xl font-extrabold text-red-950 font-mono mt-1">4.2M</p>
                    <span className="text-[9px] text-gray-500 font-medium">Simulated logs</span>
                  </div>
                </div>

                {/* Turnout SVG Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-500">Gender & Age Division Turnout Ratio</h4>
                  <div className="h-44 w-full flex items-end gap-10 justify-center pt-8 border-b">
                    {[
                      { label: 'Male', pct: 68, color: 'bg-red-800' },
                      { label: 'Female', pct: 66, color: 'bg-saffron-500' },
                      { label: 'Youth (18-25)', pct: 74, color: 'bg-blue-800' },
                      { label: 'Senior Citizen', pct: 59, color: 'bg-gray-700' }
                    ].map(bar => (
                      <div key={bar.label} className="flex flex-col items-center gap-2">
                        <div className="w-12 text-center text-xs font-bold">{bar.pct}%</div>
                        <div className={`w-10 rounded-t ${bar.color}`} style={{ height: `${bar.pct * 1.5}px` }}></div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">{bar.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 11. Notification Center Tab */}
            {adminTab === 'notification_center' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Official Gazettes & Bulletins</h3>
                    <p className="text-xs text-gray-400">Publish guidelines regarding Model Code of Conduct to citizens and nominees</p>
                  </div>
                  <button
                    onClick={() => setShowCreateNotif(true)}
                    className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                  >
                    Setup ECI Gazetted circular
                  </button>
                </div>

                {showCreateNotif && (
                  <motion.div className="bg-white p-4 rounded-xl border border-gray-200 shadow-lg space-y-4">
                    <h4 className="text-xs font-bold uppercase text-gray-800 border-b pb-2">Publish Bulletin Announcement</h4>
                    <form onSubmit={handleCreateNotif} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Bulletin Header Title</label>
                        <input type="text" className="w-full p-2.5 border rounded-lg mt-1" required value={newNotif.title} onChange={e => setNewNotif({ ...newNotif, title: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Notification Type</label>
                        <select className="w-full p-2.5 border bg-white rounded-lg mt-1" value={newNotif.type} onChange={e => setNewNotif({ ...newNotif, type: e.target.value })}>
                          <option value="URGENT">🔴 Urgent Alert</option>
                          <option value="UPDATE">🔵 General Notification Update</option>
                          <option value="ELECTION">🟠 Official Electoral Gazette</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400">Content / Gazette Narrative</label>
                        <textarea className="w-full p-2.5 border rounded-lg mt-1 h-24" required value={newNotif.content} onChange={e => setNewNotif({ ...newNotif, content: e.target.value })}></textarea>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCreateNotif(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-red-800 text-white font-bold rounded-lg">Broadcast Gazette</button>
                      </div>
                    </form>
                  </motion.div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase">Gazettes & Circular Alert logs</div>
                  <div className="divide-y divide-gray-100 p-4 space-y-4">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-4 rounded-xl bg-gray-50 border space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded uppercase ${notif.type === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700'}`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{notif.timestamp ? new Date(notif.timestamp).toLocaleString() : 'Just now'}</span>
                        </div>
                        <h4 className="text-xs font-bold text-red-950">{notif.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{notif.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 12. Document Verification Tab */}
            {adminTab === 'document_verification' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Aadhaar & Biometric Security Cryptographic Audit</h3>
                  <p className="text-xs text-gray-400">Verifying security hashes and KYC validation logs generated by the system</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-500">Aadhaar UIDAI Secure Handshake Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-1">
                        <span>CIDR API Handshake:</span>
                        <span className="text-green-600 font-bold">🟢 Connected & Authorized</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span>Biometric FaceRD Engine:</span>
                        <span className="text-green-600 font-bold">🟢 Online (v2.4)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OTP Gateway:</span>
                        <span className="text-green-600 font-bold">🟢 Operational</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase text-gray-500">Real-Time Cryptographic KYC Validation stream</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 font-mono text-[10px] divide-y divide-gray-100">
                      <p className="py-1">🔓 SHA256-VOTER-SALT::03f4a9b... matching OK (100%)</p>
                      <p className="py-1">🔓 UIDAI_MATCH_SUCCESS::+91 99*****999 OK (100%)</p>
                      <p className="py-1">🔓 FORMD26_AFFIDAVIT_SECURE_SIGNED::sha256 matching OK (100%)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 13. User Management Tab */}
            {adminTab === 'user_management' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Portal Access Roles Overview</h3>
                  <p className="text-xs text-gray-400">Registered roles active on the national digital election server</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-white border rounded-xl text-center">
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Super Admins</p>
                    <p className="text-xl font-bold mt-1 text-red-950">1</p>
                  </div>
                  <div className="p-4 bg-white border rounded-xl text-center">
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Party Admins</p>
                    <p className="text-xl font-bold mt-1 text-red-950">3</p>
                  </div>
                  <div className="p-4 bg-white border rounded-xl text-center">
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Registered Candidates</p>
                    <p className="text-xl font-bold mt-1 text-red-950">4</p>
                  </div>
                  <div className="p-4 bg-white border rounded-xl text-center">
                    <p className="text-gray-400 uppercase font-bold text-[9px]">Verified Voters</p>
                    <p className="text-xl font-bold mt-1 text-red-950">1,425</p>
                  </div>
                </div>
              </div>
            )}

            {/* 14. System Settings Tab */}
            {adminTab === 'system_settings' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">ECI Cyber Core System Settings</h3>
                  <p className="text-xs text-gray-400">Manage state persistence, backups, audit trails, and system defaults</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold uppercase text-gray-500 border-b pb-2">Operational State Backup & Recovery</h4>
                  <p className="text-xs text-gray-500">Back up all current elections, candidates, party registry, bulletins, and logged votes to persistent JSON storage.</p>
                  <div className="flex gap-4">
                    <button
                      onClick={handleBackup}
                      className="px-4 py-2 bg-red-800 text-white font-bold text-xs rounded-lg transition hover:bg-red-900 cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Trigger System Schema Backup
                    </button>
                    <button
                      onClick={handleRestore}
                      className="px-4 py-2 border text-red-700 font-bold text-xs rounded-lg transition hover:bg-red-50 border-red-200 cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Wipe & Restore Default DB Snapshot
                    </button>
                  </div>
                </div>

                {/* Audit Trail Logs */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase">ECI Cyber Core Audit Logs</div>
                  <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto p-4 text-xs font-mono space-y-1">
                    {logs.map(l => (
                      <div key={l.id} className="p-2 bg-gray-50 rounded border text-[10px]">
                        <span className="text-gray-400">[{new Date(l.timestamp).toLocaleTimeString()}]</span> <span className="font-bold text-red-900">{l.action}</span> - {l.details} (User: {l.userName})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
