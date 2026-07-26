import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Landmark, Users, CheckCircle2, Ticket, Award, FileSpreadsheet, Calendar, Mail, Lock, 
  ArrowLeft, RefreshCw, LogOut, CheckCircle, Search, ShieldCheck, MapPin, Building, Globe, Phone
} from 'lucide-react';
import PartyMembersPage from './PartyMembersPage';

export default function PartyDashboardPage({ party, onLogout, currentUser }) {
  const [partyTab, setPartyTab] = useState('profile');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (party) {
      fetchPartyCandidates();
    }
  }, [party]);

  const fetchPartyCandidates = async () => {
    try {
      setLoading(true);
      const data = await api.candidates.list();
      if (party) {
        const partyCands = (data || []).filter(c => 
          (c.partyName && c.partyName.toLowerCase().includes((party.name || '').toLowerCase())) ||
          (c.partyName && c.partyName.toUpperCase().includes((party.abbrev || '').toUpperCase()))
        );
        setCandidates(partyCands);
      }
    } catch (err) {
      console.error('Error fetching party candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!party) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center max-w-md space-y-4 shadow-xl">
          <Landmark className="w-12 h-12 text-purple-600 mx-auto" />
          <h3 className="font-extrabold text-gray-900 text-base font-display">No Active Party Session</h3>
          <p className="text-xs text-gray-500">Please authenticate with your party abbreviation and security passkey.</p>
          {onLogout && (
            <button onClick={onLogout} className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl">
              Go to Party Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="party-dashboard-page" className="min-h-screen bg-gray-50 p-4 sm:p-6 font-sans text-left space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-purple-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 text-4xl flex items-center justify-center font-bold shadow-inner shrink-0">
            {party.symbol ? (party.symbol.includes(' ') ? party.symbol.split(' ')[1] : party.symbol) : '🪷'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase bg-amber-500 text-black px-2 py-0.5 rounded-full tracking-wider">
                ★ Active Party Admin
              </span>
              <span className="text-[10px] font-mono text-purple-300">Token ID: {party.id}</span>
            </div>
            <h2 className="text-xl font-extrabold font-display leading-tight">{party.name}</h2>
            <p className="text-xs text-slate-300 font-mono tracking-widest">{party.abbrev} HIGH-COMMAND SECRETARIAT</p>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-2 relative z-10 shrink-0">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-xl text-xs font-bold">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
            <span>ECI-CONNECTED ONLINE</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> End Party Session
            </button>
          )}
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-4 rounded-xl border shadow-3xs gap-1 overflow-x-auto">
        {[
          { id: 'profile', label: 'Party Profile & Certificate', icon: Landmark },
          { id: 'members', label: 'Party Members Directory', icon: Users },
          { id: 'approvals', label: 'Nominee Approvals', icon: CheckCircle2 },
          { id: 'tickets', label: 'Issue Auth Tickets', icon: Ticket },
          { id: 'reports', label: 'Reports & Insights', icon: FileSpreadsheet }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setPartyTab(tab.id)}
              className={`pb-3 pt-3.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                partyTab === tab.id 
                  ? 'border-purple-600 text-purple-600 font-bold' 
                  : 'border-transparent text-gray-400 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {partyTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="font-black text-base text-gray-900 font-display uppercase">Section 29A Official Electoral Profile</h3>
              <p className="text-xs text-gray-500">Official statutory registration details on record with the Election Commission of India.</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-extrabold rounded-full uppercase">
              STATUS: {party.status || 'APPROVED'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider text-purple-900">Executive Secretariat</h4>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Party Name:</span>
                <span className="font-bold text-gray-900">{party.name} ({party.abbrev})</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">President Name:</span>
                <span className="font-bold text-gray-900">{party.presidentName || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Official Email:</span>
                <span className="font-bold text-gray-900">{party.officialEmail || 'secretariat@party.org'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact Number:</span>
                <span className="font-bold text-gray-900">{party.officialPhone || party.presidentMobile || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
              <h4 className="font-extrabold text-gray-900 text-xs uppercase tracking-wider text-purple-900">Registered Office Address</h4>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Central HQ:</span>
                <span className="font-bold text-gray-900 text-right">{party.officeAddress || party.hqAddress || 'New Delhi, India'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Registration Code:</span>
                <span className="font-mono font-bold text-gray-900">{party.registrationNumber || party.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Electoral Symbol:</span>
                <span className="font-bold text-gray-900">{party.symbol || '🪷'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {partyTab === 'members' && (
        <PartyMembersPage party={party} currentUser={currentUser} />
      )}

      {partyTab === 'approvals' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 uppercase">Nominee Ticket Approvals</h3>
          <p className="text-xs text-gray-500">Review candidate nomination requests filed under {party.name}.</p>

          <div className="divide-y divide-gray-100">
            {candidates.map((c) => (
              <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <span className="text-gray-500">{c.constituency}</span>
                </div>
                <span className={`px-2 py-0.5 font-bold rounded ${c.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {partyTab === 'tickets' && (
        <PartyMembersPage party={party} currentUser={currentUser} />
      )}

      {partyTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="font-black text-sm text-gray-900 uppercase">Secretariat Reports & Insights</h3>
          <p className="text-xs text-gray-500">Summary of electoral performance, cadre count, and active nomination tickets.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <span className="text-purple-700 font-bold block uppercase text-[10px]">Nominated Candidates</span>
              <span className="text-2xl font-extrabold text-purple-950 font-display">{candidates.length}</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 font-bold block uppercase text-[10px]">Approved Tickets</span>
              <span className="text-2xl font-extrabold text-emerald-950 font-display">{candidates.filter(c => c.status === 'APPROVED').length}</span>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <span className="text-blue-700 font-bold block uppercase text-[10px]">Verified Secretariat Cadres</span>
              <span className="text-2xl font-extrabold text-blue-950 font-display">12</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
