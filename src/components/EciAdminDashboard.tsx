import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Election, PoliticalParty, Candidate, User, AuditLog, EciNotification } from '../types';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../lib/constants';
import { 
  Landmark, Plus, Edit, Trash2, CheckCircle, Ban, Play, Square, Award, Users, 
  ShieldAlert, RefreshCw, AlertTriangle, FileText, Download, Sparkles, Check, X, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EciAdminDashboardProps {
  currentUser: User;
}

export default function EciAdminDashboard({ currentUser }: EciAdminDashboardProps) {
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [parties, setParties] = useState<PoliticalParty[]>([]);
  const [voters, setVoters] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<EciNotification[]>([]);

  // Sub Tabs
  const [adminTab, setAdminTab] = useState<'elections' | 'nominations' | 'parties' | 'voters' | 'bulletins' | 'recovery'>('elections');

  // Form states
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    level: ELECTION_LEVELS[0],
    state: '',
    district: '',
    constituency: '',
    votingDate: '',
    countingDate: ''
  });

  const [showCreateNotif, setShowCreateNotif] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: '',
    content: '',
    type: 'UPDATE' as EciNotification['type']
  });

  // Selected candidate details modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [adminTab]);

  const fetchAdminData = async () => {
    try {
      if (adminTab === 'elections') {
        const data = await api.elections.list();
        setElections(data);
      } else if (adminTab === 'nominations') {
        const data = await api.candidates.list();
        setCandidates(data);
      } else if (adminTab === 'parties') {
        const data = await api.parties.list();
        setParties(data);
      } else if (adminTab === 'voters') {
        // Fetch users and filter out ECI Admins to show only voters
        const data = await api.stats.logs(currentUser.id); // fetches full user records implicitly or logs
        const votersList = await fetch('/api/auth/profile/usr-ec-admin') // mock proxy
          .then(() => api.elections.list()) // fallback
          .then(async () => {
            // Since we don't have user list endpoint, generate list from simulation or database users
            // Let's call standard fetch to get users
            const usersRes = await fetch('/api/auth/profile/usr-voter-aman').then(r => r.json()).catch(() => null);
            return usersRes ? [usersRes] : [];
          });
        // Generate mock voter view
        setVoters([
          { id: 'usr-voter-aman', mobileNumber: '9999999999', name: 'Aman Patel', role: 'VOTER', isVerified: true, age: 26, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North' },
          { id: 'usr-cand-rahul', mobileNumber: '7777777777', name: 'Rahul Sharma', role: 'CANDIDATE', isVerified: true, age: 45, state: 'Madhya Pradesh', district: 'Bhopal', constituency: 'Bhopal North' },
          { id: 'usr-sim-v-2', mobileNumber: '9123456780', name: 'Priya Nair', role: 'VOTER', isVerified: true, age: 17, state: 'Maharashtra', district: 'Mumbai', constituency: 'Ward 45' }, // underage test
          { id: 'usr-sim-v-3', mobileNumber: '9888877777', name: 'Rajesh Kumar', role: 'VOTER', isVerified: true, age: 62, state: 'Delhi', district: 'New Delhi', constituency: 'New Delhi Seat', isBlocked: true }
        ]);
      } else if (adminTab === 'bulletins') {
        const data = await api.notifications.list();
        setNotifications(data);
      } else if (adminTab === 'recovery') {
        const data = await api.stats.logs(currentUser.id);
        setLogs(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch admin data.');
    }
  };

  const handleCreateElection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await api.elections.create({
        ...newElection,
        adminId: currentUser.id
      });
      if (res.success) {
        setMessage('Election created successfully and nominations are open.');
        setShowCreateElection(false);
        setNewElection({
          title: '',
          level: ELECTION_LEVELS[0],
          state: '',
          district: '',
          constituency: '',
          votingDate: '',
          countingDate: ''
        });
        fetchAdminData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create election.');
    }
  };

  const handleUpdateElectionStatus = async (id: string, status: Election['status']) => {
    setError('');
    setMessage('');
    try {
      const res = await api.elections.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Election status upgraded to ${status.replace(/_/g, ' ')} successfully.`);
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update status.');
    }
  };

  const handleDeleteElection = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this election? All associated votes and candidate registries will be deleted permanently.')) return;
    try {
      const res = await api.elections.delete(id, currentUser.id);
      if (res.success) {
        setMessage('Election deleted successfully.');
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to delete election.');
    }
  };

  const handleCandidateStatus = async (id: string, status: Candidate['status']) => {
    try {
      const res = await api.candidates.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Candidate application ${status}.`);
        setSelectedCandidate(null);
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to review candidate.');
    }
  };

  const handlePartyStatus = async (id: string, status: PoliticalParty['status']) => {
    try {
      const res = await api.parties.updateStatus(id, status, currentUser.id);
      if (res.success) {
        setMessage(`Political Party status updated to ${status}.`);
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update party status.');
    }
  };

  const handleVoterBlockStatus = async (id: string, isBlocked: boolean) => {
    try {
      const res = await api.auth.blockUser(id, isBlocked, currentUser.id);
      if (res.success) {
        setMessage(`Voter safety status updated successfully.`);
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to update voter status.');
    }
  };

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.notifications.create({
        ...newNotif,
        adminId: currentUser.id
      });
      if (res.success) {
        setMessage('Official bulletin dispatched.');
        setShowCreateNotif(false);
        setNewNotif({ title: '', content: '', type: 'UPDATE' });
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Failed to dispatch bulletin.');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await api.admin.backup(currentUser.id);
      if (res.success) {
        setMessage(`Security Backup file db_backup_${new Date().toISOString().split('T')[0]}.json created successfully.`);
      }
    } catch (e: any) {
      setError(e.message || 'Backup failed.');
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('RESTORE WARNING: This will reset all current platform data, deletes newly registered votes, and restores ECI seed records. Proceed?')) return;
    try {
      const res = await api.admin.restore(currentUser.id);
      if (res.success) {
        setMessage('System database state successfully restored to ECI seed defaults.');
        fetchAdminData();
      }
    } catch (e: any) {
      setError(e.message || 'Restore failed.');
    }
  };

  // State selection helpers for form
  const districtsForForm = INDIAN_REGIONS.find(r => r.state === newElection.state)?.districts || [];
  const constituenciesForForm = districtsForForm.find(d => d.name === newElection.district)?.constituencies || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Commission header card */}
      <div className="bg-white border-l-4 border-primary-700 p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-700 font-bold text-sm uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-saffron-500" />
            Election Commission Authority Core
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 font-display">Super Admin Command Center</h2>
          <p className="text-xs text-gray-500 mt-1">Logged in: <strong className="text-gray-800 font-bold">{currentUser.name}</strong> • Role: Commission Officer</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleBackup}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download Backup
          </button>
          <button 
            onClick={handleRestore}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="mb-6 bg-emerald-50 text-emerald-800 border border-emerald-100 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 text-red-800 border border-red-100 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
            <button 
              onClick={() => setAdminTab('elections')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'elections' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <Landmark className="w-4 h-4" />
              Elections Command
            </button>
            <button 
              onClick={() => setAdminTab('nominations')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'nominations' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <FileText className="w-4 h-4" />
              Candidate Nominations
            </button>
            <button 
              onClick={() => setAdminTab('parties')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'parties' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <Award className="w-4 h-4" />
              Political Parties
            </button>
            <button 
              onClick={() => setAdminTab('voters')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'voters' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <Users className="w-4 h-4" />
              Voter Register Integrity
            </button>
            <button 
              onClick={() => setAdminTab('bulletins')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'bulletins' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <Plus className="w-4 h-4" />
              Publish Bulletins
            </button>
            <button 
              onClick={() => setAdminTab('recovery')}
              className={`w-full text-left p-4 text-sm font-semibold flex items-center gap-3 transition cursor-pointer ${adminTab === 'recovery' ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
            >
              <ShieldAlert className="w-4 h-4" />
              Security & Audit Logs
            </button>
          </div>
        </div>

        {/* Dynamic sub tab layout */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {adminTab === 'elections' && (
              <motion.div 
                key="elections"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-lg font-display">Simulated Elections Core</h3>
                  <button
                    onClick={() => setShowCreateElection(!showCreateElection)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Election
                  </button>
                </div>

                {showCreateElection && (
                  <form onSubmit={handleCreateElection} className="bg-white p-5 rounded-2xl border border-primary-100 shadow-sm space-y-4">
                    <h4 className="font-bold text-primary-800 text-sm">Create New Election Module</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">Election Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Lok Sabha Polls 2026"
                          value={newElection.title}
                          onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Election Level</label>
                        <select 
                          value={newElection.level}
                          onChange={(e) => setNewElection({ ...newElection, level: e.target.value as any, state: '', district: '', constituency: '' })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        >
                          {ELECTION_LEVELS.map((lvl, idx) => (
                            <option key={idx} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </div>

                      {/* State field if level is state or local specific */}
                      {!['Lok Sabha (MP)', 'Rajya Sabha (MP)', 'President', 'Vice President'].includes(newElection.level) && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">State</label>
                            <select 
                              required
                              value={newElection.state}
                              onChange={(e) => setNewElection({ ...newElection, state: e.target.value, district: '', constituency: '' })}
                              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                            >
                              <option value="">-- Choose State --</option>
                              {INDIAN_REGIONS.map((r, i) => (
                                <option key={i} value={r.state}>{r.state}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">District</label>
                            <select 
                              required
                              disabled={!newElection.state}
                              value={newElection.district}
                              onChange={(e) => setNewElection({ ...newElection, district: e.target.value, constituency: '' })}
                              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                            >
                              <option value="">-- Choose District --</option>
                              {districtsForForm.map((d, i) => (
                                <option key={i} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600">Constituency</label>
                            <select 
                              required
                              disabled={!newElection.district}
                              value={newElection.constituency}
                              onChange={(e) => setNewElection({ ...newElection, constituency: e.target.value })}
                              className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                            >
                              <option value="">-- Choose Constituency --</option>
                              {constituenciesForForm.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Voting Date</label>
                        <input 
                          type="date"
                          required
                          value={newElection.votingDate}
                          onChange={(e) => setNewElection({ ...newElection, votingDate: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Counting Date</label>
                        <input 
                          type="date"
                          required
                          value={newElection.countingDate}
                          onChange={(e) => setNewElection({ ...newElection, countingDate: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateElection(false)}
                        className="px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Establish Election State
                      </button>
                    </div>
                  </form>
                )}

                {/* Elections List */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                          <th className="p-4">Election & Level</th>
                          <th className="p-4">Geography</th>
                          <th className="p-4">Status Flow</th>
                          <th className="p-4">Votes / Candidates</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {elections.map((elec) => (
                          <tr key={elec.id} className="hover:bg-gray-50/50">
                            <td className="p-4">
                              <span className="font-bold text-gray-900 block text-sm">{elec.title}</span>
                              <span className="text-gray-400 font-mono text-[10px] block mt-0.5">{elec.level}</span>
                            </td>
                            <td className="p-4">
                              {elec.state ? (
                                <span className="text-gray-600">{elec.state} • {elec.constituency || 'All'}</span>
                              ) : (
                                <span className="text-gray-400 italic">National Scope</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                elec.status === 'VOTING_OPEN' ? 'bg-red-50 text-red-700 border border-red-100' :
                                elec.status === 'REGISTRATION_OPEN' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                elec.status === 'RESULTS_PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {elec.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="block font-semibold text-gray-700">{elec.voteCount} Votes Cast</span>
                              <span className="text-gray-400">{elec.candidateCount} Nominations</span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {/* Next status action controllers */}
                                {elec.status === 'CREATED' && (
                                  <button
                                    onClick={() => handleUpdateElectionStatus(elec.id, 'REGISTRATION_OPEN')}
                                    className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                                    title="Open Candidate Nominations"
                                  >
                                    Open nominations
                                  </button>
                                )}
                                {elec.status === 'REGISTRATION_OPEN' && (
                                  <button
                                    onClick={() => handleUpdateElectionStatus(elec.id, 'CANDIDATE_LIST_PUBLISHED')}
                                    className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                                    title="Lock Nominations & Publish Candidates List"
                                  >
                                    Publish candidate list
                                  </button>
                                )}
                                {elec.status === 'CANDIDATE_LIST_PUBLISHED' && (
                                  <button
                                    onClick={() => handleUpdateElectionStatus(elec.id, 'VOTING_OPEN')}
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center gap-1"
                                    title="Start Electronic Polls (Live Voting)"
                                  >
                                    <Play className="w-3.5 h-3.5" /> Start Voting
                                  </button>
                                )}
                                {elec.status === 'VOTING_OPEN' && (
                                  <button
                                    onClick={() => handleUpdateElectionStatus(elec.id, 'VOTING_ENDED')}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                                    title="Close Voting Stations"
                                  >
                                    <Square className="w-3.5 h-3.5" /> Stop Polls
                                  </button>
                                )}
                                {elec.status === 'VOTING_ENDED' && (
                                  <button
                                    onClick={() => handleUpdateElectionStatus(elec.id, 'RESULTS_PUBLISHED')}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded flex items-center gap-1 font-bold"
                                    title="Automate Cryptographic Vote Counting & Compile Winner Results"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Publish Results
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteElection(elec.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {adminTab === 'nominations' && (
              <motion.div 
                key="nominations"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-gray-900 text-lg font-display">Candidate nomination validation</h3>
                
                {candidates.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 className="text-gray-700 font-semibold">No candidates registered.</h4>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {candidates.map((cand) => (
                      <div key={cand.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={cand.photo} 
                            alt={cand.name} 
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{cand.name} <span className="font-normal text-xs text-gray-500">(Age: {cand.age})</span></h4>
                            <p className="text-xs text-gray-500">{cand.electionLevel} • {cand.constituency}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${cand.isIndependent ? 'bg-gray-100 text-gray-600' : 'bg-primary-50 text-primary-700'}`}>
                              {cand.isIndependent ? 'Independent Candidate' : `${cand.partyName} (${cand.partySymbol})`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            cand.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            cand.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {cand.status}
                          </span>
                          
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-50 rounded"
                            title="Review Affidavit Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {cand.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleCandidateStatus(cand.id, 'APPROVED')}
                                className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition"
                                title="Approve nomination"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCandidateStatus(cand.id, 'REJECTED')}
                                className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition"
                                title="Reject nomination"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {adminTab === 'parties' && (
              <motion.div 
                key="parties"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-gray-900 text-lg font-display">Political Party Authorizations</h3>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                          <th className="p-4">Party & Abbreviation</th>
                          <th className="p-4">Official symbol</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {parties.map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-bold text-gray-900">
                              {p.name} <span className="font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded font-bold text-[10px]">{p.abbrev}</span>
                            </td>
                            <td className="p-4 font-semibold text-gray-700">{p.symbol}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                                p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                p.status === 'SUSPENDED' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                {p.status === 'PENDING' && (
                                  <button
                                    onClick={() => handlePartyStatus(p.id, 'APPROVED')}
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold"
                                  >
                                    Approve Party
                                  </button>
                                )}
                                {p.status === 'APPROVED' && (
                                  <button
                                    onClick={() => handlePartyStatus(p.id, 'SUSPENDED')}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[10px] font-bold"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {p.status === 'SUSPENDED' && (
                                  <button
                                    onClick={() => handlePartyStatus(p.id, 'APPROVED')}
                                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold"
                                  >
                                    Reinstate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {adminTab === 'voters' && (
              <motion.div 
                key="voters"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-gray-900 text-lg font-display">Voter Audit and Account Suspension</h3>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 uppercase tracking-wider font-semibold border-b border-gray-200">
                          <th className="p-4">Name & Mobile</th>
                          <th className="p-4">Assigned Location</th>
                          <th className="p-4">Age Validation</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Block/Unblock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {voters.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-bold text-gray-900">
                              {v.name}
                              <span className="block text-[10px] font-mono text-gray-400 mt-0.5">+{v.mobileNumber}</span>
                            </td>
                            <td className="p-4 text-gray-600">
                              {v.state ? `${v.state} • ${v.constituency}` : <span className="text-gray-400 italic">Not set (Guest profile)</span>}
                            </td>
                            <td className="p-4 font-semibold text-gray-700">
                              {v.age ? `${v.age} Yrs` : 'N/A'}{' '}
                              {v.age && v.age < 18 && (
                                <span className="inline-block bg-rose-50 text-rose-700 border border-rose-100 px-1 rounded text-[9px]">Suspicious Underage</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded-full font-semibold ${
                                v.isBlocked ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              }`}>
                                {v.isBlocked ? 'Flagged/Suspended' : 'Verified'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {v.isBlocked ? (
                                <button
                                  onClick={() => handleVoterBlockStatus(v.id, false)}
                                  className="p-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition"
                                  title="Reinstate Voter Account"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleVoterBlockStatus(v.id, true)}
                                  className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded transition"
                                  title="Suspend Voter Account due to Duplicate Audit"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {adminTab === 'bulletins' && (
              <motion.div 
                key="bulletins"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-lg font-display">Dispatched Bulletins</h3>
                  <button
                    onClick={() => setShowCreateNotif(!showCreateNotif)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Write New Bulletin
                  </button>
                </div>

                {showCreateNotif && (
                  <form onSubmit={handleCreateNotification} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm">Write Official Notification</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">Bulletin Header Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. Code of Conduct Enforced"
                          value={newNotif.title}
                          onChange={(e) => setNewNotif({ ...newNotif, title: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">Bulletin Level Priority</label>
                        <select 
                          value={newNotif.type}
                          onChange={(e) => setNewNotif({ ...newNotif, type: e.target.value as any })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        >
                          <option value="UPDATE">Update (Regular)</option>
                          <option value="ELECTION">Election (Technical)</option>
                          <option value="URGENT">Urgent compliance notification</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-semibold text-gray-600">Bulletin Description Content</label>
                        <textarea 
                          required
                          rows={4}
                          placeholder="State full ECI regulation notes here..."
                          value={newNotif.content}
                          onChange={(e) => setNewNotif({ ...newNotif, content: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowCreateNotif(false)}
                        className="px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Dispatch National Bulletin
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 bg-white rounded-xl border border-gray-200 flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{n.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 leading-normal">{n.content}</p>
                        <span className="text-[10px] text-gray-400 block mt-2">{new Date(n.timestamp).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        n.type === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {n.type}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {adminTab === 'recovery' && (
              <motion.div 
                key="recovery"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <h3 className="font-bold text-gray-900 text-lg font-display">ECI Platform Operations Audit trail</h3>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 bg-gray-50 font-bold text-xs text-gray-600 uppercase border-b border-gray-200">
                    Immutable security log records
                  </div>
                  <div className="max-h-[450px] overflow-y-auto divide-y divide-gray-100 font-mono text-[11px]">
                    {logs.map((log) => (
                      <div key={log.id} className="p-3.5 hover:bg-gray-50/50 flex flex-col md:flex-row justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary-700">[{log.action}]</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">By: {log.userName} ({log.role})</span>
                          </div>
                          <p className="text-gray-600 leading-normal">{log.details}</p>
                        </div>
                        <span className="text-gray-400 text-[10px] shrink-0 text-right">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Candidate Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-primary-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Nomination Affidavit details</h3>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="flex gap-4 items-center p-3 bg-gray-50 rounded-xl">
              <img 
                src={selectedCandidate.photo} 
                alt={selectedCandidate.name} 
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <h4 className="font-bold text-gray-900 text-base">{selectedCandidate.name}</h4>
                <p className="text-xs text-gray-500">Party Code: <strong className="font-mono text-primary-700">{selectedCandidate.authorizationCode || 'INDEPENDENT'}</strong></p>
                <p className="text-xs text-gray-500">Education: <span className="font-semibold text-gray-700">{selectedCandidate.education || 'N/A'}</span></p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">District / State</span>
                  <span className="font-bold text-gray-800">{selectedCandidate.district || 'N/A'}, {selectedCandidate.state || 'N/A'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Asset Affidavits Declaration</span>
                  <span className="font-bold text-emerald-800">{selectedCandidate.assets || 'Declared'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gray-700">Biography & Background:</span>
                <p className="bg-gray-50 p-2.5 rounded-lg text-gray-600 leading-relaxed italic">"{selectedCandidate.biography || 'No biography uploaded.'}"</p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-gray-700">Core Constituency Manifesto Pledges:</span>
                <p className="bg-gray-50 p-2.5 rounded-lg text-gray-600 leading-relaxed font-medium">"{selectedCandidate.manifesto || 'No manifesto uploaded.'}"</p>
              </div>
            </div>

            {selectedCandidate.status === 'PENDING' && (
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleCandidateStatus(selectedCandidate.id, 'REJECTED')}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Reject Nomination
                </button>
                <button
                  onClick={() => handleCandidateStatus(selectedCandidate.id, 'APPROVED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Approve and Publish Candidate
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
