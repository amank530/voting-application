import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS, STATE_LIST } from '../../services/constants';
import ElectionHierarchyEngine from '../../components/ElectionHierarchyEngine';
import DatabaseInspector from './DatabaseInspector';
import { 
  Landmark, Plus, Edit, Trash2, CheckCircle, Ban, Play, Square, Award, Users, 
  ShieldAlert, RefreshCw, AlertTriangle, FileText, Download, Sparkles, Check, X, Eye,
  UserCheck, MapPin, Bell, Lock, Fingerprint, Search, TrendingUp, HelpCircle, Database, LogOut,
  ChevronDown, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Define the ECI Administrative Core Tabs grouped into intuitive sections (excluding officer & symbol management)
const TABS_CONFIG = [
  { id: 'election_mgmt', label: '1. Election Management & Setup', icon: Landmark, group: 'Core Lifecycle' },
  { id: 'nomination_mgmt', label: '2. Nomination Management', icon: Award, group: 'Core Lifecycle' },
  { id: 'result_mgmt', label: '3. Result Management', icon: FileText, group: 'Core Lifecycle' },
  
  { id: 'party_mgmt', label: '4. Political Party Management', icon: Sparkles, group: 'Registry Records' },
  { id: 'candidate_mgmt', label: '5. Candidate Management', icon: Users, group: 'Registry Records' },
  { id: 'voter_mgmt', label: '6. Voter Management', icon: Users, group: 'Registry Records' },
  
  { id: 'reports_analytics', label: '7. Reports & Analytics', icon: TrendingUp, group: 'Compliance & Audits' },
  { id: 'notification_center', label: '8. Notification Center', icon: Bell, group: 'Compliance & Audits' },
  { id: 'document_verification', label: '9. Document Verification', icon: Fingerprint, group: 'Compliance & Audits' },
  { id: 'user_management', label: '10. User Management', icon: Users, group: 'Compliance & Audits' },
  { id: 'system_settings', label: '11. System Settings', icon: ShieldAlert, group: 'Compliance & Audits' },
  { id: 'database_state', label: '12. Database Inspector', icon: Database, group: 'Compliance & Audits' }
];

export default function EciAdminDashboard({ currentUser, onNavigateToHome, onLogout }) {
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [parties, setParties] = useState([]);
  const [voters, setVoters] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allDbUsers, setAllDbUsers] = useState([]);

  // Active tab inside ECI core
  const [adminTab, setAdminTab] = useState('election_mgmt');

  // Search states
  const [voterSearch, setVoterSearch] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [partySearch, setPartySearch] = useState('');

  // Form toggles and states
  const ALL_LOCAL_SUBTYPES = [
    'Gram Panchayat',
    'Ward Panchayat',
    'Block Samiti',
    'Zila Parishad',
    'Nagar Panchayat',
    'Municipal Corporation',
    'Municipal Council'
  ];

  const [showCreateElection, setShowCreateElection] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    level: 'Lok Sabha (MP)',
    subLevel: '',
    selectedSubLevels: ['Gram Panchayat', 'Ward Panchayat', 'Block Samiti', 'Zila Parishad', 'Nagar Panchayat', 'Municipal Corporation', 'Municipal Council'],
    selectedStates: [...STATE_LIST],
    votingDate: '',
    countingDate: ''
  });

  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({ title: '', content: '', type: 'UPDATE' });

  // Mock states for additional simulation modules
  const [stations, setStations] = useState([
    { id: 'PS-BPL-014', name: 'Government Boys Higher Secondary School, Room 1', district: 'Bhopal', state: 'Madhya Pradesh', officersCount: 2, registeredVoters: 1420, status: 'ACTIVE' },
    { id: 'PS-BPL-015', name: 'Community Health Center, Arera Colony', district: 'Bhopal', state: 'Madhya Pradesh', officersCount: 1, registeredVoters: 980, status: 'ACTIVE' },
    { id: 'PS-MUM-045', name: 'BMC Municipal School, Dada Saheb Phalke Marg', district: 'Mumbai', state: 'Maharashtra', officersCount: 3, registeredVoters: 2150, status: 'ACTIVE' },
    { id: 'PS-DEL-101', name: 'New Delhi Central Kendriya Vidyalaya, Hall A', district: 'New Delhi', state: 'Delhi', officersCount: 2, registeredVoters: 1850, status: 'ACTIVE' }
  ]);

  // Modals inside specific tabs
  const [showAddStation, setShowAddStation] = useState(false);
  const [newStation, setNewStation] = useState({ name: '', district: '', state: '', registeredVoters: '' });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedElectionModal, setSelectedElectionModal] = useState(null);

  // Deep detail views & document inspection
  const [selectedPartyForDetail, setSelectedPartyForDetail] = useState(null);
  const [selectedCandidateForDetail, setSelectedCandidateForDetail] = useState(null);
  const [selectedVoterForDetail, setSelectedVoterForDetail] = useState(null);
  const [partyStatusFilter, setPartyStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED'
  const [showPartyFilterMenu, setShowPartyFilterMenu] = useState(false);
  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [verifiedDocKeys, setVerifiedDocKeys] = useState({});
  
  // Confirms within details
  const [confirmDetailAction, setConfirmDetailAction] = useState(null); // { type: 'SUSPEND' | 'REINSTATE' | 'DELETE', targetId: string, label: string }

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Active Category Setup State variables
  const [activeConfig, setActiveConfig] = useState(() => {
    const saved = localStorage.getItem('eci_active_configuration');
    return saved ? JSON.parse(saved) : { category: '', subCategory: '', stateName: '', status: 'CLOSED' };
  });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [showStatePopup, setShowStatePopup] = useState(false);
  const [stateInput, setStateInput] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState('');

  // Detect super admin level
  const isSuperAdmin = currentUser && currentUser.role === 'ELECTION_COMMISSION';

  // Compute state-wise user distribution (both baseline census values and dynamic live database records)
  const stateData = useMemo(() => {
    const baseCounts = {
      'Andhra Pradesh': 28,
      'Bihar': 45,
      'Delhi': 32,
      'Gujarat': 25,
      'Karnataka': 30,
      'Madhya Pradesh': 52,
      'Maharashtra': 65,
      'Rajasthan': 36,
      'Tamil Nadu': 40,
      'Uttar Pradesh': 85,
      'West Bengal': 48
    };

    if (allDbUsers && allDbUsers.length > 0) {
      allDbUsers.forEach(u => {
        if (u.state) {
          const s = u.state.trim();
          if (baseCounts[s] !== undefined) {
            baseCounts[s] += 1;
          } else {
            baseCounts[s] = 1;
          }
        }
      });
    }

    return Object.entries(baseCounts)
      .map(([stateName, count]) => ({ stateName, count }))
      .sort((a, b) => b.count - a.count);
  }, [allDbUsers]);

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
      
      if (adminTab === 'reports_analytics') {
        try {
          const dbState = await api.admin.getDbState();
          if (dbState && dbState.collections && dbState.collections.users) {
            setAllDbUsers(dbState.collections.users);
          }
        } catch (dbErr) {
          console.error('Error fetching dbState for reports & analytics:', dbErr);
        }
      }
      
      if (adminTab === 'nomination_mgmt' || adminTab === 'candidate_mgmt') {
        const data = await api.candidates.list();
        setCandidates(data || []);
      }
      
      if (adminTab === 'party_mgmt') {
        const data = await api.parties.list();
        setParties(data || []);
      }
      
      if (adminTab === 'voter_mgmt' || adminTab === 'user_management') {
        try {
          const dbState = await api.admin.getDbState();
          if (dbState && dbState.collections && dbState.collections.users) {
            setVoters(dbState.collections.users);
          } else {
            setVoters([
              { id: 'usr-voter-aman', mobileNumber: '9999999999', name: 'Aman Patel', role: 'VOTER', isVerified: true, age: 26, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
              { id: 'usr-cand-rahul', mobileNumber: '7777777777', name: 'Rahul Sharma', role: 'CANDIDATE', isVerified: true, age: 45, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
              { id: 'usr-sim-v-2', mobileNumber: '9123456780', name: 'Priya Nair', role: 'VOTER', isVerified: true, age: 17, state: 'Maharashtra', district: 'Mumbai', constituency: 'Ward 45', isBlocked: false },
              { id: 'usr-sim-v-3', mobileNumber: '9888877777', name: 'Rajesh Kumar', role: 'VOTER', isVerified: true, age: 62, state: 'Delhi', district: 'New Delhi', constituency: 'New Delhi Seat', isBlocked: true }
            ]);
          }
        } catch (err) {
          setVoters([
            { id: 'usr-voter-aman', mobileNumber: '9999999999', name: 'Aman Patel', role: 'VOTER', isVerified: true, age: 26, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
            { id: 'usr-cand-rahul', mobileNumber: '7777777777', name: 'Rahul Sharma', role: 'CANDIDATE', isVerified: true, age: 45, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North', isBlocked: false },
            { id: 'usr-sim-v-2', mobileNumber: '9123456780', name: 'Priya Nair', role: 'VOTER', isVerified: true, age: 17, state: 'Maharashtra', district: 'Mumbai', constituency: 'Ward 45', isBlocked: false },
            { id: 'usr-sim-v-3', mobileNumber: '9888877777', name: 'Rajesh Kumar', role: 'VOTER', isVerified: true, age: 62, state: 'Delhi', district: 'New Delhi', constituency: 'New Delhi Seat', isBlocked: true }
          ]);
        }
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

  // Helper to publish public gazette notifications when electoral contests are created or updated
  const publishPublicNotification = async ({ title, content, type = 'CALENDAR' }) => {
    try {
      await api.notifications.create({
        title,
        content,
        type,
        adminId: currentUser ? currentUser.id : 'admin'
      });
    } catch (err) {
      console.warn('API notification create error:', err);
    }

    try {
      const existingNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
      const newNotif = {
        id: `gazette-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title,
        content,
        time: 'Just Now',
        type,
        read: false
      };
      localStorage.setItem('eci_voter_notifications', JSON.stringify([newNotif, ...existingNotifs]));
    } catch (err) {
      console.warn('LocalStorage voter notification error:', err);
    }

    try {
      const existingPartyNotifs = JSON.parse(localStorage.getItem('eci_party_notifications') || '[]');
      const newPartyNotif = {
        id: `party-gazette-${Date.now()}`,
        title,
        content,
        time: 'Just Now',
        type,
        read: false
      };
      localStorage.setItem('eci_party_notifications', JSON.stringify([newPartyNotif, ...existingPartyNotifs]));
    } catch (err) {
      console.warn('LocalStorage party notification error:', err);
    }

    window.dispatchEvent(new Event('storage'));
  };

  // 1. Election Mgmt Actions
  const handleCreateElection = async (e) => {
    e.preventDefault();
    if (!ensureAdminPrivilege('Create Election Context')) return;
    try {
      let targetState = 'All India (36 States & UTs)';
      if (!newElection.selectedStates || newElection.selectedStates.length === 0) {
        targetState = 'All India (36 States & UTs)';
      } else if (newElection.selectedStates.length === STATE_LIST.length) {
        targetState = 'All India (36 States & UTs)';
      } else if (newElection.selectedStates.length === 1) {
        targetState = newElection.selectedStates[0];
      } else {
        targetState = newElection.selectedStates.join(', ');
      }

      let levelDisplay = newElection.level;
      if (newElection.level === 'Rural / Urban Area') {
        const selectedSubs = (newElection.selectedSubLevels && newElection.selectedSubLevels.length > 0)
          ? (newElection.selectedSubLevels.length === 7 ? 'All 7 Local Body Sub-Types' : newElection.selectedSubLevels.join(', '))
          : 'All 7 Local Body Sub-Types';
        levelDisplay = `${newElection.level} (${selectedSubs})`;
      }

      const payload = {
        title: newElection.title,
        level: levelDisplay,
        state: targetState,
        district: 'All Districts',
        constituency: 'All Constituencies',
        votingDate: newElection.votingDate,
        countingDate: newElection.countingDate,
        status: 'REGISTRATION_OPEN',
        adminId: currentUser ? currentUser.id : 'admin'
      };

      const res = await api.elections.create(payload);
      if (res.success) {
        const createdElection = res.election || res.data || {};
        const newCfg = {
          id: createdElection.id || `elec-${Date.now()}`,
          category: levelDisplay,
          subCategory: newElection.subLevel || 'All Local Bodies',
          stateName: targetState,
          status: 'REGISTRATION_OPEN',
          title: newElection.title,
          votingDate: newElection.votingDate,
          countingDate: newElection.countingDate
        };
        setActiveConfig(newCfg);
        localStorage.setItem('eci_active_configuration', JSON.stringify(newCfg));

        // Publish notification to public notification page
        await publishPublicNotification({
          title: `📢 New Electoral Context Scheduled: ${newElection.title}`,
          content: `The Election Commission of India has officially scheduled "${newElection.title}" (${levelDisplay}) covering ${targetState}. Candidate Registration Window is now OPEN for this election level. Voting Date: ${newElection.votingDate || 'To be announced'}, Scheduled Result Date: ${newElection.countingDate || 'To be announced'}.`,
          type: 'CALENDAR'
        });

        setMessage(`New election context "${newElection.title}" created & candidate registration window is now OPEN for this election level!`);
        setShowCreateElection(false);
        setNewElection({
          title: '',
          level: 'Lok Sabha (MP)',
          subLevel: '',
          selectedSubLevels: [...ALL_LOCAL_SUBTYPES],
          selectedStates: [...STATE_LIST],
          votingDate: '',
          countingDate: ''
        });
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to create election context');
    }
  };

  const handleSetActiveContext = async (elec) => {
    if (!ensureAdminPrivilege('Set Active Election Context')) return;
    const newCfg = {
      id: elec.id,
      title: elec.title,
      category: elec.level,
      stateName: elec.state || 'All India',
      status: elec.status || 'REGISTRATION_OPEN',
      votingDate: elec.votingDate,
      countingDate: elec.countingDate
    };
    setActiveConfig(newCfg);
    localStorage.setItem('eci_active_configuration', JSON.stringify(newCfg));

    // Publish notification to public notification page
    await publishPublicNotification({
      title: `⭐ Active Electoral Context Activated: ${elec.title}`,
      content: `Official Announcement: The Election Commission has designated "${elec.title}" as the primary active nationwide election context. Voting Date: ${elec.votingDate || 'Scheduled'}, Jurisdiction: ${elec.state || 'All India'}.`,
      type: 'INFO'
    });

    setMessage(`"${elec.title}" is now set as the active election context across the portal!`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpdateElectionStatus = async (id, status) => {
    if (!ensureAdminPrivilege('Advance Election Phase')) return;
    try {
      const res = await api.elections.updateStatus(id, status, currentUser?.id || 'admin');
      if (res.success) {
        const updatedElec = elections.find(e => e.id === id);
        const title = updatedElec ? updatedElec.title : 'Electoral Contest';
        const phaseLabel = status === 'REGISTRATION_OPEN' ? 'Candidate Nominations & Registrations OPEN' : status === 'REGISTRATION_CLOSED' ? 'Candidate Registrations CLOSED' : status === 'VOTING_OPEN' ? 'Polling Window Active / Voting Open' : status === 'RESULTS_PUBLISHED' ? 'Counting Complete & Results Published' : status.replace('_', ' ');

        if (!activeConfig || (updatedElec && (activeConfig.title === updatedElec.title || activeConfig.id === id))) {
          const newCfg = { 
            ...(activeConfig || {}), 
            id,
            title: updatedElec ? updatedElec.title : (activeConfig?.title || 'Active Election'),
            category: updatedElec ? updatedElec.level : (activeConfig?.category || 'General'),
            stateName: updatedElec ? updatedElec.state : (activeConfig?.stateName || 'All India'),
            status: status 
          };
          setActiveConfig(newCfg);
          localStorage.setItem('eci_active_configuration', JSON.stringify(newCfg));
        }

        // Publish notification to public notification page
        await publishPublicNotification({
          title: `⚡ Schedule & Lifecycle Update: ${title}`,
          content: `Official Gazette Update: The electoral phase for "${title}" has been updated to "${phaseLabel}". All voters and political parties should review updated schedules.`,
          type: status === 'REGISTRATION_OPEN' ? 'SUCCESS' : status === 'VOTING_OPEN' ? 'WARNING' : status === 'RESULTS_PUBLISHED' ? 'SUCCESS' : 'INFO'
        });

        setMessage(`Election phase changed to: ${phaseLabel}.`);
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
      const targetElec = elections.find(e => e.id === id);
      const titleStr = targetElec ? targetElec.title : 'Scheduled Contest';

      const res = await api.elections.delete(id, currentUser.id);
      if (res.success) {
        // Publish notification to public notification page
        await publishPublicNotification({
          title: `🚫 Electoral Contest Cancelled/Terminated: ${titleStr}`,
          content: `Official Gazette Notice: The scheduled electoral contest "${titleStr}" has been officially cancelled/terminated by the Election Commission.`,
          type: 'WARNING'
        });

        setMessage('Election context terminated successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const [showDocReqInput, setShowDocReqInput] = useState(false);
  const [docReqNote, setDocReqNote] = useState('');

  // 2. Nomination & Party Status
  const handleUpdateCandidateStatus = async (id, status, ecNotes = null) => {
    if (!ensureAdminPrivilege('Audit Candidate nomination')) return;
    try {
      const res = await api.candidates.updateStatus(id, status, currentUser.id, ecNotes);
      if (res.success) {
        setMessage(`Candidate nomination audit finalized: ${status}.`);
        setSelectedCandidate(null);
        setShowDocReqInput(false);
        setDocReqNote('');
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

  const handleDeleteParty = async (id) => {
    if (!ensureAdminPrivilege('Delete Party Registration')) return;
    try {
      const res = await api.parties.delete(id, currentUser.id);
      if (res.success) {
        setMessage(`Party registration deleted successfully.`);
        setSelectedPartyForDetail(null);
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

  // 5. Polling Station deployments (Simulated state)
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

  const filteredParties = parties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(partySearch.toLowerCase()) || 
      p.abbrev.toLowerCase().includes(partySearch.toLowerCase());
    const matchesStatus = partyStatusFilter === 'ALL' || p.status === partyStatusFilter;
    return matchesSearch && matchesStatus;
  });

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
          
          
          {!isSuperAdmin && onLogout && (
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm border border-rose-500"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
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
            {['Core Lifecycle', 'Registry Records', 'Compliance & Audits'].map(group => (
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
              <div className="space-y-6 animate-fade-in text-left">
                {/* Active Electoral Context Overview Header & Action Bar */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-red-50 text-red-800 rounded-lg text-lg">🏛️</span>
                      <h3 className="text-base font-extrabold text-gray-900 font-display uppercase tracking-wide">
                        Election Setup & Lifecycle Management
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500">
                      Configure new scheduled elections (Rajya Sabha, Lok Sabha, Legislative Assembly, or Rural/Urban bodies) across state jurisdictions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateElection(!showCreateElection)}
                    className="px-5 py-3 bg-red-800 hover:bg-red-900 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    {!isSuperAdmin && <Lock className="w-3.5 h-3.5" />}
                    <Plus className="w-4 h-4" /> Setup New Election Context
                  </button>
                </div>

                {/* Setup New Election Context Inline Form Panel */}
                {showCreateElection && (
                  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl border-2 border-red-800 shadow-xl space-y-6">
                    <div className="flex justify-between items-center border-b pb-3">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                          <span className="p-1 bg-red-800 text-white rounded text-xs">✍️</span> Setup New Election Context
                        </h4>
                        <p className="text-[11px] text-gray-400">Specify election level, target state jurisdictions, and voting/counting schedule dates.</p>
                      </div>
                      <button onClick={() => setShowCreateElection(false)} className="text-gray-400 hover:text-gray-600 font-bold text-sm p-1 cursor-pointer">✕</button>
                    </div>

                    <form onSubmit={handleCreateElection} className="space-y-5">
                      
                      {/* STEP 1: Election Event Title */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>1. Election Event Title</span> <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bihar Legislative Assembly Elections 2026 or Lok Sabha General Election 2026"
                          className="w-full text-xs p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:outline-none font-bold"
                          value={newElection.title}
                          onChange={e => setNewElection({ ...newElection, title: e.target.value })}
                          required
                        />
                        
                        {/* Interactive Title Suggestions */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">💡 Click a suggestion to populate title:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Lok Sabha General Elections 2026',
                              'Rajya Sabha Biennial Elections 2026',
                              'Bihar Legislative Assembly Elections 2026'                              
                            ].map((sug) => (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => setNewElection({ ...newElection, title: sug })}
                                className={`px-2.5 py-1 border rounded-full text-[10px] font-semibold transition cursor-pointer ${
                                  newElection.title === sug
                                    ? 'bg-red-800 text-white border-red-800 font-bold shadow-xs'
                                    : 'bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-800 border-gray-200'
                                }`}
                              >
                                + {sug}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* STEP 2: Select Election Level */}
                      <div className="space-y-2.5">
                        <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                          <span>2. Select Election Level</span> <span className="text-red-600">*</span>
                        </label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { id: 'Rajya Sabha (MP)', label: 'Rajya Sabha (MP)', desc: 'Upper House of Parliament selection by state assemblies' },
                            { id: 'Lok Sabha (MP)', label: 'Lok Sabha (MP)', desc: 'House of the People general federal parliamentary constituencies' },
                            { id: 'Legislative Assembly (MLA/MLC)', label: 'Legislative Assembly (MLA/MLC)', desc: 'State legislative assembly or council contests' },
                            { id: 'Rural / Urban Area', label: 'Rural / Urban Area', desc: 'Local self-government, municipalities, and panchayats' }
                          ].map((opt) => {
                            const isSelected = newElection.level === opt.label;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  if (opt.label === 'Rural / Urban Area') {
                                    setNewElection({
                                      ...newElection,
                                      level: opt.label,
                                      selectedSubLevels: [...ALL_LOCAL_SUBTYPES],
                                      subLevel: 'All Local Body Sub-Types'
                                    });
                                  } else {
                                    setNewElection({
                                      ...newElection,
                                      level: opt.label,
                                      subLevel: ''
                                    });
                                  }
                                }}
                                className={`p-4 rounded-xl border text-left space-y-2 transition duration-150 cursor-pointer ${
                                  isSelected
                                    ? 'border-red-800 bg-red-50/50 ring-2 ring-red-800 shadow-sm'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-base">🏛️</span>
                                  {isSelected && <span className="w-2 h-2 rounded-full bg-red-800" />}
                                </div>
                                <div>
                                  <h5 className="text-xs font-extrabold text-gray-900 uppercase">{opt.label}</h5>
                                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{opt.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Sub-level selection if Rural / Urban Area */}
                        {newElection.level === 'Rural / Urban Area' && (
                          <div className="p-4 bg-amber-50/70 border border-amber-300 rounded-xl space-y-3 animate-fade-in">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                              <label className="text-xs font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                                <span>✨ Local Body Administrative Sub-Types:</span>
                                <span className="px-2 py-0.5 bg-amber-800 text-white rounded-full text-[10px] font-bold">
                                  {newElection.selectedSubLevels?.length || 0} / 7 Selected
                                </span>
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setNewElection({
                                    ...newElection,
                                    selectedSubLevels: [...ALL_LOCAL_SUBTYPES],
                                    subLevel: 'All Local Body Sub-Types'
                                  })}
                                  className="px-2.5 py-1 bg-amber-800 text-white rounded text-[10px] font-bold hover:bg-amber-900 transition cursor-pointer"
                                >
                                  Select All 7 Sub-Types
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNewElection({
                                    ...newElection,
                                    selectedSubLevels: [],
                                    subLevel: ''
                                  })}
                                  className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded text-[10px] font-bold hover:bg-amber-300 transition cursor-pointer"
                                >
                                  Clear Selection
                                </button>
                              </div>
                            </div>

                            <div className="p-2.5 bg-amber-100/80 border border-amber-300 rounded-lg text-[11px] font-bold text-amber-950 flex items-center gap-2">
                              <span>⚡ Automatically Selected All 7 Local Body Administrative Sub-Types:</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {ALL_LOCAL_SUBTYPES.map((subOpt) => {
                                const isSubSelected = newElection.selectedSubLevels?.includes(subOpt);
                                return (
                                  <button
                                    key={subOpt}
                                    type="button"
                                    onClick={() => {
                                      const current = newElection.selectedSubLevels || [];
                                      const updated = isSubSelected
                                        ? current.filter(s => s !== subOpt)
                                        : [...current, subOpt];
                                      setNewElection({
                                        ...newElection,
                                        selectedSubLevels: updated,
                                        subLevel: updated.length === 7 ? 'All Local Body Sub-Types' : updated.join(', ')
                                      });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                                      isSubSelected
                                        ? 'border-amber-700 bg-amber-800 text-white font-extrabold shadow-2xs'
                                        : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-100'
                                    }`}
                                  >
                                    <span>{isSubSelected ? '✅' : '⚪'}</span>
                                    <span>{subOpt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* STEP 3: Target State Jurisdiction Selection */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>3. Select Target State Jurisdiction</span> <span className="text-red-600">*</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-gray-600 uppercase">
                              Selected: <strong className="text-red-800 font-mono text-xs">{newElection.selectedStates.length} / {STATE_LIST.length} States & UTs</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewElection({ ...newElection, selectedStates: [...STATE_LIST] })}
                              className="px-2.5 py-1 bg-red-800 text-white rounded text-[10px] font-bold hover:bg-red-900 transition cursor-pointer"
                            >
                              Select All 36 States/UTs (All India)
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewElection({ ...newElection, selectedStates: [] })}
                              className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-[10px] font-bold hover:bg-gray-300 transition cursor-pointer"
                            >
                              Clear Selection
                            </button>
                          </div>
                        </div>

                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1">
                            {STATE_LIST.map((st) => {
                              const isChecked = newElection.selectedStates.includes(st);
                              return (
                                <label
                                  key={st}
                                  className={`p-2 rounded-lg border text-[11px] font-bold flex items-center gap-2 cursor-pointer transition select-none ${
                                    isChecked
                                      ? 'border-red-800 bg-red-50 text-red-900 ring-1 ring-red-800/20'
                                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setNewElection({
                                          ...newElection,
                                          selectedStates: [...newElection.selectedStates, st]
                                        });
                                      } else {
                                        setNewElection({
                                          ...newElection,
                                          selectedStates: newElection.selectedStates.filter(item => item !== st)
                                        });
                                      }
                                    }}
                                    className="rounded text-red-800 focus:ring-red-800"
                                  />
                                  <span className="truncate">{st}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* STEP 4: Voting Date and Scheduled Result Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>4. Voting Date</span> <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="date"
                            className="w-full text-xs p-3 border border-gray-300 bg-white rounded-xl font-bold focus:ring-2 focus:ring-red-800 focus:outline-none"
                            value={newElection.votingDate}
                            onChange={e => setNewElection({ ...newElection, votingDate: e.target.value })}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                            <span>5. Scheduled Result Date</span> <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="date"
                            className="w-full text-xs p-3 border border-gray-300 bg-white rounded-xl font-bold focus:ring-2 focus:ring-red-800 focus:outline-none"
                            value={newElection.countingDate}
                            onChange={e => setNewElection({ ...newElection, countingDate: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      {/* Form Action Buttons */}
                      <div className="pt-3 flex justify-end gap-3 border-t">
                        <button
                          type="button"
                          onClick={() => setShowCreateElection(false)}
                          className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-red-800 hover:bg-red-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer flex items-center gap-2"
                        >
                          🚀 Publish & Launch Official Election Context
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Scheduled Elections Master List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-600 uppercase flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active Scheduled Electoral Contests ({elections.length})</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-normal uppercase">ECI Live Master Register</span>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {elections.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 space-y-2">
                        <span className="text-2xl block">🗳️</span>
                        <p>No scheduled elections found. Click "Setup New Election Context" above to launch.</p>
                      </div>
                    ) : (
                      elections.map(elec => {
                        const isActive = activeConfig && (activeConfig.title === elec.title || activeConfig.id === elec.id);
                        return (
                          <div
                            key={elec.id}
                            onClick={() => setSelectedElectionModal(elec)}
                            className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition cursor-pointer group ${isActive ? 'bg-red-50/40 border-l-4 border-l-red-800' : 'hover:bg-gray-50/60'}`}
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 bg-red-50 text-red-800 border border-red-100 rounded-full">
                                  {elec.level}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono font-bold truncate max-w-[200px]">
                                  📍 {elec.state || 'All India'}
                                </span>
                                {isActive && (
                                  <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                                    ⭐ CURRENTLY ACTIVE CONTEXT
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-extrabold text-gray-900 group-hover:text-red-800 transition truncate">
                                  {elec.title}
                                </h4>
                               
                              </div>

                              <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 items-center">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                  elec.status === 'REGISTRATION_OPEN' || elec.status === 'OPEN'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : elec.status === 'REGISTRATION_CLOSED'
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : elec.status === 'VOTING_OPEN'
                                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                                    : elec.status === 'RESULTS_PUBLISHED'
                                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                  Phase: {elec.status === 'REGISTRATION_OPEN' || elec.status === 'OPEN' ? '🟢 Registration Open' : elec.status === 'REGISTRATION_CLOSED' ? '🔴 Registration Closed' : elec.status === 'VOTING_OPEN' ? '🗳️ Voting Open' : elec.status === 'RESULTS_PUBLISHED' ? '📊 Results Published' : elec.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => setSelectedElectionModal(elec)}
                                className="px-3.5 py-2 bg-red-800 hover:bg-red-900 text-white text-xs font-extrabold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                🔍 Details & Status
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Election Context Detail Pop-Up Modal */}
                {selectedElectionModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl border-2 border-red-800 max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto animate-fade-in"
                    >
                      {/* Modal Header */}
                      <div className="flex items-start justify-between border-b pb-3.5 gap-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-200 text-[10px] font-black uppercase rounded-full">
                              {selectedElectionModal.level}
                            </span>
                            <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full ${
                              selectedElectionModal.status === 'REGISTRATION_OPEN' || selectedElectionModal.status === 'OPEN'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : selectedElectionModal.status === 'REGISTRATION_CLOSED'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : selectedElectionModal.status === 'VOTING_OPEN'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : selectedElectionModal.status === 'RESULTS_PUBLISHED'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              Phase: {
                                selectedElectionModal.status === 'REGISTRATION_OPEN' || selectedElectionModal.status === 'OPEN' ? 'Registration Open' :
                                selectedElectionModal.status === 'REGISTRATION_CLOSED' ? 'Registration Closed' :
                                selectedElectionModal.status === 'VOTING_OPEN' ? 'Voting Open' :
                                selectedElectionModal.status === 'RESULTS_PUBLISHED' ? 'Results Published' : selectedElectionModal.status
                              }
                            </span>
                            {(activeConfig && (activeConfig.title === selectedElectionModal.title || activeConfig.id === selectedElectionModal.id)) && (
                              <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-full flex items-center gap-1 shadow-2xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                ⭐ CURRENTLY ACTIVE CONTEXT
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                            {selectedElectionModal.title}
                          </h3>
                        </div>
                        
                      </div>

                      {/* Modal Body - Comprehensive Information Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Voting Date */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">🗓️ Scheduled Voting Date</span>
                          <strong className="text-xs sm:text-sm font-extrabold text-gray-900 block">
                            {selectedElectionModal.votingDate || 'Not Scheduled'}
                          </strong>
                        </div>

                        {/* Scheduled Result Date */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">📊 Scheduled Result Date</span>
                          <strong className="text-xs sm:text-sm font-extrabold text-gray-900 block">
                            {selectedElectionModal.countingDate || 'Not Scheduled'}
                          </strong>
                        </div>

                        {/* Electoral Level */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-0.5 sm:col-span-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">🏛️ Electoral Level / Type</span>
                          <strong className="text-xs font-bold text-red-900 block">
                            {selectedElectionModal.level}
                          </strong>
                        </div>

                        {/* Target State Jurisdiction */}
                        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1 sm:col-span-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">📍 Target State Jurisdiction</span>
                          <div className="text-xs font-semibold text-gray-800 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-gray-200 max-h-28 overflow-y-auto">
                            {selectedElectionModal.state || 'All India (36 States & UTs)'}
                          </div>
                        </div>

                        {/* Administrative Overview & Security Compliance */}
                        <div className="p-3.5 bg-red-50/40 border border-red-100 rounded-xl space-y-1.5 sm:col-span-2">
                          <span className="text-[10px] font-black text-red-900 uppercase tracking-wider block">🛡️ Electoral Security & Governance Standards</span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-gray-700 font-semibold pt-1">
                            <div className="bg-white p-2 rounded-lg border border-red-100">
                              <span className="text-gray-400 block text-[9px]">Model Code of Conduct</span>
                              <strong className="text-emerald-800">Active & Enforced</strong>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-red-100">
                              <span className="text-gray-400 block text-[9px]">EVM / VVPAT Audit</span>
                              <strong className="text-blue-800">Verified & Sealed</strong>
                            </div>
                            <div className="bg-white p-2 rounded-lg border border-red-100 col-span-2 sm:col-span-1">
                              <span className="text-gray-400 block text-[9px]">ECI Admin Override</span>
                              <strong className="text-red-800">Authorized</strong>
                            </div>
                          </div>
                        </div>

                        {/* Context Unique Identifier */}
                        <div className="p-2.5 bg-gray-100 border border-gray-200 rounded-xl sm:col-span-2 text-xs text-gray-700 flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold text-[10px] uppercase tracking-wide text-gray-500">🆔 Context Unique ID:</span>
                          <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-gray-300 font-bold">{selectedElectionModal.id}</span>
                        </div>
                      </div>

                      {/* Modal Actions Footer */}
                      <div className="border-t pt-4 space-y-3">
                        <div className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center justify-between">
                          <span>⚙️ Context Operations & State Management:</span>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Set Active Context Button */}
                          <div>
                            <button
                              type="button"
                              onClick={async () => {
                                await handleSetActiveContext(selectedElectionModal);
                              }}
                              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                                (activeConfig && (activeConfig.title === selectedElectionModal.title || activeConfig.id === selectedElectionModal.id))
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
                                  : 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600'
                              }`}
                            >
                              {(activeConfig && (activeConfig.title === selectedElectionModal.title || activeConfig.id === selectedElectionModal.id)) ? (
                                <>✅ Currently Active System Context (Click to Re-Sync)</>
                              ) : (
                                <>⭐ Set Active Context</>
                              )}
                            </button>
                          </div>

                          {/* Phase Progression Action Buttons */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                            <button
                              type="button"
                              onClick={async () => {
                                await handleUpdateElectionStatus(selectedElectionModal.id, 'REGISTRATION_OPEN');
                                setSelectedElectionModal({ ...selectedElectionModal, status: 'REGISTRATION_OPEN' });
                              }}
                              className={`px-3 py-2 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 border ${
                                selectedElectionModal.status === 'REGISTRATION_OPEN' || selectedElectionModal.status === 'OPEN'
                                  ? 'bg-emerald-700 text-white border-emerald-800 ring-2 ring-emerald-300 shadow-xs'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              <CheckCircle className="w-3.5 h-3.5" /> Open Candidate Reg
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await handleUpdateElectionStatus(selectedElectionModal.id, 'REGISTRATION_CLOSED');
                                setSelectedElectionModal({ ...selectedElectionModal, status: 'REGISTRATION_CLOSED' });
                              }}
                              className={`px-3 py-2 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 border ${
                                selectedElectionModal.status === 'REGISTRATION_CLOSED'
                                  ? 'bg-amber-700 text-white border-amber-800 ring-2 ring-amber-300 shadow-xs'
                                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              <Lock className="w-3.5 h-3.5" /> Close Candidate Reg
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await handleUpdateElectionStatus(selectedElectionModal.id, 'VOTING_OPEN');
                                setSelectedElectionModal({ ...selectedElectionModal, status: 'VOTING_OPEN' });
                              }}
                              className={`px-3 py-2 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 border ${
                                selectedElectionModal.status === 'VOTING_OPEN'
                                  ? 'bg-purple-700 text-white border-purple-800 ring-2 ring-purple-300 shadow-xs'
                                  : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                              }`}
                            >
                              <Play className="w-3.5 h-3.5" /> Voting Open
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                await handleUpdateElectionStatus(selectedElectionModal.id, 'RESULTS_PUBLISHED');
                                setSelectedElectionModal({ ...selectedElectionModal, status: 'RESULTS_PUBLISHED' });
                              }}
                              className={`px-3 py-2 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1 border ${
                                selectedElectionModal.status === 'RESULTS_PUBLISHED'
                                  ? 'bg-blue-700 text-white border-blue-800 ring-2 ring-blue-300 shadow-xs'
                                  : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                              }`}
                            >
                              <Award className="w-3.5 h-3.5" /> Publish Result
                            </button>
                          </div>
                        </div>

                        {/* Lower Modal Bar with Delete Context on Left Side */}
                        <div className="pt-3 flex items-center justify-between border-t gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={async () => {
                              const idToDelete = selectedElectionModal.id;
                              setSelectedElectionModal(null);
                              await handleDeleteElection(idToDelete);
                            }}
                            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Context
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedElectionModal(null)}
                            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            Close 
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Confirm Action Dialog Modal */}
                {showConfirmDialog && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-gray-250 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fade-in text-center">
                      <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-800">
                        ⚠️
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-gray-900 uppercase">Confirm Electoral Event Status Change</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">
                          Are you sure you want to change the status of the <strong className="text-gray-800">{activeConfig.category}</strong> election in <strong className="text-gray-800">{activeConfig.stateName}</strong> to <strong className="text-gray-950 font-mono">{pendingAction}</strong>? 
                          This action will immediately restrict/open nominee registrations in this region.
                        </p>
                      </div>

                      <div className="pt-2 flex justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowConfirmDialog(false)}
                          className="px-4 py-2 border border-gray-200 text-gray-750 hover:bg-gray-50 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...activeConfig, status: pendingAction };
                            setActiveConfig(updated);
                            localStorage.setItem('eci_active_configuration', JSON.stringify(updated));
                            setShowConfirmDialog(false);
                            setMessage(`Election context successfully changed to ${pendingAction}!`);
                            setTimeout(() => setMessage(''), 5000);
                          }}
                          className={`px-5 py-2 text-white font-bold rounded-lg text-xs transition shadow-md cursor-pointer ${
                            pendingAction === 'OPEN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                          }`}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                          <p><strong>Affiliation:</strong> {selectedCandidate.isIndependent || selectedCandidate.partyName === 'Independent' ? 'Independent Candidate' : selectedCandidate.partyName}</p>
                        </div>
                        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg col-span-2 space-y-1">
                          <p className="text-[9px] text-amber-900 font-bold uppercase">🎫 Ticket & Authorization Credentials</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div><span className="text-gray-500">Party/EC Ticket #:</span> <strong className="font-mono text-emerald-800">{selectedCandidate.ticketNumber || (selectedCandidate.isIndependent || selectedCandidate.partyName === 'Independent' ? 'Will be generated by EC Admin' : 'Awaiting Party Ticket')}</strong></div>
                            <div><span className="text-gray-500">Authorization Code:</span> <strong className="font-mono text-indigo-900">{selectedCandidate.authorizationCode || (selectedCandidate.isIndependent || selectedCandidate.partyName === 'Independent' ? 'Will be generated by EC Admin' : 'Awaiting Party Auth Code')}</strong></div>
                          </div>
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

                      {showDocReqInput && (
                        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 text-left animate-fade-in">
                          <label className="text-[11px] font-extrabold text-indigo-950 block">Specify Requested Document / Clarification Reason:</label>
                          <textarea
                            value={docReqNote}
                            onChange={(e) => setDocReqNote(e.target.value)}
                            placeholder="e.g. Please re-upload notarized Form 26 Affidavit or verified Income/Asset declaration statement."
                            className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setShowDocReqInput(false)}
                              className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-300 rounded-lg font-bold hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'DOCUMENT_REQUESTED', docReqNote || 'EC Admin requested document re-verification / additional affidavit upload.')}
                              className="px-3 py-1.5 text-xs text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg font-bold shadow-xs"
                            >
                              Send Document Request
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t flex flex-wrap justify-end items-center gap-2">
                        <button
                          onClick={() => setShowDocReqInput(!showDocReqInput)}
                          className="px-3.5 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          📄 Request Additional Document
                        </button>
                        <button
                          onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'REJECTED')}
                          className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-lg transition cursor-pointer"
                        >
                          ❌ Reject Nomination
                        </button>
                        <button
                          onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'EC_CONFIRMED')}
                          className="px-4 py-2 bg-emerald-700 text-white hover:bg-emerald-800 font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                        >
                          ✅ Approve & Issue Clearance / Credentials
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
              <div className="space-y-6 animate-fade-in text-left">
                {selectedPartyForDetail ? (
                  // Deep Party Detail View & Document Dossier Inspection
                  <div className="space-y-6">
                    {/* Top Control Bar */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <button
                        onClick={() => { setSelectedPartyForDetail(null); setConfirmDetailAction(null); }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 border border-gray-200"
                      >
                        ← Back to Party Registry
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md border border-gray-200">
                          Registry Ref: {selectedPartyForDetail.id}
                        </span>
                        {selectedPartyForDetail.status === 'PENDING' && (
                          <button
                            onClick={async () => {
                              await handleUpdatePartyStatus(selectedPartyForDetail.id, 'APPROVED');
                              setSelectedPartyForDetail({
                                ...selectedPartyForDetail,
                                status: 'APPROVED',
                                registrationNumber: selectedPartyForDetail.registrationNumber || `ECI-REG-${selectedPartyForDetail.abbrev}-${Math.floor(100000 + Math.random() * 900000)}`
                              });
                            }}
                            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve Registration
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Pending Approval Statutory Callout Banner */}
                    {selectedPartyForDetail.status === 'PENDING' && (
                      <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-xl space-y-3 shadow-sm">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wide">
                              Action Required: Pending ECI Registration Review (Sec 29A RPA, 1951)
                            </h4>
                            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                              This political party registration application was submitted for ECI authorization. Please review the submitted constitution, president Aadhaar credentials, address proofs, and financial records below.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Main Dossier Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6 shadow-xs">
                      {/* Party Header Banner */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-gray-200 flex items-center justify-center text-3xl font-bold shrink-0 shadow-xs">
                            {selectedPartyForDetail.symbol?.split(' ')[1] || selectedPartyForDetail.symbol || '🏛️'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-black text-gray-900 font-display uppercase tracking-wide">{selectedPartyForDetail.name}</h3>
                              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-extrabold rounded-md uppercase">
                                {selectedPartyForDetail.abbrev}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 font-semibold mt-1">
                              Category: <span className="text-gray-800">{selectedPartyForDetail.category || (selectedPartyForDetail.abbrev === 'BJP' || selectedPartyForDetail.abbrev === 'INC' ? 'National Recognized Party' : 'State Recognized Party')}</span> • Formed: <span className="text-gray-800">{selectedPartyForDetail.dateOfFormation || '2026-01-15'}</span>
                            </p>
                            <p className="text-xs font-mono text-gray-400 mt-0.5">
                              ECI Reg Code: <span className="font-bold text-gray-700">{selectedPartyForDetail.registrationNumber || 'ECI-REG-PENDING'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-left md:text-right">
                          <span className={`text-xs px-3.5 py-1.5 rounded-full font-extrabold tracking-wider uppercase inline-block border ${
                            selectedPartyForDetail.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-200' :
                            selectedPartyForDetail.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            STATUS: {selectedPartyForDetail.status}
                          </span>
                          <p className="text-xs text-gray-500">
                            <strong>Registered Cadre:</strong> <span className="font-bold text-gray-800">{selectedPartyForDetail.memberNumber || (selectedPartyForDetail.abbrev === 'BJP' ? '180,000,000' : selectedPartyForDetail.abbrev === 'INC' ? '45,000,000' : selectedPartyForDetail.abbrev === 'AAP' ? '12,000,000' : '750,000')}</span>
                          </p>
                        </div>
                      </div>

                      {/* Section 1: Basic Information & Platform */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <Landmark className="w-4 h-4 text-red-900" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">1. Basic Party Information & Platform</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-400 text-[10px] block uppercase font-bold">Party Name</span>
                            <span className="font-bold text-gray-800 text-sm">{selectedPartyForDetail.name} ({selectedPartyForDetail.abbrev})</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-400 text-[10px] block uppercase font-bold">Reserved Symbol</span>
                            <span className="font-bold text-gray-800">{selectedPartyForDetail.symbol || '⏳'}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-gray-400 text-[10px] block uppercase font-bold">Party Type / Category</span>
                            <span className="font-bold text-gray-800">{selectedPartyForDetail.category || 'National Recognized Party'}</span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-xs space-y-1">
                          <span className="text-gray-400 text-[10px] uppercase font-bold block">Party Manifesto & Ideology Summary</span>
                          <p className="text-gray-700 italic leading-relaxed">
                            "{selectedPartyForDetail.manifesto || selectedPartyForDetail.agenda || 'Promoting democratic governance, socio-economic equity, public accountability, national security, and sustainable development.'}"
                          </p>
                        </div>
                      </div>

                      {/* Section 2: Registered Headquarters Office Address */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <MapPin className="w-4 h-4 text-red-900" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">2. Registered Central Headquarters Office</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Full Address:</span>
                              <span className="font-bold text-gray-900 text-right">{selectedPartyForDetail.hqAddress || selectedPartyForDetail.officeAddress || '6-C, Deendayal Upadhyaya Marg, ITO, New Delhi'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">State / Union Territory:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.officeState || 'Delhi'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">District & City:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.officeDistrict || 'New Delhi'}, PIN: {selectedPartyForDetail.officePinCode || '110002'}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Official Phone / Landline:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.officialPhone || selectedPartyForDetail.presidentMobile || '+91 11 2350 0000'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Official Secretariat Email:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.officialEmail || `secretariat@${selectedPartyForDetail.abbrev.toLowerCase()}.org`}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Official Website URL:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.officialWebsite || `https://www.${selectedPartyForDetail.abbrev.toLowerCase()}.org`}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Party Founder & President Dossier */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <UserCheck className="w-4 h-4 text-red-900" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">3. Party President & Founder Credentials</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">President Name:</span>
                              <span className="font-extrabold text-gray-900">{selectedPartyForDetail.presidentName || 'Shri Jagat Prakash Nadda'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Contact Number:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.presidentMobile || '+91 98765 43210'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Residential Address:</span>
                              <span className="font-bold text-gray-900 text-right">{selectedPartyForDetail.presidentAddress || 'New Delhi, India'}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Aadhaar Card Number:</span>
                              <span className="font-bold font-mono text-gray-900">
                                {selectedPartyForDetail.presidentAadhar ? `XXXX-XXXX-${selectedPartyForDetail.presidentAadhar.slice(-4)}` : 'XXXX-XXXX-9988'}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">PAN Card Number:</span>
                              <span className="font-bold font-mono text-gray-900">{selectedPartyForDetail.presidentPan || 'ABCDE1234F'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5 items-center">
                              <span className="text-gray-500">eKYC Verification:</span>
                              <span className="text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded font-extrabold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> VERIFIED OK
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 4: Key Executive Office Bearers */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <Users className="w-4 h-4 text-red-900" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">4. Executive High Command Office Bearers</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                            <span className="text-[10px] font-bold text-red-800 uppercase block">Party President</span>
                            <span className="font-bold text-gray-900 block">{selectedPartyForDetail.presidentName || 'N/A'}</span>
                            <span className="text-[10px] text-gray-500 block">Mobile: {selectedPartyForDetail.presidentMobile || 'N/A'}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                            <span className="text-[10px] font-bold text-red-800 uppercase block">General Secretary</span>
                            <span className="font-bold text-gray-900 block">{selectedPartyForDetail.genSecretaryName || 'B. L. Santhosh'}</span>
                            <span className="text-[10px] text-gray-500 block">Mobile: {selectedPartyForDetail.genSecretaryMobile || '+91 98111 22233'}</span>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                            <span className="text-[10px] font-bold text-red-800 uppercase block">Designated Treasurer</span>
                            <span className="font-bold text-gray-900 block">{selectedPartyForDetail.bankTreasurerName || 'Rajesh Aggarwal'}</span>
                            <span className="text-[10px] text-gray-500 block">Mobile: {selectedPartyForDetail.treasurerMobile || '+91 98222 33344'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Banking & Financial Credentials */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                          <Lock className="w-4 h-4 text-red-900" />
                          <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">5. Financial Accounts & Banking Clearance</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bank Name:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.bankName || 'State Bank of India (Main Branch)'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Account Holder Name:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.bankAccountHolderName || selectedPartyForDetail.name}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Account Number:</span>
                              <span className="font-bold font-mono text-gray-900">{selectedPartyForDetail.bankAccountNumber || '40998877665'}</span>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Bank IFSC Code:</span>
                              <span className="font-bold font-mono text-gray-900">{selectedPartyForDetail.bankIfscCode || 'SBIN0000691'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Party Income Tax PAN:</span>
                              <span className="font-bold font-mono text-gray-900">{selectedPartyForDetail.partyPan || 'AAAPB1234K'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-200/50 pt-1.5">
                              <span className="text-gray-500">Authorized Treasurer:</span>
                              <span className="font-bold text-gray-900">{selectedPartyForDetail.bankTreasurerName || 'Rajesh Aggarwal'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 6: Statutory Uploaded Documents Dossier (Verification Hub) */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-red-900" />
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">6. Statutory Submitted Uploaded Documents Dossier</h4>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">8 Documents Checklist</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {[
                            {
                              key: 'docPartyConstitution',
                              title: 'Party Constitution',
                              desc: 'Sec 29A RPA Compliance Bylaws',
                              docType: 'CONSTITUTION',
                              fileName: `${selectedPartyForDetail.abbrev}_Constitution_2026.pdf`
                            },
                            {
                              key: 'docPresidentIdProof',
                              title: 'President ID & Aadhaar',
                              desc: 'Verified UIDAI Aadhaar Proof',
                              docType: 'IDENTITY_PROOF',
                              fileName: `${selectedPartyForDetail.abbrev}_President_Aadhaar.pdf`
                            },
                            {
                              key: 'docPresidentPhoto',
                              title: 'President Official Photo',
                              desc: 'Passport Size Photo Photograph',
                              docType: 'PHOTOGRAPH',
                              fileName: `${selectedPartyForDetail.abbrev}_President_Photo.jpg`
                            },
                            {
                              key: 'docOfficeAddressProof',
                              title: 'HQ Office Address Proof',
                              desc: 'Utility Bill / Registry Deed',
                              docType: 'ADDRESS_PROOF',
                              fileName: `${selectedPartyForDetail.abbrev}_HQ_Address_Proof.pdf`
                            },
                            {
                              key: 'docPanCard',
                              title: 'Party Income Tax PAN',
                              desc: 'Official IT PAN Card Copy',
                              docType: 'PAN_CARD',
                              fileName: `${selectedPartyForDetail.abbrev}_PAN_Copy.pdf`
                            },
                            {
                              key: 'docBankProof',
                              title: 'Bank Account Passbook',
                              desc: 'Passbook / Mandate Certificate',
                              docType: 'BANK_PASSBOOK',
                              fileName: `${selectedPartyForDetail.abbrev}_Bank_Passbook.pdf`
                            },
                            {
                              key: 'docPartyLogo',
                              title: 'Party Symbol Graphic',
                              desc: 'Official High-Res Symbol Design',
                              docType: 'SYMBOL_LOGO',
                              fileName: `${selectedPartyForDetail.abbrev}_Symbol_Graphic.png`
                            },
                            {
                              key: 'declDigitalSignature',
                              title: 'Statutory Declaration',
                              desc: 'Signed Section 29A Affidavit',
                              docType: 'AFFIDAVIT',
                              fileName: `${selectedPartyForDetail.abbrev}_Statutory_Affidavit.pdf`
                            }
                          ].map(doc => {
                            const isVerified = verifiedDocKeys[`${selectedPartyForDetail.id}_${doc.key}`] || selectedPartyForDetail.status === 'APPROVED';
                            return (
                              <div key={doc.key} className="bg-gray-50 hover:bg-gray-100/80 p-3 rounded-lg border border-gray-200 transition space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="p-1.5 bg-white rounded border border-gray-200 shadow-2xs">
                                    <FileText className="w-4 h-4 text-red-800" />
                                  </div>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                    {isVerified ? '✓ Verified' : 'Pending Review'}
                                  </span>
                                </div>

                                <div>
                                  <h5 className="font-bold text-gray-900 text-xs leading-tight">{doc.title}</h5>
                                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{doc.fileName}</p>
                                </div>

                                <button
                                  onClick={() => {
                                    setSelectedDocModal({
                                      title: doc.title,
                                      docType: doc.docType,
                                      fileName: doc.fileName,
                                      partyName: selectedPartyForDetail.name,
                                      partyAbbrev: selectedPartyForDetail.abbrev,
                                      docKey: doc.key,
                                      partyId: selectedPartyForDetail.id,
                                      isVerified: isVerified
                                    });
                                  }}
                                  className="w-full py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold text-[10px] rounded border border-gray-200 hover:border-blue-200 transition cursor-pointer flex items-center justify-center gap-1"
                                >
                                  <Eye className="w-3 h-3" /> View & Audit Document
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Administrative Governance Actions */}
                      <div className="pt-6 border-t border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Administrative Governance Actions</h4>
                        
                        {confirmDetailAction ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 text-xs">
                            <p className="text-amber-800 font-bold">
                              ⚠️ Confirmation Required: Are you sure you want to {confirmDetailAction.label} this political party? 
                              This action will immediately update the national database and restrict any pending actions related to {selectedPartyForDetail.name}.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  if (confirmDetailAction.type === 'SUSPEND') {
                                    await handleUpdatePartyStatus(selectedPartyForDetail.id, 'SUSPENDED');
                                    setSelectedPartyForDetail({ ...selectedPartyForDetail, status: 'SUSPENDED' });
                                  } else if (confirmDetailAction.type === 'REINSTATE') {
                                    await handleUpdatePartyStatus(selectedPartyForDetail.id, 'APPROVED');
                                    setSelectedPartyForDetail({ ...selectedPartyForDetail, status: 'APPROVED' });
                                  } else if (confirmDetailAction.type === 'DELETE') {
                                    await handleDeleteParty(selectedPartyForDetail.id);
                                  }
                                  setConfirmDetailAction(null);
                                }}
                                className="px-3 py-1.5 bg-red-800 text-white font-bold rounded hover:bg-red-900 transition cursor-pointer"
                              >
                                Yes, Confirm Action
                              </button>
                              <button
                                onClick={() => setConfirmDetailAction(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {selectedPartyForDetail.status === 'PENDING' && (
                              <button
                                onClick={async () => {
                                  await handleUpdatePartyStatus(selectedPartyForDetail.id, 'APPROVED');
                                  setSelectedPartyForDetail({
                                    ...selectedPartyForDetail,
                                    status: 'APPROVED',
                                    registrationNumber: selectedPartyForDetail.registrationNumber || `ECI-REG-${selectedPartyForDetail.abbrev}-${Math.floor(100000 + Math.random() * 900000)}`
                                  });
                                }}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" /> Approve Party Registration & Issue ECI Code
                              </button>
                            )}

                            {selectedPartyForDetail.status !== 'SUSPENDED' ? (
                              <button
                                onClick={() => setConfirmDetailAction({ type: 'SUSPEND', targetId: selectedPartyForDetail.id, label: 'SUSPEND' })}
                                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg border border-amber-200 transition cursor-pointer"
                              >
                                ⛔ Suspend Party Registration
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmDetailAction({ type: 'REINSTATE', targetId: selectedPartyForDetail.id, label: 'REINSTATE' })}
                                className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs rounded-lg border border-green-200 transition cursor-pointer"
                              >
                                ✅ Remove Suspension / Activate
                              </button>
                            )}

                            <button
                              onClick={() => setConfirmDetailAction({ type: 'DELETE', targetId: selectedPartyForDetail.id, label: 'DELETE' })}
                              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-lg border border-rose-200 transition cursor-pointer"
                            >
                              🗑️ Delete & Deregister Party
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Normal List Registry View
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">Political Party Registry Core</h3>
                        <p className="text-xs text-gray-400">View registered high-commands, verify documents & process registration applications</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Packed Status Filter Menu Dropdown */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowPartyFilterMenu(!showPartyFilterMenu)}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Filter className="w-3.5 h-3.5 text-gray-500" />
                            <span>
                              {partyStatusFilter === 'ALL' ? `All (${parties.length})` : partyStatusFilter === 'PENDING' ? `Pending (${parties.filter(p => p.status === 'PENDING').length})` : `Approved (${parties.filter(p => p.status === 'APPROVED').length})`}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showPartyFilterMenu ? 'rotate-180' : ''}`} />
                          </button>

                          {showPartyFilterMenu && (
                            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                              <div className="px-3 py-1 border-b border-gray-100 font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">
                                Filter Applications
                              </div>
                              <button
                                onClick={() => { setPartyStatusFilter('ALL'); setShowPartyFilterMenu(false); }}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-gray-50 transition cursor-pointer ${partyStatusFilter === 'ALL' ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                  All
                                </span>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-mono">{parties.length}</span>
                              </button>

                              <button
                                onClick={() => { setPartyStatusFilter('PENDING'); setShowPartyFilterMenu(false); }}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-amber-50/50 transition cursor-pointer ${partyStatusFilter === 'PENDING' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                  Pending
                                </span>
                                <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800 font-mono">{parties.filter(p => p.status === 'PENDING').length}</span>
                              </button>

                              <button
                                onClick={() => { setPartyStatusFilter('APPROVED'); setShowPartyFilterMenu(false); }}
                                className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-green-50/50 transition cursor-pointer ${partyStatusFilter === 'APPROVED' ? 'text-green-700 bg-green-50' : 'text-gray-700'}`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                  Approved
                                </span>
                                <span className="text-[10px] bg-green-100 px-2 py-0.5 rounded-full text-green-800 font-mono">{parties.filter(p => p.status === 'APPROVED').length}</span>
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="relative flex-1 sm:flex-initial">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                          <input type="text" placeholder="Search party name or abbrev..." className="pl-8 pr-3 py-1.5 border text-xs rounded-lg w-full sm:w-52" value={partySearch} onChange={e => setPartySearch(e.target.value)} />
                        </div>
                      </div>
                    </div>

                    {/* Pending Request Alert Callout */}
                    {parties.some(p => p.status === 'PENDING') && (
                      <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span className="font-bold text-amber-900">
                            Attention: There {parties.filter(p => p.status === 'PENDING').length === 1 ? 'is 1 pending party registration application' : `are ${parties.filter(p => p.status === 'PENDING').length} pending party registration applications`} awaiting ECI approval.
                          </span>
                        </div>
                        <button
                          onClick={() => setPartyStatusFilter('PENDING')}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded transition cursor-pointer shrink-0"
                        >
                          View Pending Applications
                        </button>
                      </div>
                    )}

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase flex justify-between items-center">
                        <span>Recognized Political Parties & Applications</span>
                        <span className="text-[10px] text-gray-400">Showing {filteredParties.length} records</span>
                      </div>

                      {filteredParties.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs">
                          No political parties found matching filter criteria.
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredParties.map(p => (
                            <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                              <div className="flex items-start md:items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-bold border shrink-0">
                                  {p.symbol?.split(' ')[1] || p.symbol || '🏛️'}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-xs font-extrabold text-gray-900">{p.name} ({p.abbrev})</h4>
                                    <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${
                                      p.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                      p.status === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800 animate-pulse'
                                    }`}>
                                      {p.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    Symbol: <span className="font-semibold text-gray-700">{p.symbol || 'Pending'}</span> | Reg Code: <span className="font-semibold text-gray-700">{p.registrationNumber || 'PENDING AUTHORIZATION'}</span>
                                  </p>
                                  <p className="text-[10px] text-gray-500 mt-0.5">
                                    President: <span className="font-semibold text-gray-800">{p.presidentName || 'N/A'}</span> ({p.officialEmail || p.presidentMobile || 'Email N/A'})
                                  </p>
                                </div>
                              </div>

                              <div className="flex gap-1.5 items-center self-end md:self-center">
                                <button
                                  onClick={() => setSelectedPartyForDetail(p)}
                                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer border border-blue-100"
                                >
                                  <Eye className="w-3.5 h-3.5" /> Inspect Application & Documents
                                </button>

                                {p.status === 'PENDING' && (
                                  <button
                                    onClick={() => handleUpdatePartyStatus(p.id, 'APPROVED')}
                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition cursor-pointer shadow-xs"
                                  >
                                    Quick Approve
                                  </button>
                                )}
                                {p.status === 'APPROVED' ? (
                                  <button onClick={() => handleUpdatePartyStatus(p.id, 'SUSPENDED')} className="px-2.5 py-1.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 transition cursor-pointer border border-amber-100">
                                    Suspend
                                  </button>
                                ) : p.status === 'SUSPENDED' ? (
                                  <button onClick={() => handleUpdatePartyStatus(p.id, 'APPROVED')} className="px-2.5 py-1.5 bg-green-50 text-green-700 font-bold text-xs rounded-lg hover:bg-green-100 transition cursor-pointer border border-green-100">
                                    Activate
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
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
              <div className="space-y-6 animate-fade-in text-left">
                {selectedVoterForDetail ? (
                  // Deep Voter Detail View
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <button
                        onClick={() => { setSelectedVoterForDetail(null); setConfirmDetailAction(null); }}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 border border-gray-200"
                      >
                        ← Back to Voter List
                      </button>
                      <span className="text-xs font-mono text-gray-400">EPIC System Key: {selectedVoterForDetail.id}</span>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6 shadow-xs">
                      <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-3xl font-bold shrink-0 shadow-xs text-red-800 font-display">
                            V
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-wide">{selectedVoterForDetail.name}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-1">Mobile ID: +91 {selectedVoterForDetail.mobileNumber}</p>
                            <p className="text-xs text-gray-400">Constituency Jurisdiction: {selectedVoterForDetail.district || 'District A'} • {selectedVoterForDetail.state || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="space-y-2 text-left md:text-right">
                          <div className="inline-block">
                            <span className={`text-xs px-3 py-1 rounded-full font-extrabold tracking-wider uppercase inline-block ${
                              selectedVoterForDetail.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800'
                            }`}>
                              STATUS: {selectedVoterForDetail.isBlocked ? 'Suspended / Restricted' : 'Active & Verified'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>Electoral ID / EPIC No:</strong> <span className="font-mono font-bold text-gray-800">
                              ECI-EPIC-{selectedVoterForDetail.state?.substring(0,3).toUpperCase() || 'IND'}-{selectedVoterForDetail.id?.substring(4,10).toUpperCase() || 'REG'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">National Demographic Data</h4>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Age:</span>
                              <span className="font-bold text-gray-900">{selectedVoterForDetail.age || '32'} Years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Gender:</span>
                              <span className="font-bold text-gray-900">Declared in EPIC File</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">State of Residence:</span>
                              <span className="font-bold text-gray-900">{selectedVoterForDetail.state || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">EPIC Issuance date:</span>
                              <span className="font-bold text-gray-900">12th May 2018</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Voter Node Security & Audit</h4>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-3 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Device/Key Association:</span>
                              <span className="font-mono text-green-700 font-bold">Secure SHA-256 Verified ✓</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Multifactor State:</span>
                              <span className="font-bold text-green-700">Biometric & SMS Bound ✓</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Electoral Offenses:</span>
                              <span className="font-bold text-green-700">No offenses on record ✓</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions with Two-Step Confirmation */}
                      <div className="pt-6 border-t border-gray-100 space-y-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Voter Franchise Access Controls</h4>
                        
                        {confirmDetailAction ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3 text-xs">
                            <p className="text-amber-800 font-bold">
                              ⚠️ Confirmation Required: Are you sure you want to {confirmDetailAction.label} this voter's access? 
                              This will prevent them from logging in, editing credentials, or casting any votes in any active election until ECI reinstates them.
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  await handleToggleBlockVoter(selectedVoterForDetail.id, selectedVoterForDetail.isBlocked);
                                  setSelectedVoterForDetail({ ...selectedVoterForDetail, isBlocked: !selectedVoterForDetail.isBlocked });
                                  setConfirmDetailAction(null);
                                }}
                                className="px-3 py-1.5 bg-red-800 text-white font-bold rounded hover:bg-red-900 transition cursor-pointer"
                              >
                                Yes, Confirm Action
                              </button>
                              <button
                                onClick={() => setConfirmDetailAction(null)}
                                className="px-3 py-1.5 bg-gray-200 text-gray-700 font-bold rounded hover:bg-gray-300 transition cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-3">
                            {selectedVoterForDetail.isBlocked ? (
                              <button
                                onClick={() => setConfirmDetailAction({ type: 'UNBLOCK', targetId: selectedVoterForDetail.id, label: 'Reinstate Franchise Access' })}
                                className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-800 font-bold text-xs rounded-lg border border-green-200 transition cursor-pointer"
                              >
                                ✅ Reinstate Voter Franchise Access
                              </button>
                            ) : (
                              <button
                                onClick={() => setConfirmDetailAction({ type: 'BLOCK', targetId: selectedVoterForDetail.id, label: 'Suspend Franchise Access' })}
                                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs rounded-lg border border-rose-200 transition cursor-pointer"
                              >
                                ⛔ Suspend Voter Node
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // List Voters View
                  <>
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 font-display uppercase tracking-wide">National Voter Registry & Compliance</h3>
                        <p className="text-xs text-gray-400">Audit demographic profiles and lock suspicious credentials</p>
                      </div>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                        <input type="text" placeholder="Search voter logs..." className="pl-8 pr-3 py-1.5 border text-xs rounded-lg w-56 bg-white" value={voterSearch} onChange={e => setVoterSearch(e.target.value)} />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div className="p-4 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase">Registered National Voters</div>
                      <div className="divide-y divide-gray-100 text-xs">
                        {filteredVoters.map(v => (
                          <div key={v.id} className="p-4 flex items-center justify-between gap-4">
                            <div className="text-left">
                              <h4 className="text-xs font-extrabold text-gray-900">{v.name}</h4>
                              <p className="text-[10px] text-gray-400 font-mono">Mobile ID: +91 {v.mobileNumber} | State: {v.state || 'N/A'}</p>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold inline-block mt-1 ${v.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800'}`}>
                                {v.isBlocked ? 'Suspended for Security' : 'Verified voter'}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setSelectedVoterForDetail(v)}
                                className="px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] rounded transition flex items-center gap-1 cursor-pointer border border-blue-100"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Details
                              </button>

                              <button
                                onClick={() => handleToggleBlockVoter(v.id, v.isBlocked)}
                                className={`px-2.5 py-1.5 text-[10px] font-bold rounded transition cursor-pointer border ${
                                  v.isBlocked ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-100'
                                }`}
                              >
                                {v.isBlocked ? 'Reinstate' : 'Suspend'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-500">Gender & Age Division Turnout Ratio</h4>
                      <p className="text-[11px] text-gray-400 mt-1">Calculated percentage from historical electoral turnouts and active samples</p>
                    </div>
                    <div className="h-44 w-full flex items-end gap-6 justify-center pt-8 border-b">
                      {[
                        { label: 'Male', pct: 68, color: 'bg-red-800' },
                        { label: 'Female', pct: 66, color: 'bg-amber-600' },
                        { label: 'Youth (18-25)', pct: 74, color: 'bg-blue-800' },
                        { label: 'Senior Citizen', pct: 59, color: 'bg-gray-700' }
                      ].map(bar => (
                        <div key={bar.label} className="flex flex-col items-center gap-2 flex-1">
                          <div className="w-full text-center text-xs font-bold font-mono text-gray-800">{bar.pct}%</div>
                          <div className={`w-full max-w-[40px] rounded-t ${bar.color}`} style={{ height: `${bar.pct * 1.5}px` }}></div>
                          <div className="text-[9px] font-extrabold text-gray-400 uppercase text-center tracking-tight h-8 flex items-center justify-center">{bar.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* State-wise Distribution Chart */}
                  <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase text-gray-500">State-wise Registered People Distribution</h4>
                      <span className="text-[9px] bg-red-50 text-red-800 font-extrabold px-2 py-0.5 rounded-md border border-red-150">
                        Live Database Sync
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Total registered voters, party managers, and candidates mapped across active states</p>
                    
                    <div className="space-y-3 pt-2 max-h-56 overflow-y-auto pr-1">
                      {stateData.map((item, idx) => {
                        const maxCount = Math.max(...stateData.map(d => d.count)) || 1;
                        const percentage = (item.count / maxCount) * 100;
                        return (
                          <div key={item.stateName} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-gray-700 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-[8px] text-gray-500 font-mono font-bold">
                                  {idx + 1}
                                </span>
                                {item.stateName}
                              </span>
                              <span className="font-bold text-gray-950 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200/50">
                                {item.count} Users
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden flex">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  idx === 0 ? 'bg-red-800' : idx === 1 ? 'bg-amber-600' : idx === 2 ? 'bg-emerald-700' : 'bg-blue-850'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
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

            {/* 14. Database Inspector Tab */}
            {adminTab === 'database_state' && (
              <div className="space-y-6 animate-fade-in">
                <DatabaseInspector />
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Statutory Document Inspection Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-4 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Landmark className="w-5 h-5 text-saffron-400" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold font-display uppercase tracking-wider">ECI Statutory Document Audit</h3>
                  <p className="text-[10px] text-gray-300">{selectedDocModal.partyName} ({selectedDocModal.partyAbbrev})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocModal(null)}
                className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Document Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Document Title</span>
                  <span className="font-extrabold text-gray-900">{selectedDocModal.title}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">File Descriptor</span>
                  <span className="font-mono font-semibold text-gray-700">{selectedDocModal.fileName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Audit Clearance Status</span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${selectedDocModal.isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedDocModal.isVerified ? '✓ VERIFIED PASSED' : 'PENDING AUDIT'}
                  </span>
                </div>
              </div>

              {/* Simulated Document Preview Certificate Box */}
              <div className="border-2 border-dashed border-gray-300 bg-amber-50/30 rounded-2xl p-6 space-y-4 relative overflow-hidden shadow-inner">
                <div className="absolute top-2 right-3 text-[9px] font-mono text-gray-400 uppercase tracking-widest">
                  OFFICIAL ECI RECORD COPY • SEC 29A RPA ACT
                </div>

                <div className="text-center space-y-1 border-b border-amber-200/60 pb-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-900 text-white flex items-center justify-center text-xl font-bold font-display shadow-xs">
                    🏛️
                  </div>
                  <h4 className="font-black text-sm text-gray-900 uppercase font-display tracking-wide">Election Commission of India</h4>
                  <p className="text-[10px] text-gray-500 font-bold uppercase">Nirvachan Sadan, Ashoka Road, New Delhi - 110001</p>
                  <p className="text-[11px] font-bold text-red-900 mt-1 uppercase underline decoration-red-200">
                    {selectedDocModal.title}
                  </p>
                </div>

                <div className="space-y-3 text-xs text-gray-800 leading-relaxed font-serif">
                  <p>
                    <strong>CERTIFIED STATUTORY SUBMISSION:</strong> This document serves as official verification for the political party registration dossier of <strong>{selectedDocModal.partyName} ({selectedDocModal.partyAbbrev})</strong> submitted to the Election Commission of India.
                  </p>
                  
                  <div className="bg-white p-4 rounded-xl border border-amber-200/80 space-y-2 font-sans text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Applicant Party:</span>
                      <span className="font-bold text-gray-900">{selectedDocModal.partyName}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 border-gray-100">
                      <span className="text-gray-500">Document Classification:</span>
                      <span className="font-mono text-gray-900">{selectedDocModal.docType}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 border-gray-100">
                      <span className="text-gray-500">Digital Signature / Checksum:</span>
                      <span className="font-mono text-[10px] text-gray-700">sha256::e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5 border-gray-100">
                      <span className="text-gray-500">KYC Cryptographic Audit Node:</span>
                      <span className="text-green-700 font-bold">🟢 UIDAI / MCA / IT Cyber Node Verified</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic">
                    "I hereby certify that the attached statutory record has been inspected for full compliance under the Representation of the People Act, 1951."
                  </p>
                </div>

                <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>ECI Timestamp: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="text-green-700 font-bold">VALIDATED & AUTHENTICATED</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  const docKey = `${selectedDocModal.partyId}_${selectedDocModal.docKey}`;
                  setVerifiedDocKeys(prev => ({ ...prev, [docKey]: !prev[docKey] }));
                  setSelectedDocModal(prev => ({ ...prev, isVerified: !prev.isVerified }));
                  setMessage(`Document clearance status updated for ${selectedDocModal.title}`);
                }}
                className={`px-4 py-2 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  selectedDocModal.isVerified
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-xs'
                }`}
              >
                {selectedDocModal.isVerified ? (
                  <>✕ Re-Open Audit Review</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Mark Document Verified PASSED</>
                )}
              </button>

              <button
                onClick={() => setSelectedDocModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
