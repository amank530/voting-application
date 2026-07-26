import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Database, ShieldAlert, CheckCircle, AlertTriangle, RefreshCw, 
  Search, Download, Eye, FileText, User, Users, Landmark, 
  Key, Bell, ListTodo, Layers, HelpCircle, HardDrive, Cpu, ExternalLink
} from 'lucide-react';

export default function DatabaseInspector() {
  const [dbState, setDbState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTable, setActiveTable] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  const fetchDbState = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.admin.getDbState();
      setDbState(data);
      setSyncStatus(`Updated at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error('Error fetching database state:', err);
      setError(err.message || 'Failed to retrieve database state.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState();
  }, []);

  // Filter records based on active table and search query
  const getFilteredData = () => {
    if (!dbState || !dbState.collections) return [];
    const rawList = dbState.collections[activeTable] || [];
    
    if (!searchQuery.trim()) return rawList;
    
    const query = searchQuery.toLowerCase();
    return rawList.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          return JSON.stringify(val).toLowerCase().includes(query);
        }
        return String(val).toLowerCase().includes(query);
      });
    });
  };

  const getTableIcon = (tableName) => {
    switch (tableName) {
      case 'users': return User;
      case 'candidates': return Users;
      case 'parties': return Landmark;
      case 'elections': return Layers;
      case 'votes': return FileText;
      case 'codes': return Key;
      case 'documents': return HardDrive;
      case 'notifications': return Bell;
      case 'auditLogs': return ListTodo;
      default: return Database;
    }
  };

  const handleExportJSON = (tableName) => {
    if (!dbState || !dbState.collections) return;
    const data = dbState.collections[tableName] || [];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `eci_${tableName}_export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeRecords = getFilteredData();
  const IconComponent = getTableIcon(activeTable);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-6 text-left" id="database-inspector">
      
      {/* 1. Header with Connection State Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-700 animate-pulse" />
            <h2 className="text-lg font-extrabold text-gray-900 font-display">
              ECI Database State Inspector
            </h2>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xl">
            Real-time developer monitor to track database sync, scrutinize storage architecture, and inspect raw voter/nominee records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDbState}
            disabled={loading}
            className="p-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-55 text-gray-700 rounded-lg transition-all flex items-center justify-center cursor-pointer border border-gray-200"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {dbState ? (
            <div className={`px-4 py-2 rounded-xl border flex items-center gap-2.5 shadow-sm text-xs font-bold leading-none ${
              dbState.useMySQL 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-saffron-50 text-saffron-800 border-saffron-200'
            }`}>
              <span className={`w-2.5 h-2.5 rounded-full ${
                dbState.useMySQL ? 'bg-emerald-500 animate-pulse' : 'bg-saffron-500 animate-bounce'
              }`}></span>
              <div>
                <p className="font-extrabold text-[11px] uppercase tracking-wider">
                  {dbState.useMySQL ? 'MySQL Connection: Connected' : 'JSON Fallback: Connected'}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-mono">
                  {dbState.useMySQL ? 'Real Relational Database' : 'Local db.json / Sandbox Active'}
                </p>
              </div>
            </div>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 border border-gray-200 text-xs flex items-center gap-2 font-bold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking Status...
            </div>
          )}
        </div>
      </div>

      {/* 2. Environment Variables & DB Connection Spec */}
      {dbState && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gray-950 text-emerald-400 font-mono p-4 rounded-xl border border-gray-800 text-xs shadow-inner space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-1.5">
              <span className="text-gray-400 font-bold flex items-center gap-1.5 text-[10px]">
                <Cpu className="w-3.5 h-3.5 text-gray-500" /> SYSTEM ENV CONFIGURATION (.env)
              </span>
              <span className="text-[9px] text-emerald-500/80 font-black">Active Mode</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px]">
              <div>
                <span className="text-gray-500">DB_HOST:</span>{' '}
                <span className="font-bold text-gray-200">
                  {dbState.env.DB_HOST ? dbState.env.DB_HOST : 'Empty (Triggering Falling Back to db.json)'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">DB_USER:</span>{' '}
                <span className="font-bold text-gray-200">
                  {dbState.env.DB_USER ? dbState.env.DB_USER : 'Not Configured'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">DB_NAME:</span>{' '}
                <span className="font-bold text-gray-200">{dbState.env.DB_NAME}</span>
              </div>
              <div>
                <span className="text-gray-500">DB_PORT:</span>{' '}
                <span className="font-bold text-gray-200">{dbState.env.DB_PORT}</span>
              </div>
            </div>
            
            <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-900 mt-2 italic flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
              {dbState.useMySQL 
                ? 'Relational table structure mapped in MySQL instance. Live state changes will persist across sessions.' 
                : 'Offline JSON persistence active in local server directory. Modify .env page DB variables to connect real database.'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-950 to-primary-900 text-white p-4 rounded-xl shadow-md border border-primary-850 flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-extrabold tracking-widest text-primary-300 uppercase">Database Footprint</h4>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <p className="text-lg font-black font-mono">{(dbState.collections?.users || []).length}</p>
                  <p className="text-[8px] text-gray-300 uppercase">Voters</p>
                </div>
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <p className="text-lg font-black font-mono">{(dbState.collections?.candidates || []).length}</p>
                  <p className="text-[8px] text-gray-300 uppercase">Nominees</p>
                </div>
                <div className="bg-white/5 p-1.5 rounded border border-white/5">
                  <p className="text-lg font-black font-mono">{(dbState.collections?.parties || []).length}</p>
                  <p className="text-[8px] text-gray-300 uppercase">Parties</p>
                </div>
              </div>
            </div>
            
            <div className="text-[9px] text-primary-200/70 pt-3 border-t border-primary-800 flex justify-between items-center">
              <span>{syncStatus || 'Checking sync...'}</span>
              <span className="font-bold text-white bg-emerald-500/20 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/10">LIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main State Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Collections & Tables</p>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-2 lg:pb-0">
            {dbState && dbState.collections && Object.keys(dbState.collections).map((key) => {
              const TabIcon = getTableIcon(key);
              const itemsCount = (dbState.collections[key] || []).length;
              const isActive = activeTable === key;

              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTable(key);
                    setSearchQuery('');
                    setSelectedRow(null);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer border shrink-0 text-left ${
                    isActive 
                      ? 'bg-primary-950 border-primary-950 text-white shadow-md' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <TabIcon className={`w-4 h-4 ${isActive ? 'text-saffron-400' : 'text-gray-400'}`} />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </div>
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {itemsCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Table Browser */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={`Search through ${activeTable}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-250 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-600 focus:border-primary-600 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-gray-500 font-medium font-mono">
                Showing {activeRecords.length} records
              </span>
              <button
                onClick={() => handleExportJSON(activeTable)}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-lg text-[11px] transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Export list as JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>

          {/* Records Table Grid */}
          <div className="bg-white border border-gray-150 rounded-xl overflow-hidden shadow-xs">
            <div className="max-h-[480px] overflow-auto">
              {activeRecords.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-800">No matching records found</p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto leading-normal">
                      There are no entries currently in the {activeTable} table matching "{searchQuery}".
                    </p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                      <th className="p-3">ID / Reference</th>
                      <th className="p-3">Core Information</th>
                      <th className="p-3">Location / Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeRecords.map((record, index) => {
                      const idVal = record.id || record.code || record.receiptId || `idx-${index}`;
                      
                      return (
                        <tr key={idVal} className="hover:bg-gray-50/70 transition">
                          <td className="p-3 font-mono font-bold text-gray-900 align-top">
                            <span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-[10px]">
                              {idVal}
                            </span>
                          </td>
                          <td className="p-3 align-top space-y-0.5">
                            {/* Render core information based on table type */}
                            {activeTable === 'users' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.name}</p>
                                <p className="text-gray-500 font-mono text-[10px]">📞 +91 {record.mobileNumber} | 🆔 Aadhaar: {record.aadharNumber || 'N/A'}</p>
                                <p className="text-[10px] text-primary-700 bg-primary-50 inline-block px-1.5 rounded font-black border border-primary-100 uppercase">{record.role}</p>
                              </>
                            )}

                            {activeTable === 'candidates' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.name}</p>
                                <p className="text-gray-500 text-[10px]">🏷️ Party: <span className="font-bold text-primary-900">{record.partyAbbrev || record.partyName || 'Independent'}</span></p>
                                <p className="text-gray-400 text-[9px] font-mono leading-none">Election: {record.electionTitle} ({record.electionLevel})</p>
                              </>
                            )}

                            {activeTable === 'parties' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.name} ({record.abbrev})</p>
                                <p className="text-gray-500 text-[10px]">🦁 Symbol: <span className="text-lg font-normal leading-none align-middle">{record.symbol || '⏳'}</span> | President: {record.presidentName}</p>
                                <p className="text-gray-400 font-mono text-[9px]">📧 {record.officialEmail} | Reg: {record.registrationNumber || 'Pending'}</p>
                              </>
                            )}

                            {activeTable === 'elections' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.title}</p>
                                <p className="text-gray-500 font-mono text-[9px]">Level: {record.level} | 📅 Poll: {record.votingDate} | Count: {record.countingDate}</p>
                              </>
                            )}

                            {activeTable === 'votes' && (
                              <>
                                <p className="font-bold text-gray-800">Voter: <span className="font-mono text-gray-600">{record.voterId}</span></p>
                                <p className="text-gray-500 text-[10px]">Cast For Candidate: <span className="font-mono font-bold text-primary-900">{record.candidateId}</span></p>
                                <p className="text-[9px] text-gray-400 font-mono leading-none">Sig: {record.encryptionSignature}</p>
                              </>
                            )}

                            {activeTable === 'codes' && (
                              <>
                                <p className="font-bold text-gray-800 font-mono text-xs">{record.code}</p>
                                <p className="text-gray-500 text-[10px]">Issued For Party: <span className="font-extrabold text-primary-900">{record.partyAbbrev}</span> in {record.constituency}</p>
                                {record.isUsed && <p className="text-[9px] text-emerald-600 font-semibold">✓ Claimed by {record.candidateName}</p>}
                              </>
                            )}

                            {activeTable === 'documents' && (
                              <>
                                <p className="font-bold text-gray-900 text-xs">{record.fileName}</p>
                                <p className="text-gray-500 text-[10px]">Type: <span className="font-mono text-gray-700">{record.fileType}</span> | Size: {Math.round(record.sizeBytes / 1024)} KB</p>
                                <p className="text-gray-400 text-[9px] font-mono leading-none">Affiliation: {record.candidateName || record.partyName || 'System Archive'}</p>
                              </>
                            )}

                            {activeTable === 'notifications' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.title}</p>
                                <p className="text-gray-600 line-clamp-1 leading-relaxed text-[10px]">{record.content}</p>
                              </>
                            )}

                            {activeTable === 'auditLogs' && (
                              <>
                                <p className="font-extrabold text-gray-900 text-xs">{record.action}</p>
                                <p className="text-gray-500 text-[10px]">Operator: {record.userName} ({record.role})</p>
                                <p className="text-gray-400 line-clamp-1 text-[10px] italic">{record.details}</p>
                              </>
                            )}
                          </td>
                          <td className="p-3 align-top space-y-1">
                            {/* Render status or key markers */}
                            {activeTable === 'users' && (
                              <div className="space-y-0.5">
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${record.isVerified ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-500 border border-gray-150'}`}>
                                  {record.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                                </span>
                                {record.isBlocked && (
                                  <span className="block px-1.5 py-0.5 rounded text-[9px] font-black bg-red-50 text-red-700 border border-red-100 w-max">LOCKED</span>
                                )}
                                <p className="text-gray-400 text-[9px] font-mono leading-none">{record.constituency || 'No constituency'}</p>
                              </div>
                            )}

                            {activeTable === 'candidates' && (
                              <div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  record.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-150' :
                                  record.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-150' :
                                  'bg-saffron-50 text-saffron-700 border border-saffron-150'
                                }`}>
                                  {record.status}
                                </span>
                                <p className="text-gray-400 font-mono text-[9px] mt-0.5">{record.constituency || 'No Ward'}</p>
                              </div>
                            )}

                            {activeTable === 'parties' && (
                              <div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${record.approved ? 'bg-green-50 text-green-700 border border-green-150' : 'bg-saffron-50 text-saffron-700 border border-saffron-150'}`}>
                                  {record.status}
                                </span>
                              </div>
                            )}

                            {activeTable === 'elections' && (
                              <div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                  record.status === 'VOTING_OPEN' ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' :
                                  record.status === 'RESULTS_PUBLISHED' ? 'bg-green-50 text-green-700 border border-green-100' :
                                  'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  {record.status.replace(/_/g, ' ')}
                                </span>
                                <p className="text-gray-400 font-mono text-[9px] mt-0.5">Polls: {record.voteCount || 0}</p>
                              </div>
                            )}

                            {activeTable === 'votes' && (
                              <div>
                                <p className="text-gray-400 text-[9px] font-mono">Date: {new Date(record.timestamp).toLocaleDateString('en-IN')}</p>
                                <p className="text-gray-400 text-[9px] font-mono leading-none">Receipt: {record.receiptId}</p>
                              </div>
                            )}

                            {activeTable === 'codes' && (
                              <div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black ${record.isUsed ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                                  {record.isUsed ? 'USED' : 'AVAILABLE'}
                                </span>
                              </div>
                            )}

                            {activeTable === 'documents' && (
                              <div>
                                <p className="text-gray-400 text-[9px] font-mono">Uploaded:</p>
                                <p className="text-gray-500 font-mono text-[9px] leading-none">{new Date(record.createdAt).toLocaleDateString('en-IN')}</p>
                              </div>
                            )}

                            {activeTable === 'notifications' && (
                              <div>
                                <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100">
                                  {record.type}
                                </span>
                              </div>
                            )}

                            {activeTable === 'auditLogs' && (
                              <div>
                                <p className="text-gray-400 text-[9px] font-mono leading-none">{new Date(record.timestamp).toLocaleTimeString()}</p>
                                <p className="text-gray-400 text-[9px] font-mono mt-0.5">{new Date(record.timestamp).toLocaleDateString()}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-3 align-top text-right">
                            <button
                              onClick={() => setSelectedRow(record)}
                              className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded transition flex items-center justify-center cursor-pointer ml-auto"
                              title="Inspect raw JSON record"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Single Row Detail Inspector Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="row-inspector-modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-primary-950 text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-saffron-400" />
                <h4 className="font-extrabold text-sm font-display tracking-tight">
                  Scrutiny: Raw Storage Record Object
                </h4>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1 hover:bg-white/10 text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed flex-grow font-sans">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metadata Schema</p>
                <p className="font-mono text-gray-800 text-[11px]">
                  Table Collection: <span className="font-bold text-primary-900">{activeTable}</span>
                </p>
                <p className="font-mono text-gray-500 text-[10px]">
                  UUID: {selectedRow.id || selectedRow.code || selectedRow.receiptId || 'System Auto-generated Key'}
                </p>
              </div>

              {selectedRow.base64Data && (
                <div className="space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-800 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-blue-700" /> BASE64 DIGITAL ATTACHMENT IN DB
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedRow.base64Data);
                        alert('Base64 content copied to clipboard successfully!');
                      }}
                      className="text-[10px] text-primary-700 font-bold hover:underline"
                    >
                      Copy Raw Base64 Code
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 font-mono italic">
                    Binary document file size: {Math.round(selectedRow.sizeBytes / 1024)} KB. Base64 representation stored inside MySQL longtext / JSON column column format safely.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Raw JSON Object Structure</p>
                <pre className="bg-gray-950 text-emerald-400 font-mono text-[10px] p-4 rounded-xl border border-gray-900 overflow-auto max-h-72 shadow-inner select-all">
                  {JSON.stringify(selectedRow, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-150 flex justify-end gap-2 rounded-b-2xl">
              <button
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Icon helper
function X({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
