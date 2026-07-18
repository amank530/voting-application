import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import AuthModal from './components/AuthModal';
import EciAdminDashboard from './pages/EciAdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import CandidateRegistration from './pages/CandidateRegistration';
import ElectionsLivePage from './pages/ElectionsLivePage';
import CandidateProfilesPage from './pages/CandidateProfilesPage';
import RegisteredPartiesPage from './pages/RegisteredPartiesPage';
import AboutPage from './pages/AboutPage';
import { api } from './services/api';
import { 
  LogIn, LogOut, Landmark, ShieldAlert, Users, Award, 
  MapPin, Clock, HelpCircle, Sparkles, UserCheck, ChevronRight,
  Menu, ChevronDown, Bell, Calendar, UserPlus, Grid, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // App views: 'HOME' | 'CANDIDATE_REG'
  const [currentView, setCurrentView] = useState('HOME');
  
  // Dashboard Tabs (for logged-in users to toggle between views): 'PUBLIC' | 'DASHBOARD'
  const [userRoleView, setUserRoleView] = useState('PUBLIC');

  const [currentTime, setCurrentTime] = useState(new Date());

  const [dashboardTab, setDashboardTab] = useState('elections');
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [bulletins, setBulletins] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  const navLinks = [
    { id: 'HOME_PUB', label: '🏠 Home & Stats', action: () => { setCurrentView('HOME'); setUserRoleView('PUBLIC'); } },
    { 
      id: 'VOTER_PORTAL', 
      label: '🗳️ Voter Portal', 
      action: () => { 
        if (currentUser) {
          setCurrentView('HOME');
          setUserRoleView('DASHBOARD');
        } else {
          setShowAuthModal(true);
        }
      } 
    },
    { id: 'CANDIDATE_PROFILE', label: '👤 Nominees', action: () => { setCurrentView('CANDIDATE_PROFILE'); } },
    { id: 'REGISTERED_PARTIES', label: '🏛️ Parties', action: () => { setCurrentView('REGISTERED_PARTIES'); } },
    { id: 'CANDIDATE_REG', label: '📝 Become Candidate', action: () => { setCurrentView('CANDIDATE_REG'); } },
    { id: 'ABOUT', label: '📢 Gazettes', action: () => { setCurrentView('ABOUT'); } },
    { 
      id: 'ECI_ADMIN', 
      label: '⚖️ Admin', 
      action: () => { 
        if (currentUser && currentUser.role === 'ELECTION_COMMISSION') {
          setCurrentView('ECI_ADMIN');
        } else {
          setShowAuthModal(true);
        }
      } 
    }
  ];

  const handleSelectMenuOption = (tabId, viewId = 'HOME') => {
    setDashboardTab(tabId);
    setCurrentView(viewId);
    setUserRoleView('PUBLIC');
    setShowMenuDropdown(false);
  };

  useEffect(() => {
    api.notifications.list()
      .then(list => setBulletins(list || []))
      .catch(err => console.error('Error fetching bulletins in App.jsx:', err));
  }, []);

  useEffect(() => {
    // Keep timezone clock updated
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if session contains pre-saved authentication tokens
  useEffect(() => {
    const savedUser = localStorage.getItem('eci_user');
    const savedToken = localStorage.getItem('eci_token');
    if (savedUser && savedToken) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setToken(savedToken);
        setUserRoleView('DASHBOARD');
      } catch (e) {
        localStorage.removeItem('eci_user');
        localStorage.removeItem('eci_token');
      }
    }
  }, []);

  const handleLoginSuccess = (user, simToken) => {
    setCurrentUser(user);
    setToken(simToken);
    localStorage.setItem('eci_user', JSON.stringify(user));
    localStorage.setItem('eci_token', simToken);
    
    // Automatically switch to dashboard view upon login
    setUserRoleView('DASHBOARD');
    if (user.role === 'PARTY_ADMIN') {
      setCurrentView('REGISTERED_PARTIES');
    } else {
      setCurrentView('HOME');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('eci_user');
    localStorage.removeItem('eci_token');
    setUserRoleView('PUBLIC');
    setCurrentView('HOME');
  };

  const handleProfileUpdated = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('eci_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans selection:bg-saffron-500 selection:text-white">
      
      {/* 1. National Official ECI Header */}
      <header className="bg-white border-b border-gray-200/80 shadow-sm sticky top-0 z-40">
        
        {/* Top saffron and green decorative bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-saffron-500 via-white to-emerald-600"></div>



        {/* Main Header Row */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => { setCurrentView('HOME'); setUserRoleView(currentUser ? 'DASHBOARD' : 'PUBLIC'); }}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 bg-primary-700 text-white rounded-xl flex items-center justify-center font-bold text-base transition group-hover:bg-primary-800 shadow-md border border-primary-600">
              🇮🇳
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 font-display text-sm md:text-base leading-tight tracking-tight flex items-center gap-1.5 animate-fade-in">
                Election Commission of India
              </h1>
              <p className="text-[10px] text-gray-400 font-medium">Digital Administrative & Ballot Core</p>
            </div>
          </div>



          {/* Combined Services Menu Dropdown Button */}
          <div className="flex items-center gap-2.5 relative">
            
            {/* View selectors for logged in users */}
            {currentUser && currentUser.role !== 'VOTER' && currentView === 'HOME' && (
              <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-200 hidden md:flex">
                <button
                  onClick={() => setUserRoleView('PUBLIC')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${userRoleView === 'PUBLIC' ? 'bg-white text-primary-800 shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Public View
                </button>
                <button
                  onClick={() => setUserRoleView('DASHBOARD')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${userRoleView === 'DASHBOARD' ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  Role Panel ({currentUser.role.replace(/_/g, ' ')})
                </button>
              </div>
            )}

            {/* Notifications Dropdown (Shifted ECI Bulletins) */}
            <div className="relative">
              <button
                id="eci-notifications-btn"
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowMenuDropdown(false);
                }}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer relative border border-blue-200 shadow-sm flex items-center justify-center h-8 w-8"
                title="ECI Official Bulletins"
              >
                <Bell className="w-4 h-4 text-blue-700" />
                {bulletins.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[8px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse border border-white shadow-xs">
                    {bulletins.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotificationsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsDropdown(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-gray-100 shadow-2xl z-50 overflow-hidden divide-y divide-gray-50 font-sans"
                    >
                      <div className="p-3 bg-gradient-to-r from-blue-800 to-blue-900 text-white text-[11px] font-bold tracking-wide uppercase flex items-center justify-between">
                        <span className="flex items-center gap-1.5">📢 ECI Bulletins & Alerts</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-mono">{bulletins.length} Active</span>
                      </div>

                      <div className="max-h-96 overflow-y-auto p-2 space-y-2">
                        {bulletins.length === 0 ? (
                          <div className="p-6 text-center text-gray-400 text-xs italic">
                            No active official bulletins found.
                          </div>
                        ) : (
                          bulletins.slice(0, 5).map((notif) => (
                            <div key={notif.id} className="p-2.5 rounded-lg bg-gray-50/50 hover:bg-gray-50 border border-gray-100/50 transition text-left space-y-1">
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  notif.type === 'URGENT' ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' :
                                  notif.type === 'ELECTION' ? 'bg-saffron-50 text-saffron-700 border border-saffron-100' :
                                  'bg-blue-50 text-blue-700 border border-blue-100'
                                }`}>
                                  {notif.type}
                                </span>
                                <span className="text-[9px] text-gray-400 font-mono">
                                  {new Date(notif.timestamp).toLocaleDateString('en-IN')}
                                </span>
                              </div>

                              <h5 className="font-extrabold text-gray-950 text-[11px] leading-snug">{notif.title}</h5>
                              <p className="text-[10px] text-gray-600 leading-normal line-clamp-3">{notif.content}</p>

                              {notif.attachmentUrl && (
                                <a 
                                  href={notif.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block text-[9px] font-bold text-primary-600 hover:underline mt-1"
                                >
                                  📄 View Official Gazette File
                                </a>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 bg-gray-50 flex justify-center">
                        <button
                          onClick={() => {
                            setCurrentView('ABOUT');
                            setShowNotificationsDropdown(false);
                          }}
                          className="w-full py-1.5 text-center text-primary-700 hover:text-primary-800 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                        >
                          View Full Bulletins Room
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* About ECI Header link */}
            <button
              onClick={() => {
                setCurrentView('ABOUT');
                setShowMenuDropdown(false);
                setShowNotificationsDropdown(false);
              }}
              className="p-2 bg-white hover:bg-gray-50 text-gray-750 rounded-lg transition flex items-center justify-center cursor-pointer border border-gray-200 shadow-xs h-8 w-8"
              title="About ECI Portal, Location, and Regulations"
            >
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>

            {/* Combined Menu Dropdown */}
            <div className="relative">
              <button
                id="eci-combined-menu-btn"
                onClick={() => {
                  setShowMenuDropdown(!showMenuDropdown);
                  setShowNotificationsDropdown(false);
                }}
                className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-800 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-primary-200 shadow-sm"
              >
                <Grid className="w-4 h-4 text-primary-700 animate-pulse" />
                <span>Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-primary-600 transition-transform duration-200 ${showMenuDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showMenuDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenuDropdown(false)}></div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-2xl z-50 overflow-hidden divide-y divide-gray-50"
                    >
                      <div className="p-3 bg-gradient-to-r from-primary-800 to-primary-900 text-white text-[11px] font-bold tracking-wide uppercase">
                        🇮🇳 Core Election Portal
                      </div>
                      
                      <div className="p-1.5 space-y-0.5 max-h-[70vh] overflow-y-auto">
                        {/* 1. Home & Stats */}
                        <button
                          onClick={() => { setCurrentView('HOME'); setUserRoleView('PUBLIC'); setShowMenuDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-blue-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            🏠
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-blue-800">Home & Live Turnouts</span>
                            <span className="text-[9px] text-gray-400 block">Election count scoreboards & graphs</span>
                          </div>
                        </button>

                        {/* 2. Voter Portal */}
                        <button
                          onClick={() => {
                            if (currentUser) {
                              setCurrentView('HOME');
                              setUserRoleView('DASHBOARD');
                            } else {
                              setShowAuthModal(true);
                            }
                            setShowMenuDropdown(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            🗳️
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-emerald-800">Voter Portal</span>
                            <span className="text-[9px] text-gray-400 block">Cast your secure Aadhaar ballot</span>
                          </div>
                        </button>

                        {/* 3. Nominees */}
                        <button
                          onClick={() => { setCurrentView('CANDIDATE_PROFILE'); setShowMenuDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-saffron-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-saffron-100 text-saffron-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            👤
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-saffron-800">Nominee Affidavits</span>
                            <span className="text-[9px] text-gray-400 block">Form 26 declarations, education & assets</span>
                          </div>
                        </button>

                        {/* 4. Registered Parties */}
                        <button
                          onClick={() => { setCurrentView('REGISTERED_PARTIES'); setShowMenuDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-purple-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            🏛️
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-purple-800">Registered Parties</span>
                            <span className="text-[9px] text-gray-400 block">Symbols, approvals & manifestos</span>
                          </div>
                        </button>

                        {/* 5. Become Candidate */}
                        <button
                          onClick={() => { setCurrentView('CANDIDATE_REG'); setShowMenuDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-amber-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            📝
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-amber-800">Become Candidate</span>
                            <span className="text-[9px] text-gray-400 block">Register nominee profile & get tickets</span>
                          </div>
                        </button>

                        {/* 6. Gazettes & Bulletins */}
                        <button
                          onClick={() => { setCurrentView('ABOUT'); setShowMenuDropdown(false); }}
                          className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            📢
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-indigo-800">Gazettes & Bulletins</span>
                            <span className="text-[9px] text-gray-400 block">Official announcements & guidelines</span>
                          </div>
                        </button>

                        {/* 7. EC Admin Dashboard */}
                        <button
                          onClick={() => { 
                            if (currentUser && currentUser.role === 'ELECTION_COMMISSION') {
                              setCurrentView('ECI_ADMIN');
                            } else {
                              setShowAuthModal(true);
                            }
                            setShowMenuDropdown(false); 
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                            ⚖️
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 block group-hover:text-red-800">EC Admin Dashboard</span>
                            <span className="text-[9px] text-gray-400 block">System settings & nominee approvals</span>
                          </div>
                        </button>

                        <div className="h-px bg-gray-100 my-1"></div>

                        {/* Auth Option */}
                        {!currentUser ? (
                          <button
                            onClick={() => { setShowAuthModal(true); setShowMenuDropdown(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition group cursor-pointer border border-dashed border-gray-250"
                          >
                            <div className="w-6 h-6 rounded bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                              🔑
                            </div>
                            <div>
                              <span className="text-xs font-bold text-primary-950 block">Officer & Citizen Auth</span>
                              <span className="text-[9px] text-gray-400 block">Voting & admin login portals</span>
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => { handleLogout(); setShowMenuDropdown(false); }}
                            className="w-full text-left px-3 py-2 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition group cursor-pointer border border-rose-100"
                          >
                            <div className="w-6 h-6 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                              🚪
                            </div>
                            <div>
                              <span className="text-xs font-bold text-rose-950 block font-display">Sign Out Account</span>
                              <span className="text-[9px] text-rose-500 block">Terminate current secure session</span>
                            </div>
                          </button>
                        )}
                      </div>

                      {/* Info footer inside menu */}
                      <div className="p-2.5 bg-gray-50/50 text-[9px] text-gray-400 font-medium text-center">
                        ECI Digital Core System • 2026
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Quick direct Sign Out if logged in */}
            {currentUser && currentUser.role !== 'VOTER' && (
              <button
                onClick={handleLogout}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer md:block hidden border border-rose-100"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sub Navigation Bar for responsive view selector */}
        {currentUser && currentUser.role !== 'VOTER' && currentView === 'HOME' && (
          <div className="bg-gray-50/50 py-2 border-t md:hidden flex justify-center gap-2 px-4">
            <button
              onClick={() => setUserRoleView('PUBLIC')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border transition ${userRoleView === 'PUBLIC' ? 'bg-white border-gray-300 text-primary-800 shadow-sm' : 'border-transparent text-gray-500'}`}
            >
              Public Directory
            </button>
            <button
              onClick={() => setUserRoleView('DASHBOARD')}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg transition ${userRoleView === 'DASHBOARD' ? 'bg-primary-600 text-white' : 'text-gray-500'}`}
            >
              Role Panel ({currentUser.role.replace(/_/g, ' ')})
            </button>
          </div>
        )}
      </header>



      {/* 2. Main Dashboard & Routing Area */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'CANDIDATE_REG' ? (
            <motion.div 
              key="candidate_reg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CandidateRegistration 
                currentUser={currentUser}
                onNavigateToHome={() => { setCurrentView('HOME'); setUserRoleView(currentUser ? 'DASHBOARD' : 'PUBLIC'); }}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            </motion.div>
          ) : currentView === 'ELECTIONS_LIVE' ? (
            <motion.div 
              key="elections_live"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ElectionsLivePage 
                currentUser={currentUser}
                onNavigateToHome={() => setCurrentView('HOME')}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            </motion.div>
          ) : currentView === 'CANDIDATE_PROFILE' ? (
            <motion.div 
              key="candidate_profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CandidateProfilesPage 
                currentUser={currentUser}
                onNavigateToHome={() => setCurrentView('HOME')}
                onNavigateToReg={() => setCurrentView('CANDIDATE_REG')}
                onOpenAuth={() => setShowAuthModal(true)}
              />
            </motion.div>
          ) : currentView === 'REGISTERED_PARTIES' ? (
            <motion.div 
              key="registered_parties"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RegisteredPartiesPage 
                currentUser={currentUser}
                onNavigateToHome={() => { setCurrentView('HOME'); setUserRoleView(currentUser ? 'DASHBOARD' : 'PUBLIC'); }}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
              />
            </motion.div>
          ) : currentView === 'ABOUT' ? (
            <motion.div 
              key="about_page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AboutPage 
                onNavigateToHome={() => setCurrentView('HOME')}
                onNavigateToVoterPortal={() => {
                  if (currentUser) {
                    setCurrentView('HOME');
                    setUserRoleView('DASHBOARD');
                  } else {
                    setShowAuthModal(true);
                  }
                }}
              />
            </motion.div>
          ) : currentView === 'ECI_ADMIN' ? (
            <motion.div 
              key="eci_admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <EciAdminDashboard 
                currentUser={currentUser} 
                onNavigateToHome={() => { setCurrentView('HOME'); setUserRoleView(currentUser ? 'DASHBOARD' : 'PUBLIC'); }}
              />
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* If logged in, and user chose Dashboard view */}
              {currentUser && userRoleView === 'DASHBOARD' ? (
                <>
                  {currentUser.role === 'ELECTION_COMMISSION' && <EciAdminDashboard currentUser={currentUser} />}
                  {currentUser.role === 'PARTY_ADMIN' && (
                    <RegisteredPartiesPage 
                      currentUser={currentUser}
                      onNavigateToHome={() => { setCurrentView('HOME'); setUserRoleView('PUBLIC'); }}
                      onLoginSuccess={handleLoginSuccess}
                      onLogout={handleLogout}
                    />
                  )}
                  {currentUser.role === 'CANDIDATE' && (
                    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
                      <div className="w-16 h-16 bg-blue-50 border text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Users className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-extrabold text-gray-900 font-display">Candidate Console</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                          Your candidate profile is registered under mobile +91 {currentUser.mobileNumber}. Contact the Election Commission Super Admin to review and approve your active nomination status!
                        </p>
                      </div>
                      <div className="bg-white border rounded-xl p-4 text-xs space-y-2 text-left font-mono max-w-md mx-auto">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-400">Affiliation:</span>
                          <span className="font-bold text-gray-800">Nominated Politician</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Registry:</span>
                          <span className="font-bold text-gray-800">Pending ECI Validation</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setCurrentView('CANDIDATE_REG')}
                          className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-lg text-xs shadow-md shadow-saffron-500/10 cursor-pointer transition"
                        >
                          📝 Fill Form 26 Nomination Form
                        </button>
                      </div>
                    </div>
                  )}
                  {currentUser.role === 'VOTER' && (
                    <VoterDashboard 
                      currentUser={currentUser} 
                      onProfileUpdated={handleProfileUpdated} 
                      onLogout={handleLogout} 
                      userRoleView={userRoleView} 
                      setUserRoleView={setUserRoleView} 
                      onNavigateToCandidateReg={() => setCurrentView('CANDIDATE_REG')}
                    />
                  )}
                </>
              ) : (
                /* Public Landing Page Dashboard view */
                <Dashboard 
                  onOpenAuth={() => {
                    if (currentUser) {
                      setUserRoleView('DASHBOARD');
                    } else {
                      setShowAuthModal(true);
                    }
                  }} 
                  onNavigateToCandidateReg={() => setCurrentView('CANDIDATE_REG')}
                  onNavigateToCandidates={() => setCurrentView('CANDIDATE_PROFILE')}
                  onNavigateToParties={() => setCurrentView('REGISTERED_PARTIES')}
                  onNavigateToVoterPortal={() => {
                    if (currentUser) {
                      setCurrentView('HOME');
                      setUserRoleView('DASHBOARD');
                    } else {
                      setShowAuthModal(true);
                    }
                  }}
                  currentUser={currentUser}
                  defaultTab={dashboardTab}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. Government Standard Footer */}
      <footer className="bg-primary-800 text-white py-6 px-4 lg:px-8 border-t-4 border-emerald-600 select-none">
        <div className="max-w-7xl mx-auto text-center text-xs text-gray-400 space-y-2">
          <p>© 2026 Election Commission of India. Crafted for administrative simulation and civic training.</p>
          <p className="text-[10px] italic">Any production rollout must comply with independent security clearances and ECI constitutional guidelines.</p>
        </div>
      </footer>

      {/* Authenticator Modal Popup */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
