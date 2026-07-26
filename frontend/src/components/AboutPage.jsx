import React, { useState } from 'react';
import { 
  FileText, Shield, Award, HelpCircle, BookOpen, Search, 
  ExternalLink, Download, CheckCircle2, ChevronRight, Scale, Info
} from 'lucide-react';

export default function AboutPage({ onNavigateToHome, onNavigateToVoterPortal }) {
  const [activeTab, setActiveTab] = useState('GAZETTES');
  const [searchQuery, setSearchQuery] = useState('');

  const gazettes = [
    {
      id: 'G-2026-04',
      title: 'Delimitation of Parliamentary and Assembly Constituencies Order, 2026',
      date: 'July 15, 2026',
      category: 'Constituency Delimitation',
      ref: 'ECI/NOTIFICATION/2026/DEL-04',
      description: 'Official gazette notification publishing updated ward and seat boundaries for upcoming regional general elections.',
      size: '2.4 MB'
    },
    {
      id: 'G-2026-03',
      title: 'Amendment to the Conduct of Election Rules, 2026 (Postal Ballots)',
      date: 'June 28, 2026',
      category: 'Rules & Amendments',
      ref: 'ECI/LEG-RULES/2026/VOL-I',
      description: 'Revised eligibility criteria and submission guidelines for postal ballots and remote voting for defense personnel.',
      size: '1.1 MB'
    },
    {
      id: 'G-2026-02',
      title: 'Election Commission Order on Symbols of Registered unrecognized Parties',
      date: 'May 12, 2026',
      category: 'Party Symbols',
      ref: 'ECI/SYM-ORD/2026',
      description: 'Updated schedule of free symbols and allocation rules for unrecognized newly-registered political parties.',
      size: '1.8 MB'
    },
    {
      id: 'G-2026-01',
      title: 'Notification of General Elections to the Legislative Assembly',
      date: 'April 05, 2026',
      category: 'Election Schedule',
      ref: 'ECI/PRESS-NOTE/2026/ASSEM',
      description: 'Announcement of polling schedules, phases, counting dates, and implementation of Model Code of Conduct.',
      size: '3.5 MB'
    }
  ];

  const conductGuidelines = [
    {
      title: 'General Conduct',
      points: [
        'No party or candidate shall indulge in any activity which may aggravate existing differences or create mutual hatred or cause tension between different castes and communities.',
        'Criticism of other political parties, when made, shall be confined to their policies and program, past record and work. No party or candidate shall comment on the private life or personal character of opponents.',
        'No appeal shall be made to caste or communal feelings for securing votes. Temples, Mosques, Churches or other places of worship shall not be used as forum for election propaganda.'
      ]
    },
    {
      title: 'Meetings & Processions',
      points: [
        'Parties and candidates shall inform the local police authorities of the venue and time of any proposed meeting in good time, to enable police to make necessary arrangements.',
        'If two or more political parties propose to take processions along the same route, organizers shall establish contact beforehand to avoid clashes and traffic congestion.',
        'No political party or candidate shall permit their followers to use any individual\'s land, building, or compound wall without explicit written permission.'
      ]
    },
    {
      title: 'Polling Day Regulations',
      points: [
        'All political parties and candidates shall co-operate with the officers on election duty to ensure peaceful and orderly polling.',
        'Identity slips supplied to voters shall be on plain white paper and shall not contain any symbol, name of the candidate or the party.',
        'No candidate or party worker shall distribute liquor or refreshments near polling booths during the 48 hours ending with the hour fixed for the close of poll.'
      ]
    }
  ];

  const faqs = [
    {
      q: 'How do I check if my name is in the electoral roll?',
      a: 'You can check your status on the ECI homepage or log into the Citizen Portal using your Aadhaar/Credential login to view your official Digital Voter Slip (EPIC).'
    },
    {
      q: 'What is Form 26 and who has to fill it?',
      a: 'Form 26 is the official Nomination Affidavit that all prospective candidates must file during registration. It discloses candidates\' assets, liabilities, criminal antecedents (if any), educational qualifications, and party affiliation.'
    },
    {
      q: 'What is VVPAT and how does it verify my vote?',
      a: 'Voter Verifiable Paper Audit Trail (VVPAT) is an independent system attached to EVMs. When you cast your vote, a paper slip containing candidate number, name, and symbol is briefly visible through a transparent glass window for 7 seconds for visual verification.'
    },
    {
      q: 'What is the Model Code of Conduct (MCC)?',
      a: 'The MCC is a set of guidelines issued by the Election Commission of India for political parties and candidates during elections, primarily regarding speeches, polling day, polling booths, portfolios, content of election manifestos, and general conduct.'
    }
  ];

  const filteredGazettes = gazettes.filter(g => 
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-white to-emerald-600 p-0.5 rounded-2xl shadow-xl overflow-hidden mb-8">
        <div className="bg-slate-900/95 backdrop-blur-md px-6 py-10 sm:p-12 text-center relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-90">
            <span className="w-20 h-1 bg-orange-500 rounded-full"></span>
            <span className="w-3 h-3 border-2 border-white rounded-full bg-blue-700"></span>
            <span className="w-20 h-1 bg-emerald-500 rounded-full"></span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-slate-100 to-emerald-400 tracking-tight mt-2">
            Electoral Gazettes & Guidelines
          </h1>
          <p className="mt-3 text-slate-300 text-sm max-w-2xl mx-auto">
            Access official Election Commission of India notifications, the Model Code of Conduct, constitutional rules, and vital information for candidates and citizens.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={onNavigateToHome}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-2"
            >
              🏠 Back to Home
            </button>
            <button
              onClick={onNavigateToVoterPortal}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-saffron-600 hover:from-orange-600 hover:to-saffron-700 text-white font-bold rounded-lg text-xs shadow-lg shadow-orange-500/20 transition cursor-pointer flex items-center gap-2"
            >
              🔐 Enter Citizen Portal
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('GAZETTES')}
          className={`px-5 py-3.5 border-b-2 font-bold text-xs whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'GAZETTES' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          ECI Official Gazettes ({gazettes.length})
        </button>
        <button
          onClick={() => setActiveTab('MCC')}
          className={`px-5 py-3.5 border-b-2 font-bold text-xs whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'MCC' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          Model Code of Conduct
        </button>
        <button
          onClick={() => setActiveTab('GUIDELINES')}
          className={`px-5 py-3.5 border-b-2 font-bold text-xs whitespace-nowrap cursor-pointer transition flex items-center gap-2 ${
            activeTab === 'GUIDELINES' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Voter Awareness FAQ
        </button>
      </div>

      {/* Tab 1: GAZETTES */}
      {activeTab === 'GAZETTES' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col sm:flex-row items-center gap-4 justify-between shadow-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search gazette title, keyword, or reference number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Showing {filteredGazettes.length} of {gazettes.length} ECI Documents
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGazettes.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-slate-400">
                      {doc.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2 leading-snug">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 line-clamp-3">
                    {doc.description}
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>REF: {doc.ref}</span>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">PDF ({doc.size})</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert(`Simulated Download of ${doc.id} - In production, this provides the signed electronic gazette PDF.`)}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Gazette
                  </button>
                  <button
                    onClick={() => alert(`Opening secure ECI viewer for gazette ref: ${doc.ref}`)}
                    className="px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition text-slate-600 cursor-pointer flex items-center justify-center"
                    title="View Online"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: MCC */}
      {activeTab === 'MCC' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-xl flex items-start gap-3.5">
              <Scale className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider mb-1">
                  Binding Regulatory Framework
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  The Model Code of Conduct (MCC) is a standard set of protocols agreed upon by political parties to maintain high standards of democratic ethics during election campaigns. Violations will trigger severe disciplinary actions by the Election Commission of India.
                </p>
              </div>
            </div>

            {conductGuidelines.map((sect, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                  <div className="w-5 h-5 rounded bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800">
                    {sect.title}
                  </h4>
                </div>
                <ul className="space-y-3.5">
                  {sect.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed items-start">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-orange-600/10 rounded-full blur-xl pointer-events-none"></div>
              <h4 className="text-xs font-black text-orange-400 uppercase tracking-widest mb-3">
                ECI Fast-Track Redressal
              </h4>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                Citizens can report MCC violations, voter bribe attempts, illicit distribution of materials, or fake campaign platforms directly to ECI.
              </p>
              <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg mb-4 text-[10px] text-slate-300 font-mono">
                📞 Hotline: 1950<br/>
                📧 Email: complaints@eci.gov.in
              </div>
              <button 
                onClick={() => alert("Redirecting to online ECI Complaint Portal...")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-lg text-[10px] font-bold text-white transition cursor-pointer"
              >
                🚨 File Instant MCC Complaint
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-orange-500" />
                Ethical Voting Pledge
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                "We, the citizens of India, having abiding faith in democracy, hereby pledge to uphold the democratic traditions of our country and the dignity of free, fair and peaceful elections."
              </p>
              <div className="flex justify-between items-center bg-orange-50/50 p-2.5 rounded-lg border border-orange-100">
                <span className="text-[10px] font-bold text-orange-800">Citizens Signed</span>
                <span className="text-[11px] font-mono font-black text-slate-700">14,285,102</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GUIDELINES */}
      {activeTab === 'GUIDELINES' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-orange-50/40 border border-orange-200/60 p-5 rounded-xl flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="text-xs text-slate-700">
              Clear answers to the most common questions regarding registration, polling procedures, and general voter rights.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-250 p-6 shadow-sm hover:border-orange-200 transition">
                <h4 className="text-xs font-black text-orange-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  Question {i + 1}: {f.q}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed pl-5 border-l-2 border-slate-100">
                  {f.a}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
            <h4 className="text-sm font-extrabold text-slate-800 mb-2">
              Have a specific question not listed here?
            </h4>
            <p className="text-xs text-slate-600 mb-4 max-w-lg mx-auto">
              Our 24/7 ECI Citizens Helpdesk is active. Call our national toll-free helpline or search complete manual databases.
            </p>
            <div className="flex gap-3 justify-center">
              <a 
                href="tel:1950" 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1.5"
              >
                📞 Dial 1950
              </a>
              <button 
                onClick={() => alert("Opening full ECI Voter Education handbook...")}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                📕 ECI Voter Guidebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
