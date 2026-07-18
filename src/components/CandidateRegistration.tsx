import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Election, User, Candidate } from '../types';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../lib/constants';
import { ShieldCheck, UserCheck, FileSpreadsheet, Sparkles, Phone, KeyRound, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface CandidateRegistrationProps {
  currentUser: User | null;
  onNavigateToHome: () => void;
  onOpenAuth: () => void;
}

export default function CandidateRegistration({ currentUser, onNavigateToHome, onOpenAuth }: CandidateRegistrationProps) {
  // Wizard steps: 'DETAILS' | 'AFFILIATION' | 'SUBMITTED'
  const [step, setStep] = useState<'DETAILS' | 'AFFILIATION' | 'SUBMITTED'>('DETAILS');

  const [elections, setElections] = useState<Election[]>([]);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    age: '25',
    education: 'Post Graduate (M.A.)',
    assets: '₹1.5 Crores',
    biography: '',
    manifesto: '',
    photo: '',
    mobileNumber: currentUser?.mobileNumber || '',
    electionId: '',
    constituency: '',
    state: '',
    district: '',
    isIndependent: true,
    authorizationCode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchActiveElections();
  }, []);

  const fetchActiveElections = async () => {
    try {
      const all = await api.elections.list();
      // Filter elections where nominations are actively open
      setElections(all.filter(e => e.status === 'REGISTRATION_OPEN'));
    } catch (e) {
      console.error('Error fetching active elections:', e);
    }
  };

  const selectedElection = elections.find(e => e.id === form.electionId);

  // Region selections for Independent candidates or manual entry
  const districtsList = INDIAN_REGIONS.find(r => r.state === form.state)?.districts || [];
  const constituenciesList = districtsList.find(d => d.name === form.district)?.constituencies || [];

  // Update constituency list automatically if election is selected
  useEffect(() => {
    if (selectedElection && selectedElection.constituency) {
      setForm(f => ({
        ...f,
        constituency: selectedElection.constituency || '',
        state: selectedElection.state || '',
        district: selectedElection.district || ''
      }));
    }
  }, [form.electionId]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('Please authenticate or log in first via the top header before completing candidate registration.');
      onOpenAuth();
      return;
    }

    if (Number(form.age) < 25) {
      setError('Democracy Regulation: Candidates must be at least 25 years or older to file election nominations.');
      return;
    }

    if (!form.electionId) {
      setError('Please select an active election context to file your nomination.');
      return;
    }

    setStep('AFFILIATION');
  };

  const handleRegisterNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedElection) {
        throw new Error('Election context not selected.');
      }

      // Prepare submission payload
      const payload = {
        name: form.name,
        electionId: form.electionId,
        electionTitle: selectedElection.title,
        electionLevel: selectedElection.level,
        constituency: form.constituency,
        state: form.state,
        district: form.district,
        isIndependent: form.isIndependent,
        authorizationCode: form.isIndependent ? undefined : form.authorizationCode,
        photo: form.photo || undefined,
        manifesto: form.manifesto,
        biography: form.biography,
        age: Number(form.age),
        education: form.education,
        assets: form.assets,
        mobileNumber: form.mobileNumber
      };

      const res = await api.candidates.register(payload);
      if (res.success) {
        setStep('SUBMITTED');
      }
    } catch (err: any) {
      setError(err.message || 'Nomination filing failed. Please double-check your authorization code or eligibility.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      
      {/* Step Tracker Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-saffron-500 rounded-xl flex items-center justify-center font-bold text-white shadow-md">
            DRO
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900 font-display text-base">Affidavit Filing Center</h2>
            <p className="text-[11px] text-gray-400">ECI Form 26 Affidavit & Nomination Filing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${step === 'DETAILS' ? 'bg-saffron-500 animate-pulse' : 'bg-emerald-500'}`}></span>
          <span className="text-xs font-semibold text-gray-500">Step: {step === 'DETAILS' ? '1 of 2' : step === 'AFFILIATION' ? '2 of 2' : 'Complete'}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {/* STEP 1: Candidate Profile & Affidavit details */}
      {step === 'DETAILS' && (
        <form onSubmit={handleNextStep} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100 text-sm">
          <div className="bg-primary-800 text-white p-6 eci-watermark">
            <h3 className="font-bold text-lg font-display">Personal Profile & Qualifications Affidavit</h3>
            <p className="text-xs text-gray-300 mt-1">Verify age requirements, declare education, assets net worth, and outline your constituency pledges.</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Select Active Election for Nomination</label>
                <select 
                  required
                  value={form.electionId}
                  onChange={(e) => setForm({ ...form, electionId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                >
                  <option value="">-- Select Election Contest --</option>
                  {elections.map((elec) => (
                    <option key={elec.id} value={elec.id}>{elec.title} ({elec.level})</option>
                  ))}
                </select>
                {elections.length === 0 && (
                  <span className="text-[10px] text-gray-400 italic block mt-1">Note: No elections are currently accepting candidate registrations. Log in as Election Commission Super Admin to create a new election with "REGISTRATION_OPEN" status.</span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Candidate Full Name (As per Aadhar/EPIC)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Candidate Age (Must be ≥ 25 Yrs)</label>
                <input 
                  type="number"
                  required
                  min={25}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm font-semibold text-primary-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Educational Qualification Degree</label>
                <select 
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                >
                  <option value="Graduate (B.A. / B.Sc / B.Com)">Graduate (B.A. / B.Sc / B.Com)</option>
                  <option value="Post Graduate (M.A. / M.Sc / M.Tech)">Post Graduate (M.A. / M.Sc / M.Tech)</option>
                  <option value="MBA / Professional Degree">MBA / Professional Degree</option>
                  <option value="LL.B. / Law Graduate">LL.B. / Law Graduate</option>
                  <option value="Doctorate (Ph.D.)">Doctorate (Ph.D.)</option>
                  <option value="Senior Secondary School (Class 12)">Senior Secondary School (Class 12)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Declared Net Assets Net Worth (Form 26)</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. ₹1.5 Crores"
                  value={form.assets}
                  onChange={(e) => setForm({ ...form, assets: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                />
              </div>

              {/* Geographical manual entry fields if election doesn't have locked constituency */}
              {selectedElection && !selectedElection.constituency && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Target State</label>
                    <select 
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value, district: '', constituency: '' })}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                    >
                      <option value="">-- Select State --</option>
                      {INDIAN_REGIONS.map((r, i) => (
                        <option key={i} value={r.state}>{r.state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600">Target District</label>
                    <select 
                      required
                      disabled={!form.state}
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value, constituency: '' })}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                    >
                      <option value="">-- Select District --</option>
                      {districtsList.map((d, i) => (
                        <option key={i} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600">Target Constituency</label>
                    <select 
                      required
                      disabled={!form.district}
                      value={form.constituency}
                      onChange={(e) => setForm({ ...form, constituency: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                    >
                      <option value="">-- Select Constituency --</option>
                      {constituenciesList.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Candidate Portrait Photo URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Short Biography / Public Career History</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Highlight your previous administrative contributions, community work, or leadership records..."
                  value={form.biography}
                  onChange={(e) => setForm({ ...form, biography: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">Core Election Manifesto Pledges</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Define your development plans (infrastructure, sanitation, schooling) for this constituency..."
                  value={form.manifesto}
                  onChange={(e) => setForm({ ...form, manifesto: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg text-sm"
                />
              </div>

            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-100">
              <button 
                type="button" 
                onClick={onNavigateToHome}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ← Back to Dashboard
              </button>

              <button 
                type="submit"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md transition cursor-pointer"
              >
                Proceed to Affiliation Verification
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 2: Affiliation Check (Independent vs Party authorization codes) */}
      {step === 'AFFILIATION' && (
        <form onSubmit={handleRegisterNomination} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-sm">
          <div className="bg-primary-800 text-white p-6 eci-watermark">
            <h3 className="font-bold text-lg font-display">Party Affiliation & Authorization Codes</h3>
            <p className="text-xs text-gray-300 mt-1">Declare whether you represent an ECI approved national/regional political party, or are running independently.</p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Toggle independent */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setForm({ ...form, isIndependent: false })}
                className={`p-4 border-2 rounded-2xl text-left transition flex flex-col justify-between h-32 cursor-pointer ${!form.isIndependent ? 'border-primary-600 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="p-2 bg-primary-100 text-primary-700 rounded-lg h-fit w-fit">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Political Party Nomination</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Requires a secure, unique, party-issued authorization code.</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setForm({ ...form, isIndependent: true, authorizationCode: '' })}
                className={`p-4 border-2 rounded-2xl text-left transition flex flex-col justify-between h-32 cursor-pointer ${form.isIndependent ? 'border-primary-600 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="p-2 bg-saffron-100 text-saffron-600 rounded-lg h-fit w-fit">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Independent Candidate</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Requires ECI District Magistrate audit of documents & identity affidavits.</p>
                </div>
              </button>
            </div>

            {/* If Party Candidate: Enter authorization code */}
            {!form.isIndependent && (
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex gap-2 text-primary-800 font-semibold items-center text-xs">
                  <Info className="w-4 h-4 text-primary-600" />
                  Party Authorization Code Required
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Enter Party Authorization Code</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. BJP-MLA-BHOPAL-2026-0001"
                    value={form.authorizationCode}
                    onChange={(e) => setForm({ ...form, authorizationCode: e.target.value.trim().toUpperCase() })}
                    className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="text-[10px] text-gray-400 leading-normal block mt-1">
                    * Codes are generated exclusively by Political Party National Admins. This code is one-time use and verifies party affiliation.
                  </span>
                </div>
              </div>
            )}

            {form.isIndependent && (
              <div className="bg-saffron-50/30 border border-saffron-200 p-4 rounded-xl text-xs text-saffron-800 space-y-1">
                <span className="font-bold block">Independent Candidate Declaration</span>
                <span>As an independent candidate, you are required to submit identity verification affidavits, police verification certificates, and security deposit transaction details directly to the District returning officer.</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => setStep('DETAILS')}
                className="text-xs font-bold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                ← Back to profile details
              </button>

              <button 
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-bold rounded-lg shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting Nomination Affidavit...' : 'Submit Official Nomination File'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 3: Nomination filed screen */}
      {step === 'SUBMITTED' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-gray-900 text-xl font-display">Nomination Filed Successfully!</h3>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Your Form 26 Affidavit & Nomination file for <strong className="text-gray-800 font-bold">"{selectedElection?.title}"</strong> has been successfully uploaded to the ECI security vault.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80 max-w-sm mx-auto text-xs text-left space-y-2 font-mono">
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-400">Candidate:</span>
              <span className="font-bold text-gray-700">{form.name}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="text-gray-400">Constituency:</span>
              <span className="font-bold text-gray-700">{form.constituency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className="font-bold text-orange-600 animate-pulse">PENDING ECI REVIEW</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 leading-normal max-w-xs mx-auto italic">
            * The Returning Officer of the ECI will verify credentials, education affidavits, and asset clearances before releasing the approved candidates list.
          </p>

          <button 
            onClick={onNavigateToHome}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-lg shadow transition cursor-pointer"
          >
            Return to Public Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
