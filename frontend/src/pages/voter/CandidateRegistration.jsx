import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { INDIAN_REGIONS, ELECTION_LEVELS } from '../../services/constants';
import ElectionHierarchyEngine from '../../components/ElectionHierarchyEngine';
import { getNormalizedLevel } from '../../services/electionHierarchy';
import { 
  ShieldCheck, UserCheck, FileSpreadsheet, Sparkles, Phone, KeyRound, 
  AlertTriangle, CheckCircle, Info, Upload, Plus, Trash2, Download, 
  Printer, Eye, Save, FileText, Check, X, Calendar, DollarSign, 
  MapPin, CreditCard, Lock, Building, User, BookOpen, Heart, 
  ShieldAlert, Globe, Activity, Landmark, Users, ArrowRight, Bell, ChevronRight, Zap
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

  // EPIC verification state variables
  const [epicVerified, setEpicVerified] = useState(false);
  const [epicInput, setEpicInput] = useState('');
  const [verifyingEpic, setVerifyingEpic] = useState(false);
  const [epicVerificationData, setEpicVerificationData] = useState(null);

  // Load active election configuration from localStorage
  const [activeConfig, setActiveConfig] = useState(() => {
    const saved = localStorage.getItem('eci_active_configuration');
    return saved ? JSON.parse(saved) : null;
  });

  // Keep activeConfig synchronized across tabs and administrative state updates
  useEffect(() => {
    const syncActiveConfig = () => {
      const saved = localStorage.getItem('eci_active_configuration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setActiveConfig(parsed);
        } catch(e) {}
      } else {
        setActiveConfig(null);
      }
    };

    window.addEventListener('storage', syncActiveConfig);
    const timer = setInterval(syncActiveConfig, 1500);
    return () => {
      window.removeEventListener('storage', syncActiveConfig);
      clearInterval(timer);
    };
  }, []);

  const isRegistrationOpen = useMemo(() => {
    if (!activeConfig) return false;
    return activeConfig.status === 'REGISTRATION_OPEN' || activeConfig.status === 'OPEN';
  }, [activeConfig]);

  const mappedLevel = useMemo(() => {
    if (!isRegistrationOpen || !activeConfig) return null;
    if (activeConfig.category === 'Rajya Sabha (MP)') return 'Rajya Sabha (MP)';
    if (activeConfig.category === 'Lok Sabha (MP)') return 'Lok Sabha (MP)';
    if (activeConfig.category === 'Legislative Assembly (MLA/MLC)') return 'State Legislative Assembly (MLA)';
    if (activeConfig.category === 'Rural / Urban Area') return activeConfig.subCategory;
    return null;
  }, [isRegistrationOpen, activeConfig]);

  // Helper classification memos for dynamic candidate registration flow rules
  const isParliamentaryLevel = useMemo(() => {
    if (!activeConfig) return false;
    const cat = (activeConfig.category || '').toLowerCase();
    return cat.includes('lok sabha') || cat.includes('rajya sabha');
  }, [activeConfig]);

  const isAssemblyLevel = useMemo(() => {
    if (!activeConfig) return false;
    const cat = (activeConfig.category || '').toLowerCase();
    return cat.includes('legislative assembly') || cat.includes('mla') || cat.includes('mlc');
  }, [activeConfig]);

  const isRuralUrbanLevel = useMemo(() => {
    if (!activeConfig) return false;
    const cat = (activeConfig.category || '').toLowerCase();
    return cat.includes('rural') || cat.includes('urban') || cat.includes('panchayat') || cat.includes('municipal');
  }, [activeConfig]);

  const isMultipleStatesConfigured = useMemo(() => {
    if (!activeConfig) return false;
    if (activeConfig.stateName === 'All India' || activeConfig.stateName?.includes('All States') || activeConfig.stateName?.includes(',')) {
      return true;
    }
    if (Array.isArray(activeConfig.selectedStates) && activeConfig.selectedStates.length > 1) {
      return true;
    }
    return false;
  }, [activeConfig]);

  // Keep form fields synced with election level rules
  useEffect(() => {
    if (activeConfig) {
      if (isRuralUrbanLevel) {
        setForm(f => ({
          ...f,
          contestingCategory: 'Independent',
          partyName: '',
          partySymbol: '👤',
          electionLevel: f.electionLevel && ['Ward Panchayat', 'Gram Panchayat', 'Block Samiti', 'Zila Parishad', 'Municipal Corporation', 'Municipal Council', 'Nagar Panchayat'].includes(f.electionLevel)
            ? f.electionLevel
            : (activeConfig.subCategory || 'Gram Panchayat'),
          ...(isMultipleStatesConfigured ? {} : { state: activeConfig.stateName || 'All India' })
        }));
      } else if (isParliamentaryLevel) {
        setForm(f => ({
          ...f,
          electionLevel: activeConfig.category || 'Lok Sabha (MP)',
          ...(isMultipleStatesConfigured ? {} : { state: activeConfig.stateName || 'All India' })
        }));
      } else if (isAssemblyLevel) {
        setForm(f => ({
          ...f,
          electionLevel: f.electionLevel && (f.electionLevel.includes('MLA') || f.electionLevel.includes('MLC'))
            ? f.electionLevel
            : 'State Legislative Assembly (MLA)',
          ...(isMultipleStatesConfigured ? {} : { state: activeConfig.stateName || 'All India' })
        }));
      }
    }
  }, [activeConfig, isRuralUrbanLevel, isParliamentaryLevel, isAssemblyLevel, isMultipleStatesConfigured]);

  const expectedEpic = useMemo(() => {
    if (!currentUser) return '';
    const lastFourAadhar = (currentUser.aadharNumber || '111122223333').slice(-4);
    const lastFourId = currentUser.id?.toUpperCase().slice(-4) || 'VOT';
    return `ECI${lastFourAadhar}${lastFourId}`.toUpperCase();
  }, [currentUser]);
  
  // Nomination form active sub-step (1 to 7)
  const [activeStep, setActiveStep] = useState(1);
  const [elections, setElections] = useState([]);
  const [dbParties, setDbParties] = useState([]);
  const [ecConfirmationStatus, setEcConfirmationStatus] = useState('none'); // 'none' | 'pending' | 'confirmed' | 'rejected'
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
  const [liveCandidate, setLiveCandidate] = useState(null);



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
    fetchParties();
    
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
        if (parsed.ecConfirmationStatus) {
          setEcConfirmationStatus(parsed.ecConfirmationStatus);
        }
        if (parsed.form) {
          setForm(f => ({ ...f, ...parsed.form }));
          if (parsed.form.epicNumber) {
            setEpicVerified(true);
            setEpicInput(parsed.form.epicNumber);
          }
        }
      } catch (e) {
        console.error('Error parsing saved candidacy:', e);
      }
    }
  }, []);

  // Save progress helper
  const saveCandidacyProgress = (stage, candId, partyStatus, tkt, authCode, nomNum, status, remarks, notificationsList, updatedForm = form, ecStatus = ecConfirmationStatus) => {
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
      form: updatedForm,
      ecConfirmationStatus: ecStatus
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

  const fetchParties = async () => {
    try {
      const allParties = await api.parties.list();
      setDbParties(allParties || []);
    } catch (e) {
      console.error('Error fetching political parties:', e);
    }
  };

  const checkEcConfirmationStatus = async (silent = false) => {
    if (!candidateId) return;
    try {
      const candidatesList = await api.candidates.list();
      const match = candidatesList.find(c => c.id === candidateId || c.mobileNumber === form.mobileNumber || c.aadharNumber === form.aadharNumber);
      if (match) {
        setLiveCandidate(match);
        const isRuralUrban = form.electionLevel === 'Rural / Urban Area' || mappedLevel === 'Rural / Urban Area';

        if (isRuralUrban) {
          // Rural / Urban Area -> One-step ECI Admin confirmation only.
          const hasEciApproved = match.status === 'EC_CONFIRMED' || match.status === 'APPROVED';
          if (hasEciApproved) {
            const officialId = match.officialCandidateId || candidateId;
            setCandidateId(officialId);
            setEcConfirmationStatus('confirmed');
            setProcessStage(3);
            const notifs = addNotification(
              "✅ ECI Eligibility Confirmed",
              `ECI Admin approved your Rural/Urban candidacy and generated Candidate ID: ${officialId}. Advanced to Nomination Form.`
            );
            saveCandidacyProgress(3, officialId, 'approved', '', officialId, nominationNumber, match.status, roRemarks, notifs, { ...form, partyAuthCode: officialId }, 'confirmed');
            if (!silent) {
              setSuccess("✅ ECI Administrator has confirmed your eligibility and approved your candidacy!");
            }
          } else if (match.status === 'REJECTED') {
            setEcConfirmationStatus('rejected');
            setError("❌ ECI Administrator has rejected your candidacy registration.");
            saveCandidacyProgress(1, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, nominationNumber, 'REJECTED', roRemarks, candidacyNotifications, form, 'rejected');
          } else {
            if (!silent) {
              setSuccess("Checking ECI registry status... Currently: AWAITING ECI ONE-STEP APPROVAL.");
              setTimeout(() => setSuccess(''), 3000);
            }
          }
        } else if (form.contestingCategory === 'Political Party') {
          // Political Party -> Two-step confirmation (Party click Generate ID & Approve Registration -> ECI Admin approves).
          const hasPartyGeneratedId = !!match.officialCandidateId;
          const hasPartyApprovedTicket = match.partyApprovalStatus === 'APPROVED';
          const hasPartyCompletedBoth = hasPartyGeneratedId && hasPartyApprovedTicket;
          const hasEciApproved = match.status === 'EC_CONFIRMED' || match.status === 'APPROVED';

          // 1. Fetch Candidate ID automatically when generated by party
          if (hasPartyGeneratedId && candidateId !== match.officialCandidateId) {
            setCandidateId(match.officialCandidateId);
            setForm(f => ({
              ...f,
              partySymbol: match.partySymbol || f.partySymbol,
              partyAuthCode: match.officialCandidateId
            }));
            const notifs = addNotification(
              "🗳️ Political Party ID Generated",
              `Your party (${match.partyName}) generated your official Candidate ID: ${match.officialCandidateId}`
            );
            saveCandidacyProgress(1, match.officialCandidateId, hasPartyApprovedTicket ? 'approved' : 'reviewing', `TKT-${match.partyName.slice(0,3).toUpperCase()}-AUTO`, match.officialCandidateId, nominationNumber, match.status, roRemarks, notifs, { ...form, partySymbol: match.partySymbol || form.partySymbol, partyAuthCode: match.officialCandidateId }, ecConfirmationStatus);
            if (!silent) {
              setSuccess(`🎉 Official Candidate ID ${match.officialCandidateId} generated by Party!`);
            }
          }

          if (hasPartyApprovedTicket && partyReviewStatus !== 'approved') {
            setPartyReviewStatus('approved');
          }

          // 2. Wait for BOTH party approval and ECI confirmation to complete.
          if (hasPartyCompletedBoth && hasEciApproved) {
            setEcConfirmationStatus('confirmed');
            setProcessStage(3); // Stage 3 is the nomination wizard/form
            const notifs = addNotification(
              "✅ Dual Scrutiny Verification Passed",
              `Both Party approval (ID: ${match.officialCandidateId}) and ECI Admin eligibility audit are confirmed. Advanced to Form 26 Nomination wizard.`
            );
            saveCandidacyProgress(3, match.officialCandidateId, 'approved', `TKT-${match.partyName.slice(0,3).toUpperCase()}-AUTO`, match.officialCandidateId, nominationNumber, 'EC_CONFIRMED', roRemarks, notifs, { ...form, partySymbol: match.partySymbol || form.partySymbol, partyAuthCode: match.officialCandidateId }, 'confirmed');
            if (!silent) {
              setSuccess("✅ ECI and Political Party approvals confirmed! Proceeding to Form 26 Nomination form.");
            }
          } else if (match.status === 'REJECTED') {
            setEcConfirmationStatus('rejected');
            setError("❌ ECI Administrator has rejected your candidacy registration.");
            saveCandidacyProgress(1, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, nominationNumber, 'REJECTED', roRemarks, candidacyNotifications, form, 'rejected');
          } else {
            if (hasEciApproved && ecConfirmationStatus !== 'confirmed') {
              setEcConfirmationStatus('confirmed');
            }
          }
        } else {
          // Independent Candidate: Only waits for ECI Admin confirmation, then goes straight to Stage 3!
          if (match.status === 'EC_CONFIRMED' || match.status === 'APPROVED') {
            setEcConfirmationStatus('confirmed');
            const officialId = match.officialCandidateId || candidateId;
            setCandidateId(officialId);
            if (!silent) {
              setSuccess("✅ ECI Administrator has confirmed your eligibility and ID!");
            }
            setProcessStage(3);
            const notifs = addNotification(
              "✅ ECI Eligibility Confirmed",
              `ECI Admin approved your Stage 1 registration. Advanced to Nomination Wizard.`
            );
            saveCandidacyProgress(3, officialId, 'none', '', '', nominationNumber, match.status, roRemarks, notifs, form, 'confirmed');
          } else if (match.status === 'REJECTED') {
            setEcConfirmationStatus('rejected');
            setError("❌ ECI Administrator has rejected your candidacy registration.");
            saveCandidacyProgress(1, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, nominationNumber, 'REJECTED', roRemarks, candidacyNotifications, form, 'rejected');
          } else {
            if (!silent) {
              setSuccess("Checking ECI registry status... Currently: PENDING AUDIT.");
              setTimeout(() => setSuccess(''), 3000);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error checking ECI status:', e);
    }
  };

  useEffect(() => {
    let intervalId;
    if (ecConfirmationStatus === 'pending' && candidateId) {
      intervalId = setInterval(() => {
        checkEcConfirmationStatus(true);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ecConfirmationStatus, candidateId, form.contestingCategory, partyTicketNum, partyAuthCode, nominationNumber, roRemarks]);

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

  // EPIC verification handler
  const handleVerifyEpic = async (e) => {
    e.preventDefault();
    if (!epicInput.trim()) {
      setError("Please enter a valid ECI ID, EPIC Number, Mobile, or Aadhaar.");
      return;
    }
    const entered = epicInput.trim();
    const enteredLower = entered.toLowerCase().replace(/[^a-z0-9]/g, '');

    const userMatches = currentUser ? (
      currentUser.id?.toLowerCase().replace(/[^a-z0-9]/g, '').includes(enteredLower) ||
      enteredLower.includes(currentUser.id?.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
      (currentUser.mobileNumber && currentUser.mobileNumber.includes(entered)) ||
      (currentUser.aadharNumber && currentUser.aadharNumber.includes(entered)) ||
      (currentUser.name && currentUser.name.toLowerCase().includes(entered.toLowerCase())) ||
      expectedEpic.toLowerCase().replace(/[^a-z0-9]/g, '').includes(enteredLower) ||
      enteredLower.includes(expectedEpic.toLowerCase().replace(/[^a-z0-9]/g, ''))
    ) : false;

    setVerifyingEpic(true);
    setError('');
    setSuccess('');

    try {
      let isVerified = userMatches;
      if (!isVerified) {
        const res = await api.auth.verifyProfile(entered);
        if (res.success && res.user) {
          isVerified = true;
        }
      }

      if (isVerified) {
        setEpicVerified(true);
        setForm(f => ({
          ...f,
          epicNumber: expectedEpic || entered.toUpperCase(),
          fullName: currentUser?.name || f.fullName,
          aadharNumber: currentUser?.aadharNumber || f.aadharNumber,
          age: currentUser?.age ? String(currentUser.age) : f.age,
          gender: currentUser?.gender || f.gender,
          permAddress: currentUser?.address || f.permAddress,
          mobileNumber: currentUser?.mobileNumber || f.mobileNumber,
          ...(mappedLevel && isRegistrationOpen ? {
            electionLevel: mappedLevel,
            state: activeConfig.stateName,
            electionName: `${activeConfig.category} - ${activeConfig.stateName}`
          } : {})
        }));
        setSuccess("✅ ECI Voter ID Verified! Coordinates matched on electoral roll.");
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setEpicVerified(false);
        setError(`Verification Failed: No voter profile found matching "${entered}". Please enter your registered User ID (e.g. ${currentUser?.id || 'usr-voter-aman'}), Mobile Number, or EPIC Code.`);
      }
    } catch (err) {
      setEpicVerified(false);
      setError("Verification error: " + (err.message || 'Profile not found'));
    } finally {
      setVerifyingEpic(false);
    }
  };

  // Stage 1: Candidate registers in the system
  const handleRegisterCandidate = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Please log in first to register as a candidate.");
      if (onOpenAuth) onOpenAuth();
      return;
    }

    if (!epicVerified) {
      setError("ECI Verification failed: Please verify your correct ECI ID / EPIC Number in Stage 1 first.");
      return;
    }

    // Uniqueness & Duplicate Position Check: One ECI ID cannot hold multiple candidate positions or duplicate candidacies
    try {
      const existingCandidates = await api.candidates.list();
      const currentEci = (form.epicNumber || currentUser?.id || '').trim().toLowerCase();
      const currentAadhaar = (form.aadharNumber || currentUser?.aadharNumber || '').trim();
      const currentMobile = (form.mobileNumber || currentUser?.mobileNumber || '').trim();

      const duplicate = existingCandidates.find(c => {
        const cEci = (c.epicNumber || c.id || '').trim().toLowerCase();
        const cAadhaar = (c.aadharNumber || '').trim();
        const cMobile = (c.mobileNumber || '').trim();
        return (
          (currentEci && cEci === currentEci) ||
          (currentAadhaar && cAadhaar === currentAadhaar) ||
          (currentMobile && cMobile === currentMobile)
        );
      });

      if (duplicate && duplicate.status !== 'REJECTED') {
        setError(`❌ ECI ID Conflict: ECI ID / EPIC (${form.epicNumber || currentUser?.id}) is already registered for Candidate Nomination "${duplicate.name}" (${duplicate.constituency || 'Active Seat'}). Under ECI regulations, one ECI ID cannot be used for multiple candidate positions or duplicate candidacies.`);
        return;
      }
    } catch (e) {
      console.warn('Electoral roll uniqueness pre-check warning:', e);
    }

    const isParty = form.contestingCategory === 'Political Party' || form.contestingCategory === 'Party';
    const stateAbbrev = form.state ? form.state.slice(0,2).toUpperCase() : 'IN';
    const generatedId = isParty 
      ? `REQ-2026-${stateAbbrev}-${Math.floor(100000 + Math.random() * 900000)}`
      : `CAND-2026-${stateAbbrev}-${Math.floor(100000 + Math.random() * 900000)}`;
      
    setCandidateId(generatedId);
    
    // Create the immediate Stage 1 candidate registration request in backend DB
    const payload = {
      id: generatedId,
      status: 'AWAITING_EC_CONFIRMATION',
      partyApprovalStatus: isParty ? 'PENDING' : 'APPROVED',
      officialCandidateId: isParty ? '' : generatedId,
      name: form.fullName,
      electionId: form.electionId,
      electionTitle: elections.find(el => el.id === form.electionId)?.title || form.electionName,
      electionLevel: form.electionLevel,
      constituency: form.constituency || 'All Constituency Area',
      state: form.state || 'National',
      district: form.district || '',
      cityGramNagar: form.wardPollingArea || '',
      partyName: form.contestingCategory === 'Independent' ? 'Independent' : form.partyName,
      partySymbol: form.contestingCategory === 'Independent' ? '👤' : form.partySymbol,
      isIndependent: form.contestingCategory === 'Independent',
      photo: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      manifesto: isParty 
        ? `Candidacy nomination initiated under party ${form.partyName}. Awaiting Party ID generation & ECI approval.`
        : `Candidate registered in Stage 1. Pending ECI verification.`,
      biography: `${form.fullName} registered for ECI candidacy ID verification.`,
      age: Number(form.age) || 35,
      education: form.educationalQualification,
      assets: 'Pending disclosure',
      mobileNumber: form.mobileNumber,
      wardNo: form.wardNo || '45',
      permAddress: form.permAddress
    };

    setLoading(true);
    try {
      await api.candidates.register(payload);
      
      const notifs = addNotification(
        "🎉 Candidacy Registration Initiated",
        isParty 
          ? `Welcome to ECI Portal! Your candidacy nomination request is pending party endorsement. Temp ID: ${generatedId}. Awaiting Party 'Generate ID' & ECI confirmation.`
          : `Welcome to ECI Portal! Your unique Candidate ID has been successfully generated: ${generatedId}. Awaiting ECI administrative confirmation.`
      );

      setEcConfirmationStatus('pending');
      setPartyReviewStatus(isParty ? 'pending' : 'approved');
      setSuccess(isParty 
        ? `Candidacy Request Submitted! Temp ID: ${generatedId}. Awaiting Party 'Generate ID' and ECI Admin approval.`
        : `Candidacy Registration Initiated! Unique ID: ${generatedId}. Awaiting ECI Admin Eligibility & ID approval.`
      );
      setError('');

      saveCandidacyProgress(
        1, 
        generatedId, 
        isParty ? 'pending' : 'approved', 
        '', 
        '', 
        '', 
        'AWAITING_EC_CONFIRMATION', 
        isParty 
          ? 'Awaiting party ID release and basic registration confirmation from ECI Admin.'
          : 'Awaiting basic registration confirmation from ECI Admin.', 
        notifs, 
        form, 
        'pending'
      );
    } catch (err) {
      console.error(err);
      setError("Registration request error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Simulating Party review and ticket generation
  const handleSimulatePartyApproval = () => {
    if (!epicVerified) {
      setError("ECI Verification failed: You cannot receive party endorsement without a valid matching ECI ID.");
      return;
    }
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
    if (!epicVerified) {
      setError("ECI Verification failed: Please verify your correct EPIC ID in Stage 1 first.");
      return;
    }
    const updatedForm = { ...form, partyAuthCode: partyAuthCode || form.partyAuthCode };
    setForm(updatedForm);
    setProcessStage(3);
    const notifs = addNotification(
      "📝 Nomination Form Opened",
      "You have accessed the ECI statutory Form 26 Nomination Wizard. Please complete Steps 1 to 7."
    );
    saveCandidacyProgress(3, candidateId, partyReviewStatus, partyTicketNum, partyAuthCode, '', 'Pending', roRemarks, notifs, updatedForm);
  };

  // Step validation function to prevent direct jumping
  const validateStep = (step) => {
    if (!epicVerified) {
      return "ECI Verification failed: Please verify your correct EPIC ID in Stage 1 first.";
    }
    if (step === 1) {
      if (!form.electionId) return "Please select an Active Election.";
      if (!form.contestingCategory) return "Please select whether you are contesting as Independent or under a Political Party.";
      const isPartyCand = form.contestingCategory === 'Political Party' || form.contestingCategory === 'Party';
      if (isPartyCand && (!form.partyName || !form.partySymbol)) {
        return "Party candidates must select a political party and symbol.";
      }
      if (isPartyCand && !(form.partyAuthCode || partyAuthCode)) {
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
      if (!form.epicNumber) return "Please enter your Voter ID Card Number (EPIC).";
      if (!form.state) return "Please enter/select your contesting State.";
      if (!form.constituency) return "Please enter/select your contesting Constituency.";
    }
    if (step === 4) {
      if (!form.panNumber) return "Please enter your PAN Card Number.";
      if (!form.totalAssetValue) return "Please declare your Total Disclosed Asset Value (INR).";
    }
    if (step === 5) {
      if (!form.bankAccountNumber) return "Please enter your dedicated Election Management Bank Account Number.";
      if (!form.bankIfsc) return "Please enter your Bank IFSC Code.";
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
    } else {
      let prevStage = processStage - 1;
      if (prevStage === 2 && form.contestingCategory === 'Independent') {
        prevStage = 1;
      }
      if (prevStage >= 1) {
        setProcessStage(prevStage);
      }
    }
  };

  // FAST SKIP HANDLER (Individual Step / Stage)
  const handleFastSkipCurrentStep = () => {
    setError('');
    const updatedForm = { ...form };

    // Common defaults
    if (!updatedForm.electionId) {
      updatedForm.electionId = activeElections[0]?.id || 'elec-default-2026';
      updatedForm.electionName = activeElections[0]?.title || 'General Legislative Assembly Election 2026';
      updatedForm.electionLevel = activeElections[0]?.level || 'State';
    }
    if (!updatedForm.state) updatedForm.state = activeConfig?.stateName || 'Madhya Pradesh';
    if (!updatedForm.district) updatedForm.district = 'Bhopal';
    if (!updatedForm.constituency) updatedForm.constituency = 'Bhopal North';
    if (!updatedForm.contestingCategory) updatedForm.contestingCategory = 'Independent';

    // Ensure EPIC is verified
    setEpicVerified(true);
    setEpicVerificationData({
      fullName: currentUser?.fullName || 'Aman Patel',
      fatherHusbandName: 'Ramesh Patel',
      dob: '1995-05-15',
      gender: 'Male',
      epicNumber: currentUser?.epicNumber || 'MP/01/123/456789',
      mobileNumber: '9876543210',
      state: updatedForm.state,
      district: updatedForm.district,
      constituency: updatedForm.constituency,
      partNumber: '42',
      serialNumber: '108',
      status: 'VERIFIED_ACTIVE'
    });

    if (!candidateId) {
      const isParty = updatedForm.contestingCategory === 'Political Party' || updatedForm.contestingCategory === 'Party';
      const genId = isParty ? `REQ-2026-MP-${Math.floor(100000 + Math.random() * 900000)}` : `IND-2026-MP-${Math.floor(100000 + Math.random() * 900000)}`;
      setCandidateId(genId);
    }

    if (processStage === 1) {
      if (updatedForm.contestingCategory === 'Political Party' || updatedForm.contestingCategory === 'Party') {
        if (!updatedForm.partyName) updatedForm.partyName = dbParties[0]?.name || 'Bharatiya Janata Party';
        if (!updatedForm.partySymbol) updatedForm.partySymbol = dbParties[0]?.symbol || '🪷';
        setForm(updatedForm);
        setProcessStage(2);
      } else {
        setForm(updatedForm);
        setProcessStage(3);
        setActiveStep(1);
      }
      return;
    }

    if (processStage === 2) {
      setPartyReviewStatus('approved');
      setPartyTicketNum(`TKT-${(updatedForm.partyName || 'PARTY').slice(0, 3).toUpperCase()}-AUTO`);
      const auth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
      setPartyAuthCode(auth);
      updatedForm.partyAuthCode = auth;
      setForm(updatedForm);
      setProcessStage(3);
      setActiveStep(1);
      return;
    }

    if (processStage === 3) {
      if (activeStep === 1) {
        if (updatedForm.contestingCategory === 'Political Party' || updatedForm.contestingCategory === 'Party') {
          if (!updatedForm.partyName) updatedForm.partyName = dbParties[0]?.name || 'Bharatiya Janata Party';
          if (!updatedForm.partySymbol) updatedForm.partySymbol = dbParties[0]?.symbol || '🪷';
          if (!updatedForm.partyAuthCode) {
            const auth = partyAuthCode || `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
            updatedForm.partyAuthCode = auth;
            setPartyAuthCode(auth);
          }
        }
      } else if (activeStep === 2) {
        if (!updatedForm.fullName) updatedForm.fullName = currentUser?.fullName || 'Aman Patel';
        if (!updatedForm.fatherHusbandName) updatedForm.fatherHusbandName = 'Ramesh Patel';
        if (!updatedForm.dob) updatedForm.dob = '1995-05-15';
        if (!updatedForm.age) updatedForm.age = '31';
        if (!updatedForm.gender) updatedForm.gender = 'Male';
        if (!updatedForm.mobileNumber) updatedForm.mobileNumber = '9876543210';
        if (!updatedForm.email) updatedForm.email = 'aman.patel@voter.in';
        if (!updatedForm.residentialAddress) updatedForm.residentialAddress = '123 Civil Lines, Bhopal';
      } else if (activeStep === 3) {
        if (!updatedForm.aadharNumber) updatedForm.aadharNumber = '123456789012';
        if (!updatedForm.epicNumber) updatedForm.epicNumber = currentUser?.epicNumber || 'MP/01/123/456789';
        if (!updatedForm.partNumber) updatedForm.partNumber = '42';
        if (!updatedForm.serialNumber) updatedForm.serialNumber = '108';
      } else if (activeStep === 4) {
        if (!updatedForm.panNumber) updatedForm.panNumber = 'ABCDE1234F';
        if (!updatedForm.totalAssetValue) updatedForm.totalAssetValue = '5000000';
        if (!updatedForm.highestEducation) updatedForm.highestEducation = 'Post Graduate (M.Tech)';
      } else if (activeStep === 5) {
        if (!updatedForm.bankName) updatedForm.bankName = 'State Bank of India';
        if (!updatedForm.bankAccountNumber) updatedForm.bankAccountNumber = '39812049182';
        if (!updatedForm.bankIfsc) updatedForm.bankIfsc = 'SBIN0000001';
        if (!updatedForm.depositAmount) updatedForm.depositAmount = '10000';
      } else if (activeStep === 6) {
        if (!updatedForm.proposers || updatedForm.proposers.length < 10) {
          updatedForm.proposers = Array.from({ length: 10 }, (_, i) => ({
            epicNumber: `PROPOSER-EPIC-${1000 + i}`,
            fullName: `Proposer Citizen ${i + 1}`,
            mobileNumber: `98700${10000 + i}`,
            serialNo: `${i + 1}`,
            isVerified: true
          }));
        }
      } else if (activeStep === 7) {
        updatedForm.declCertifiedTrue = true;
        updatedForm.declUnderstandPenalties = true;
        if (!updatedForm.declPlace) updatedForm.declPlace = updatedForm.district || 'Bhopal';
        if (!updatedForm.declDate) updatedForm.declDate = new Date().toISOString().split('T')[0];
      }

      setForm(updatedForm);

      if (activeStep < 7) {
        setActiveStep(prev => prev + 1);
      } else {
        const genNom = nominationNumber || `NOM-2026-MP-${Math.floor(100000 + Math.random() * 900000)}`;
        setNominationNumber(genNom);
        setProcessStage(4);
        setRoStatus('Accepted');
        setRoRemarks('Fast skip completed. Form 26 statutory affidavits verified by Returning Officer.');
      }
    }
  };

  // FAST SKIP ALL STEPS (Full Candidacy Registration)
  const handleFastSkipAllSteps = () => {
    setError('');
    const genNom = `NOM-2026-MP-${Math.floor(100000 + Math.random() * 900000)}`;
    const genCandId = candidateId || `CAND-2026-MP-${Math.floor(100000 + Math.random() * 900000)}`;
    
    setEpicVerified(true);
    setCandidateId(genCandId);
    setPartyReviewStatus('approved');
    setPartyTicketNum('TKT-BJP-SKIP');
    setPartyAuthCode('AUTH-SKIP-FULL');
    setNominationNumber(genNom);
    
    setForm({
      electionId: activeElections[0]?.id || 'elec-default-2026',
      electionName: activeElections[0]?.title || 'General Legislative Assembly Election 2026',
      electionLevel: activeElections[0]?.level || 'State',
      state: activeConfig?.stateName || 'Madhya Pradesh',
      district: 'Bhopal',
      constituency: 'Bhopal North',
      contestingCategory: 'Political Party',
      partyName: 'Bharatiya Janata Party',
      partySymbol: '🪷',
      partyAuthCode: 'AUTH-SKIP-FULL',
      fullName: currentUser?.fullName || 'Aman Patel',
      fatherHusbandName: 'Ramesh Patel',
      dob: '1995-05-15',
      age: '31',
      gender: 'Male',
      mobileNumber: '9876543210',
      email: 'aman.patel@voter.in',
      residentialAddress: '123 Civil Lines, Bhopal',
      aadharNumber: '123456789012',
      epicNumber: currentUser?.epicNumber || 'MP/01/123/456789',
      partNumber: '42',
      serialNumber: '108',
      panNumber: 'ABCDE1234F',
      totalAssetValue: '5000000',
      highestEducation: 'Post Graduate (M.Tech)',
      bankName: 'State Bank of India',
      bankAccountNumber: '39812049182',
      bankIfsc: 'SBIN0000001',
      depositAmount: '10000',
      proposers: Array.from({ length: 10 }, (_, i) => ({
        epicNumber: `PROPOSER-EPIC-${1000 + i}`,
        fullName: `Proposer Citizen ${i + 1}`,
        mobileNumber: `98700${10000 + i}`,
        serialNo: `${i + 1}`,
        isVerified: true
      })),
      declCertifiedTrue: true,
      declUnderstandPenalties: true,
      declPlace: 'Bhopal',
      declDate: new Date().toISOString().split('T')[0]
    });

    setProcessStage(5);
    setRoStatus('Accepted');
    setRoRemarks('Fast skip completed. Candidacy verified, statutory affidavits accepted, published on official ballot.');
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
    if (window.confirm("Do you want to reset your candidacy filing draft? This will clear all progress and delete all filled data.")) {
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
      setEpicVerified(false);
      setEpicInput('');
      setForm({
        electionId: elections[0]?.id || '',
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
        contestingCategory: 'Independent',
        partyName: '',
        partySymbol: '👤',
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
        occupation: '',
        educationalQualification: '',
        mobileNumber: currentUser?.mobileNumber || '',
        emailAddress: '',
        permAddress: '',
        epicNumber: '',
        aadharNumber: currentUser?.aadharNumber || '',
        panNumber: '',
        eligIndianCitizen: true,
        eligRegisteredVoter: true,
        eligMinimumAge: true,
        criminalStatus: 'No Criminal Cases',
        totalAssetValue: '',
        totalLiabilityValue: '',
        bankAccountNumber: '',
        bankIfsc: '',
        proposersCount: '10',
        docPhoto: '',
        docSignature: '',
        docAffidavit: '',
        declCertifiedTrue: false,
        declUnderstandPenalties: false,
        declPlace: '',
        declDate: '2026-07-16'
      });
      setError('');
      setSuccess('Portal has been completely reset. All filled data deleted.');
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-center animate-fade-in">
        {/* Banner */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
          <div className="mx-auto w-16 h-16 bg-saffron-50 rounded-full flex items-center justify-center text-2xl">
            🏛️
          </div>
          <div className="space-y-2">
            <span className="bg-saffron-100 text-saffron-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-saffron-200">
              ECI Candidate Enrollment Gateway
            </span>
            <h1 className="text-xl font-black text-gray-900">Secure Candidate Nomination Portal</h1>
            <p className="text-xs text-gray-500 max-w-xl mx-auto leading-relaxed">
              To ensure compliance with the Representation of the People Act and ECI's security framework, every prospective candidate must first hold a verified citizen profile with completed eKYC records.
            </p>
          </div>

          {/* Flow visual diagram */}
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block text-left">
              Required Candidacy Sequence
            </span>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-left">
              {[
                { step: 1, label: "ECI Profile", status: "Required", isDone: false, desc: "Create/verify profile" },
                { step: 2, label: "Secure Login", status: "Required", isDone: false, desc: "Aadhaar eKYC session" },
                { step: 3, label: "Become Candidate", status: "Pending", isDone: false, desc: "Select target seat context" },
                { step: 4, label: "Registration Form", status: "Pending", isDone: false, desc: "Generate Candidate ID" },
                { step: 5, label: "Nomination Form", status: "Pending", isDone: false, desc: "Form 26 affidavit (7-steps)" }
              ].map((item, index) => (
                <div key={item.step} className="p-3 bg-white rounded-xl border border-gray-250/50 shadow-3xs relative">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono text-gray-400 font-bold">Step 0{item.step}</span>
                    <span className="text-[8px] bg-amber-50 text-amber-700 font-black px-1.5 py-0.2 rounded uppercase border border-amber-200">
                      {item.status}
                    </span>
                  </div>
                  <strong className="text-xs text-gray-800 block">{item.label}</strong>
                  <span className="text-[9px] text-gray-400 block mt-0.5">{item.desc}</span>
                  {index < 4 && (
                    <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-gray-300 font-bold">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={onOpenAuth}
              className="px-8 py-3.5 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Login / Create ECI Profile</span>
            </button>
            <p className="text-[10px] text-gray-400">
              Already registered or have an Aadhaar profile? Use the sandbox quick bypass to authenticate instantly.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Fast Step Skip Helper */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-saffron-500/10 border border-amber-300/50 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div>
            <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">⚡ Fast Step Skip Helper</span>
            <p className="text-[11px] text-amber-800">
              Skip individual steps or auto-complete the full candidacy registration with pre-filled valid statutory data.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {processStage <= 3 && (
            <button
              type="button"
              onClick={handleFastSkipCurrentStep}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              title="Auto-fill current step and jump to next step"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Skip {processStage === 3 ? `Step ${activeStep}` : `Stage ${processStage}`}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleFastSkipAllSteps}
            className="flex-1 sm:flex-none px-3.5 py-1.5 bg-primary-900 hover:bg-primary-950 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Bypass all steps and complete candidacy immediately"
          >
            <Sparkles className="w-3.5 h-3.5 text-saffron-300" />
            <span>Skip All Steps & Finish</span>
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
            const canGoBack = item.stage < processStage;
            
            return (
              <div 
                key={item.stage} 
                onClick={() => {
                  if (canGoBack) {
                    setProcessStage(item.stage);
                    setError('');
                  }
                }}
                className={`p-3 rounded-xl border transition-all text-left ${
                  canGoBack ? 'cursor-pointer hover:bg-gray-100/80 hover:border-gray-300' : ''
                } ${
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
                {canGoBack && (
                  <span className="text-[8px] text-primary-800 font-extrabold uppercase mt-1 block">← Click to go back</span>
                )}
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
            <div className="space-y-6">
              {ecConfirmationStatus === 'pending' ? (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-md space-y-6 animate-fade-in text-left">
                  {/* Status Banner */}
                  <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-3 shadow-xs">
                    <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300 shadow-xs animate-pulse">
                      <Activity className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <span className="bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-300 tracking-wider">
                        ⏳ Registration Saved — Waiting for Candidate Registration Acceptance
                      </span>
                      <h2 className="text-xl font-black text-gray-950 font-display uppercase tracking-wide pt-1">
                        Candidate Registration Pending Acceptance
                      </h2>
                      <p className="text-xs text-gray-600 max-w-xl mx-auto leading-relaxed font-medium">
                        Your Stage 1 candidate registration form has been saved successfully in the ECI central registry. All your nomination details are mentioned below and are currently waiting for acceptance and scrutiny by the Election Commission Administrator.
                      </p>
                    </div>
                  </div>

                  {/* EC Admin Document Request Banner */}
                  {(liveCandidate?.status === 'DOCUMENT_REQUESTED' || liveCandidate?.status === 'NEEDS_CORRECTION') && (
                    <div className="max-w-2xl mx-auto p-4 bg-indigo-50 border-2 border-indigo-400 rounded-2xl text-left space-y-2 shadow-sm animate-fade-in">
                      <div className="flex items-center gap-2 text-indigo-950 font-extrabold text-xs">
                        <span className="text-base">📄</span> EC Admin Requested Additional Document / Scrutiny Clarification
                      </div>
                      <p className="text-xs text-indigo-950 bg-white p-3 rounded-xl border border-indigo-200 font-mono">
                        "{liveCandidate?.ecNotes || 'Please upload updated Form 26 affidavit or additional identity proof as requested by EC Returning Officer.'}"
                      </p>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                        <span className="text-[11px] text-indigo-800 font-semibold">Action Required: Upload requested documents to clear scrutiny.</span>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-3.5 py-1.5 bg-indigo-700 text-white font-bold text-xs rounded-lg hover:bg-indigo-800 shadow-xs cursor-pointer transition"
                        >
                          📄 Upload / Correct Document (Step 2)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Scrutiny Progress Trackers */}
                  {(form.electionLevel === 'Rural / Urban Area' || mappedLevel === 'Rural / Urban Area' || isRuralUrbanLevel) ? (
                    <div className="max-w-xl mx-auto text-left p-4 rounded-xl border bg-emerald-50/60 border-emerald-200 text-emerald-950">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">🏡</span>
                        <span className="font-extrabold text-xs">Rural / Urban Local Election One-Step Scrutiny</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-snug">
                        Rural/Urban local elections use a streamlined process. The EC Administrator will verify your profile, generate your EC Ticket Number & Authorization Code, and grant final clearance.
                      </p>
                    </div>
                  ) : form.contestingCategory === 'Political Party' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                      <div className={`p-4 rounded-xl border ${(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode || liveCandidate?.officialCandidateId) ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50/60 border-amber-200 text-amber-950 animate-pulse'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode || liveCandidate?.officialCandidateId) ? '✅' : '⏳'}</span>
                          <span className="font-extrabold text-xs">Step 1a: Party Ticket Number & Auth Code</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode) 
                            ? `Generated by ${form.partyName}! Ticket #${liveCandidate.ticketNumber || 'TKT-AUTO'} | Code #${liveCandidate.authorizationCode || liveCandidate.officialCandidateId}.` 
                            : `Awaiting ${form.partyName} High-Command to generate Party Ticket Number & Authorization Code.`}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${liveCandidate?.partyApprovalStatus === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50/60 border-amber-200 text-amber-950 animate-pulse'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{liveCandidate?.partyApprovalStatus === 'APPROVED' ? '✅' : '⏳'}</span>
                          <span className="font-extrabold text-xs">Step 1b: Party Ticket Endorsement</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {liveCandidate?.partyApprovalStatus === 'APPROVED'
                            ? `Approved by ${form.partyName}! Ticket signed & symbol (${liveCandidate.partySymbol || form.partySymbol || '🏛️'}) allocated.` 
                            : `Awaiting ${form.partyName} High-Command ticket approval.`}
                        </p>
                      </div>

                      <div className={`col-span-1 md:col-span-2 p-4 rounded-xl border ${(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED') ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50/40 border-amber-200 text-amber-950 animate-pulse'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED') ? '✅' : '⏳'}</span>
                          <span className="font-extrabold text-xs">Step 2: EC Admin Final Approval</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED')
                            ? 'Confirmed & Approved! EC Admin cleared registration acceptance.'
                            : liveCandidate?.partyApprovalStatus === 'APPROVED'
                              ? 'Party ticket approved! Awaiting final EC Admin scrutiny and approval.'
                              : 'Awaiting Political Party Ticket Number, Authorization Code & Endorsement before EC Admin final approval.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                      <div className={`p-4 rounded-xl border ${(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode || liveCandidate?.status === 'APPROVED' || liveCandidate?.status === 'EC_CONFIRMED') ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50/60 border-amber-200 text-amber-950 animate-pulse'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode || liveCandidate?.status === 'APPROVED' || liveCandidate?.status === 'EC_CONFIRMED') ? '✅' : '⏳'}</span>
                          <span className="font-extrabold text-xs">Step 1: EC Ticket Number & Auth Code</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {(liveCandidate?.ticketNumber || liveCandidate?.authorizationCode) 
                            ? `Generated by EC Admin! Ticket #${liveCandidate.ticketNumber} | Code #${liveCandidate.authorizationCode}`
                            : `Awaiting EC Admin to generate official EC Ticket Number & Authorization Code for Independent Candidate.`}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED') ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50/60 border-amber-200 text-amber-950 animate-pulse'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs">{(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED') ? '✅' : '⏳'}</span>
                          <span className="font-extrabold text-xs">Step 2: EC Admin Final Approval</span>
                        </div>
                        <p className="text-[11px] text-gray-600 leading-snug">
                          {(liveCandidate?.status === 'EC_CONFIRMED' || liveCandidate?.status === 'APPROVED')
                            ? 'Confirmed & Approved! EC Admin verified credentials & granted final clearance.'
                            : 'Awaiting EC Admin scrutiny and final candidacy approval.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Registered Information Summary Grid */}
                  <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-gray-200">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>📄 Submitted Candidate Registration Profile</span>
                      </h3>
                      <span className="text-[11px] font-mono font-extrabold text-primary-900 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-200">
                        Ref ID: {candidateId}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Candidate Personal Identity */}
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block border-b pb-1">👤 Candidate Identification</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between"><span className="text-gray-500">Full Name:</span> <strong className="text-gray-900 font-bold">{form.fullName}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">ECI Card / EPIC ID:</span> <strong className="text-emerald-800 font-mono font-bold">{form.epicNumber}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Mobile Number:</span> <strong className="text-gray-900">+91 {form.mobileNumber}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Aadhaar Number:</span> <strong className="text-gray-900 font-mono">XXXX-XXXX-{(form.aadharNumber || '1234').slice(-4)}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Permanent Address:</span> <strong className="text-gray-900 truncate max-w-[180px]">{form.permAddress || 'Verified on roll'}</strong></div>
                        </div>
                      </div>

                      {/* Election & Jurisdiction Details */}
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 shadow-2xs">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block border-b pb-1">🏛️ Election Jurisdiction</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between"><span className="text-gray-500">Election Context:</span> <strong className="text-gray-900 font-bold">{form.electionName || activeConfig?.title || 'National Election Context'}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Election Category:</span> <strong className="text-primary-900 font-bold">{activeConfig?.category || 'General Election'}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Jurisdiction Level:</span> <strong className="text-blue-900 font-bold">{form.electionLevel || 'Standard'}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Target Region State:</span> <strong className="text-gray-900 font-bold">{form.state || activeConfig?.stateName || 'All India'}</strong></div>
                          <div className="flex justify-between"><span className="text-gray-500">Constituency / Ward:</span> <strong className="text-gray-900 font-bold">{form.constituency || form.district || 'All Area'}</strong></div>
                        </div>
                      </div>

                      {/* Contesting Affiliation & Authorization Credentials */}
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2 shadow-2xs md:col-span-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block border-b pb-1">🗳️ Affiliation & Credentials (Ticket & Code)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-left">
                          <div>
                            <span className="text-gray-500 block text-[10px]">Contesting Mode</span>
                            <strong className="text-amber-950 font-extrabold">{form.contestingCategory}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">Party / Symbol</span>
                            <strong className="text-gray-900 font-bold">{form.contestingCategory === 'Political Party' ? `${form.partyName} (${liveCandidate?.partySymbol || form.partySymbol || '🏛️'})` : 'Independent (👤)'}</strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">Party/EC Ticket Number</span>
                            <strong className="text-emerald-800 font-mono font-bold block truncate">
                              {liveCandidate?.ticketNumber || (form.contestingCategory === 'Political Party' ? '⏳ Awaiting Party Ticket' : '⏳ Awaiting EC Ticket')}
                            </strong>
                          </div>
                          <div>
                            <span className="text-gray-500 block text-[10px]">Authorization Code</span>
                            <strong className="text-indigo-900 font-mono font-bold block truncate">
                              {liveCandidate?.authorizationCode || (form.contestingCategory === 'Political Party' ? '⏳ Awaiting Party Auth Code' : '⏳ Awaiting EC Auth Code')}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => checkEcConfirmationStatus(false)}
                      className="px-6 py-3 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <span>🔄 Check Live EC Acceptance Status</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.candidates.updateStatus(candidateId, 'EC_CONFIRMED', 'usr-ec-admin');
                          await checkEcConfirmationStatus(false);
                        } catch (err) {
                          console.error(err);
                          setError("Bypass failed: " + err.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <span>⚡ Simulate EC Admin Approval</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEcConfirmationStatus('none')}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>✏️ Edit Registration</span>
                    </button>
                  </div>
                </div>
              ) : ecConfirmationStatus === 'rejected' ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center space-y-6 animate-fade-in">
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-sm">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-rose-200">
                      Candidacy Stage 1 Registration Rejected
                    </span>
                    <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-wide pt-1">Candidacy ID Rejected</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      Unfortunately, the Election Commission of India reviewed and rejected your candidacy registration request due to eligibility failure or invalid verification coordinates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFiling}
                    className="px-6 py-2.5 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md mx-auto inline-block"
                  >
                    Reset & Try Again
                  </button>
                </div>
              ) : (
                <>
                  {!isRegistrationOpen ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xs text-center space-y-4">
                  <div className="w-16 h-16 bg-red-50 text-red-700 rounded-full flex items-center justify-center mx-auto border border-red-100 shadow-sm animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                      Status: {activeConfig?.status ? activeConfig.status.replace('_', ' ') : 'REGISTRATION CLOSED'}
                    </span>
                    <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-wide pt-1">
                      Candidate Nominations Closed
                    </h3>
                  </div>

                  {activeConfig && (
                    <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-left max-w-md mx-auto space-y-1">
                      <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Active System Election Context</span>
                      <p className="text-xs font-extrabold text-gray-900">{activeConfig.title || 'National Election Context'}</p>
                      <p className="text-[11px] text-gray-600 font-semibold">
                        📍 {activeConfig.category} — {activeConfig.stateName}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    Under Election Commission of India guidelines, candidate registration availability is strictly <strong>controlled by the EC Admin</strong>.
                    {activeConfig?.status === 'REGISTRATION_CLOSED' && " The EC Admin has officially closed candidate nomination filings for this election."}
                    {activeConfig?.status === 'VOTING_OPEN' && " Polling is currently LIVE for this election context. Candidate registrations are closed."}
                    {activeConfig?.status === 'RESULTS_PUBLISHED' && " Counting has completed and election results are officially PUBLISHED."}
                    {(!activeConfig?.status || activeConfig?.status === 'CREATED') && " Candidate registration has not been opened yet by the EC Admin for this election level."}
                  </p>
                </div>
              ) : !epicVerified ? (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                  <div className="space-y-1.5">
                    <span className="bg-red-50 text-red-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-red-200">
                      Step 1/2: Elector Verification
                    </span>
                    <h2 className="text-lg font-extrabold text-gray-950">Voter Registry ID Lookup (EPIC)</h2>
                    <p className="text-xs text-gray-500">
                      To comply with Election Commission mandates, candidates must be registered electors. Please input and verify your Electoral Photo Identity Card (EPIC) Number to unlock registration.
                    </p>
                  </div>

                  {isRegistrationOpen && activeConfig && (
                    <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                      <div className="text-lg mt-0.5">🏛️</div>
                      <div className="text-left space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">Active Election Window Opened by EC Admin</span>
                        <p className="text-xs text-gray-700 font-bold">
                          {activeConfig.category} {activeConfig.subCategory ? `(${activeConfig.subCategory})` : ''} - {activeConfig.stateName}
                        </p>
                        <p className="text-[10px] text-gray-500">Nomination forms will be automatically locked to this state & category jurisdiction.</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleVerifyEpic} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">EPIC Card Number *</label>
                      <input
                        type="text"
                        required
                        maxLength={12}
                        placeholder="e.g. EPIC123456"
                        value={epicInput}
                        onChange={(e) => setEpicInput(e.target.value.toUpperCase())}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3.5 text-xs font-mono font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-red-800"
                      />
                      <p className="text-[10px] text-gray-400">Your unique 10-12 character alphanumeric national elector ID card code.</p>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyingEpic}
                      className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>{verifyingEpic ? "Querying Electoral Rolls Database..." : "Verify Voter Registration Status"}</span>
                      <ArrowRight className="w-4 h-4 text-white" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        ✓ EPIC VERIFIED: {form.epicNumber}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => setEpicVerified(false)} 
                        className="text-[10px] text-red-700 hover:underline font-bold"
                      >
                        Change Voter ID
                      </button>
                    </div>
                    <h2 className="text-lg font-extrabold text-gray-950">Become a Candidate: Registry Information</h2>
                    <p className="text-xs text-gray-500">
                      Provide legal identification credentials to complete candidacy filing. Your verified EPIC code has been bound to this registration sequence.
                    </p>
                  </div>

                  {isRegistrationOpen && activeConfig && (
                    <div className="bg-emerald-50/70 border border-emerald-100 p-3 rounded-xl text-left text-xs font-bold text-emerald-850">
                      🔒 Your nomination is locked to state jurisdiction <strong className="text-emerald-950 underline">{activeConfig.stateName}</strong> for <strong className="text-emerald-950">{activeConfig.category} {activeConfig.subCategory ? `(${activeConfig.subCategory})` : ''}</strong> elections.
                    </div>
                  )}

                  <form onSubmit={handleRegisterCandidate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Full Legal Name *</label>
                        <input 
                          type="text"
                          required
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-250 rounded-lg py-2 px-3 text-xs focus:outline-none focus:bg-white"
                          placeholder="Same as Voter Card Name"
                          disabled={!!currentUser}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Mobile Number *</label>
                        <input 
                          type="tel"
                          required
                          value={form.mobileNumber}
                          onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-250 rounded-lg py-2 px-3 text-xs focus:outline-none focus:bg-white"
                          placeholder="Active 10-digit mobile"
                          disabled={!!currentUser}
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-4 space-y-4">
                        {/* Dynamic Rule Banner & Inputs based on active election context */}
                        {isRegistrationOpen && activeConfig ? (
                          <div className="space-y-4">
                            {/* Rule 1: Parliamentary Election (Lok Sabha / Rajya Sabha) */}
                            {isParliamentaryLevel && (
                              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl text-left text-xs space-y-1 shadow-2xs">
                                <span className="text-[9px] font-black uppercase text-purple-800 tracking-wider">Parliamentary Election Jurisdiction Level</span>
                                <div className="font-extrabold text-purple-950 flex flex-wrap items-center justify-between gap-2 pt-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">🏛️</span>
                                    <div>
                                      <span className="text-xs text-purple-900 block font-black">
                                        Default Level: <strong className="underline text-purple-950">{form.electionLevel || activeConfig.category || 'Lok Sabha (MP)'}</strong>
                                      </span>
                                      <span className="text-[10px] text-purple-700 font-medium block">Parliamentary Member of Parliament (MP) Level automatically applied by ECI Admin</span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-purple-800 font-black bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200 uppercase tracking-wider">
                                    🔒 Default Applied
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Rule 2: Legislative Assembly (MLA / MLC) */}
                            {isAssemblyLevel && (
                              <div className="space-y-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-left shadow-2xs">
                                <label className="text-xs font-black text-blue-950 uppercase tracking-wider flex items-center justify-between">
                                  <span>🏛️ Select Election Jurisdiction Level *</span>
                                  <span className="text-[10px] text-blue-800 font-bold bg-blue-100 px-2 py-0.5 rounded border border-blue-200">(Select MLA or MLC)</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                  <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, electionLevel: 'State Legislative Assembly (MLA)' }))}
                                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                                      form.electionLevel === 'State Legislative Assembly (MLA)' || form.electionLevel === 'Legislative Assembly (MLA)'
                                        ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className="text-base">🏛️</span>
                                    <div className="text-left">
                                      <span className="block font-bold">1. MLA (Member of Legislative Assembly)</span>
                                      <span className={`block text-[9px] ${form.electionLevel?.includes('MLA') ? 'text-blue-100' : 'text-gray-400'}`}>State Legislative Assembly Constituency</span>
                                    </div>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, electionLevel: 'State Legislative Council (MLC)' }))}
                                    className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition cursor-pointer ${
                                      form.electionLevel === 'State Legislative Council (MLC)' || form.electionLevel === 'Legislative council (MLC)'
                                        ? 'bg-blue-900 text-white border-blue-950 shadow-xs'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className="text-base">📜</span>
                                    <div className="text-left">
                                      <span className="block font-bold">2. MLC (Member of Legislative Council)</span>
                                      <span className={`block text-[9px] ${form.electionLevel?.includes('MLC') ? 'text-blue-100' : 'text-gray-400'}`}>State Legislative Council Representative</span>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Rule 3: Rural / Urban Area Local Elections - Selectable Jurisdiction Level */}
                            {isRuralUrbanLevel && (
                              <div className="space-y-2.5 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-left text-xs shadow-2xs">
                                <div className="flex flex-wrap items-center justify-between gap-1">
                                  <label className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                                    🏡 Select Election Jurisdiction Level (Rural / Urban Area) *
                                  </label>
                                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                                    Independent Candidate Default
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 pt-1">
                                  {[
                                    { id: 'Ward Panchayat', label: 'Ward Panchayat', icon: '🏘️' },
                                    { id: 'Gram Panchayat', label: 'Gram Panchayat', icon: '🏡' },
                                    { id: 'Block Samiti', label: 'Block Samiti', icon: '🏛️' },
                                    { id: 'Zila Parishad', label: 'Zila Parishad', icon: '🏢' },
                                    { id: 'Municipal Corporation', label: 'Municipal Corporation', icon: '🏙️' },
                                    { id: 'Municipal Council', label: 'Municipal Council', icon: '🌆' },
                                    { id: 'Nagar Panchayat', label: 'Nagar Panchayat', icon: '🏬' }
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => setForm(f => ({ ...f, electionLevel: opt.id }))}
                                      className={`p-2.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 transition cursor-pointer text-left ${
                                        form.electionLevel === opt.id
                                          ? 'bg-emerald-800 text-white border-emerald-950 shadow-xs'
                                          : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
                                      }`}
                                    >
                                      <span className="text-sm">{opt.icon}</span>
                                      <span className="block font-bold text-[11px] truncate">{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* State Selection if EC Admin set multiple states */}
                            {isMultipleStatesConfigured ? (
                              <div className="space-y-1.5 text-left p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl shadow-2xs">
                                <label className="text-xs font-black text-amber-950 uppercase tracking-wider block">
                                  🌐 Select Region / State Jurisdiction *
                                </label>
                                <select
                                  required
                                  value={form.state}
                                  onChange={(e) => setForm(f => ({ ...f, state: e.target.value, district: '', constituency: '' }))}
                                  className="w-full bg-white border border-gray-300 rounded-xl py-2 px-3 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-900"
                                >
                                  <option value="">-- Choose State Region Jurisdiction --</option>
                                  {INDIAN_REGIONS.map(reg => (
                                    <option key={reg.state} value={reg.state}>{reg.state}</option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-amber-800 font-medium">
                                  EC Admin configured multi-state context. Candidate needs to select region hierarchy.
                                </p>
                              </div>
                            ) : (
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 text-left">
                                🔒 Locked Jurisdiction State: <span className="text-primary-900 underline">{activeConfig.stateName || 'All India'}</span>
                              </div>
                            )}

                            {/* Cascading Region Hierarchy Engine */}
                            <ElectionHierarchyEngine
                              level={form.electionLevel || mappedLevel}
                              formValues={{ ...form, state: form.state || activeConfig.stateName }}
                              onChange={(updatedVals) => setForm(f => ({ ...f, ...updatedVals }))}
                              showBreadcrumbs={true}
                            />
                          </div>
                        ) : (
                          <ElectionHierarchyEngine
                            level={form.electionLevel}
                            formValues={form}
                            onChange={(updatedVals) => setForm(updatedVals)}
                            showBreadcrumbs={true}
                          />
                        )}
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
                            onChange={(e) => {
                              const pName = e.target.value;
                              const selectedP = dbParties.find(p => p.name === pName);
                              setForm({ 
                                ...form, 
                                partyName: pName,
                                partySymbol: selectedP ? (selectedP.symbol || '🏛️') : '🏛️',
                                partyId: selectedP ? selectedP.id : ''
                              });
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:outline-none"
                          >
                            <option value="">-- Choose Party Affiliation --</option>
                            {dbParties.length > 0 ? (
                              dbParties.map(p => (
                                <option key={p.id} value={p.name}>
                                  {p.name} ({p.abbrev || p.name.substring(0,3).toUpperCase()}) {p.symbol || '🏛️'}
                                </option>
                              ))
                            ) : (
                              <>
                                <option value="Bharatiya Janata Party">Bharatiya Janata Party (BJP) 🪷</option>
                                <option value="Indian National Congress">Indian National Congress (INC) ✋</option>
                                <option value="Aam Aadmi Party">Aam Aadmi Party (AAP) 🧹</option>
                                <option value="Bahujan Samaj Party">Bahujan Samaj Party (BSP) 🐘</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-primary-900 hover:bg-primary-950 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span>Register Candidacy & Generate ID</span>
                        <ArrowRight className="w-4 h-4 text-saffron-300" />
                      </button>
                      <button
                        type="button"
                        onClick={handleFastSkipCurrentStep}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                        title="Skip Stage 1 and move forward"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Skip Stage 1</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
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

                  <div className="flex gap-2">
                    <button
                      onClick={handleSimulatePartyApproval}
                      className="flex-1 py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold text-xs uppercase rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Authorize & Issue Party Ticket</span>
                      <Sparkles className="w-4 h-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFastSkipCurrentStep}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
                      title="Skip Stage 2 and move forward"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>Skip Stage 2</span>
                    </button>
                  </div>
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
                    {/* Locked State Jurisdiction parameters banner */}
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Locked State Jurisdiction Parameters</span>
                      </div>
                      <p className="text-[11px] text-gray-600">
                        Under ECI safety and statutory guidelines, your contesting jurisdiction has been strictly verified and locked to your registered electoral state and local boundaries.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs font-bold text-gray-800">
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-[9px] text-gray-400 block uppercase">Election Level</span>
                          <span className="text-indigo-900 font-extrabold">{form.electionLevel || 'State'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-[9px] text-gray-400 block uppercase">State</span>
                          <span className="text-indigo-900 font-extrabold">{form.state || activeConfig?.stateName || 'N/A'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-[9px] text-gray-400 block uppercase">Constituency</span>
                          <span className="text-indigo-900 font-extrabold">{form.constituency || 'N/A'}</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-amber-100">
                          <span className="text-[9px] text-gray-400 block uppercase">District</span>
                          <span className="text-indigo-900 font-extrabold">{form.district || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

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
                        <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                          <span>Voter ID (EPIC Card Number) *</span>
                          <span className="text-[9px] font-black text-amber-700 uppercase bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5 text-amber-700" /> Locked by Candidate Selection
                          </span>
                        </label>
                        <input 
                          type="text" required value={form.epicNumber} 
                          readOnly
                          className="w-full bg-amber-50/50 border border-amber-200 text-amber-950 rounded-lg py-2 px-3 text-xs font-mono font-extrabold tracking-wider focus:outline-none select-none cursor-not-allowed"
                          placeholder="e.g. ECI5693845"
                        />
                        <p className="text-[10px] text-amber-700 font-medium">This EPIC code is locked by candidate registration and verified elector records.</p>
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
                      <div 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) setForm(prev => ({ ...prev, docPhoto: file.name }));
                          };
                          input.click();
                        }}
                        className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50 hover:border-red-400 cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Candidate Photo</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docPhoto || 'Click to upload'}</span>
                      </div>

                      <div 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) setForm(prev => ({ ...prev, docSignature: file.name }));
                          };
                          input.click();
                        }}
                        className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50 hover:border-red-400 cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Legal Signature</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docSignature || 'Click to upload'}</span>
                      </div>

                      <div 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) setForm(prev => ({ ...prev, docAffidavit: file.name }));
                          };
                          input.click();
                        }}
                        className="border border-dashed p-4 rounded-xl text-center space-y-1 bg-gray-50 hover:border-red-400 cursor-pointer transition"
                      >
                        <Upload className="w-5 h-5 mx-auto text-gray-400" />
                        <span className="block text-xs font-bold text-gray-700">Affidavit (Form 26)</span>
                        <span className="block text-[10px] text-emerald-600 font-bold">✓ {form.docAffidavit || 'Click to upload'}</span>
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
                <div className="bg-gray-50 border-t border-gray-100 -mx-6 -mb-6 p-4 flex justify-between items-center mt-6 gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={handlePrevStep}
                    className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-bold disabled:opacity-40"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFastSkipCurrentStep}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
                      title="Auto-fill default data for current step and proceed to next step"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Skip Step {activeStep}</span>
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
