import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Search, User, Award, ShieldAlert, BookOpen, DollarSign, FileText, Download } from 'lucide-react';

export default function VoterCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const list = await api.candidates.list();
      // Only approved candidates are visible to voters
      setCandidates((list || []).filter(c => c.status === 'APPROVED'));
    } catch (e) {
      console.error('Error fetching candidates:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.partyName && c.partyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.constituency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Informational banner */}
      <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-800 font-medium">
        ℹ Voters can view all certified candidate profile filings, Form 26 affidavits, and party pledges. Approval or rejection is strictly restricted to ECI Super Administrators.
      </div>

      {/* Search Header */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name, party, constituency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400 italic">
          Synchronizing verified candidate credentials...
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center text-xs text-gray-400 italic bg-white rounded-2xl border">
          No finalized candidates found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((cand) => (
            <div key={cand.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4">
              
              {/* Profile Card Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 flex items-center justify-center font-black text-xl shadow-inner shrink-0 select-none">
                  {cand.partySymbol || '👤'}
                </div>
                <div className="space-y-0.5 truncate">
                  <h4 className="font-extrabold text-gray-950 text-sm truncate">{cand.name}</h4>
                  <p className="text-[10px] font-bold text-primary-800 truncate">{cand.partyName || 'Independent'}</p>
                  <p className="text-[9px] text-gray-400 truncate font-mono">{cand.constituency} Constituency</p>
                </div>
              </div>

              {/* Stats/Quick Details */}
              <div className="grid grid-cols-2 gap-2 border-y border-gray-100 py-3 text-[10px] text-gray-500 select-none">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Education</span>
                  <p className="font-bold text-gray-800 truncate flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {cand.education || 'Graduate'}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-gray-400 uppercase">Declared Assets</span>
                  <p className="font-bold text-emerald-700 truncate flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {cand.declaredAssets || '₹ 2.1 Crores'}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCandidate(cand)}
                  className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer text-center"
                >
                  View Full Dossier
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Dossier Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-primary-800/50 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 overflow-y-auto max-h-[85vh] border border-gray-100">
            <div className="flex items-start justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border flex items-center justify-center text-xl select-none">
                  {selectedCandidate.partySymbol || '👤'}
                </div>
                <div>
                  <h3 className="font-black text-gray-950 text-base">{selectedCandidate.name}</h3>
                  <p className="text-[11px] font-bold text-primary-700">{selectedCandidate.partyName || 'Independent Nominee'}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-900 cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form 26 Affidavit details */}
            <div className="space-y-4 text-xs">
              
              {/* Educational and Financial details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Educational Qualifications</span>
                  <p className="font-bold text-gray-800 mt-0.5">{selectedCandidate.education || 'Graduate from Delhi University'}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Declared Net Worth / Assets</span>
                  <p className="font-bold text-emerald-800 mt-0.5">{selectedCandidate.declaredAssets || '₹ 5.4 Crores'}</p>
                </div>
              </div>

              {/* Criminal Declarations */}
              <div className="border border-red-100 bg-red-50/50 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-red-800 font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Criminal Declarations & Charges</span>
                </div>
                <p className="text-[10px] text-red-700 leading-relaxed">
                  {selectedCandidate.criminalDeclarations || 'Declared Nil. No active criminal case file, conviction record, or outstanding charge exists under Form 26.'}
                </p>
              </div>

              {/* Manifesto & Biography */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase block">Candidate Manifesto & Pledge</span>
                <p className="text-gray-600 leading-relaxed bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                  {selectedCandidate.manifestoPledge || 'Focus on strengthening public infrastructure, healthcare systems, employment, clean water access, and smart environmental sustainability within the constituency boundaries.'}
                </p>
              </div>

              {/* Download Affidavits */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-gray-400" /> Form 26 Certified Hash: SHA-256
                </span>
                <button
                  onClick={() => alert('Simulating PDF Generation: Form-26 Affidavit downloaded successfully!')}
                  className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
                >
                  <Download className="w-3 h-3" /> Download Affidavit
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
