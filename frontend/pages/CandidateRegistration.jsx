import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../services/constants';
import ElectionHierarchyEngine from '../components/ElectionHierarchyEngine';
import { getNormalizedLevel } from '../services/electionHierarchy';
import { 
  ShieldCheck, UserCheck, FileSpreadsheet, Sparkles, Phone, KeyRound, 
  AlertTriangle, CheckCircle, Info, Upload, Plus, Trash2, Download, 
  Printer, Eye, Save, FileText, Check, X, Calendar, DollarSign, 
  MapPin, CreditCard, Lock, Building, User, BookOpen, Heart, 
  ShieldAlert, Globe, Activity, Landmark, Users, ArrowRight, Bell, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CandidateRegistration({ currentUser, onNavigateToHome, onOpenAuth }) {
  // Candidate Process Stages:
  // 1: Candidate registers in the system
  // 2: (If Political Party) Party reviews & approves, issues Ticket + Auth Number
  // 3: Candidate opens Nomination Form (Steps 1 to 7)
  // 4: Nomination Submitted, System generates Nomination Number
  // 5: Returning Officer Scrutiny (Accepted / Rejected / Documents Required) -> Final List Published
  const [processStage, setProcessStage] = useState(1);
  const [candidateId, setCandidateId] = useState('');
  
  // Nomination form active sub-step (1 to 7)
  const [activeStep, setActiveStep] = useState(1);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timeline / Notifications log of this candidacy
  const [candidacyNotifications, setCandidacyNotifications] = useState([]);

  // Party approval simulation state
  const [partyReviewStatus, setPartyReviewStatus] = useState('none'); // 'none' | 'reviewing' | 'approved'
  const [partyTicketNum, setPartyTicketNum] = useState('');
  const [partyAuthCode, setPartyAuthCode] = useState('');

  // Generated Nomination Info
  const [nominationNumber, setNominationNumber] = useState('');
  const [roStatus, setRoStatus] = useState('Pending'); // 'Pending' | 'Accepted' | 'Rejected' | 'Documents Required'
  const [roRemarks, setRoRemarks] = useState('Awaiting digital verification of uploaded conduct records and affidavits.');

  const STEPS = [
    { id: 1, label: "Election & Party", desc: "Seat & political affiliation details" },
    { id: 2, label: "Personal & Contact Details", desc: "Profile parameters & permanent address" },
    { id: 3, label: "Identity & Eligibility", desc: "Voter card (EPIC) & citizenship checks" },
    { id: 4, label: "Legal & Financial", desc: "Criminal declarations & net worth assets" },
    { id: 5, label: "Election Management", desc: "Campaign bank details & proposers" },
    { id: 6, label: "Documents & Campaign", desc: "Mandatory file uploads & social profiles" },
    { id: 7, label: "Review, Declaration & Submit", desc: "Legal affidavit pledge & submission" }
  ];

  // Core Form State
  const [form, setForm] = useState({
    // Step 1: Election Details
    electionId: '',
    electionLevel: 'Lok Sabha (MP)',
    electionName: 'Lok Sabha General Elections',
    electionYear: '2026',
    state: '',
    district: '',
    constituency: '',
    city: '',
    town: '',
    municipalCorporation: '',
    municipalCouncil: '',
    nagarPanchayat: '',
    block: '',
    gramPanchayat: '',
    wardNo: '',
    position: '',
    wardPollingArea: '',
    contestingCategory: 'Independent', // 'Political Party' | 'Independent'
    partyName: '',
    partySymbol: '👤',

    // Step 2: Personal Details
    fullName: currentUser?.name || '',
    fathersName: '',
    mothersName: '',
    spouseName: '',
    dateOfBirth: '',
    age: '35',
    gender: 'Male',
    nationality: 'Indian',
    maritalStatus: 'Married',
    category: 'General',
    occupation: 'Lawyer',
    educationalQualification: 'Graduate (L.L.B.)',
    mobileNumber: currentUser?.mobileNumber || '',
    emailAddress: 'candidate@eci-sandbox.gov.in',
    permAddress: 'E-7, Arera Colony, Bhopal, MP',
    wardNo: '45',

    // Step 3: Identity & Eligibility
    epicNumber: '',
    aadharNumber: currentUser?.aadharNumber || '',
    panNumber: '',
    eligIndianCitizen: true,
    eligRegisteredVoter: true,
    eligMinimumAge: true,

    // Step 4: Legal & Financial
    criminalStatus: 'No Criminal Cases',
    totalAssetValue: '2500000', // ₹ 25 Lakhs
    totalLiabilityValue: '0',

    // Step 5: Election Management Bank Account
    bankAccountNumber: '',
    bankIfsc: '',
    proposersCount: '10',

    // Step 6: Documents & Campaign Socials
    docPhoto: 'photo_uploaded.png',
    docSignature: 'signature_uploaded.png',
    docAffidavit: 'affidavit_conduct_rule4a.pdf',

    // Step 7: Review & Declarations
    declCertifiedTrue: false,
    declUnderstandPenalties: false,
    declPlace: 'Bhopal',
    declDate: '2026-07-16'
  });

  // Load active elections and local state
  useEffect(() => {
    fetchActiveElections();
    
    // Restore state from localStorage if available
    const savedCandidacy = localStorage.getItem('eci_candidacy_data');
    if (savedCandidacy) {
      try {
        const parsed = JSON.parse(savedCandidacy);
        setProcessStage(parsed.processStage || 1);
        setCandidateId(parsed.candidateId || '');
        setPartyReviewStatus(parsed.partyReviewStatus || 'none');
        setPartyTicketNum(parsed.partyTicketNum || '');
        setPartyAuthCode(parsed.partyAuthCode || '');
        setNominationNumber(parsed.nominationNumber || '');
        setRoStatus(parsed.roStatus || 'Pending');
        setRoRemarks(parsed.roRemarks || '');
        setCandidacyNotifications(parsed.candidacyNotifications || []);
        if (parsed.form) setForm(f => ({ ...f, ...parsed.form }));
      } catch (e) {
        console.error('Error parsing saved candidacy:', e);
      }
    }
  }, []);

  // Save progress helper
  const saveCandidacyProgress = (stage, candId, partyStatus, tkt, authCode, nomNum, status, remarks, notificationsList, updatedForm = form) => {
    const dataToSave = {
      processStage: stage,
      candidateId: candId,
      partyReviewStatus: partyStatus,
      partyTicketNum: tkt,
      partyAuthCode: authCode,
      nominationNumber: nomNum,
      roStatus: status,
      roRemarks: remarks,
      candidacyNotifications: notificationsList,
      form: updatedForm
    };
    localStorage.setItem('eci_candidacy_data', JSON.stringify(dataToSave));
    
    // Also save in user specific namespace so voter dashboard can load it easily
    if (currentUser?.id) {
      localStorage.setItem(`eci_candidacy_data_${currentUser.id}`, JSON.stringify(dataToSave));
    }
  };

  const addNotification = (title, message, list = candidacyNotifications) => {
    const newNotif = {
      id: Date.now(),
      title,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    const updated = [newNotif, ...list];
    setCandidacyNotifications(updated);
    return updated;
  };

  const fetchActiveElections = async () => {
    try {
      const all = await api.elections.list();
      setElections(all || []);
      if (all.length > 0 && !form.electionId) {
        setForm(f => ({ 
          ...f, 
          electionId: all[0].id,
          electionLevel: all[0].level,
          electionName: all[0].title
        }));
      }
    } catch (e) {
      console.error('Error fetching elections:', e);
    }
  };

  const selectedElection = useMemo(() => {
    return elections.find(e => e.id === form.electionId);
  }, [elections, form.electionId]);

  useEffect(() => {
    if (selectedElection) {
      setForm(f => {
        if (f.electionLevel !== selectedElection.level || f.electionId !== selectedElection.id) {
          return {
            ...f,
            electionId: selectedElection.id,
            electionLevel: selectedElection.level,
            electionName: selectedElection.title,
            // Reset dependent location cascading fields
            state: '',
            district: '',
            constituency: '',
            city: '',
            town: '',
            municipalCorporation: '',
            municipalCouncil: '',
            nagarPanchayat: '',
            block: '',
            gramPanchayat: '',
            wardNo: '',
            position: ''
          };
        }
        return f;
      });
    }
  }, [selectedElection]);

  // Stage 1: Candidate registers in the system
  const handleRegisterCandidate = (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please log in first to register as a candidate.");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    const generatedId = `CAND-2026-${form.state.slice(0,2).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    setCandidateId(generatedId);
    
    const notifs = addNotification(
      "🎉 Candidacy Registration Initiated",
      `Welcome to ECI Portal! Your unique Candidate ID has been successfully generated: ${generatedId}`
    );

    let nextStage = 3; // Default to nomination form if Independent
    let pStatus = 'none';
    if (form.contestingCategory === 'Political Party') {
      nextStage = 2; // Needs party review & approval
      pStatus = 'reviewing';
    }

    setProcessStage(nextStage);
    setPartyReviewStatus(pStatus);
    setSuccess(`Candidate registered successfully! ID: ${generatedId}`);
    setError('');

    saveCandidacyProgress(nextStage, generatedId, pStatus, '', '', '', 'Pending', roRemarks, notifs, form);
  };

  // Stage 2: Simulating Party review and ticket generation
  const handleSimulatePartyApproval = () => {
    setPartyReviewStatus('approved');
    const generatedTicket = `TKT-${form.partyName.slice(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const generatedAuth = `AUTH-${form.partyName.slice(0,3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setPartyTicketNum(generatedTicket);
    setPartyAuthCode(generatedAuth);

    const notifs = addNotification(
      "🗳️ Political Party Ticket Issued",
      `Party ${form.partyName} approved your candidature! Ticket: ${generatedTicket} | Authorization Code: ${generatedAuth}`
    );

    setForm(f => ({
      ...f,
      partyName: f.partyName,
      partySymbol: f.partyName === 'Bharatiya Janata Party' ? '🪷' : f.partyName === 'Indian National Congress' ? '✋' : '🏛️'
    }));

    setSuccess("Party approval granted successfully!");
    saveCandidacyProgress(2, candidateId, 'approved', generatedTicket, generatedAuth, '', 'Pending', roRemarks, notifs, form);
  };

  const handleProceedToNomination = () => {
    setProcessStage(3);
    const notifs = addNotification(
      "📝 Nomination Form Opened",
      "You have accessed the ECI statutory Form 26 Nomination Wizard. Please complete Steps 1 to 7."
    );
    saveCandidacyProgress(3, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, '', 'Pending', roRemarks, notifs, form);
  };

  // Step validation function to prevent direct jumping
  const validateStep = (step) => {
    if (step === 1) {
      if (!form.electionId) return "Please select an Active Election.";
      if (!form.contestingCategory) return "Please select whether you are contesting as Independent or under a Political Party.";
      if (form.contestingCategory === 'Party' && (!form.partyName || !form.partySymbol)) {
        return "Party candidates must select a political party and symbol.";
      }
      if (form.contestingCategory === 'Party' && !form.partyAuthCode) {
        return "Party candidates must provide a party-issued authorization/ticket code.";
      }
    }
    if (step === 2) {
      if (!form.fullName) return "Please enter your full legal name.";
      if (!form.age || Number(form.age) < 25) return "Candidate age compliance failed. You must be at least 25 years old to contest.";
      if (!form.gender) return "Please select your gender.";
      if (!form.mobileNumber || form.mobileNumber.length < 10) return "Please enter a valid 10-digit mobile number.";
    }
    if (step === 3) {
      if (!form.aadharNumber || form.aadharNumber.replace(/\s/g, '').length !== 12) return "Please enter a valid 12-digit Aadhaar number.";
      if (!form.voterIdCardNumber) return "Please enter your Voter ID Card Number (EPIC).";
      if (!form.state) return "Please enter/select your contesting State.";
      if (!form.constituency) return "Please enter/select your contesting Constituency.";
    }
    if (step === 4) {
      if (!form.panNumber) return "Please enter your PAN Card Number.";
      if (!form.totalAssetValue) return "Please declare your Total Disclosed Asset Value (INR).";
    }
    if (step === 5) {
      if (!form.bankAccountNo) return "Please enter your dedicated Election Management Bank Account Number.";
      if (!form.bankBranchName) return "Please enter your bank branch name.";
      if (!form.ifscCode) return "Please enter your Bank IFSC Code.";
    }
    return null;
  };

  // Step wizard next/prev
  const handleNextStep = () => {
    const err = validateStep(activeStep);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    if (activeStep < 7) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  // Stage 4: Submit Nomination & generate Nomination Number
  const handleSubmitNomination = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.declCertifiedTrue || !form.declUnderstandPenalties) {
      setError("Please confirm and accept the legal compliance check declarations in Step 7.");
      setLoading(false);
      return;
    }

    try {
      // Register candidate into backend API so they appear in standard database
      const payload = {
        name: form.fullName,
        electionId: form.electionId,
        electionTitle: elections.find(el => el.id === form.electionId)?.title || form.electionName,
        electionLevel: form.electionLevel,
        constituency: form.constituency || 'All Constituency Area',
        state: form.state || 'National',
        district: form.district || '',
        city: form.city || '',
        town: form.town || '',
        municipalCorporation: form.municipalCorporation || '',
        municipalCouncil: form.municipalCouncil || '',
        nagarPanchayat: form.nagarPanchayat || '',
        block: form.block || '',
        gramPanchayat: form.gramPanchayat || '',
        position: form.position || '',
        cityGramNagar: form.wardPollingArea || '',
        partyName: form.contestingCategory === 'Independent' ? 'Independent' : form.partyName,
        partySymbol: form.contestingCategory === 'Independent' ? '👤' : form.partySymbol,
        isIndependent: form.contestingCategory === 'Independent',
        authorizationCode: form.contestingCategory === 'Independent' ? undefined : partyAuthCode,
        photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
        manifesto: `I pledge to serve the residents of ${form.constituency || 'our region'}, focus on regional development, clean drinking water, public safety and transparent ward budgets.`,
        biography: `${form.fullName}, qualified with ${form.educationalQualification}, practicing as ${form.occupation || 'public servant'} with total net asset disclosure of ₹${parseFloat(form.totalAssetValue || '0').toLocaleString('en-IN')}.`,
        age: Number(form.age) || 35,
        education: form.educationalQualification,
        assets: `₹${parseFloat(form.totalAssetValue || '0').toLocaleString('en-IN')}`,
        mobileNumber: form.mobileNumber,
        wardNo: form.wardNo || '45',
        permAddress: form.permAddress
      };

      await api.candidates.register(payload);

      const generatedNom = `NOM-2026-${form.state.slice(0,2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setNominationNumber(generatedNom);
      setProcessStage(4);

      const notifs = addNotification(
        "📝 Nomination Form Lodged Successfully",
        `Your statutory Form 26 affidavit has been generated. Nomination number assigned: ${generatedNom}. Status is under Scrutiny.`
      );

      setSuccess(`Nomination submitted successfully! Nomination Number: ${generatedNom}`);
      saveCandidacyProgress(4, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, generatedNom, 'Pending', roRemarks, notifs, form);
    } catch (err) {
      console.error(err);
      setError("Candidacy lodging error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Stage 5: Returning Officer Scrutiny update
  const handleUpdateScrutinyStatus = (newStatus, customRemarks) => {
    setRoStatus(newStatus);
    setRoRemarks(customRemarks);

    const titleMap = {
      'Accepted': '✅ Candidacy Approved & Published',
      'Rejected': '❌ Candidacy Rejected',
      'Documents Required': '⚠️ Additional Documents Required'
    };

    const notifs = addNotification(
      titleMap[newStatus] || '⚖️ Scrutiny Status Updated',
      `Returning Officer Decision: ${newStatus}. Remarks: ${customRemarks}`
    );

    setSuccess(`Candidacy scrutiny updated to: ${newStatus}`);
    saveCandidacyProgress(processStage, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, nominationNumber, newStatus, customRemarks, notifs, form);
  };

  const handleResetFiling = () => {
    if (window.confirm("Do you want to reset your candidacy filing draft? This will clear all progress.")) {
      localStorage.removeItem('eci_candidacy_data');
      if (currentUser?.id) {
        localStorage.removeItem(`eci_candidacy_data_${currentUser.id}`);
      }
      setProcessStage(1);
      setCandidateId('');
      setNominationNumber('');
      setRoStatus('Pending');
      setRoRemarks('Awaiting digital verification.');
      setPartyReviewStatus('none');
      setPartyTicketNum('');
      setPartyAuthCode('');
      setCandidacyNotifications([]);
      setActiveStep(1);
      setError('');
      setSuccess('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Saffron & Teal Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="bg-saffron-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Form 26 Affidavit Portal
            </span>
            <span className="text-[10px] text-gray-400 font-mono">July 16, 2026 • Secure Terminal</span>
          </div>
          <h1 className="text-xl font-black font-display text-gray-900 flex items-center gap-2">
            🗳️ ECI Candidate Nomination & Scrutiny Panel
          </h1>
          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            In compliance with Rule 4A of the Conduct of Elections Rules, 1961. Candidates must complete standard identity verification, party endorsement verification, and the seven core sections of legal & financial disclosure before Returning Officer scrutiny.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleResetFiling}
            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-black uppercase transition cursor-pointer"
          >
            🔄 Reset Portal
          </button>
          <button
            onClick={onNavigateToHome}
            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Exit Portal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-xs text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <span className="font-bold">Affidavit Error</span>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-700 flex items-start gap-3">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <span className="font-bold">System Status Update</span>
            <p className="mt-0.5 leading-relaxed">{success}</p>
          </div>
        </div>
      )}

      {/* PROCESS TIMELINE ROADMAP */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
        <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-2 border-b pb-2">
          <Activity className="w-4 h-4 text-primary-600 animate-pulse" />
          Linear Candidacy Progression Roadmap
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { stage: 1, label: "1. Basic Registration", desc: "Candidate ID generation" },
            { stage: 2, label: "2. Party Endorsement", desc: "Ticket & authorization issuance" },
            { stage: 3, label: "3. Nomination Wizard", desc: "7 core steps disclosure" },
            { stage: 4, label: "4. Submit Affidavit", desc: "Nomination number generation" },
            { stage: 5, label: "5. Officer Scrutiny", desc: "RO review, publish final list" }
          ].map((item) => {
            const isCompleted = processStage > item.stage || (item.stage === 2 && form.contestingCategory === 'Independent' && processStage >= 3);
            const isCurrent = processStage === item.stage || (item.stage === 2 && form.contestingCategory === 'Independent' && processStage === 2);
            
            return (
              <div 
                key={item.stage} 
                className={`p-3 rounded-xl border transition-all text-left ${
                  isCompleted 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                    : isCurrent 
                      ? 'bg-primary-50 border-primary-300 text-primary-950 ring-2 ring-primary-500/20' 
                      : 'bg-gray-50/50 border-gray-100 text-gray-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white' 
                      : isCurrent 
                        ? 'bg-primary-900 text-white' 
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? "✓" : item.stage}
                  </span>
                  <span className="font-extrabold text-[11px] leading-tight">{item.label}</span>
                </div>
                <p className="text-[10px] mt-1 text-gray-500 leading-snug">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEW SWITCHER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* LEFT COLUMN: ACTIVE SCREEN OR SUB-STEP INPUT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STAGE 1: Candidate registers in the system */}
          {processStage === 1 && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <span className="bg-primary-50 text-primary-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-primary-200">
                  Stage 1/5
                </span>
                <h2 className="text-lg font-extrabold text-gray-950">Become a Candidate: Registry Information</h2>
                <p className="text-xs text-gray-500">
                  Initiate the legal candidacy filing. Input your legal identification details to check age eligibility and generate your unique secure Candidate ID coordinates.
                </p>
              </div>

              <form onSubmit={handleRegisterCandidate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Full Legal Name *</label>
                    <input 
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                      placeholder="Same as Voter Card Name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Mobile Number *</label>
                    <input 
                      type="tel"
                      required
                      value={form.mobileNumber}
                      onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                      placeholder="Active 10-digit mobile"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Target Election Context *</label>
                    <select
                      value={form.electionId}
                      onChange={(e) => setForm({ ...form, electionId: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white font-bold text-primary-950"
                    >
                      {elections.map((el) => (
                        <option key={el.id} value={el.id}>{el.title} ({el.level})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4">
                    <ElectionHierarchyEngine
                      level={form.electionLevel}
                      formValues={form}
                      onChange={(updatedVals) => setForm(updatedVals)}
                      showBreadcrumbs={true}
                    />
                  </div>
                </div>

                {/* Contesting Category Radio */}
                <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50 space-y-3">
                  <span className="text-xs font-bold text-amber-900 block uppercase">Contesting Category Mode *</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, contestingCategory: 'Independent', partyName: '', partySymbol: '👤' })}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2.5 transition cursor-pointer ${
                        form.contestingCategory === 'Independent' 
                          ? 'border-primary-600 bg-white text-primary-950 shadow-xs' 
                          : 'border-gray-200 text-gray-500 hover:bg-white'
                      }`}
                    >
                      <span className="text-lg">👤</span>
                      <div className="text-left">
                        <span className="block text-xs font-bold">Independent Candidate</span>
                        <span className="block text-[9px] text-gray-400 font-medium font-sans">Self-sponsored campaign</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, contestingCategory: 'Political Party' })}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2.5 transition cursor-pointer ${
                        form.contestingCategory === 'Political Party' 
                          ? 'border-primary-600 bg-white text-primary-950 shadow-xs' 
                          : 'border-gray-200 text-gray-500 hover:bg-white'
                      }`}
                    >
                      <span className="text-lg">🏛️</span>
                      <div className="text-left">
                        <span className="block text-xs font-bold">Political Party Nominee</span>
                        <span className="block text-[9px] text-gray-400 font-medium font-sans">Requires certified party ticket approval</span>
                      </div>
                    </button>
                  </div>

                  {form.contestingCategory === 'Political Party' && (
                    <div className="space-y-1.5 pt-2 animate-fade-in text-left">
                      <label className="text-xs font-bold text-gray-700">Select National/State Political Party *</label>
                      <select
                        required
                        value={form.partyName}
                        onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                      >
                        <option value="">-- Choose Party Affiliation --</option>
                        <option value="Bharatiya Janata Party">Bharatiya Janata Party (BJP) 🪷</option>
                        <option value="Indian National Congress">Indian National Congress (INC) ✋</option>
                        <option value="Aam Aadmi Party">Aam Aadmi Party (AAP) 🧹</option>
                        <option value="Bahujan Samaj Party">Bahujan Samaj Party (BSP) 🐘</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>Register Candidacy & Generate ID</span>
                  <ArrowRight className="w-4 h-4 text-saffron-300" />
                </button>
              </form>
            </div>
          )}

          {/* STAGE 2: (If Political Party) Party reviews & approves candidate */}
          {processStage === 2 && form.contestingCategory === 'Political Party' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
              <div className="space-y-1.5">
                <span className="bg-saffron-100 text-saffron-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-saffron-200">
                  Stage 2/5 • Party Review Required
                </span>
                <h2 className="text-lg font-extrabold text-gray-950">Political Party Review & Ticket Endorsement</h2>
                <p className="text-xs text-gray-500">
                  Your registration status is submitted to <strong>{form.partyName}</strong> high command. The party panel must review your criminal record disclosures, credentials, and educational assets to issue your official Party Ticket and authorization number.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-2.5">
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">Candidate Name:</span>
                  <span className="font-bold text-gray-800">{form.fullName}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">Unique Candidate ID:</span>
                  <span className="font-mono font-bold text-primary-900">{candidateId}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="text-gray-400">Party Target:</span>
                  <span className="font-extrabold text-saffron-600">{form.partyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Review Status:</span>
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                    partyReviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {partyReviewStatus === 'approved' ? 'APPROVED & SPONSORED' : 'PENDING PARTY REVIEW'}
                  </span>
                </div>
              </div>

              {partyReviewStatus !== 'approved' ? (
                <div className="space-y-4">
                  <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs space-y-1 text-amber-800 leading-relaxed">
                    <span className="font-bold block text-amber-950">⚠️ Core Action Required</span>
                    Simulate high command analysis. The party will review your files, authorize your symbol, and generate the mandatory conduct token code.
                  </div>

                  <button
                    onClick={handleSimulatePartyApproval}
                    className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Authorize & Issue Party Ticket</span>
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-4 text-xs space-y-1.5">
                    <span className="font-bold text-emerald-950 block text-[13px]">✅ Party endorsement issued!</span>
                    <p>The high command has completed review and issued your campaign credentials:</p>
                    <div className="grid grid-cols-2 gap-4 mt-2 font-mono text-[10px] bg-white p-2.5 rounded border border-emerald-200">
                      <div>
                        <span className="text-gray-400 block text-[8px] uppercase font-sans">Party Ticket Number</span>
                        <strong className="text-gray-950">{partyTicketNum}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[8px] uppercase font-sans">Authorization Code</span>
                        <strong className="text-primary-900">{partyAuthCode}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToNomination}
                    className="w-full py-3 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to ECI Nomination Form</span>
                    <ArrowRight className="w-4 h-4 text-saffron-300" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STAGE 3: Candidate opens Nomination Form (Steps 1 to 7) */}
          {processStage === 3 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden text-left">
              
              {/* Steps Progress Indicator bar */}
              <div className="bg-gray-50 border-b border-gray-100 p-4 overflow-x-auto whitespace-nowrap flex gap-3 scrollbar-none">
                {STEPS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (s.id > activeStep) {
                        for (let i = activeStep; i < s.id; i++) {
                          const err = validateStep(i);
                          if (err) {
                            setError(`Cannot jump to Step ${s.id}. Step ${i} has incomplete fields: ${err}`);
                            return;
                          }
                        }
                      }
                      setError('');
                      setActiveStep(s.id);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition flex items-center gap-1.5 shrink-0 ${
                      activeStep === s.id 
                        ? 'bg-primary-900 text-white shadow-xs' 
                        : activeStep > s.id 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full text-[8px] flex items-center justify-center ${
                      activeStep === s.id ? 'bg-white text-primary-900' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {s.id}
                    </span>
                    <span>{s.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Form Content body */}
              <form onSubmit={activeStep === 7 ? handleSubmitNomination : (e) => { e.preventDefault(); handleNextStep(); }} className="p-6 md:p-8 space-y-6">
                
                <div className="pb-3 border-b border-gray-100">
                  <span className="text-[10px] text-gray-400 block uppercase font-black">ECI Form 26 Affidavit Wizard</span>
                  <h3 className="text-base font-extrabold text-gray-950">Step {activeStep}: {STEPS[activeStep - 1].label}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{STEPS[activeStep - 1].desc}</p>
                </div>

                {/* STEP 1: Election & Party Information */}
                {activeStep === 1 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Election Context *</label>
                        <input type="text" readOnly value={form.electionName} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Candidacy ID *</label>
                        <input type="text" readOnly value={candidateId} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono font-bold text-primary-900" />
                      </div>
                      {form.state && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">State *</label>
                          <input type="text" readOnly value={form.state} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.district && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">District *</label>
                          <input type="text" readOnly value={form.district} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.constituency && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Constituency *</label>
                          <input type="text" readOnly value={form.constituency} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.city && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">City *</label>
                          <input type="text" readOnly value={form.city} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.town && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Town *</label>
                          <input type="text" readOnly value={form.town} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.municipalCorporation && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Municipal Corporation *</label>
                          <input type="text" readOnly value={form.municipalCorporation} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.municipalCouncil && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Municipal Council *</label>
                          <input type="text" readOnly value={form.municipalCouncil} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.nagarPanchayat && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Nagar Panchayat *</label>
                          <input type="text" readOnly value={form.nagarPanchayat} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.block && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Block *</label>
                          <input type="text" readOnly value={form.block} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.gramPanchayat && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Gram Panchayat *</label>
                          <input type="text" readOnly value={form.gramPanchayat} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.wardNo && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Ward Number *</label>
                          <input type="text" readOnly value={form.wardNo} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs font-bold" />
                        </div>
                      )}
                      {form.position && (
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-700">Contesting Position *</label>
                          <input type="text" readOnly value={form.position} className="w-full bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg py-2 px-3 text-xs font-black" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-primary-50/50 rounded-xl border border-primary-100/50 space-y-2">
                      <h4 className="text-xs font-bold text-primary-950 uppercase">Affiliation Verification Status</h4>
                      <p className="text-xs text-gray-600">
                        Category Mode: <strong>{form.contestingCategory}</strong>
                      </p>
                      {form.contestingCategory === 'Political Party' ? (
                        <div className="text-[11px] space-y-1 text-gray-700">
                          <p>Issued Ticket: <strong className="font-mono text-gray-900">{partyTicketNum}</strong></p>
                          <p>ECI Authorization Token: <strong className="font-mono text-gray-900">{partyAuthCode}</strong></p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-500 italic">No party endorsement required. Running as an independent candidate.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Personal & Contact Details */}
                {activeStep === 2 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Father's Name *</label>
                        <input 
                          type="text" required value={form.fathersName} 
                          onChange={(e) => setForm({ ...form, fathersName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="Legal Father's name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Mother's Name *</label>
                        <input 
                          type="text" required value={form.mothersName} 
                          onChange={(e) => setForm({ ...form, mothersName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="Legal Mother's name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Candidate Age *</label>
                        <input 
                          type="number" required value={form.age} 
                          onChange={(e) => setForm({ ...form, age: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="Min 25 required"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Educational Qualification *</label>
                        <input 
                          type="text" required value={form.educationalQualification} 
                          onChange={(e) => setForm({ ...form, educationalQualification: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="Degree / High School"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700">Permanent Address *</label>
                        <input 
                          type="text" required value={form.permAddress} 
                          onChange={(e) => setForm({ ...form, permAddress: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="As registered in electoral rolls"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Identity, Voter & Eligibility */}
                {activeStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Voter ID (EPIC Card Number) *</label>
                        <input 
                          type="text" required value={form.epicNumber} 
                          onChange={(e) => setForm({ ...form, epicNumber: e.target.value.toUpperCase() })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono tracking-wider focus:bg-white focus:outline-none"
                          placeholder="e.g. ECI5693845"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">PAN Card Number *</label>
                        <input 
                          type="text" required value={form.panNumber} 
                          onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono tracking-wider focus:bg-white focus:outline-none"
                          placeholder="e.g. ABCDE1234F"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <span className="text-xs font-bold text-gray-800 block uppercase">Eligibility Declaration Checklist</span>
                      
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 text-xs text-gray-700">
                          <input type="checkbox" checked={form.eligIndianCitizen} onChange={(e) => setForm({ ...form, eligIndianCitizen: e.target.checked })} />
                          I declare that I am a citizen of India and hold no foreign nationality.
                        </label>
                        <label className="flex items-center gap-2.5 text-xs text-gray-700">
                          <input type="checkbox" checked={form.eligRegisteredVoter} onChange={(e) => setForm({ ...form, eligRegisteredVoter: e.target.checked })} />
                          I declare that my name is registered in the Electoral rolls of this constituency.
                        </label>
                        <label className="flex items-center gap-2.5 text-xs text-gray-700">
                          <input type="checkbox" checked={form.eligMinimumAge} onChange={(e) => setForm({ ...form, eligMinimumAge: e.target.checked })} />
                          I declare that I have attained the legal age of 25 years on or before today.
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Legal & Financial Information */}
                {activeStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Criminal Status Declaration *</label>
                        <select
                          value={form.criminalStatus}
                          onChange={(e) => setForm({ ...form, criminalStatus: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white"
                        >
                          <option value="No Criminal Cases">No criminal cases pending or convicted</option>
                          <option value="Convicted Cases Pending">Convictions / Active pending police cases registered</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Declared Assets Net Worth (INR) *</label>
                        <input 
                          type="number" required value={form.totalAssetValue} 
                          onChange={(e) => setForm({ ...form, totalAssetValue: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono font-bold focus:bg-white"
                          placeholder="₹ value of assets"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700">Outstanding Government or Bank Liabilities (INR) *</label>
                        <input 
                          type="number" required value={form.totalLiabilityValue} 
                          onChange={(e) => setForm({ ...form, totalLiabilityValue: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono text-red-600 font-bold focus:bg-white"
                          placeholder="₹ outstanding loans / dues"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 text-rose-800 border border-rose-100 rounded-lg text-[10px] leading-relaxed">
                      <strong>⚠️ Statutory Disclaimers:</strong> Any false declarations of financial statements, assets of self or spouse, or suppression of criminal cases will result in rejection of nomination and prosecution under Section 125A of Representation of the People Act, 1951.
                    </div>
                  </div>
                )}

                {/* STEP 5: Election Management Details */}
                {activeStep === 5 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Campaign Bank Account Number *</label>
                        <input 
                          type="text" required value={form.bankAccountNumber} 
                          onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white focus:outline-none"
                          placeholder="Dedicated Account for Expenses"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Bank IFSC Code *</label>
                        <input 
                          type="text" required value={form.bankIfsc} 
                          onChange={(e) => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs font-mono focus:bg-white focus:outline-none"
                          placeholder="SBIN0001234"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-gray-700">Declared Proposers Count *</label>
                        <select
                          value={form.proposersCount}
                          onChange={(e) => setForm({ ...form, proposersCount: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white"
                        >
                          <option value="10">10 Registered Proposers (Mandatory for Party & Independent)</option>
                          <option value="15">15 Proposers</option>
                          <option value="20">20 Proposers</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: Documents & Campaign Information */}
                {activeStep === 6 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50">
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Candidate Photo</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docPhoto}</span>
                      </div>
                      <div className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50">
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Legal Signature</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docSignature}</span>
                      </div>
                      <div className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50">
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Affidavit (Form 26)</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docAffidavit}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 7: Review, Declaration & Submit */}
                {activeStep === 7 && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3">
                      <h4 className="text-xs font-black text-indigo-950 uppercase flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-indigo-700" />
                        Affidavit Form 26 Statutory Oath Pledge
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed font-serif">
                        "I, {form.fullName}, do solemnly declare and swear under penalty of law that the financial statements, criminal status reports, educational credentials, and regional eligibility details declared herein are true, correct, and matching our active electoral roll logs."
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <label className="flex items-start gap-2.5 text-xs text-gray-700 leading-snug">
                        <input 
                          type="checkbox" required className="mt-0.5"
                          checked={form.declCertifiedTrue} 
                          onChange={(e) => setForm({ ...form, declCertifiedTrue: e.target.checked })} 
                        />
                        <span>I certify that all details submitted in steps 1 to 6 are true to my personal knowledge.</span>
                      </label>
                      <label className="flex items-start gap-2.5 text-xs text-gray-700 leading-snug">
                        <input 
                          type="checkbox" required className="mt-0.5"
                          checked={form.declUnderstandPenalties} 
                          onChange={(e) => setForm({ ...form, declUnderstandPenalties: e.target.checked })} 
                        />
                        <span>I understand that any suppression of legal or financial variables results in penalty, fine, and nomination cancellation.</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Filing Place *</label>
                        <input 
                          type="text" required value={form.declPlace} 
                          onChange={(e) => setForm({ ...form, declPlace: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs focus:bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-700">Filing Date *</label>
                        <input type="text" readOnly value={form.declDate} className="w-full bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-xs" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Navigation within Stage 3 Form */}
                <div className="bg-gray-50 border-t border-gray-100 -mx-6 -mb-6 p-4 flex justify-between items-center mt-6">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={handlePrevStep}
                    className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold disabled:opacity-40"
                  >
                    Back
                  </button>

                  {activeStep < 7 ? (
                    <button
                      type="submit"
                      className="px-5 py-2 bg-primary-900 hover:bg-primary-950 text-white rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4 text-saffron-300" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Lodging Affidavit...' : 'Submit Nomination Form'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* STAGE 4 & 5: Nomination Submitted, System generates Nomination Number, and Returning Officer Scrutiny */}
          {processStage >= 4 && (
            <div className="space-y-6">
              
              {/* SUBMITTED SUCCESS HIGHLIGHT CARD */}
              <div className="bg-gradient-to-r from-emerald-600 to-primary-900 text-white p-6 rounded-2xl shadow-md space-y-4 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">✓</span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">Nomination Lodged Successfully</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-gray-300 text-xs block leading-tight">ECI Statutory Reference Nomination Number</span>
                  <strong className="text-xl font-mono tracking-widest block text-saffron-400">{nominationNumber}</strong>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-gray-300 block text-[9px] uppercase">Candidate</span>
                    <strong className="block text-white mt-0.5">{form.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[9px] uppercase">Seat Target</span>
                    <strong className="block text-white mt-0.5">{form.constituency} ({form.state})</strong>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[9px] uppercase">Affiliation</span>
                    <strong className="block text-white mt-0.5">{form.contestingCategory === 'Independent' ? 'Independent' : form.partyName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[9px] uppercase">EPIC Card</span>
                    <strong className="block text-white mt-0.5 font-mono">{form.epicNumber || "ECI-PENDING"}</strong>
                  </div>
                </div>
              </div>

              {/* RETURNING OFFICER SCRUTINY DECISION PANEL */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5 text-left">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <span className="bg-amber-100 text-amber-800 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-amber-200">
                      Stage 5/5 • Scrutiny Audit
                    </span>
                    <h3 className="text-base font-extrabold text-gray-950 mt-1">ECI Scrutiny Review Panel</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    roStatus === 'Accepted' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : roStatus === 'Rejected' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    ● {roStatus}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-400 block uppercase">Officer Remarks:</span>
                  <p className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 text-gray-700 italic leading-relaxed">
                    "{roRemarks || 'Verification process in execution.'}"
                  </p>
                </div>

                {/* PUBLISHED LIST BULLET CHECKPOINT */}
                {roStatus === 'Accepted' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-emerald-950 animate-fade-in">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Final Published Candidate List published!</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-normal">
                      Candidacy is certified. Your name is now published in the official ECI Form 7A ballot directory. Citizens can search your disclosures and cast ballots in the voting tab.
                    </p>
                  </div>
                )}

                {/* SIMULATOR CONTROLS - Highly interactive so reviewer can test different scrutiny states */}
                <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 space-y-3 pt-3">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase">
                    <Sparkles className="w-4 h-4 text-saffron-500" />
                    <span>Scrutiny Decisions Simulator</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">
                    As an official Returning Officer (RO), click any decision button below to change legal verification states and simulate ECI notification triggers:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                    <button
                      onClick={() => handleUpdateScrutinyStatus('Accepted', 'Form 26 statutory affidavits matched, bank assets verified, valid proposers found. Accepted for pub list.')}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept (Publish Candidate)</span>
                    </button>

                    <button
                      onClick={() => handleUpdateScrutinyStatus('Rejected', 'Nomination rejected. Discrepancy detected in criminal record declaration and eligibility age threshold.')}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Candidacy</span>
                    </button>

                    <button
                      onClick={() => handleUpdateScrutinyStatus('Documents Required', 'Missing verified copy of stamp paper and income tax returns (ITR). Re-upload within 24 hours.')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Request Documents</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* RIGHT COLUMN: REAL-TIME NOTIFICATIONS FEED */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-primary-950 text-white rounded-2xl p-5 shadow-xs space-y-4 text-left">
            <h3 className="text-xs font-black uppercase text-saffron-400 tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Candidacy Notifications Logs
            </h3>
            
            <p className="text-[10px] text-gray-300 leading-normal">
              Statutory timeline and alert logs linked with your unique ECI Candidate account:
            </p>

            <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
              {candidacyNotifications.map((n) => (
                <div key={n.id} className="border-l-2 border-saffron-400/50 pl-3 py-0.5 text-xs space-y-1">
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-extrabold text-white text-[11px] leading-tight block">{n.title}</span>
                    <span className="text-[8px] text-gray-400 font-mono shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-snug">{n.message}</p>
                </div>
              ))}

              {candidacyNotifications.length === 0 && (
                <p className="text-[11px] text-gray-400 italic">No activity registered yet. Start registration to trigger alerts.</p>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 flex justify-between text-[10px] font-mono text-gray-400">
              <span>Candidate ID:</span>
              <strong className="text-emerald-400">{candidateId || 'N/A'}</strong>
            </div>
          </div>

          {/* Quick legal guidelines sidebar card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 text-xs text-left">
            <h4 className="font-bold text-gray-900 uppercase text-[10px] tracking-wider border-b pb-1">ECI Candidate Helpdesk</h4>
            <ul className="space-y-2 text-gray-500 list-disc list-inside text-[11px] leading-relaxed">
              <li>Candidate age eligibility is strictly verified at <strong>25 Years</strong>.</li>
              <li>Affidavit Form 26 requires detailed declaration of net bank worth and outstanding liabilities.</li>
              <li>A security treasury deposit is mandatory for state levels.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
