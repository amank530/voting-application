import React, { useState } from 'react';
import { Landmark, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function VoterSupport({ currentUser }) {
  const [complaints, setComplaints] = useState([
    {
      id: 'GRV-401',
      category: 'Identity Verification discrepancy',
      subject: 'Aadhaar middle name mismatch',
      status: 'RESOLVED',
      date: 'Oct 02, 2026',
      remarks: 'Manually certified with UIDAI biometric override.'
    },
    {
      id: 'GRV-503',
      category: 'Electoral Roll Correction',
      subject: 'Ward number updated to 14',
      status: 'OPEN',
      date: 'Just Now',
      remarks: 'Queued for ECI Booth Officer audit.'
    }
  ]);

  const [category, setCategory] = useState('Identity Verification');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket = {
      id: `GRV-${Math.floor(600 + Math.random() * 300)}`,
      category,
      subject,
      status: 'OPEN',
      date: 'Today',
      remarks: 'Grievance ticket created. Sent to district administrative officer.'
    };

    setComplaints([newTicket, ...complaints]);
    setSubject('');
    setDescription('');
    setMessage('Grievance ticket registered successfully inside ECI compliance database!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Lodge Complaint Form */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center gap-2 border-b border-gray-50 pb-2">
          <Send className="w-4 h-4 text-primary-600" />
          Lodge Grievance Petition
        </h3>

        {message && (
          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs text-emerald-850 font-semibold">
            ✓ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-gray-600">Complaint Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
              >
                <option value="Identity Verification">Identity Verification Mismatch</option>
                <option value="Electoral Roll Error">Electoral Roll Entry Correction</option>
                <option value="Booth Relocation">Allocated Polling Station Issue</option>
                <option value="Technical Glitch">Online Ballot Technical Error</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-600">Brief Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Electricity bill address doesn't match"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-600">Detailed grievance description</label>
            <textarea
              required
              rows={4}
              placeholder="Provide relevant Aadhaar hashes, EPIC numbers, or error steps encountered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition shadow-xs cursor-pointer"
          >
            Lodge Grievance File
          </button>
        </form>
      </div>

      {/* Tracker Column */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider border-b pb-2">Grievance Case Tracking</h4>
        
        <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
          {complaints.map((c) => {
            return (
              <div key={c.id} className="p-3 bg-gray-50 rounded-xl border border-gray-150 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-gray-400">{c.id}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                    c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                  }`}>
                    {c.status === 'RESOLVED' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                    {c.status}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tight block">{c.category}</span>
                  <p className="font-extrabold text-gray-950">{c.subject}</p>
                </div>

                <div className="text-[10px] text-gray-500 bg-white p-2 rounded border border-gray-100 italic leading-relaxed">
                  <strong>Remarks:</strong> {c.remarks}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
