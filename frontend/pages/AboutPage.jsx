import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Landmark, ArrowLeft, RefreshCw, Users, Award, Calendar, 
  TrendingUp, ShieldCheck, MapPin, Phone, Mail, HelpCircle, 
  Layers, Lock, Server, CheckCircle, X, Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AboutPage({ onNavigateToHome, onNavigateToVoterPortal }) {
  const [liveStats, setLiveStats] = useState({
    totalRegisteredVoters: 0,
    totalCandidates: 0,
    totalPoliticalParties: 0,
    totalElections: 0,
    votesCast: 0,
    turnoutPercent: 64.5
  });
  const [elections, setElections] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showAllElections, setShowAllElections] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchStatsAndElections();
  }, []);

  const fetchStatsAndElections = async () => {
    setLoading(true);
    try {
      const [stats, elecList, notifList] = await Promise.all([
        api.stats.live(),
        api.elections.list().catch(() => []),
        api.notifications.list().catch(() => [])
      ]);
      if (stats) {
        setLiveStats(stats);
      }
      if (elecList) {
        setElections(elecList);
      }
      if (notifList) {
        setNotifications(notifList);
      }
    } catch (e) {
      console.error('Error fetching data on About Page:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
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
              <Landmark className="w-5 h-5 text-primary-700" />
              <h1 className="text-xl font-black font-display text-gray-950">About ECI Digital Core</h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              National administrative structure, electoral statistics, security standards, and official support directories.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatsAndElections}
          className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-600' : ''}`} />
          <span>Refresh Database Stats</span>
        </button>
      </div>

      {/* 2. Live Infrastructure and Registered Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-saffron-600" />
          <h2 className="text-xs font-black uppercase text-gray-500 tracking-wider">Live Electoral Registry Metrics</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 animate-pulse h-24"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { 
                icon: Users, 
                color: 'text-blue-600 bg-blue-50 border-blue-100', 
                value: liveStats.totalRegisteredVoters.toLocaleString(), 
                label: 'Registered Voters',
                desc: 'Eligible Indian voters registered in digital directory' 
              },
              { 
                icon: Award, 
                color: 'text-saffron-600 bg-saffron-50 border-saffron-100', 
                value: liveStats.totalCandidates, 
                label: 'Approved Candidates',
                desc: 'Cleared nominations with verified Form 26 affidavits' 
              },
              { 
                icon: Landmark, 
                color: 'text-purple-600 bg-purple-50 border-purple-100', 
                value: liveStats.totalPoliticalParties, 
                label: 'Political Parties',
                desc: 'Recognized alliances and independent coalitions' 
              },
              { 
                icon: Calendar, 
                color: 'text-emerald-600 bg-emerald-50 border-emerald-100', 
                value: liveStats.totalElections, 
                label: 'Total Elections',
                desc: 'National and local circles tracked in real-time' 
              },
              { 
                icon: TrendingUp, 
                color: 'text-pink-600 bg-pink-50 border-pink-100', 
                value: liveStats.votesCast.toLocaleString(), 
                label: 'Votes Casted',
                desc: 'Total ballots securely counted by server nodes' 
              },
              { 
                icon: ShieldCheck, 
                color: 'text-indigo-600 bg-indigo-50 border-indigo-100', 
                value: `${liveStats.turnoutPercent}%`, 
                label: 'Simulated Turnout',
                desc: 'Average national voter turnout across active circles' 
              }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between group hover:border-primary-200 transition">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${stat.color.split(' ')[1]} ${stat.color.split(' ')[2]} ${stat.color.split(' ')[0]}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl font-bold font-mono text-gray-900 block tracking-tight">{stat.value}</span>
                  <span className="text-[10px] text-gray-500 font-bold block uppercase tracking-wide mt-0.5">{stat.label}</span>
                  <p className="text-[9px] text-gray-400 font-medium leading-tight mt-1 line-clamp-2">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Multi-Section Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Locations and Levels */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* ECI Headquarters and Location */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Physical & Digital Location Nodes</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Central Headquarters</span>
                <p className="text-xs font-bold text-gray-950">Nirvachan Sadan</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Ashoka Road, New Delhi, Delhi 110001, India
                </p>
                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[10px] text-gray-500 font-medium leading-relaxed">
                  📍 Opposite Parliament Library, central executive district of the national capital territory.
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">Digital Server Architecture</span>
                <p className="text-xs font-bold text-gray-950">New Delhi National Server Node</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  NIC Sovereign Cloud Core, Shastri Park Data Center, Delhi, India
                </p>
                <div className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50 text-[10px] text-emerald-700 font-medium leading-relaxed flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  Active status: Online & fully sync-validated.
                </div>
              </div>
            </div>
          </div>

          {/* Supported Administrative Levels */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Layers className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Supported Administrative Levels</h3>
            </div>
            
            <p className="text-xs text-gray-600 leading-relaxed">
              The Election Commission of India Digital Core handles decentralized voter lists and balloting systems across three key constitutional tiers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Level 1</span>
                <h4 className="text-xs font-bold text-gray-950">National Parliamentary</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Lok Sabha (Lower House) constituencies. Conducts federal-level MP electoral updates and alliance counts.
                </p>
              </div>
              
              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-saffron-600 uppercase tracking-widest block">Level 2</span>
                <h4 className="text-xs font-bold text-gray-950">State Assembly</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Vidhan Sabha constituencies. Maps local state regions, legislative assembly districts, and regional seats.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest block">Level 3</span>
                <h4 className="text-xs font-bold text-gray-950">Local / Municipal</h4>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Panchayat and Ward constituencies. Governs grass-root municipal representation and local district circles.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Security & Contact Support */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Security and Regulations */}
          <div className="bg-gradient-to-br from-primary-900 to-primary-950 text-white p-6 rounded-2xl border border-primary-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-primary-800/80">
              <Lock className="w-4 h-4 text-saffron-400" />
              <h3 className="text-xs font-black text-saffron-400 uppercase tracking-widest">Security & Legal Regulation</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Operating under strict constitutional guidelines of Article 324 of the Constitution of India, our digital systems feature military-grade safety controls:
            </p>

            <div className="space-y-3">
              {[
                { title: 'SHA-256 AES-256 Encryption', desc: 'All digital ballot records are stored using asymmetric cryptographic standards with continuous network ledger verification.' },
                { title: 'Aadhaar-OTP Identity Verification', desc: 'Citizens register and login securely via dynamic national identity nodes with temporary session tokens.' },
                { title: 'Form 26 Affidavit Validation', desc: 'Automatic validation filters ensure candidate asset, education, and legal declarations are complete before approval.' },
                { title: 'Anti-Tamper Vote Counting', desc: 'Real-time consensus verification across regional data servers prevents duplicate or unauthorized vote inputs.' }
              ].map((rule, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-[11px] font-bold text-white">{rule.title}</h4>
                    <p className="text-[9px] text-gray-400 leading-normal">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support & Administrative Desk */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Phone className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Administrative Support & Contacts</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              If you discover discrepancies in voter registration lists or need administrative action concerning symbol allocation, please contact our support desk:
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-gray-100/50">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">ECI Control Room</span>
                  <p className="text-xs font-bold text-gray-950 font-mono">+91 11-23052205</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-gray-100/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">General Enquiries</span>
                  <p className="text-xs font-bold text-gray-950 font-mono">complaints@eci.gov.in</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-gray-100/50">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 tracking-wider uppercase block">Technical Support</span>
                  <p className="text-xs font-bold text-gray-950 font-mono">support@eci.gov.in</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition border border-gray-100/50">
                <div className="w-8 h-8 rounded-lg bg-saffron-50 text-saffron-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block">National Voter Toll-Free</span>
                  <p className="text-xs font-bold text-gray-950 font-mono">1950 (Toll Free)</p>
                </div>
              </div>
          </div>

        </div>

      </div>

    </div>

      {/* SECTION: ACTIVE & UPCOMING POLLING BOOTHS */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
          <h3 className="text-xs font-black uppercase text-gray-750 tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600 animate-pulse" />
            Active & Upcoming Polling Booths
          </h3>
          <button
            onClick={onNavigateToVoterPortal}
            className="px-3 py-1.5 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-[10px] uppercase rounded-lg transition-all duration-150 cursor-pointer shadow-xs shrink-0"
          >
            🗳️ Enter Voter Portal & Cast Ballot
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(showAllElections ? elections : elections.slice(0, 3)).map((elec) => (
            <div 
              key={elec.id} 
              onClick={() => setSelectedElection(elec)}
              className="p-4 bg-white hover:bg-gray-50/80 rounded-xl border border-gray-150 flex flex-col justify-between space-y-3 cursor-pointer hover:border-emerald-500 transition text-left shadow-2xs group"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start gap-1.5">
                  <span className="bg-primary-50 text-primary-800 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary-200">
                    {elec.level}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold ${
                    elec.status === 'VOTING_OPEN' ? 'bg-emerald-100 text-emerald-800 animate-pulse font-black' : 'bg-gray-200 text-gray-700'
                  }`}>
                    ● {elec.status?.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-extrabold text-gray-950 text-xs leading-tight group-hover:text-emerald-700 transition truncate" title={elec.title}>
                  {elec.title}
                </h4>
              </div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 pt-1 border-t border-gray-100/60 select-none">
                View Booth Details & Vote →
              </div>
            </div>
          ))}
          {elections.length === 0 && (
            <p className="text-xs text-gray-500 italic">No scheduled elections match active database records.</p>
          )}
        </div>

        {elections.length > 3 && (
          <div className="flex justify-center pt-2 border-t border-gray-50">
            <button
              onClick={() => setShowAllElections(!showAllElections)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer border border-gray-200"
            >
              {showAllElections ? 'Collapse Booths List ▲' : `View All ${elections.length} Active Booths ▼`}
            </button>
          </div>
        )}
      </section>

      {/* Detail Pop-up Modal for Election Polling Booth */}
      <AnimatePresence>
        {selectedElection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative text-left space-y-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedElection(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="bg-primary-50 text-primary-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-primary-200">
                    {selectedElection.level}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                    selectedElection.status === 'VOTING_OPEN' ? 'bg-emerald-100 text-emerald-800 animate-pulse font-black' : 'bg-gray-200 text-gray-700'
                  }`}>
                    ● {selectedElection.status?.replace('_', ' ')}
                  </span>
                </div>
                <h2 className="text-base font-black text-gray-950 font-display leading-snug pr-6">
                  {selectedElection.title}
                </h2>
              </div>

              <hr className="border-gray-100" />

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2 text-xs font-semibold text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-400">Constituency Assembly:</span>
                  <span className="text-gray-950 font-bold">{selectedElection.constituency || 'All constituencies'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Polling Scheduled Date:</span>
                  <span className="text-gray-950 font-bold">{selectedElection.votingDate || 'Scheduled'}</span>
                </div>
                {selectedElection.winnerParty && (
                  <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                    <span className="text-gray-400">Declared Winner Party:</span>
                    <span className="text-emerald-700 font-bold">{selectedElection.winnerParty}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedElection(null);
                    onNavigateToVoterPortal();
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                >
                  🗳️ Enter Booth & Vote
                </button>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION: ELECTION TIMELINE */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 text-left">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-saffron-600" />
          General Elections Lifecycle Milelines
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3.5 text-center text-xs font-medium">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 1</span>
            <p className="font-extrabold text-gray-900 leading-none">Nomination</p>
            <p className="text-[10px] text-gray-400">Sep 01 - Sep 15</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 2</span>
            <p className="font-extrabold text-gray-900 leading-none">Scrutiny</p>
            <p className="text-[10px] text-gray-400">Sep 16 - Sep 18</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 3</span>
            <p className="font-extrabold text-gray-900 leading-none">Withdrawal</p>
            <p className="text-[10px] text-gray-400">Sep 19 - Sep 21</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 4</span>
            <p className="font-extrabold text-gray-900 leading-none">Campaign</p>
            <p className="text-[10px] text-gray-400">Sep 22 - Oct 13</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 5</span>
            <p className="font-extrabold text-emerald-800 leading-none">Polling Day</p>
            <p className="text-[10px] text-emerald-600 font-bold">Oct 15, 2026</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
            <span className="bg-primary-50 text-primary-700 text-[8px] font-black px-1.5 py-0.5 rounded-full block mx-auto w-max">PHASE 6</span>
            <p className="font-extrabold text-primary-800 leading-none">Results</p>
            <p className="text-[10px] text-primary-600 font-bold">Oct 18, 2026</p>
          </div>
        </div>
      </section>

      {/* SECTION: OFFICIAL NOTIFICATIONS & GAZETTES */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-4 text-left">
        <div className="flex items-center gap-2 border-b pb-2">
          <Newspaper className="w-4 h-4 text-saffron-600 animate-pulse" />
          <h3 className="text-xs font-black uppercase text-gray-750 tracking-wider">
            🔔 Recent ECI Bulletins & Official Gazettes
          </h3>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-gray-400 font-semibold">
            Loading official publications...
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400 italic">No public announcements are currently logged.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => setSelectedNotification(notif)}
                className="p-4 bg-gray-50/50 hover:bg-emerald-50/10 border border-gray-150 rounded-xl cursor-pointer transition flex flex-col justify-between hover:border-emerald-500 text-left group shadow-3xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black font-mono px-1.5 py-0.5 rounded uppercase tracking-wide ${
                      notif.type === 'URGENT' ? 'bg-red-50 text-red-600 border border-red-100' :
                      notif.type === 'ELECTION' ? 'bg-saffron-50 text-saffron-700 border border-saffron-100' :
                      'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                      {notif.type}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(notif.timestamp).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-gray-950 text-xs font-display leading-snug line-clamp-2 group-hover:text-emerald-700 transition">
                    {notif.title}
                  </h4>
                </div>
                <div className="text-[10px] text-emerald-600 font-black mt-3 flex items-center gap-1 select-none">
                  Read Announcement details →
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION: VOTER INFORMATION */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-6 text-left">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-600" />
          Voter Guidelines, Eligibility, and Walkthroughs
        </h3>

        {/* Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs leading-relaxed">
          <div className="space-y-2">
            <span className="text-lg">📋</span>
            <h4 className="font-extrabold text-gray-950">1. Verification Check</h4>
            <p className="text-gray-500 text-[11px]">Make sure your age is 18 years or older and that you possess a valid UIDAI Aadhaar ID card file scan.</p>
          </div>
          <div className="space-y-2">
            <span className="text-lg">🤳</span>
            <h4 className="font-extrabold text-gray-950">2. Register Profile</h4>
            <p className="text-gray-500 text-[11px]">Create an online voter credentials file. Validate Aadhaar references with secure OTP verification codes.</p>
          </div>
          <div className="space-y-2">
            <span className="text-lg">🗳️</span>
            <h4 className="font-extrabold text-gray-950">3. Electronic Voting</h4>
            <p className="text-gray-500 text-[11px]">Enter your custom regional polling booth when active. Cast your secret vote ballot Confidentially on our EVM unit.</p>
          </div>
          <div className="space-y-2">
            <span className="text-lg">🔍</span>
            <h4 className="font-extrabold text-gray-950">4. Audited Results</h4>
            <p className="text-gray-500 text-[11px]">Track real-time counting margins and final electoral roll certifications audited by ECI Administrators.</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">Frequently Asked Questions</span>
          <div className="space-y-2">
            {[
              { q: "How do I register as a voter?", a: "Indian citizens aged 18 or above can register via this portal by clicking the 'Register' button, which authenticates with your Aadhaar ID and sends an OTP, followed by local face validation." },
              { q: "Can I cast my vote online?", a: "Yes, our secure digital EVM module is live during official voting hours. Eligible voters matching the constituency can vote securely via their voter dashboard." },
              { q: "What is Form 26?", a: "Form 26 is the candidate affidavit declaring educational qualifications, net assets, criminal record (if any), and biographical summary. All approved filings are public." },
              { q: "What is the EPIC number?", a: "The Electoral Photo Identity Card (EPIC) is your unique Voter ID number generated by the Election Commission of India once your identity is approved." }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-4 py-3 text-xs font-extrabold text-gray-900 flex justify-between items-center cursor-pointer transition hover:bg-gray-100"
                  >
                    <span>{faq.q}</span>
                    <span>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-0.5 text-xs text-gray-500 leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail Pop-up Modal for Notification Bulletin / Gazette */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 relative text-left space-y-4 max-h-[85vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-150 text-gray-400 hover:text-gray-700 transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[9px] font-black font-mono px-2 py-0.5 rounded uppercase tracking-wide ${
                    selectedNotification.type === 'URGENT' ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' :
                    selectedNotification.type === 'ELECTION' ? 'bg-saffron-50 text-saffron-700 border border-saffron-100' :
                    'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}>
                    {selectedNotification.type}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(selectedNotification.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>
                <h2 className="text-lg font-black text-gray-950 font-display leading-snug pr-8">
                  {selectedNotification.title}
                </h2>
              </div>

              <hr className="border-gray-100" />

              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                {selectedNotification.content}
              </div>

              {selectedNotification.attachmentUrl && (
                <div className="pt-2">
                  <a 
                    href={selectedNotification.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-blue-700 transition cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>View Official Gazette PDF Document</span>
                  </a>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close Bulletin
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
