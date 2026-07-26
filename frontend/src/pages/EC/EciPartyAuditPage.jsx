import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Landmark, CheckCircle, AlertTriangle, FileText, Search, Eye, X, MapPin, 
  UserCheck, Users, Lock, ArrowLeft, ShieldCheck, Check, ChevronDown, Filter
} from 'lucide-react';

export default function EciPartyAuditPage({ onBack, currentUser }) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partySearch, setPartySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedDocModal, setSelectedDocModal] = useState(null);
  const [verifiedDocs, setVerifiedDocs] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      setLoading(true);
      const data = await api.parties.list();
      setParties(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load political party registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePartyStatus = async (id, status) => {
    try {
      const res = await api.parties.updateStatus(id, status, currentUser?.id);
      if (res.success) {
        setMessage(`Party registration updated to ${status}.`);
        if (selectedParty && selectedParty.id === id) {
          setSelectedParty({
            ...selectedParty,
            status,
            registrationNumber: status === 'APPROVED' ? (selectedParty.registrationNumber || `ECI-REG-${selectedParty.abbrev}-${Math.floor(100000 + Math.random() * 900000)}`) : selectedParty.registrationNumber
          });
        }
        fetchParties();
      }
    } catch (err) {
      setError(err.message || 'Failed to update party status.');
    }
  };

  const filteredParties = parties.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(partySearch.toLowerCase()) ||
      (p.abbrev || '').toLowerCase().includes(partySearch.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="eci-party-audit-page" className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans text-left space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition cursor-pointer text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-saffron-500/20 border border-saffron-400/30 text-saffron-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                Section 29A RPA 1951 Compliance Module
              </span>
              <span className="text-xs text-amber-200 font-mono font-bold">ECI AUDIT CORE</span>
            </div>
            <h2 className="text-xl font-black font-display mt-0.5">Political Party Registration & Document Dossier Audit</h2>
            <p className="text-xs text-amber-100/80">Inspect party constitutions, president Aadhaar credentials, financial records, and approve ECI registration codes.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] bg-white/10 text-amber-200 font-mono px-3 py-1.5 rounded-xl border border-white/10 font-bold">
            Pending Applications: {parties.filter(p => p.status === 'PENDING').length}
          </span>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex justify-between items-center">
          <span>✓ {message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 text-xs font-bold rounded-xl border border-red-200 flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="text-red-600 hover:text-red-900"><X className="w-4 h-4" /></button>
        </div>
      )}

      {selectedParty ? (
        /* DEEP DOSSIER INSPECTION VIEW */
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
            <button
              onClick={() => setSelectedParty(null)}
              className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              ← Back to Party List
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">Registry Ref: {selectedParty.id}</span>
              {selectedParty.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdatePartyStatus(selectedParty.id, 'APPROVED')}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" /> Approve Registration
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-800 border border-red-100 flex items-center justify-center text-3xl font-bold">
                  {selectedParty.symbol?.split(' ')[1] || selectedParty.symbol || '🏛️'}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-gray-900 font-display">{selectedParty.name} ({selectedParty.abbrev})</h3>
                  <p className="text-xs text-gray-500 mt-0.5">President: <strong className="text-gray-800">{selectedParty.presidentName || 'N/A'}</strong> | Email: {selectedParty.officialEmail || 'N/A'}</p>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded-full font-extrabold text-xs uppercase ${
                selectedParty.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
              }`}>
                STATUS: {selectedParty.status}
              </span>
            </div>

            {/* Document Checklist */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-wider">Statutory Uploaded Document Dossier</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'constitution', title: 'Party Constitution', file: `${selectedParty.abbrev}_Constitution.pdf` },
                  { key: 'presidentId', title: 'President Aadhaar Proof', file: `${selectedParty.abbrev}_President_Aadhaar.pdf` },
                  { key: 'hqAddress', title: 'HQ Office Address Proof', file: `${selectedParty.abbrev}_HQ_Address.pdf` },
                  { key: 'panCard', title: 'Income Tax PAN Card', file: `${selectedParty.abbrev}_PAN_Card.pdf` }
                ].map(doc => {
                  const isVerified = verifiedDocs[`${selectedParty.id}_${doc.key}`] || selectedParty.status === 'APPROVED';
                  return (
                    <div key={doc.key} className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <FileText className="w-4 h-4 text-red-800" />
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isVerified ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                      <h5 className="font-bold text-gray-900 text-xs">{doc.title}</h5>
                      <p className="text-[10px] text-gray-400 truncate">{doc.file}</p>
                      <button
                        onClick={() => setSelectedDocModal({ ...doc, partyName: selectedParty.name, partyAbbrev: selectedParty.abbrev, partyId: selectedParty.id, isVerified })}
                        className="w-full py-1 bg-white hover:bg-blue-50 text-blue-700 font-bold text-[10px] rounded border transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Audit Document
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST REGISTRY VIEW */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Packed Status Filter Menu Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Filter className="w-3.5 h-3.5 text-gray-500" />
                <span>
                  {statusFilter === 'ALL' ? `All (${parties.length})` : statusFilter === 'PENDING' ? `Pending (${parties.filter(p => p.status === 'PENDING').length})` : `Approved (${parties.filter(p => p.status === 'APPROVED').length})`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showFilterMenu ? 'rotate-180' : ''}`} />
              </button>

              {showFilterMenu && (
                <div className="absolute left-0 md:left-auto md:right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1 text-xs">
                  <div className="px-3 py-1 border-b border-gray-100 font-extrabold text-[10px] text-gray-400 uppercase tracking-wider">
                    Filter Applications
                  </div>
                  <button
                    onClick={() => { setStatusFilter('ALL'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-gray-50 transition cursor-pointer ${statusFilter === 'ALL' ? 'text-blue-600 bg-blue-50/60' : 'text-gray-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      All
                    </span>
                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-700 font-mono">{parties.length}</span>
                  </button>

                  <button
                    onClick={() => { setStatusFilter('PENDING'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-amber-50/50 transition cursor-pointer ${statusFilter === 'PENDING' ? 'text-amber-700 bg-amber-50' : 'text-gray-700'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Pending
                    </span>
                    <span className="text-[10px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800 font-mono">{parties.filter(p => p.status === 'PENDING').length}</span>
                  </button>

                  <button
                    onClick={() => { setStatusFilter('APPROVED'); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between font-bold hover:bg-green-50/50 transition cursor-pointer ${statusFilter === 'APPROVED' ? 'text-green-700 bg-green-50' : 'text-gray-700'}`}
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

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search party or abbrev..."
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border text-xs rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs divide-y divide-gray-100">
            {filteredParties.map((p) => (
              <div key={p.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-lg border">
                    {p.symbol?.split(' ')[1] || p.symbol || '🏛️'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900">{p.name} ({p.abbrev})</h4>
                    <p className="text-[10px] text-gray-500">President: {p.presidentName || 'N/A'} | Reg: {p.registrationNumber || 'PENDING'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md uppercase ${
                    p.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                  <button
                    onClick={() => setSelectedParty(p)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg transition cursor-pointer border border-blue-100 flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Inspect Dossier
                  </button>
                  {p.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdatePartyStatus(p.id, 'APPROVED')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                    >
                      Quick Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Inspection Modal */}
      {selectedDocModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-left">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-sm text-gray-900 uppercase">Document Audit: {selectedDocModal.title}</h3>
              <button onClick={() => setSelectedDocModal(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Party:</span>
                <span className="font-bold text-gray-900">{selectedDocModal.partyName} ({selectedDocModal.partyAbbrev})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">File Name:</span>
                <span className="font-mono text-gray-800">{selectedDocModal.file}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Section 29A Verification:</span>
                <span className="text-green-700 font-bold">🟢 UIDAI / Cyber Node Authenticated</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between gap-2">
              <button
                onClick={() => {
                  const docKey = `${selectedDocModal.partyId}_${selectedDocModal.key}`;
                  setVerifiedDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
                  setSelectedDocModal(null);
                  setMessage(`Document verification status toggled for ${selectedDocModal.title}`);
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Mark Document Verified PASSED
              </button>
              <button
                onClick={() => setSelectedDocModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
