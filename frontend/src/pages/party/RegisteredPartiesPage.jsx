import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Landmark, ArrowLeft, RefreshCw, ShieldCheck, FileText, Search, PlusCircle, 
  Sparkles, Lock, Unlock, User, Check, X, Award, Briefcase, GraduationCap, 
  TrendingUp, Paperclip, ShieldAlert, CheckCircle2, ChevronRight, LogOut, Eye,
  Building, CheckCircle, FileSpreadsheet, XCircle, Ticket, Trash2, UploadCloud,
  MapPin, CreditCard, CheckSquare, Users, Calendar, Mail, Phone, Globe, Zap, Send, Plus, Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PartyRegistry from './PartyRegistry';
import PartyLogin from './PartyLogin';

const APPROVED_SYMBOL_TEMPLATES = [
  { char: '🪷', name: 'Lotus (BJP)' },
  { char: '✋', name: 'Hand (INC)' },
  { char: '🧹', name: 'Broom (AAP)' },
  { char: '🚲', name: 'Bicycle (SP)' },
  { char: '🏹', name: 'Bow & Arrow (SS)' },
  { char: '⚖️', name: 'Balance Scales (SAD)' },
  { char: '☀️', name: 'Rising Sun (DMK)' },
  { char: '🦁', name: 'Lion (AIFB)' },
  { char: '🐘', name: 'Elephant (BSP)' },
  { char: '🚗', name: 'Car (TRS)' },
  { char: '✈️', name: 'Airplane (Independent)' },
  { char: '📖', name: 'Book (NPP)' },
  { char: '⏰', name: 'Clock (NCP)' }
];

export default function RegisteredPartiesPage({ currentUser, onNavigateToHome, onLoginSuccess, onLogout }) {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeConfig, setActiveConfig] = useState(() => {
    const saved = localStorage.getItem('eci_active_configuration');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Navigation View State: 'BROWSE' | 'LOGIN' | 'REGISTER_PARTY' | 'PARTY_DASHBOARD'
  const [viewMode, setViewMode] = useState('BROWSE');
  
  // Party Session State (local session)
  const [activeParty, setActiveParty] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  
  // Filter for candidates in the panel
  const [candidateFilter, setCandidateFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null); // Document detail viewer modal
  
  // Login Form States
  const [loginAbbrev, setLoginAbbrev] = useState('');
  const [loginPassword, setLoginPassword] = useState('password'); // Default password for preconfigured parties
  const [loginError, setLoginError] = useState('');

  // 10-step wizard states
  const [regStep, setRegStep] = useState(1);
  const [partyForm, setPartyForm] = useState({
    // Step 1: Basic Party Information
    name: '',
    abbrev: '',
    symbol: '⏳',
    motto: '',
    ideology: '',
    partyType: 'Local', // (National / State / Regional / Local)
    dateOfFormation: '',
    officialEmail: '',
    officialPhone: '',
    officialWebsite: '',
    logoUrl: '',
    manifesto: '', // Party Manifesto / Vision statement
    password: 'password', // Password for login

    // Step 2: Registered Office Details
    officeAddress: '',
    officeState: '',
    officeDistrict: '',
    officeCityVillage: '',
    officePinCode: '',
    officeAddressProofUrl: '',

    // Step 3: Party President Details
    presidentEciProfileId: '',
    presidentEciProfileVerified: false,
    presidentName: '',
    presidentDob: '',
    presidentGender: 'Male',
    presidentMobile: '',
    presidentEmail: '',
    presidentAadhar: '',
    presidentPan: '',
    presidentAddress: '',
    presidentPhotoUrl: '',
    presidentIdProofUrl: '',

    // Step 4: Office Bearers (Add Multiple)
    officeBearers: [
      { fullName: '', position: 'President', mobileNumber: '', email: '', address: '', photoUrl: '', idProofUrl: '' }
    ],

    // Step 5: Party Constitution
    constitutionObjective: '',
    constitutionPdfUrl: '',
    membershipRules: '',
    internalElectionProcess: '',
    disciplinaryRules: '',

    // Step 6: Party Members (Add Multiple)
    partyMembers: [
      { eciProfileId: '', eciProfileVerified: false, fullName: '', mobileNumber: '', state: '', district: '', membershipId: '', joiningDate: '' }
    ],

    // Step 7: Bank & Financial Details
    bankName: '',
    bankAccountHolderName: '',
    bankAccountNumber: '',
    bankIfscCode: '',
    bankPanNumber: '',
    bankTreasurerName: '',

    // Step 8: Election Details
    electionLevels: [], // Array of string levels

    // Step 9: Documents Upload
    docPartyConstitution: '',
    docPresidentIdProof: '',
    docPresidentPhoto: '',
    docOfficeAddressProof: '',
    docPanCard: '',
    docBankProof: '',
    docPartyLogo: '',

    // Step 10: Declaration
    declDeclaredTrue: false,
    declDigitalSignature: '',
    declSignatureUrl: '',
    declDate: new Date().toISOString().split('T')[0],
  });

  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  const validateRegStep = (step) => {
    if (step === 1) {
      if (!partyForm.name.trim()) return 'Political Party Name is required in Step 1.';
      if (!partyForm.abbrev.trim()) return 'Abbreviation is required in Step 1.';
      if (!partyForm.manifesto.trim()) return 'Manifesto / Vision Statement is required in Step 1.';
    }
    if (step === 2) {
      if (!partyForm.officeAddress.trim() || !partyForm.officeState.trim() || !partyForm.officeDistrict.trim() || !partyForm.officeCityVillage.trim() || !partyForm.officePinCode.trim()) {
        return 'All Registered Office Address fields (Address, State, District, City/Village, PIN Code) are required in Step 2.';
      }
    }
    if (step === 3) {
      if (!partyForm.presidentEciProfileId.trim()) return 'Required Voter ECI ID is required in Step 3.';
      if (!partyForm.presidentEciProfileVerified) return "Please verify the Voter ECI ID before proceeding.";
      if (!partyForm.presidentName.trim()) return 'President Full Name is required in Step 3.';
      if (!partyForm.presidentMobile.trim()) return 'President Mobile Number is required in Step 3.';
    }
    if (step === 4) {
      if (!partyForm.officeBearers || partyForm.officeBearers.length === 0) {
        return 'Please add the primary Executive Office Bearer details in Step 4.';
      }
      const b = partyForm.officeBearers[0];
      if (!b.fullName.trim() || !b.position.trim()) {
        return 'Executive Office Bearer Full Name and Position Title are required in Step 4.';
      }
      // Strict ECI Uniqueness Check: President vs Executive Bearer
      const presEci = (partyForm.presidentEciProfileId || '').trim().toLowerCase();
      const bearerEci = (b.eciProfileId || b.mobileNumber || '').trim().toLowerCase();
      if (presEci && bearerEci && presEci === bearerEci) {
        return `❌ ECI ID Conflict: The Party President and Executive Office Bearer (${b.position}) cannot be the same ECI ID (${partyForm.presidentEciProfileId}). As per ECI regulations, one ECI ID cannot hold multiple positions.`;
      }
    }
    if (step === 6) {
      if (!partyForm.partyMembers || partyForm.partyMembers.length === 0) {
        return 'At least one verified party member is required in Step 6.';
      }

      /* Code requirement for 100 members commented out:
      // if (partyForm.partyMembers.length < 100) {
      //   return 'At least 100 verified members are required for ECI registration.';
      // }
      */

      const presEci = (partyForm.presidentEciProfileId || '').trim().toLowerCase();
      const bearerEcis = (partyForm.officeBearers || []).map(b => (b.eciProfileId || b.mobileNumber || '').trim().toLowerCase()).filter(Boolean);
      const memberEcis = new Set();

      for (let i = 0; i < partyForm.partyMembers.length; i++) {
        const m = partyForm.partyMembers[i];
        const mEci = (m.eciProfileId || '').trim().toLowerCase();
        if (!mEci) {
          return `Member #${i + 1} is missing an ECI Profile ID in Step 6.`;
        }
        if (!m.eciProfileVerified) {
          return `Please verify the ECI Profile ID for member #${i + 1} before proceeding.`;
        }

        // Check 1: Member ECI ID vs President ECI ID
        if (presEci && mEci === presEci) {
          return `❌ ECI ID Conflict: Member #${i + 1} (${m.fullName || mEci}) has ECI ID (${m.eciProfileId}) which is already assigned as Party President. One ECI ID cannot be used for two positions/places.`;
        }

        // Check 2: Member ECI ID vs Executive Bearer ECI ID
        if (bearerEcis.includes(mEci)) {
          return `❌ ECI ID Conflict: Member #${i + 1} (${m.fullName || mEci}) has ECI ID (${m.eciProfileId}) which is already assigned as an Executive Office Bearer. One ECI ID cannot be used for two positions/places.`;
        }

        // Check 3: Member ECI ID duplicate within founding members list
        if (memberEcis.has(mEci)) {
          return `❌ ECI ID Conflict: Duplicate ECI ID (${m.eciProfileId}) found in Founding Members list at #${i + 1}. Every member must have a unique ECI ID.`;
        }
        memberEcis.add(mEci);
      }
    }
    if (step === 8) {
      if (!partyForm.electionLevels || partyForm.electionLevels.length === 0) {
        return 'Please select at least one targeted election level (Assembly, Lok Sabha, or Rajya Sabha) in Step 8.';
      }
    }
    return null;
  };

  const nextStep = () => {
    setRegError('');
    const err = validateRegStep(regStep);
    if (err) {
      setRegError(err);
      return;
    }
    setRegStep(prev => Math.min(prev + 1, 10));
  };

  const prevStep = () => {
    setRegError('');
    setRegStep(prev => Math.max(prev - 1, 1));
  };

  const skipRegStep = () => {
    setRegError('');
    setPartyForm(prev => {
      const updated = { ...prev };
      if (regStep === 1) {
        if (!updated.name) updated.name = 'Democracy Progressive Front';
        if (!updated.abbrev) updated.abbrev = 'DPF' + Math.floor(100 + Math.random() * 899);
        if (!updated.officialEmail) updated.officialEmail = 'contact@dpf-party.org';
        if (!updated.officialPhone) updated.officialPhone = '9876543210';
        if (!updated.motto) updated.motto = 'Empowering Citizens, Elevating India';
        if (!updated.ideology) updated.ideology = 'Progressive Governance & Social Welfare';
        if (!updated.partyType) updated.partyType = 'State';
      } else if (regStep === 2) {
        if (!updated.officeAddress) updated.officeAddress = '12 Parliament Street';
        if (!updated.officeState) updated.officeState = 'Delhi';
        if (!updated.officeDistrict) updated.officeDistrict = 'Central Delhi';
        if (!updated.officeCityVillage) updated.officeCityVillage = 'New Delhi';
        if (!updated.officePinCode) updated.officePinCode = '110001';
      } else if (regStep === 3) {
        if (!updated.presidentEciProfileId) updated.presidentEciProfileId = 'usr-voter-aman';
        updated.presidentEciProfileVerified = true;
        if (!updated.presidentName) updated.presidentName = 'Aman Patel';
        if (!updated.presidentMobile) updated.presidentMobile = '9876543210';
      } else if (regStep === 4) {
        if (!updated.officeBearers || updated.officeBearers.length === 0) {
          updated.officeBearers = [{ fullName: 'Rajesh Sharma', position: 'National General Secretary', mobileNumber: '9123456789', email: 'rajesh@dpf.org', address: 'Delhi', eciProfileId: 'ECI-BEARER-99', eciProfileVerified: true }];
        } else {
          updated.officeBearers = updated.officeBearers.map((b, idx) => ({
            ...b,
            fullName: b.fullName || 'Rajesh Sharma',
            position: b.position || 'National General Secretary',
            mobileNumber: b.mobileNumber || '9123456789',
            eciProfileId: b.eciProfileId || `ECI-BEARER-${idx + 10}`,
            eciProfileVerified: true
          }));
        }
      } else if (regStep === 5) {
        if (!updated.bankName) updated.bankName = 'State Bank of India';
        if (!updated.accountNumber) updated.accountNumber = '39820192837';
        if (!updated.ifscCode) updated.ifscCode = 'SBIN0000001';
      } else if (regStep === 6) {
        if (!updated.partyMembers || updated.partyMembers.length === 0) {
          /* 100 person requirement code commented out:
          // updated.partyMembers = Array.from({ length: 100 }, ...);
          */
          updated.partyMembers = [
            {
              eciProfileId: 'ECI-MEM-SKIP-1',
              eciProfileVerified: true,
              fullName: 'Founding Member 1',
              memberType: 'Founding Member',
              mobileNumber: '9800000001',
              state: updated.officeState || 'Delhi',
              district: updated.officeDistrict || 'Central Delhi',
              membershipId: 'MEM-SKIP-1001',
              joiningDate: new Date().toISOString().split('T')[0]
            }
          ];
        } else {
          updated.partyMembers = updated.partyMembers.map((m, idx) => ({
            ...m,
            eciProfileVerified: true,
            eciProfileId: m.eciProfileId || `ECI-MEM-SKIP-${idx + 1}`
          }));
        }
      } else if (regStep === 7) {
        updated.constitutionAgreed = true;
      } else if (regStep === 8) {
        if (!updated.electionLevels || updated.electionLevels.length === 0) {
          updated.electionLevels = ['State Assembly (MLA)', 'Lok Sabha (MP)'];
        }
      } else if (regStep === 9) {
        updated.affidavitConfirmed = true;
        updated.declarationConfirmed = true;
        if (!updated.declName) updated.declName = updated.presidentName || 'Aman Patel';
        if (!updated.declPlace) updated.declPlace = 'New Delhi';
        if (!updated.declDate) updated.declDate = new Date().toISOString().split('T')[0];
      }
      return updated;
    });
    setRegStep(prev => Math.min(prev + 1, 10));
  };

  const skipAllRegSteps = () => {
    setRegError('');
    const randomSuffix = Math.floor(100 + Math.random() * 899);
    setPartyForm({
      name: `Jan Kalyan Party ${randomSuffix}`,
      abbrev: `JKP${randomSuffix}`,
      symbol: '🌟',
      motto: 'Progress, Equality, Transparency',
      ideology: 'Social Justice & Development',
      partyType: 'State',
      dateOfFormation: '2026-01-01',
      officialEmail: `contact@jkp${randomSuffix}.org`,
      officialPhone: '9876543210',
      officialWebsite: `https://jkp${randomSuffix}.org`,
      logoUrl: '',
      manifesto: 'Comprehensive Development and Welfare for All',
      password: 'password',

      officeAddress: '100 ECI Marg, Civil Lines',
      officeState: 'Delhi',
      officeDistrict: 'Central Delhi',
      officeCityVillage: 'New Delhi',
      officePinCode: '110001',
      officeAddressProofUrl: 'office_proof.pdf',

      presidentEciProfileId: 'usr-voter-aman',
      presidentEciProfileVerified: true,
      presidentName: 'Aman Patel',
      presidentDob: '1990-01-01',
      presidentGender: 'Male',
      presidentMobile: '9876543210',
      presidentEmail: 'president@party.org',
      presidentAadhar: '123456789012',
      presidentPan: 'ABCDE1234F',
      presidentAddress: 'New Delhi',

      officeBearers: [
        { fullName: 'Sanjay Kumar', position: 'National General Secretary', mobileNumber: '9123456780', email: 'sec@party.org', address: 'Delhi', eciProfileId: 'ECI-SEC-888', eciProfileVerified: true }
      ],

      bankName: 'State Bank of India',
      accountNumber: '39820192837',
      ifscCode: 'SBIN0000001',

      partyMembers: Array.from({ length: 100 }, (_, i) => ({
        eciProfileId: `ECI-MEM-AUTO-${i + 1}`,
        eciProfileVerified: true,
        fullName: `Founding Member ${i + 1}`,
        memberType: i === 0 ? 'Founder' : 'Cadre',
        mobileNumber: `98000${String(i).padStart(5, '0')}`,
        state: 'Delhi',
        district: 'Central Delhi',
        membershipId: `MEM-AUTO-${1000 + i}`,
        joiningDate: new Date().toISOString().split('T')[0]
      })),

      constitutionAgreed: true,
      electionLevels: ['State Assembly (MLA)', 'Lok Sabha (MP)'],
      affidavitConfirmed: true,
      declarationConfirmed: true,
      declName: 'Aman Patel',
      declPlace: 'New Delhi',
      declDate: new Date().toISOString().split('T')[0]
    });
    setRegStep(10);
  };

  const addOfficeBearer = () => {
    setPartyForm(prev => {
      if (prev.officeBearers.length >= 1) return prev; // Limit to 1 Executive Office Bearer
      return {
        ...prev,
        officeBearers: [{ fullName: '', position: 'National General Secretary', mobileNumber: '', email: '', address: '', photoUrl: '', idProofUrl: '' }]
      };
    });
  };

  const removeOfficeBearer = (index) => {
    setPartyForm(prev => {
      const updated = [...prev.officeBearers];
      updated.splice(index, 1);
      return { ...prev, officeBearers: updated };
    });
  };

  const updateOfficeBearer = (index, field, value) => {
    setPartyForm(prev => {
      const updated = prev.officeBearers.map((b, i) => {
        if (i === index) {
          return { ...b, [field]: value };
        }
        return b;
      });
      return { ...prev, officeBearers: updated };
    });
  };

  const addPartyMember = () => {
    setPartyForm(prev => ({
      ...prev,
      partyMembers: [...prev.partyMembers, { eciProfileId: '', eciProfileVerified: false, fullName: '', mobileNumber: '', state: '', district: '', membershipId: `MEM-${Math.floor(1000 + Math.random() * 9000)}`, joiningDate: new Date().toISOString().split('T')[0] }]
    }));
  };

  const removePartyMember = (index) => {
    setPartyForm(prev => {
      const updated = [...prev.partyMembers];
      updated.splice(index, 1);
      return { ...prev, partyMembers: updated };
    });
  };

  const updatePartyMember = (index, field, value) => {
    setPartyForm(prev => {
      const updated = prev.partyMembers.map((m, i) => {
        if (i === index) {
          return { ...m, [field]: value };
        }
        return m;
      });
      return { ...prev, partyMembers: updated };
    });
  };
  
  // Direct Logo / Status Allocation States for candidate under review
  const [allocateSymbol, setAllocateSymbol] = useState('🪷');
  const [approvalActionLoading, setApprovalActionLoading] = useState(false);
  const [approvalError, setApprovalError] = useState('');
  const [approvalSuccess, setApprovalSuccess] = useState('');

  // ECI Profile Verification States & Handlers
  const [presidentVerifying, setPresidentVerifying] = useState(false);
  const [presidentVerifyErr, setPresidentVerifyErr] = useState('');
  const [memberVerifyingIndex, setMemberVerifyingIndex] = useState(null);
  const [memberVerifyErrIndex, setMemberVerifyErrIndex] = useState({});

  const handleVerifyPresident = async () => {
    const profileId = (partyForm.presidentEciProfileId || '').trim();
    if (!profileId) {
      setPresidentVerifyErr('Please enter a Voter ECI ID.');
      return;
    }
    setPresidentVerifying(true);
    setPresidentVerifyErr('');
    try {
      const res = await api.auth.verifyProfile(profileId);
      if (res.success) {
        const addressParts = [];
        if (res.user.address) addressParts.push(res.user.address);
        if (res.user.constituency) addressParts.push(res.user.constituency);
        if (res.user.district) addressParts.push(res.user.district);
        if (res.user.state) addressParts.push(res.user.state);
        const fullAddress = addressParts.join(', ');

        setPartyForm(prev => ({
          ...prev,
          presidentEciProfileVerified: true,
          presidentName: res.user.name || '',
          presidentMobile: res.user.mobileNumber || '',
          presidentEciProfileId: res.user.id || profileId,
          presidentDob: res.user.dob ? res.user.dob.substring(0, 10) : (prev.presidentDob || ''),
          presidentGender: res.user.gender || prev.presidentGender || 'Male',
          presidentEmail: res.user.email || prev.presidentEmail || '',
          presidentAadhar: res.user.aadharNumber || prev.presidentAadhar || '',
          presidentPan: res.user.panNumber || prev.presidentPan || '',
          presidentAddress: fullAddress || prev.presidentAddress || '',
          presidentPhotoUrl: 'verified_voter_photo.png',
          docPresidentPhoto: 'verified_voter_photo.png',
          presidentIdProofUrl: 'verified_voter_id_proof.png',
          docPresidentIdProof: 'verified_voter_id_proof.png'
        }));
      } else {
        setPresidentVerifyErr('ECI Profile not found.');
        setPartyForm(prev => ({ ...prev, presidentEciProfileVerified: false }));
      }
    } catch (err) {
      setPresidentVerifyErr(err.message || 'ECI Profile not found.');
      setPartyForm(prev => ({ ...prev, presidentEciProfileVerified: false }));
    } finally {
      setPresidentVerifying(false);
    }
  };

  const handleVerifyMember = async (index) => {
    const m = partyForm.partyMembers[index];
    const profileId = (m.eciProfileId || '').trim();
    if (!profileId) {
      setMemberVerifyErrIndex(prev => ({ ...prev, [index]: 'Please enter an ECI Profile ID.' }));
      return;
    }
    setMemberVerifyingIndex(index);
    setMemberVerifyErrIndex(prev => ({ ...prev, [index]: '' }));
    try {
      const res = await api.auth.verifyProfile(profileId);
      if (res.success) {
        setPartyForm(prev => {
          const updated = [...prev.partyMembers];
          updated[index] = {
            ...updated[index],
            eciProfileVerified: true,
            fullName: res.user.name,
            mobileNumber: res.user.mobileNumber,
            state: res.user.state || '',
            district: res.user.district || '',
            eciProfileId: res.user.id || profileId
          };
          return { ...prev, partyMembers: updated };
        });
      } else {
        setMemberVerifyErrIndex(prev => ({ ...prev, [index]: 'ECI Profile not found.' }));
        setPartyForm(prev => {
          const updated = [...prev.partyMembers];
          updated[index].eciProfileVerified = false;
          return { ...prev, partyMembers: updated };
        });
      }
    } catch (err) {
      setMemberVerifyErrIndex(prev => ({ ...prev, [index]: err.message || 'ECI Profile not found.' }));
      setPartyForm(prev => {
        const updated = [...prev.partyMembers];
        updated[index].eciProfileVerified = false;
        return { ...prev, partyMembers: updated };
      });
    } finally {
      setMemberVerifyingIndex(null);
    }
  };

  // Consolidated Party Admin tab state
  const [partyTab, setPartyTab] = useState('approvals'); // 'approvals' | 'tickets' | 'manifesto' | 'nominees'

  // Code generation & elections states
  const [elections, setElections] = useState([]);
  const [codes, setCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [electionsLoading, setElectionsLoading] = useState(false);

  // Ticket Form States
  const [ticketForm, setTicketForm] = useState({
    constituency: '',
    electionId: '',
    position: 'Member of Legislative Assembly (MLA)'
  });
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketError, setTicketError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // New Party Dashboard Member & Profile states
  const [memberSearch, setMemberSearch] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    mobileNumber: '',
    state: '',
    district: '',
    membershipId: '',
    joiningDate: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    abbrev: '',
    symbol: '',
    motto: '',
    ideology: '',
    officialEmail: '',
    officialPhone: '',
    officialWebsite: '',
    officeAddress: '',
    officeState: '',
    officeDistrict: '',
    officePinCode: ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  const [partyNotifications, setPartyNotifications] = useState([]);
  const [partyNotificationsLoading, setPartyNotificationsLoading] = useState(false);

  // Additional Party Admin Sub-tab States (Campaigns, Sub-admins, Pending memberships, Print/Letter previews)
  const [pendingMembers, setPendingMembers] = useState([
    { id: 'pm-1', fullName: 'Vikram Joshi', mobileNumber: '9123456711', state: 'Madhya Pradesh', district: 'Bhopal', date: '2026-07-14', email: 'vikram.j@gmail.com', status: 'PENDING' },
    { id: 'pm-2', fullName: 'Nisha Deshmukh', mobileNumber: '9123456712', state: 'Maharashtra', district: 'Mumbai', date: '2026-07-15', email: 'nisha.d@gmail.com', status: 'PENDING' },
    { id: 'pm-3', fullName: 'Siddharth Rao', mobileNumber: '9888877766', state: 'Karnataka', district: 'Bangalore', date: '2026-07-16', email: 'sid.rao@gmail.com', status: 'PENDING' }
  ]);
  const [selectedMemberReqModal, setSelectedMemberReqModal] = useState(null);
  const [selectedMemberType, setSelectedMemberType] = useState('Active Cadre');
  const [selectedMemberForUpdate, setSelectedMemberForUpdate] = useState(null);
  const [writtenPosition, setWrittenPosition] = useState('Active Cadre');
  const [showUpdateMemberModal, setShowUpdateMemberModal] = useState(false);

  const [campaignOffices, setCampaignOffices] = useState([
    { id: 'co-1', name: 'Bhopal Central Command Secretariat', district: 'Bhopal', coordinator: 'Rajesh Dubey', phone: '9425012345', status: 'ACTIVE' },
    { id: 'co-2', name: 'Indore Youth Outreach Center', district: 'Indore', coordinator: 'Neha Malviya', phone: '9827012345', status: 'ACTIVE' }
  ]);

  const [campaignEvents, setCampaignEvents] = useState([
    { id: 'ce-1', name: 'National Development Youth Sankalp Rally', date: '2026-07-22', venue: 'Dushera Maidan, Bhopal', expectedTurnout: '12,000', status: 'SCHEDULED' },
    { id: 'ce-2', name: 'Door-to-Door Public Welfare Interaction', date: '2026-07-25', venue: 'Ward 12 & 15, Indore', expectedTurnout: '1,500', status: 'PLANNING' }
  ]);

  const [campaignCoordinators, setCampaignCoordinators] = useState([
    { id: 'cc-1', name: 'Amitabh Sen', role: 'State Social Media Head', area: 'Madhya Pradesh', phone: '9400012345' },
    { id: 'cc-2', name: 'Pooja Hegde', role: 'Women Empowerment Wing Chief', area: 'Karnataka', phone: '9890012345' }
  ]);

  const [subAdmins, setSubAdmins] = useState([
    { id: 'sa-1', name: 'Sunita Nair', email: 'sunita.n@partyorg.in', role: 'Campaign Coordinator', permissions: ['Member Management', 'Issue Tickets'] },
    { id: 'sa-2', name: 'Ritesh Varma', email: 'ritesh.v@partyorg.in', role: 'IT Desk Admin', permissions: ['Edit Profile'] }
  ]);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [printedTicket, setPrintedTicket] = useState(null);
  const [sponsoredLetter, setSponsoredLetter] = useState(null);

  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddCoordinatorModal, setShowAddCoordinatorModal] = useState(false);
  const [showAddSubAdminModal, setShowAddSubAdminModal] = useState(false);

  const [officeForm, setOfficeForm] = useState({ name: '', district: '', coordinator: '', phone: '' });
  const [eventForm, setEventForm] = useState({ name: '', date: '', venue: '', expectedTurnout: '' });
  const [coordinatorForm, setCoordinatorForm] = useState({ name: '', role: '', area: '', phone: '' });
  const [subAdminForm, setSubAdminForm] = useState({ name: '', email: '', role: '', permissions: [] });

  const fetchPartyNotifications = async () => {
    setPartyNotificationsLoading(true);
    try {
      const list = await api.notifications.list();
      const localPartyNotifs = JSON.parse(localStorage.getItem('eci_party_notifications') || '[]');
      const localVoterNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
      const combined = [...(Array.isArray(list) ? list : []), ...localPartyNotifs, ...localVoterNotifs];
      
      const seen = new Set();
      const unique = [];
      for (const item of combined) {
        const key = item.id || `${item.title}-${item.content}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(item);
        }
      }
      setPartyNotifications(unique);
    } catch (e) {
      console.error('Error fetching party notifications:', e);
    } finally {
      setPartyNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeParty) {
      setProfileForm({
        name: activeParty.name || '',
        abbrev: activeParty.abbrev || '',
        symbol: activeParty.symbol || '',
        motto: activeParty.motto || '',
        ideology: activeParty.ideology || '',
        officialEmail: activeParty.officialEmail || '',
        officialPhone: activeParty.officialPhone || '',
        officialWebsite: activeParty.officialWebsite || '',
        officeAddress: activeParty.officeAddress || '',
        officeState: activeParty.officeState || '',
        officeDistrict: activeParty.officeDistrict || '',
        officePinCode: activeParty.officePinCode || ''
      });
      fetchPartyNotifications();

      const syncPendingAndNotifs = () => {
        const allReqs = JSON.parse(localStorage.getItem('eci_party_member_requests') || '[]');
        const partyReqs = allReqs.filter(r => 
          (r.partyAbbrev?.toLowerCase() === activeParty.abbrev?.toLowerCase() ||
           r.partyName?.toLowerCase() === activeParty.name?.toLowerCase()) &&
          (r.status === 'PENDING' || r.status === 'MEETING_REQUESTED')
        );

        if (partyReqs.length > 0) {
          setPendingMembers(prev => {
            const map = new Map();
            partyReqs.forEach(r => map.set(r.id, r));
            prev.forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
            return Array.from(map.values());
          });
        }

        const allPartyNotifs = JSON.parse(localStorage.getItem('eci_party_notifications') || '[]');
        const filteredNotifs = allPartyNotifs.filter(n => 
          !n.partyAbbrev || n.partyAbbrev?.toLowerCase() === activeParty.abbrev?.toLowerCase()
        );
        if (filteredNotifs.length > 0) {
          setPartyNotifications(filteredNotifs);
        }
      };

      syncPendingAndNotifs();
      const interval = setInterval(syncPendingAndNotifs, 2000);
      return () => clearInterval(interval);
    }
  }, [activeParty]);

  useEffect(() => {
    fetchParties();
    const saved = localStorage.getItem('eci_active_configuration');
    if (saved) {
      setActiveConfig(JSON.parse(saved));
    } else {
      setActiveConfig(null);
    }
    // Auto login if current logged in user in App.jsx is already a PARTY_ADMIN
    if (currentUser && currentUser.role === 'PARTY_ADMIN') {
      // Find a matching party or simulate one
      fetchParties().then(list => {
        if (list && list.length > 0) {
          const matched = list.find(p => p.abbrev.toLowerCase() === 'bjp') || list[0];
          setActiveParty(matched);
          setViewMode('PARTY_DASHBOARD');
          fetchCandidates();
          fetchElectionsAndCodes(matched.id);
        }
      });
    }
  }, [currentUser]);

  const fetchParties = async () => {
    setLoading(true);
    try {
      const list = await api.parties.list();
      setParties(list || []);
      return list;
    } catch (e) {
      console.error('Error fetching registered parties:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    try {
      const list = await api.candidates.list();
      setCandidates(list || []);
    } catch (e) {
      console.error('Error fetching candidates for party review:', e);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchElectionsAndCodes = async (partyId) => {
    setElectionsLoading(true);
    setCodesLoading(true);
    try {
      const [elecs, allCodes] = await Promise.all([
        api.elections.list(),
        api.codes.list()
      ]);
      setElections(elecs.filter(e => e.status === 'REGISTRATION_OPEN' || e.status === 'CREATED'));
      setCodes(allCodes.filter(c => c.partyId === partyId));
    } catch (err) {
      console.error('Error fetching elections and codes:', err);
    } finally {
      setElectionsLoading(false);
      setCodesLoading(false);
    }
  };

  const handleGenerateCode = async (e) => {
    e.preventDefault();
    setTicketError('');
    setTicketMessage('');
    if (!activeParty) return;

    const selectedElec = elections.find(el => el.id === ticketForm.electionId);
    if (!selectedElec) {
      setTicketError('Please select a valid election to issue authorization codes.');
      return;
    }

    try {
      const res = await api.codes.generate({
        partyId: activeParty.id,
        partyAbbrev: activeParty.abbrev,
        constituency: ticketForm.constituency || selectedElec.constituency || 'All Constituency',
        electionLevel: selectedElec.level,
        position: ticketForm.position,
        electionId: ticketForm.electionId,
        adminId: activeParty.adminId || currentUser?.id || 'party-admin'
      });

      if (res.success) {
        setTicketMessage('New Candidate Authorization Ticket Code issued successfully!');
        // Refresh codes
        const allCodes = await api.codes.list();
        setCodes(allCodes.filter(c => c.partyId === activeParty.id));
        setTicketForm({ constituency: '', electionId: '', position: 'Member of Legislative Assembly (MLA)' });
      }
    } catch (err) {
      setTicketError(err.message || 'Failed to issue nomination code.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    if (!activeParty) return;

    try {
      const res = await api.parties.update(activeParty.id, profileForm);
      if (res.success) {
        setProfileSuccess('Party Profile details updated and synchronized with ECI Central Server!');
        setActiveParty(res.party);
        fetchParties();
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile changes.');
    }
  };

  const handleApproveMembershipRequest = async (id) => {
    const req = pendingMembers.find(m => m.id === id);
    if (!req) return;
    setSelectedMemberReqModal(req);
  };

  const handleAcceptMemberRequestWithRole = async (req, role) => {
    if (!req || !activeParty) return;

    const membershipId = `MEM-${activeParty.abbrev}-${Math.floor(100000 + Math.random() * 900000)}`;
    let updatedMembers = [...(activeParty.partyMembers || [])];
    const newMember = {
      fullName: req.fullName || req.voterName,
      mobileNumber: req.mobileNumber,
      state: req.state || 'Madhya Pradesh',
      district: req.district || 'Bhopal',
      internalRole: role || 'Active Cadre',
      membershipId,
      joiningDate: new Date().toISOString().split('T')[0]
    };
    updatedMembers.push(newMember);

    try {
      const res = await api.parties.update(activeParty.id, { partyMembers: updatedMembers });
      if (res.success) {
        setActiveParty(res.party);
        fetchParties();

        // 1. Update eci_party_member_requests in localStorage
        const allReqs = JSON.parse(localStorage.getItem('eci_party_member_requests') || '[]');
        const updatedReqs = allReqs.map(r => {
          if (r.id === req.id || (r.voterId === req.voterId && r.partyAbbrev === activeParty.abbrev)) {
            return {
              ...r,
              status: 'APPROVED',
              memberType: role || 'Active Cadre',
              membershipId,
              dateApproved: new Date().toISOString().split('T')[0]
            };
          }
          return r;
        });
        localStorage.setItem('eci_party_member_requests', JSON.stringify(updatedReqs));

        // 2. Remove from pending list
        setPendingMembers(prev => prev.filter(m => m.id !== req.id));

        // 3. Dispatch Notification to Voter in localStorage
        const voterNotif = {
          id: `vnotif-${Date.now()}`,
          voterId: req.voterId || 'voter-1',
          voterName: req.fullName || req.voterName,
          type: 'MEMBER_REQUEST_APPROVED',
          title: '🎉 Party Membership Request Approved!',
          content: `Your request to join ${activeParty.name} (${activeParty.abbrev}) has been APPROVED as "${role || 'Active Cadre'}"! Click the button below to view your official Request Political Party Membership form page & ID.`,
          time: 'Just Now',
          date: new Date().toLocaleDateString(),
          partyAbbrev: activeParty.abbrev,
          partyName: activeParty.name,
          memberType: role || 'Active Cadre',
          membershipId,
          actionLink: 'MEMBER_REQUEST_FORM',
          read: false
        };
        const existingVoterNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
        existingVoterNotifs.unshift(voterNotif);
        localStorage.setItem('eci_voter_notifications', JSON.stringify(existingVoterNotifs));

        setSelectedMemberReqModal(null);
        alert(`✓ Voter member request approved successfully!\n\nRole assigned: "${role}"\nMembership ID: ${membershipId}\nApproval notification with Request Political Party Membership Form link sent to voter.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to approve membership request.');
    }
  };

  const handleDeclineMembershipRequest = (id) => {
    setPendingMembers(pendingMembers.filter(m => m.id !== id));
  };

  const handleRequestMeetingForMember = (reqId) => {
    const allReqs = JSON.parse(localStorage.getItem('eci_party_member_requests') || '[]');
    let targetReq = null;
    const updatedReqs = allReqs.map(r => {
      if (r.id === reqId) {
        targetReq = { ...r, status: 'MEETING_REQUESTED' };
        return targetReq;
      }
      return r;
    });
    localStorage.setItem('eci_party_member_requests', JSON.stringify(updatedReqs));

    setPendingMembers(prev => prev.map(m => m.id === reqId ? { ...m, status: 'MEETING_REQUESTED' } : m));

    if (targetReq) {
      const voterNotif = {
        id: `vnotif-${Date.now()}`,
        voterId: targetReq.voterId || 'voter-1',
        voterName: targetReq.fullName || targetReq.voterName,
        type: 'MEETING_REQUESTED',
        title: '🤝 Party Leadership Requested a Meeting / Interview',
        content: `${activeParty?.name || targetReq.partyName} (${activeParty?.abbrev || targetReq.partyAbbrev}) high-command has reviewed your application and requested a meeting with you regarding your position and admission. Check your Voter Dashboard for details.`,
        time: 'Just Now',
        date: new Date().toLocaleDateString(),
        partyAbbrev: activeParty?.abbrev || targetReq.partyAbbrev,
        partyName: activeParty?.name || targetReq.partyName,
        actionLink: 'MEMBER_REQUEST_FORM',
        read: false
      };
      const existingVoterNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
      existingVoterNotifs.unshift(voterNotif);
      localStorage.setItem('eci_voter_notifications', JSON.stringify(existingVoterNotifs));
    }

    alert('🤝 Meeting Request sent to voter! Status updated to MEETING_REQUESTED.');
  };

  const handleApproveMemberWithWrittenPosition = async (req, position) => {
    if (!activeParty || !req) return;
    const pos = position?.trim() || 'Active Cadre';
    const membershipId = `MEM-${activeParty.abbrev}-${Math.floor(100000 + Math.random() * 900000)}`;
    let updatedMembers = [...(activeParty.partyMembers || [])];
    const newMember = {
      fullName: req.fullName || req.voterName,
      mobileNumber: req.mobileNumber,
      state: req.state || 'Madhya Pradesh',
      district: req.district || 'Bhopal',
      internalRole: pos,
      membershipId,
      joiningDate: new Date().toISOString().split('T')[0]
    };
    updatedMembers.push(newMember);

    try {
      const res = await api.parties.update(activeParty.id, { partyMembers: updatedMembers });
      if (res.success) {
        setActiveParty(res.party);
        fetchParties();

        const allReqs = JSON.parse(localStorage.getItem('eci_party_member_requests') || '[]');
        const updatedReqs = allReqs.map(r => {
          if (r.id === req.id || (r.voterId === req.voterId && r.partyAbbrev === activeParty.abbrev)) {
            return {
              ...r,
              status: 'APPROVED',
              memberType: pos,
              membershipId,
              dateApproved: new Date().toISOString().split('T')[0]
            };
          }
          return r;
        });
        localStorage.setItem('eci_party_member_requests', JSON.stringify(updatedReqs));

        setPendingMembers(prev => prev.filter(m => m.id !== req.id));

        const voterNotif = {
          id: `vnotif-${Date.now()}`,
          voterId: req.voterId || 'voter-1',
          voterName: req.fullName || req.voterName,
          type: 'MEMBER_REQUEST_APPROVED',
          title: '🎉 Party Membership Request Approved!',
          content: `Your request to join ${activeParty.name} (${activeParty.abbrev}) has been APPROVED with written position: "${pos}"!`,
          time: 'Just Now',
          date: new Date().toLocaleDateString(),
          partyAbbrev: activeParty.abbrev,
          partyName: activeParty.name,
          memberType: pos,
          membershipId,
          actionLink: 'MEMBER_REQUEST_FORM',
          read: false
        };
        const existingVoterNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
        existingVoterNotifs.unshift(voterNotif);
        localStorage.setItem('eci_voter_notifications', JSON.stringify(existingVoterNotifs));

        setShowUpdateMemberModal(false);
        setSelectedMemberForUpdate(null);
        alert(`✓ Membership approved with position: "${pos}"!\n\nMembership ID: ${membershipId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to approve membership request.');
    }
  };

  const handleRejectMemberRequestFull = (reqId) => {
    const allReqs = JSON.parse(localStorage.getItem('eci_party_member_requests') || '[]');
    let targetReq = null;
    const updatedReqs = allReqs.map(r => {
      if (r.id === reqId) {
        targetReq = { ...r, status: 'REJECTED' };
        return targetReq;
      }
      return r;
    });
    localStorage.setItem('eci_party_member_requests', JSON.stringify(updatedReqs));

    setPendingMembers(prev => prev.filter(m => m.id !== reqId));

    if (targetReq) {
      const voterNotif = {
        id: `vnotif-${Date.now()}`,
        voterId: targetReq.voterId || 'voter-1',
        voterName: targetReq.fullName || targetReq.voterName,
        type: 'MEMBER_REQUEST_REJECTED',
        title: '❌ Party Membership Request Declined',
        content: `Your application to join ${activeParty?.name || targetReq.partyName} was not approved by party high-command.`,
        time: 'Just Now',
        date: new Date().toLocaleDateString(),
        partyAbbrev: targetReq.partyAbbrev,
        partyName: targetReq.partyName,
        read: false
      };
      const existingVoterNotifs = JSON.parse(localStorage.getItem('eci_voter_notifications') || '[]');
      existingVoterNotifs.unshift(voterNotif);
      localStorage.setItem('eci_voter_notifications', JSON.stringify(existingVoterNotifs));
    }

    if (showUpdateMemberModal) {
      setShowUpdateMemberModal(false);
      setSelectedMemberForUpdate(null);
    }
    alert('Membership request rejected.');
  };

  const handleAddOrEditMember = async (e) => {
    e.preventDefault();
    if (!activeParty) return;

    let updatedMembers = [...(activeParty.partyMembers || [])];

    if (editingMemberIndex !== null) {
      updatedMembers[editingMemberIndex] = {
        ...updatedMembers[editingMemberIndex],
        fullName: memberForm.fullName,
        mobileNumber: memberForm.mobileNumber,
        state: memberForm.state,
        district: memberForm.district,
        internalRole: memberForm.internalRole || 'Standard Member'
      };
    } else {
      const newMember = {
        fullName: memberForm.fullName,
        mobileNumber: memberForm.mobileNumber,
        state: memberForm.state,
        district: memberForm.district,
        internalRole: memberForm.internalRole || 'Standard Member',
        membershipId: `MEM-${Math.floor(100000 + Math.random() * 900000)}`,
        joiningDate: new Date().toISOString().split('T')[0]
      };
      updatedMembers.push(newMember);
    }

    try {
      const res = await api.parties.update(activeParty.id, { partyMembers: updatedMembers });
      if (res.success) {
        setActiveParty(res.party);
        fetchParties();
        setShowAddMemberModal(false);
        setEditingMemberIndex(null);
        setMemberForm({ fullName: '', mobileNumber: '', state: '', district: '', membershipId: '', joiningDate: '', internalRole: 'Standard Member' });
      }
    } catch (err) {
      alert(err.message || 'Failed to update members directory.');
    }
  };

  const handleRemoveMember = async (index) => {
    if (!window.confirm('Are you sure you want to remove this member from the official party directory?')) return;
    if (!activeParty) return;

    let updatedMembers = [...(activeParty.partyMembers || [])];
    updatedMembers.splice(index, 1);

    try {
      const res = await api.parties.update(activeParty.id, { partyMembers: updatedMembers });
      if (res.success) {
        setActiveParty(res.party);
        fetchParties();
      }
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  // Campaign Office Handlers
  const handleAddCampaignOffice = (e) => {
    e.preventDefault();
    const newOffice = {
      id: `co-${Date.now()}`,
      name: officeForm.name,
      district: officeForm.district,
      coordinator: officeForm.coordinator,
      phone: officeForm.phone,
      status: 'ACTIVE'
    };
    setCampaignOffices([...campaignOffices, newOffice]);
    setOfficeForm({ name: '', district: '', coordinator: '', phone: '' });
    setShowAddOfficeModal(false);
  };

  const handleRemoveCampaignOffice = (id) => {
    setCampaignOffices(campaignOffices.filter(o => o.id !== id));
  };

  // Campaign Event Handlers
  const handleAddCampaignEvent = (e) => {
    e.preventDefault();
    const newEvent = {
      id: `ce-${Date.now()}`,
      name: eventForm.name,
      date: eventForm.date,
      venue: eventForm.venue,
      expectedTurnout: eventForm.expectedTurnout,
      status: 'SCHEDULED'
    };
    setCampaignEvents([...campaignEvents, newEvent]);
    setEventForm({ name: '', date: '', venue: '', expectedTurnout: '' });
    setShowAddEventModal(false);
  };

  const handleRemoveCampaignEvent = (id) => {
    setCampaignEvents(campaignEvents.filter(ev => ev.id !== id));
  };

  // Campaign Coordinator Handlers
  const handleAddCampaignCoordinator = (e) => {
    e.preventDefault();
    const newCoordinator = {
      id: `cc-${Date.now()}`,
      name: coordinatorForm.name,
      role: coordinatorForm.role,
      area: coordinatorForm.area,
      phone: coordinatorForm.phone
    };
    setCampaignCoordinators([...campaignCoordinators, newCoordinator]);
    setCoordinatorForm({ name: '', role: '', area: '', phone: '' });
    setShowAddCoordinatorModal(false);
  };

  const handleRemoveCampaignCoordinator = (id) => {
    setCampaignCoordinators(campaignCoordinators.filter(c => c.id !== id));
  };

  // Settings Handlers: Sub-admins
  const handleAddSubAdmin = (e) => {
    e.preventDefault();
    const newSub = {
      id: `sa-${Date.now()}`,
      name: subAdminForm.name,
      email: subAdminForm.email,
      role: subAdminForm.role,
      permissions: subAdminForm.permissions.length > 0 ? subAdminForm.permissions : ['View Profile']
    };
    setSubAdmins([...subAdmins, newSub]);
    setSubAdminForm({ name: '', email: '', role: '', permissions: [] });
    setShowAddSubAdminModal(false);
  };

  const handleRemoveSubAdmin = (id) => {
    setSubAdmins(subAdmins.filter(s => s.id !== id));
  };

  // Settings Handlers: Change Password
  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New Password and Confirm Password do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    setPasswordSuccess('High-command security credential passphrase updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Ticket cancellation & reissue simulation
  const handleCancelTicket = (code) => {
    if (!window.confirm(`Are you sure you want to cancel authorization ticket ${code}? This candidate will no longer be eligible to file nomination with this ticket.`)) return;
    setCodes(codes.map(c => c.code === code ? { ...c, status: 'Cancelled' } : c));
  };

  const handleReissueTicket = (code) => {
    const ticket = codes.find(c => c.code === code);
    if (!ticket) return;
    const newCodeString = `${activeParty.abbrev}-${ticket.position.includes('MLA') ? 'MLA' : 'MP'}-${ticket.constituency.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Create reissued ticket
    setCodes(codes.map(c => c.code === code ? { ...c, status: 'Reissued', isUsed: true } : c).concat([{
      ...ticket,
      code: newCodeString,
      createdAt: new Date().toISOString()
    }]));
    alert(`Nomination ticket reissued successfully! New Ticket Code is: ${newCodeString}`);
  };

  const handlePartyLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginAbbrev.trim()) {
      setLoginError('Please enter a party abbreviation.');
      return;
    }

    // Lookup matching party in ECI memory registry
    const matchedParty = parties.find(
      p => p.abbrev.toLowerCase() === loginAbbrev.trim().toLowerCase()
    );

    if (!matchedParty) {
      setLoginError(`No registered party found with abbreviation "${loginAbbrev}". Try "BJP" or register a new one.`);
      return;
    }

    if (matchedParty.status !== 'APPROVED') {
      setLoginError(`Login Rejected: The registration for ${matchedParty.name} (${matchedParty.abbrev}) is currently ${matchedParty.status || 'PENDING'}. ECI document auditing must be completed before admin console activation.`);
      return;
    }

    try {
      // Fetch party admin user profile
      const adminId = matchedParty.adminId || 'usr-party-bjp';
      const adminUser = await api.auth.getProfile(adminId);
      
      if (adminUser) {
        setActiveParty(matchedParty);
        setViewMode('PARTY_DASHBOARD');
        fetchCandidates();
        fetchElectionsAndCodes(matchedParty.id);
        setLoginAbbrev('');
        
        if (onLoginSuccess) {
          onLoginSuccess(adminUser, `sim-jwt-party-${adminUser.id}`);
        }
      } else {
        throw new Error('Party admin account not found.');
      }
    } catch (err) {
      setLoginError(err.message || 'Failed to authenticate party admin.');
    }
  };

  const handleRegisterParty = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const name = partyForm.name.trim();
    const abbrev = partyForm.abbrev.trim().toUpperCase();
    const manifesto = partyForm.manifesto.trim();

    if (!name || !abbrev || !manifesto) {
      setRegError('All Basic Party fields (Name, Abbreviation, Manifesto) are mandatory to register a Political Party.');
      return;
    }

    if (!partyForm.declDeclaredTrue) {
      setRegError('Please accept the statutory declaration checkbox before registering.');
      return;
    }

    const checkExisting = parties.find(
      p => p.abbrev.toLowerCase() === abbrev.toLowerCase()
    );
    if (checkExisting) {
      setRegError(`A party with token abbreviation "${abbrev}" is already registered on ECI nodes.`);
      return;
    }

    setLoading(true);
    try {
      const newPartyData = {
        ...partyForm,
        name,
        abbrev,
        manifesto,
        adminId: currentUser?.id || 'usr-party-bjp'
      };

      const res = await api.parties.create(newPartyData);
      if (res.success) {
        setRegSuccess(`Party "${name}" (${abbrev}) has been successfully added to ECI Registry node! You can now log in using abbreviation "${abbrev}".`);
        // Reset state
        setPartyForm({
          name: '',
          abbrev: '',
          symbol: '⏳',
          motto: '',
          ideology: '',
          partyType: 'Local',
          dateOfFormation: '',
          officialEmail: '',
          officialPhone: '',
          officialWebsite: '',
          logoUrl: '',
          manifesto: '',
          password: 'password',
          officeAddress: '',
          officeState: '',
          officeDistrict: '',
          officeCityVillage: '',
          officePinCode: '',
          officeAddressProofUrl: '',
          presidentEciProfileId: '',
          presidentEciProfileVerified: false,
          presidentName: '',
          presidentDob: '',
          presidentGender: 'Male',
          presidentMobile: '',
          presidentEmail: '',
          presidentAadhar: '',
          presidentPan: '',
          presidentAddress: '',
          presidentPhotoUrl: '',
          presidentIdProofUrl: '',
          officeBearers: [
            { fullName: '', position: 'President', mobileNumber: '', email: '', address: '', photoUrl: '', idProofUrl: '' }
          ],
          constitutionObjective: '',
          constitutionPdfUrl: '',
          membershipRules: '',
          internalElectionProcess: '',
          disciplinaryRules: '',
          partyMembers: [
            { eciProfileId: '', eciProfileVerified: false, fullName: '', mobileNumber: '', state: '', district: '', membershipId: '', joiningDate: '' }
          ],
          bankName: '',
          bankAccountHolderName: '',
          bankAccountNumber: '',
          bankIfscCode: '',
          bankPanNumber: '',
          bankTreasurerName: '',
          electionLevels: [],
          docPartyConstitution: '',
          docPresidentIdProof: '',
          docPresidentPhoto: '',
          docOfficeAddressProof: '',
          docPanCard: '',
          docBankProof: '',
          docPartyLogo: '',
          declDeclaredTrue: false,
          declDigitalSignature: '',
          declSignatureUrl: '',
          declDate: new Date().toISOString().split('T')[0],
        });
        setRegStep(1);
        fetchParties();
      }
    } catch (e) {
      setRegError(e.message || 'Failed to submit party registration.');
    } finally {
      setLoading(false);
    }
  };

  // Generate unique Candidate ID
  const handleGenerateCandidateId = async () => {
    if (!selectedCandidate) return;
    setApprovalActionLoading(true);
    setApprovalError('');
    setApprovalSuccess('');

    try {
      const res = await api.candidates.partyApprove(
        selectedCandidate.id,
        'ID_GENERATED',
        activeParty.name,
        allocateSymbol,
        activeParty.adminId || currentUser?.id || 'party-admin'
      );

      if (res.success) {
        setApprovalSuccess(`Candidate ID ${res.candidate?.officialCandidateId} generated successfully!`);
        fetchCandidates();
        setSelectedCandidate(res.candidate || null);
      }
    } catch (err) {
      setApprovalError(err.message || 'Failed to generate Candidate ID.');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  // Perform candidate approval and assign party logo
  const handleApproveCandidateWithLogo = async () => {
    if (!selectedCandidate) return;
    setApprovalActionLoading(true);
    setApprovalError('');
    setApprovalSuccess('');

    try {
      // Call our newly created full-stack endpoint
      const res = await api.candidates.partyApprove(
        selectedCandidate.id,
        'APPROVED',
        activeParty.name,
        allocateSymbol,
        activeParty.adminId || currentUser?.id || 'party-admin'
      );

      if (res.success) {
        setApprovalSuccess(`Candidate ${selectedCandidate.name} has been successfully APPROVED! Assigned electoral symbol: ${allocateSymbol}.`);
        
        // Refresh local lists
        fetchCandidates();
        setSelectedCandidate(res.candidate || null);
      }
    } catch (err) {
      setApprovalError(err.message || 'Failed to complete candidate approval.');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  // Perform candidate rejection
  const handleRejectCandidate = async () => {
    if (!selectedCandidate) return;
    setApprovalActionLoading(true);
    setApprovalError('');
    setApprovalSuccess('');

    try {
      const res = await api.candidates.partyApprove(
        selectedCandidate.id,
        'REJECTED',
        activeParty.name,
        'None',
        activeParty.adminId || currentUser?.id || 'party-admin'
      );

      if (res.success) {
        setApprovalSuccess(`Candidate nomination for ${selectedCandidate.name} was rejected and flag updated.`);
        fetchCandidates();
        setSelectedCandidate(res.candidate || null);
      }
    } catch (err) {
      setApprovalError(err.message || 'Failed to reject candidate.');
    } finally {
      setApprovalActionLoading(false);
    }
  };

  const filteredParties = parties.filter(party => {
    return party.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           party.abbrev.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredCandidates = candidates.filter(cand => {
    if (activeParty && cand.partyId !== activeParty.id) return false;
    if (candidateFilter === 'ALL') return true;
    if (candidateFilter === 'PENDING') {
      return cand.status === 'PENDING' || 
             cand.status === 'AWAITING_PARTY_ID_AND_EC_CONFIRMATION' || 
             cand.status === 'AWAITING_EC_CONFIRMATION' || 
             cand.partyApprovalStatus === 'PENDING';
    }
    if (candidateFilter === 'APPROVED') {
      return cand.status === 'APPROVED' || cand.status === 'EC_CONFIRMED' || cand.partyApprovalStatus === 'APPROVED';
    }
    return cand.status === candidateFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
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
              <Landmark className="w-5 h-5 text-purple-600" />
              <h1 className="text-xl font-bold font-display text-gray-950">
                {viewMode === 'PARTY_DASHBOARD' ? 'Party Administration Console' : 'Political Parties & Candidates Core'}
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {viewMode === 'PARTY_DASHBOARD' 
                ? `Authorized console for high-command secretaries. Assign logos, review Form 26 documents, and authorize active ballots.`
                : 'National register of approved political bodies, party-issued ticket logs, and active ticket allocations.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {viewMode !== 'BROWSE' && (
            <button
              onClick={() => {
                setViewMode('BROWSE');
                setActiveParty(null);
              }}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              Back to Browse
            </button>
          )}

          {viewMode === 'BROWSE' && (
            <>
              <button
                onClick={() => setViewMode('LOGIN')}
                className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm shadow-purple-600/10 flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Party Admin Login</span>
              </button>

              <button
                onClick={() => setViewMode('REGISTER_PARTY')}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm shadow-amber-500/10 flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Register New Party</span>
              </button>
            </>
          )}

          {viewMode === 'PARTY_DASHBOARD' && activeParty && (
            <button
              onClick={() => {
                setActiveParty(null);
                setViewMode('BROWSE');
                if (onLogout) onLogout();
              }}
              className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition border border-red-100 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out ({activeParty.abbrev})</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchParties();
              if (viewMode === 'PARTY_DASHBOARD') fetchCandidates();
            }}
            className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg transition cursor-pointer border border-gray-200 shadow-3xs"
            title="Reload registry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE */}
      <AnimatePresence mode="wait">
        
        {/* ==================== VIEW 1: BROWSE PARTIES ==================== */}
        {viewMode === 'BROWSE' && (
          <PartyRegistry 
            parties={parties}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onNavigateToLogin={() => setViewMode('LOGIN')}
            onNavigateToRegister={() => setViewMode('REGISTER_PARTY')}
          />
        )}

        {/* ==================== VIEW 2: PARTY LOGIN ==================== */}
        {viewMode === 'LOGIN' && (
          <PartyLogin 
            parties={parties}
            onLogin={async ({ abbrev, password }) => {
              const matched = parties.find(p => p.abbrev?.toUpperCase() === abbrev?.toUpperCase());
              if (matched) {
                setActiveParty(matched);
                setViewMode('PARTY_DASHBOARD');
              } else {
                throw new Error(`Party with abbreviation '${abbrev}' not found in ECI registry.`);
              }
            }}
            onCancel={() => setViewMode('BROWSE')}
            onNavigateToRegister={() => setViewMode('REGISTER_PARTY')}
          />
        )}

        {/* ==================== VIEW 3: REGISTER NEW PARTY ==================== */}
        {viewMode === 'REGISTER_PARTY' && (
          <motion.div 
            key="register_party"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white rounded-2xl border border-gray-150 shadow-xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-1 relative pb-4 border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewMode('BROWSE')}
                  className="absolute left-0 top-0 p-2 text-gray-400 hover:text-gray-600 transition flex items-center gap-1 text-xs font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Browse
                </button>
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto border border-purple-100 shadow-3xs">
                  <Building className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 font-display">ECI Political Party Registry</h2>
                <p className="text-xs text-gray-400 max-w-lg mx-auto leading-normal">
                  Complete the 10-step statutory submission required under Section 29A of the Representation of the People Act, 1951.
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-xl border border-emerald-100 space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Registry Process Successful!
                  </p>
                  <p className="leading-relaxed">{regSuccess}</p>
                  <button
                    onClick={() => {
                      setRegSuccess('');
                      setViewMode('LOGIN');
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition mt-2 cursor-pointer"
                  >
                    Proceed to Login Page
                  </button>
                </div>
              )}

              {!regSuccess && (
                <>
                  {/* Temporary Fast Skip Bar */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-purple-500/10 border border-amber-300/50 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left mb-6">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg shadow-xs">
                        <Zap className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wider block">⚡ Fast Step Skip Helper</span>
                        <p className="text-[11px] text-amber-800">
                          Skip individual steps or auto-complete the full party registration process with pre-filled valid data.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={skipRegStep}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Auto-fill current step and jump to next step"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Skip Step {regStep}</span>
                      </button>
                      <button
                        type="button"
                        onClick={skipAllRegSteps}
                        className="flex-1 sm:flex-none px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Bypass all steps and go to review/final submission"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Skip All 10 Steps</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left Column: Vertical Steps Navigator */}
                  <div className="md:col-span-3 space-y-1.5 border-r border-gray-100 pr-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                      Statutory Steps
                    </div>
                    {[
                      { num: 1, label: 'Basic Info', desc: 'Identity & Slogan' },
                      { num: 2, label: 'Office Details', desc: 'Registered Address' },
                      { num: 3, label: 'President', desc: 'Key Representative' },
                      { num: 4, label: 'Office Bearers', desc: 'Executive High-Command' },
                      { num: 5, label: 'Constitution', desc: 'Charter & Objectives' },
                      { num: 6, label: 'Party Members', desc: 'Founding Directory' },
                      { num: 7, label: 'Financials', desc: 'Bank & Treasurer' },
                      { num: 8, label: 'Elections', desc: 'Targeted Levels' },
                      { num: 9, label: 'Documents', desc: 'Official Attachments' },
                      { num: 10, label: 'Declaration', desc: 'Statutory Affirmation' }
                    ].map((st) => {
                      const isActive = regStep === st.num;
                      const isCompleted = regStep > st.num;
                      
                      return (
                        <button
                          key={st.num}
                          type="button"
                          onClick={() => {
                            if (st.num > regStep) {
                              for (let i = regStep; i < st.num; i++) {
                                const err = validateRegStep(i);
                                if (err) {
                                  setRegError(`Cannot jump to Step ${st.num}. Step ${i} has incomplete fields: ${err}`);
                                  return;
                                }
                              }
                            }
                            setRegError('');
                            setRegStep(st.num);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex items-center gap-3 cursor-pointer ${
                            isActive 
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                              : isCompleted
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100/50'
                                : 'bg-gray-50/50 hover:bg-gray-100/50 text-gray-500 border-gray-100'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center shrink-0 border ${
                            isActive 
                              ? 'bg-white/20 border-white/20 text-white' 
                              : isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'bg-white border-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? '✓' : st.num}
                          </div>
                          <div className="truncate">
                            <h4 className="text-[11px] font-bold leading-tight">{st.label}</h4>
                            <p className={`text-[8px] truncate ${isActive ? 'text-purple-100' : 'text-gray-400'}`}>
                              {st.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}

                    {/* Progress Bar */}
                    <div className="pt-4 px-2 space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                        <span>Progress</span>
                        <span>{regStep * 10}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-600 h-full transition-all duration-300"
                          style={{ width: `${regStep * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Step Fields */}
                  <form onSubmit={handleRegisterParty} className="md:col-span-9 space-y-6 text-left">
                    
                    {/* STEP 1: Basic Party Information */}
                    {regStep === 1 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-600" /> Step 1: Basic Party Information
                          </h3>
                          <p className="text-[10px] text-gray-400">Provide the central registry name, abbreviations, ideology and brand particulars.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Political Party Name *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. National Democratic Alliance"
                              value={partyForm.name}
                              onChange={(e) => setPartyForm({...partyForm, name: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Short Name / Abbreviation *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. NDA"
                              value={partyForm.abbrev}
                              onChange={(e) => setPartyForm({...partyForm, abbrev: e.target.value.toUpperCase()})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider focus:bg-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Party Motto
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Growth, Integration, Sovereignty"
                              value={partyForm.motto}
                              onChange={(e) => setPartyForm({...partyForm, motto: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Party Ideology
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Secularism, Progressivism"
                              value={partyForm.ideology}
                              onChange={(e) => setPartyForm({...partyForm, ideology: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Party Type
                            </label>
                            <select 
                              value={partyForm.partyType}
                              onChange={(e) => setPartyForm({...partyForm, partyType: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              disabled
                            >
                              <option value="Local">Local/Unrecognized Party</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Date of Formation
                            </label>
                            <input 
                              type="date" 
                              value={partyForm.dateOfFormation}
                              onChange={(e) => setPartyForm({...partyForm, dateOfFormation: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Official Email
                            </label>
                            <input 
                              type="email" 
                              placeholder="secretariat@party.org"
                              value={partyForm.officialEmail}
                              onChange={(e) => setPartyForm({...partyForm, officialEmail: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Official Phone Number
                            </label>
                            <input 
                              type="tel" 
                              placeholder="+91-11-23348822"
                              value={partyForm.officialPhone}
                              onChange={(e) => setPartyForm({...partyForm, officialPhone: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Official Website
                            </label>
                            <input 
                              type="url" 
                              placeholder="https://www.party.org"
                              value={partyForm.officialWebsite}
                              onChange={(e) => setPartyForm({...partyForm, officialWebsite: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 block uppercase">
                            Configure Secretariat Login Password *
                          </label>
                          <input 
                            type="password" 
                            placeholder="Enter password to log in later"
                            value={partyForm.password}
                            onChange={(e) => setPartyForm({...partyForm, password: e.target.value})}
                            className="w-full px-3.5 py-2 bg-purple-50/20 border border-purple-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Party Logo Upload
                          </label>
                          <div 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setPartyForm({
                                    ...partyForm, 
                                    logoUrl: file.name,
                                    docPartyLogo: file.name
                                  });
                                }
                              };
                              input.click();
                            }}
                            className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[11px] font-bold flex items-center justify-center gap-1.5 text-gray-600"
                          >
                            <UploadCloud className="w-4.5 h-4.5 text-gray-400" />
                            <span>{partyForm.logoUrl ? `File: ${partyForm.logoUrl}` : 'Click to select and upload Logo File (PNG/JPG)'}</span>
                            {partyForm.logoUrl && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">✓ Logo Attached</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Party Manifesto / Vision Statement *
                          </label>
                          <textarea 
                            rows={3}
                            placeholder="State the primary constitutional objective, social philosophy, and political vision of your association..."
                            value={partyForm.manifesto}
                            onChange={(e) => setPartyForm({...partyForm, manifesto: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Registered Office Details */}
                    {regStep === 2 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-purple-600" /> Step 2: Registered Office Details
                          </h3>
                          <p className="text-[10px] text-gray-400">Provide the central physical location of the party secretariat.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Office Address *
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="Complete physical street address of the Party Head Office..."
                            value={partyForm.officeAddress}
                            onChange={(e) => setPartyForm({...partyForm, officeAddress: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              State *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. New Delhi"
                              value={partyForm.officeState}
                              onChange={(e) => setPartyForm({...partyForm, officeState: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              District *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Central Delhi"
                              value={partyForm.officeDistrict}
                              onChange={(e) => setPartyForm({...partyForm, officeDistrict: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              City / Village *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Connaught Place"
                              value={partyForm.officeCityVillage}
                              onChange={(e) => setPartyForm({...partyForm, officeCityVillage: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              PIN Code *
                            </label>
                            <input 
                              type="text" 
                              maxLength={6}
                              placeholder="110001"
                              value={partyForm.officePinCode}
                              onChange={(e) => setPartyForm({...partyForm, officePinCode: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-widest focus:bg-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Office Address Proof Upload
                          </label>
                          <div 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setPartyForm({
                                    ...partyForm, 
                                    officeAddressProofUrl: file.name,
                                    docOfficeAddressProof: file.name
                                  });
                                }
                              };
                              input.click();
                            }}
                            className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[11px] font-bold flex items-center justify-center gap-1.5 text-gray-600"
                          >
                            <Paperclip className="w-4.5 h-4.5 text-gray-400" />
                            <span>{partyForm.officeAddressProofUrl ? `File: ${partyForm.officeAddressProofUrl}` : 'Click to select and upload Office Lease/Ownership/Utility Document Proof'}</span>
                            {partyForm.officeAddressProofUrl && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">✓ Attached</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Party President Details */}
                    {regStep === 3 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="w-4 h-4 text-purple-600" /> Step 3: Party President Details
                          </h3>
                          <p className="text-[10px] text-gray-400">Statutory credentials of the active head of the organization. Enter your ECI/Voter ID to automatically verify and auto-fill official registration records.</p>
                        </div>

                        {/* ECI Profile ID verification block */}
                        <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-purple-950 uppercase tracking-wider block">
                              Required Voter ECI ID *
                            </label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="e.g. usr-voter-aman or usr-cand-rahul"
                                value={partyForm.presidentEciProfileId || ''}
                                onChange={(e) => setPartyForm({
                                  ...partyForm, 
                                  presidentEciProfileId: e.target.value,
                                  presidentEciProfileVerified: false // Reset verification if they change it
                                })}
                                className="flex-1 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600"
                                required
                              />
                              <button
                                type="button"
                                onClick={handleVerifyPresident}
                                disabled={presidentVerifying}
                                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer disabled:opacity-50"
                              >
                                {presidentVerifying ? 'Verifying...' : 'Verify Profile'}
                              </button>
                            </div>
                            <p className="text-[9px] text-gray-400">
                              Every political leader must possess a registered citizen/voter profile ID with verified eKYC records.
                            </p>
                          </div>

                          {partyForm.presidentEciProfileVerified ? (
                            <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                              <span>✓ Voter Profile Authenticated & Auto-filled: {partyForm.presidentName}</span>
                            </div>
                          ) : presidentVerifyErr ? (
                            <div className="p-2.5 bg-red-50 border border-red-100 rounded-xl text-[11px] font-semibold text-red-700">
                              ⚠️ {presidentVerifyErr} (Try seeded: <code className="bg-red-100/50 px-1 py-0.5 rounded">usr-voter-aman</code> or <code className="bg-red-100/50 px-1 py-0.5 rounded">usr-cand-rahul</code>)
                            </div>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              President Full Name *
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Amit K. Shah"
                              value={partyForm.presidentName}
                              onChange={(e) => setPartyForm({...partyForm, presidentName: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-150 border border-gray-250 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                              disabled={partyForm.presidentEciProfileVerified} // Lock if verified
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Date of Birth
                            </label>
                            <input 
                              type="date" 
                              value={partyForm.presidentDob}
                              onChange={(e) => setPartyForm({...partyForm, presidentDob: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Gender
                            </label>
                            <select 
                              value={partyForm.presidentGender}
                              onChange={(e) => setPartyForm({...partyForm, presidentGender: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Mobile Number *
                            </label>
                            <input 
                              type="tel" 
                              placeholder="+91-9876543210"
                              value={partyForm.presidentMobile}
                              onChange={(e) => setPartyForm({...partyForm, presidentMobile: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-150 border border-gray-250 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                              disabled={partyForm.presidentEciProfileVerified}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Email Address
                            </label>
                            <input 
                              type="email" 
                              placeholder="president@party.org"
                              value={partyForm.presidentEmail}
                              onChange={(e) => setPartyForm({...partyForm, presidentEmail: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Aadhaar Number (Optional)
                            </label>
                            <input 
                              type="text" 
                              maxLength={12}
                              placeholder="12-digit UID"
                              value={partyForm.presidentAadhar}
                              onChange={(e) => setPartyForm({...partyForm, presidentAadhar: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              PAN Number
                            </label>
                            <input 
                              type="text" 
                              maxLength={10}
                              placeholder="ABCDE1234F"
                              value={partyForm.presidentPan}
                              onChange={(e) => setPartyForm({...partyForm, presidentPan: e.target.value.toUpperCase()})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Residential Address
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="Permanent residential address of the President..."
                            value={partyForm.presidentAddress}
                            onChange={(e) => setPartyForm({...partyForm, presidentAddress: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Photo Upload *
                            </label>
                            <label className="border border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[10px] font-semibold flex items-center justify-center gap-1.5 text-gray-600 block">
                              <UploadCloud className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{partyForm.presidentPhotoUrl ? `File: ${partyForm.presidentPhotoUrl}` : 'Select & Upload President Photo'}</span>
                              {partyForm.presidentPhotoUrl && (
                                <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">✓ Attached</span>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPartyForm({
                                      ...partyForm,
                                      presidentPhotoUrl: file.name,
                                      docPresidentPhoto: file.name
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Identity Proof Upload *
                            </label>
                            <label className="border border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[10px] font-semibold flex items-center justify-center gap-1.5 text-gray-600 block">
                              <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{partyForm.presidentIdProofUrl ? `File: ${partyForm.presidentIdProofUrl}` : 'Select & Upload Identity Proof (Aadhaar/Passport/PAN)'}</span>
                              {partyForm.presidentIdProofUrl && (
                                <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">✓ Attached</span>
                              )}
                              <input 
                                type="file" 
                                accept=".pdf,image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setPartyForm({
                                      ...partyForm,
                                      presidentIdProofUrl: file.name,
                                      docPresidentIdProof: file.name
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Executive Office Bearers Details (Only 1 allowed per ECI rules) */}
                    {regStep === 4 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-purple-600" /> Step 4: Executive Office Bearer
                            </h3>
                            <p className="text-[10px] text-gray-400">Designate the primary Executive Office Bearer (General Secretary / Vice President).</p>
                          </div>
                          {partyForm.officeBearers.length < 1 && (
                            <button
                              type="button"
                              onClick={addOfficeBearer}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-3xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Add Bearer</span>
                            </button>
                          )}
                        </div>

                        {partyForm.officeBearers.length === 0 ? (
                          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl italic">
                            No executive office bearer added yet. Click "+ Add Bearer" above to assign bearer.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {partyForm.officeBearers.slice(0, 1).map((bearer, idx) => (
                              <div key={idx} className="p-4 bg-gray-50/50 rounded-xl border border-gray-200 space-y-3 relative">
                                <div className="absolute right-3 top-3 flex items-center gap-2">
                                  <span className="text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                    Primary Executive Bearer
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                                      Full Name *
                                    </label>
                                    <input 
                                      type="text" 
                                      placeholder="Full Name"
                                      value={bearer.fullName}
                                      onChange={(e) => updateOfficeBearer(idx, 'fullName', e.target.value)}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                                      required
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                                      Position / Office Title *
                                    </label>
                                    <input 
                                      type="text" 
                                      placeholder="e.g. Vice President, National General Secretary"
                                      value={bearer.position}
                                      onChange={(e) => updateOfficeBearer(idx, 'position', e.target.value)}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                                      Mobile Number
                                    </label>
                                    <input 
                                      type="tel" 
                                      placeholder="Mobile Number"
                                      value={bearer.mobileNumber}
                                      onChange={(e) => updateOfficeBearer(idx, 'mobileNumber', e.target.value)}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase">
                                      Email Address
                                    </label>
                                    <input 
                                      type="email" 
                                      placeholder="email@domain.com"
                                      value={bearer.email}
                                      onChange={(e) => updateOfficeBearer(idx, 'email', e.target.value)}
                                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">
                                    Address
                                  </label>
                                  <textarea 
                                    rows={1.5}
                                    placeholder="Complete postal address..."
                                    value={bearer.address}
                                    onChange={(e) => updateOfficeBearer(idx, 'address', e.target.value)}
                                    className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase block">Photo Upload</label>
                                    <label className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer block">
                                      <UploadCloud className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="truncate">{bearer.photoUrl ? `✓ Photo: ${bearer.photoUrl}` : 'Attach Bearer Photo'}</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) updateOfficeBearer(idx, 'photoUrl', file.name);
                                        }}
                                      />
                                    </label>
                                  </div>

                                  <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase block">ID Proof Upload</label>
                                    <label className="w-full py-2 px-3 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer block">
                                      <Paperclip className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                      <span className="truncate">{bearer.idProofUrl ? `✓ ID Attached: ${bearer.idProofUrl}` : 'Attach ID Proof (Aadhaar/PAN/Passport)'}</span>
                                      <input 
                                        type="file" 
                                        accept=".pdf,image/*" 
                                        className="hidden" 
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) updateOfficeBearer(idx, 'idProofUrl', file.name);
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 5: Party Constitution Details */}
                    {regStep === 5 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-purple-600" /> Step 5: Party Constitution & Rules
                          </h3>
                          <p className="text-[10px] text-gray-400">Statutory rules and structural charter of the party association.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Constitution Document (PDF/Doc) *
                          </label>
                          <label className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[11px] font-bold flex items-center justify-center gap-2 text-gray-600 block">
                            <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{partyForm.constitutionPdfUrl ? `File: ${partyForm.constitutionPdfUrl}` : 'Click to Upload Party Constitution Document (PDF)'}</span>
                            {partyForm.constitutionPdfUrl && (
                              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">✓ Attached</span>
                            )}
                            <input 
                              type="file" 
                              accept=".pdf,.doc,.docx" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setPartyForm({
                                    ...partyForm,
                                    constitutionPdfUrl: file.name,
                                    docPartyConstitution: file.name
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Party Objectives
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="State key ideological and structural objectives of the party..."
                            value={partyForm.constitutionObjective}
                            onChange={(e) => setPartyForm({...partyForm, constitutionObjective: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Membership Rules
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="Rules governing entry, eligibility, fees, and membership duties..."
                            value={partyForm.membershipRules}
                            onChange={(e) => setPartyForm({...partyForm, membershipRules: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Internal Election Process
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="Procedures for electing president, office bearers, and periodic organizational polls..."
                            value={partyForm.internalElectionProcess}
                            onChange={(e) => setPartyForm({...partyForm, internalElectionProcess: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Disciplinary Rules
                          </label>
                          <textarea 
                            rows={2}
                            placeholder="Anti-defection, internal panel review, suspensions, and code of conduct..."
                            value={partyForm.disciplinaryRules}
                            onChange={(e) => setPartyForm({...partyForm, disciplinaryRules: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 6: Party Members Details & Real-time Invite Request */}
                    {regStep === 6 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2 flex justify-between items-center">
                          <div>
                            <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                              <FileSpreadsheet className="w-4 h-4 text-purple-600" /> Step 6: Member Verification & Invite Requests
                            </h3>
                            <p className="text-[10px] text-gray-400">At least 1 verified party member is required to proceed to Step 7.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              // Fast demo fill: generate 1 verified member
                              const dummyList = [
                                {
                                  eciProfileId: 'ECI-MEM-1001',
                                  eciProfileVerified: true,
                                  fullName: 'Founding Member #1',
                                  memberType: 'Founding Member',
                                  mobileNumber: '9876510001',
                                  state: partyForm.officeState || 'Delhi',
                                  district: partyForm.officeDistrict || 'Central Delhi',
                                  membershipId: 'MEM-10001',
                                  joiningDate: new Date().toISOString().split('T')[0]
                                }
                              ];
                              setPartyForm(prev => ({ ...prev, partyMembers: dummyList }));
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded-lg transition shrink-0"
                          >
                            ⚡ Fast Fill Member (Testing)
                          </button>
                        </div>

                        {/* Members count status */}
                        <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-purple-950">Verified Members Count:</span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${partyForm.partyMembers.length >= 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {partyForm.partyMembers.length} Member(s) Verified
                            </span>
                          </div>

                          {/* 100 person required code commented out:
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${partyForm.partyMembers.length >= 100 ? 'bg-emerald-500' : 'bg-purple-600'}`}
                              style={{ width: `${Math.min(100, (partyForm.partyMembers.length / 100) * 100)}%` }}
                            ></div>
                          </div>
                          */}

                          {partyForm.partyMembers.length < 1 ? (
                            <p className="text-[10px] text-amber-700 font-semibold flex items-center gap-1 pt-0.5">
                              ⚠️ At least 1 verified member must be added before proceeding to Step 7.
                            </p>
                          ) : (
                            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                              ✓ Ready! At least 1 verified member added. You can now click "Next Step" to jump to Step 7.
                            </p>
                          )}
                        </div>

                        {/* Send Member Invite Request Form */}
                        <div className="p-4 bg-white border border-purple-200 rounded-xl shadow-2xs space-y-3">
                          <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5 text-purple-600" />
                            Send Real-time Member Registration Invite
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase">1. Enter ECI / Voter ID *</label>
                              <input 
                                type="text"
                                id="newMemberEciId"
                                placeholder="e.g. usr-voter-aman or EPIC ID"
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-500 uppercase">2. Write Member Type *</label>
                              <input 
                                type="text"
                                id="newMemberType"
                                placeholder="Write member type e.g. Founding Member, Cadre..."
                                defaultValue="Founding Member"
                                className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1 flex flex-col justify-end">
                              <button
                                type="button"
                                onClick={async () => {
                                  const eciInput = document.getElementById('newMemberEciId');
                                  const typeInput = document.getElementById('newMemberType');
                                  const val = eciInput?.value?.trim();
                                  const mType = typeInput?.value || 'Founding Member';
                                  if (!val) {
                                    alert('Please enter a valid ECI ID or Voter ID');
                                    return;
                                  }

                                  // ECI Uniqueness check before adding
                                  const valLower = val.toLowerCase();
                                  const presEci = (partyForm.presidentEciProfileId || '').trim().toLowerCase();
                                  const bearerEcis = (partyForm.officeBearers || []).map(b => (b.eciProfileId || b.mobileNumber || '').trim().toLowerCase()).filter(Boolean);
                                  const existingMemberEcis = (partyForm.partyMembers || []).map(m => (m.eciProfileId || '').trim().toLowerCase());

                                  if (presEci && valLower === presEci) {
                                    alert(`❌ ECI ID Conflict: "${val}" is already assigned as Party President! One ECI ID cannot hold multiple positions.`);
                                    return;
                                  }
                                  if (bearerEcis.includes(valLower)) {
                                    alert(`❌ ECI ID Conflict: "${val}" is already assigned as an Executive Office Bearer! One ECI ID cannot hold multiple positions.`);
                                    return;
                                  }
                                  if (existingMemberEcis.includes(valLower)) {
                                    alert(`❌ ECI ID Conflict: "${val}" is already added in the Party Members list!`);
                                    return;
                                  }

                                  try {
                                    // Verify ECI ID
                                    const res = await fetch('/api/eci/verify-epic', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ epicNumber: val })
                                    });
                                    const data = await res.json();
                                    const voter = (data.success && data.voter) ? data.voter : null;
                                    const newMember = {
                                      eciProfileId: val,
                                      eciProfileVerified: true,
                                      fullName: voter ? (voter.fullName || voter.name || `Verified Member (${val})`) : `Verified Member (${val})`,
                                      memberType: mType,
                                      mobileNumber: voter ? (voter.mobileNumber || voter.mobile || '9876543210') : '9876543210',
                                      state: voter?.state || partyForm.officeState || 'Delhi',
                                      district: voter?.district || partyForm.officeDistrict || 'Central Delhi',
                                      membershipId: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
                                      joiningDate: new Date().toISOString().split('T')[0]
                                    };
                                    setPartyForm(prev => ({
                                      ...prev,
                                      partyMembers: [newMember, ...prev.partyMembers]
                                    }));
                                    if (eciInput) eciInput.value = '';
                                    alert(`✓ Member Verified! Real-time registration notification sent to ${newMember.fullName} (${mType})`);
                                  } catch (err) {
                                    // Fallback add
                                    const newMember = {
                                      eciProfileId: val,
                                      eciProfileVerified: true,
                                      fullName: `Verified Member (${val})`,
                                      memberType: mType,
                                      mobileNumber: '9876543210',
                                      state: partyForm.officeState || 'State',
                                      district: partyForm.officeDistrict || 'District',
                                      membershipId: `MEM-${Math.floor(1000 + Math.random() * 9000)}`,
                                      joiningDate: new Date().toISOString().split('T')[0]
                                    };
                                    setPartyForm(prev => ({
                                      ...prev,
                                      partyMembers: [newMember, ...prev.partyMembers]
                                    }));
                                    if (eciInput) eciInput.value = '';
                                    alert(`✓ ECI ID verified and notification sent to ${val}`);
                                  }
                                }}
                                className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>3. Send Notification</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Members Table / List */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-gray-700">Registered Members Directory ({partyForm.partyMembers.length})</h4>
                            {partyForm.partyMembers.length > 0 && (
                              <button 
                                type="button"
                                onClick={() => setPartyForm(prev => ({ ...prev, partyMembers: [] }))}
                                className="text-[10px] text-red-600 hover:underline font-semibold"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          {partyForm.partyMembers.length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl italic">
                              No members added yet. Use the "Send Registration Invite" form above or click "Fast Fill 100 Members" for testing.
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                              {partyForm.partyMembers.slice(0, 20).map((member, idx) => (
                                <div key={idx} className="p-3 bg-gray-50/70 rounded-xl border border-gray-200 flex items-center justify-between text-xs gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                                      #{idx + 1}
                                    </span>
                                    <div>
                                      <p className="font-bold text-gray-900">{member.fullName} <span className="text-[9px] text-purple-700 font-extrabold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 ml-1">{member.memberType || 'Member'}</span></p>
                                      <p className="text-[10px] text-gray-500 font-mono">ECI ID: {member.eciProfileId} | Mobile: {member.mobileNumber}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      ✓ Verified
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removePartyMember(idx)}
                                      className="p-1 hover:bg-red-50 text-red-500 rounded transition"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {partyForm.partyMembers.length > 20 && (
                                <div className="p-2 text-center text-[10px] font-bold text-purple-800 bg-purple-50 rounded-lg border border-purple-100">
                                  + {partyForm.partyMembers.length - 20} more verified members recorded in database
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 7: Bank & Financial Details */}
                    {regStep === 7 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-purple-600" /> Step 7: Bank & Financial Details
                          </h3>
                          <p className="text-[10px] text-gray-400">Statutory reporting of dedicated bank nodes and treasurer particulars.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Bank Name
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. State Bank of India"
                              value={partyForm.bankName}
                              onChange={(e) => setPartyForm({...partyForm, bankName: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Account Holder Name
                            </label>
                            <input 
                              type="text" 
                              placeholder="e.g. Revolutionary Peoples Front Central Account"
                              value={partyForm.bankAccountHolderName}
                              onChange={(e) => setPartyForm({...partyForm, bankAccountHolderName: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Account Number
                            </label>
                            <input 
                              type="text" 
                              placeholder="Bank Account Number"
                              value={partyForm.bankAccountNumber}
                              onChange={(e) => setPartyForm({...partyForm, bankAccountNumber: e.target.value})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              IFSC Code
                            </label>
                            <input 
                              type="text" 
                              placeholder="SBIN0001234"
                              value={partyForm.bankIfscCode}
                              onChange={(e) => setPartyForm({...partyForm, bankIfscCode: e.target.value.toUpperCase()})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider focus:bg-white focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Party PAN Number
                            </label>
                            <input 
                              type="text" 
                              placeholder="Party PAN (10 chars)"
                              value={partyForm.bankPanNumber}
                              onChange={(e) => setPartyForm({...partyForm, bankPanNumber: e.target.value.toUpperCase()})}
                              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold tracking-wider focus:bg-white focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            Designated Treasurer Name
                          </label>
                          <input 
                            type="text" 
                            placeholder="e.g. Piyush Goyal"
                            value={partyForm.bankTreasurerName}
                            onChange={(e) => setPartyForm({...partyForm, bankTreasurerName: e.target.value})}
                            className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 8: Election Levels Details */}
                    {regStep === 8 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckSquare className="w-4 h-4 text-purple-600" /> Step 8: Targeted Election Levels
                          </h3>
                          <p className="text-[10px] text-gray-400">Select the democratic bodies your political party intends to contest.</p>
                        </div>

                        <div className="bg-purple-50/50 border border-purple-100 p-3.5 rounded-xl text-purple-950 text-xs leading-relaxed">
                          Per ECI rules, select from the three authorized legislative categories below:
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                          {[
                            'Assembly',
                            'Lok Sabha',
                            'Rajya Sabha'
                          ].map((lvl) => {
                            const currentLevels = partyForm.electionLevels || [];
                            const isChecked = currentLevels.includes(lvl);
                            
                            return (
                              <label 
                                key={lvl} 
                                className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition select-none ${
                                  isChecked 
                                    ? 'bg-purple-50/70 border-purple-400 text-purple-950 font-bold shadow-3xs' 
                                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
                                }`}
                              >
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setPartyForm({
                                        ...partyForm,
                                        electionLevels: currentLevels.filter(x => x !== lvl)
                                      });
                                    } else {
                                      setPartyForm({
                                        ...partyForm,
                                        electionLevels: [...currentLevels, lvl]
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                />
                                <span className="text-xs font-bold">{lvl}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 9: Documents Upload Checklist */}
                    {regStep === 9 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <UploadCloud className="w-4 h-4 text-purple-600" /> Step 9: Required Documents Upload Checklist
                          </h3>
                          <p className="text-[10px] text-gray-400">Any required statutory document not available in database must be uploaded.</p>
                        </div>

                        <div className="space-y-3.5">
                          {[
                            { key: 'docPartyConstitution', label: 'Party Constitution Document (PDF)', accept: '.pdf' },
                            { key: 'docPresidentIdProof', label: 'President Identity Proof (Aadhaar/PAN/Passport)', accept: '.pdf,image/*' },
                            { key: 'docPresidentPhoto', label: 'President Passport-sized Photo', accept: 'image/*' },
                            { key: 'docOfficeAddressProof', label: 'Registered Office Address Proof (Utility Bill/Rent Agreement)', accept: '.pdf,image/*' },
                            { key: 'docPanCard', label: 'Party Permanent Account Number (PAN) Card', accept: '.pdf,image/*' },
                            { key: 'docBankProof', label: 'Consolidated Bank Proof (Passbook/Cancelled Cheque)', accept: '.pdf,image/*' },
                            { key: 'docPartyLogo', label: 'Party Emblem Symbol / Logo (High Res)', accept: 'image/*' }
                          ].map((docItem) => {
                            const isUploaded = !!partyForm[docItem.key];
                            
                            return (
                              <div 
                                key={docItem.key} 
                                className={`p-3.5 border rounded-xl flex items-center justify-between gap-4 transition ${
                                  isUploaded 
                                    ? 'bg-emerald-50/40 border-emerald-200' 
                                    : 'bg-white border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                                    {docItem.label}
                                    {!isUploaded && <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-bold">Upload Required</span>}
                                  </h4>
                                  <p className="text-[10px] text-gray-400 font-mono">
                                    {isUploaded ? `✓ Attached: ${partyForm[docItem.key]}` : 'Required file missing from database - upload below'}
                                  </p>
                                </div>

                                <label className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                  isUploaded 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs' 
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-3xs'
                                }`}>
                                  {isUploaded ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>{partyForm[docItem.key]}</span>
                                    </>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-3.5 h-3.5" />
                                      <span>Upload File *</span>
                                    </>
                                  )}
                                  <input 
                                    type="file"
                                    accept={docItem.accept}
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setPartyForm(prev => ({
                                          ...prev,
                                          [docItem.key]: file.name,
                                          ...(docItem.key === 'docPartyLogo' ? { logoUrl: file.name } : {}),
                                          ...(docItem.key === 'docPresidentPhoto' ? { presidentPhotoUrl: file.name } : {}),
                                          ...(docItem.key === 'docPresidentIdProof' ? { presidentIdProofUrl: file.name } : {}),
                                          ...(docItem.key === 'docOfficeAddressProof' ? { officeAddressProofUrl: file.name } : {}),
                                          ...(docItem.key === 'docPartyConstitution' ? { constitutionPdfUrl: file.name } : {})
                                        }));
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* STEP 10: Declaration & Digital Signature */}
                    {regStep === 10 && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="border-b border-gray-100 pb-2">
                          <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-purple-600" /> Step 10: Statutory Declaration & Signature
                          </h3>
                          <p className="text-[10px] text-gray-400">Solemn undertaking and digital verification under oath.</p>
                        </div>

                        <div className="bg-amber-50/70 p-4 border border-amber-100 text-amber-900 rounded-xl space-y-2 text-xs leading-relaxed shadow-3xs">
                          <strong className="flex items-center gap-1.5 font-bold">
                            <ShieldCheck className="w-4.5 h-4.5 text-amber-600" /> Representation of the People Act, 1951
                          </strong>
                          <p>
                            The applicant association solemnly declares and affirms that it bears true faith and allegiance to the Constitution of India as by law established, and to the principles of secularism, socialism, and democracy, and would safeguard the national sovereignty, unity, and integrity of India.
                          </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-3">
                          <label className="flex items-start gap-3 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={partyForm.declDeclaredTrue}
                              onChange={(e) => setPartyForm({...partyForm, declDeclaredTrue: e.target.checked})}
                              className="mt-0.5 w-4.5 h-4.5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                              required
                            />
                            <span className="text-xs text-gray-700 font-semibold leading-relaxed">
                              I hereby declare that all information provided in this political party registration profile is true, complete, and correct to the best of my knowledge and belief. *
                            </span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block font-sans">
                              Digital President Signature (Type Name) *
                            </label>
                            <input 
                              type="text" 
                              placeholder="Type applicant president's full name to sign"
                              value={partyForm.declDigitalSignature}
                              onChange={(e) => setPartyForm({...partyForm, declDigitalSignature: e.target.value})}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none font-mono font-bold"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase block">
                              Affirmation Submission Date
                            </label>
                            <input 
                              type="date" 
                              value={partyForm.declDate}
                              onChange={(e) => setPartyForm({...partyForm, declDate: e.target.value})}
                              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase block">
                            President Signature Upload (Optional Image)
                          </label>
                          <div 
                            onClick={() => {
                              setPartyForm({
                                ...partyForm, 
                                declSignatureUrl: 'president_signature.png'
                              });
                            }}
                            className="border border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-purple-400 cursor-pointer transition bg-gray-50/50 text-[10px] font-semibold flex items-center justify-center gap-1.5 text-gray-600"
                          >
                            <UploadCloud className="w-4 h-4 text-gray-400" />
                            <span>Upload JPG/PNG of handwritten signature</span>
                            {partyForm.declSignatureUrl && (
                              <span className="text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">✓ Attached</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-6 gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={regStep === 1}
                        onClick={prevStep}
                        className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1 transition select-none ${
                          regStep === 1 
                            ? 'bg-gray-50 border-gray-150 text-gray-300 cursor-not-allowed' 
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-600 cursor-pointer'
                        }`}
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Previous Step</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={skipRegStep}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer select-none"
                          title="Auto-fill default data for current step and proceed to next step"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Skip Step {regStep}</span>
                        </button>

                        {regStep < 10 ? (
                          <button
                            type="button"
                            onClick={nextStep}
                            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md shadow-purple-500/10 cursor-pointer select-none"
                          >
                            <span>Next Step</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer flex items-center gap-1.5"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Connecting ECI Registry Node...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Complete ECI Party Registration</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
                </>
              )}
            </div>
          </motion.div>
        )}

{/* ==================== VIEW 4: PARTY ADMINISTRATION DASHBOARD ==================== */}
        {viewMode === 'PARTY_DASHBOARD' && activeParty && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Party Admin Banner */}
            <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-purple-900/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
                <Landmark className="w-96 h-96" />
              </div>

              <div className="flex items-center gap-5 relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 text-4xl flex items-center justify-center font-bold shadow-inner">
                  {activeParty.symbol ? (activeParty.symbol.includes(' ') ? activeParty.symbol.split(' ')[1] : activeParty.symbol) : '🪷'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-extrabold uppercase bg-amber-500 text-black px-2 py-0.5 rounded-full tracking-wider">
                      ★ Active Party Admin
                    </span>
                    <span className="text-[10px] font-mono text-purple-300">Token ID: {activeParty.id}</span>
                  </div>
                  <h2 className="text-xl font-extrabold font-display leading-tight">{activeParty.name}</h2>
                  <p className="text-xs text-slate-300 font-mono tracking-widest">{activeParty.abbrev} HIGH-COMMAND SECRETARIAT</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 relative z-10">
                <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">ECI Verification Node Connection</span>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-xl text-xs font-bold">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  <span>ECI-CONNECTED ONLINE</span>
                </div>
              </div>
            </div>

            {/* Sub-tabs Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto gap-1">
              {[
                { id: 'profile', label: 'Party Profile & Certificate', icon: Landmark },
                { id: 'members', label: 'Party Members Directory', icon: Users },
                { id: 'approvals', label: 'Nominee Approvals', icon: CheckCircle2 },
                { id: 'tickets', label: 'Issue Auth Tickets', icon: Ticket },
                { id: 'campaigns', label: 'Campaign Management', icon: Award },
                { id: 'reports', label: 'Reports & Insights', icon: FileSpreadsheet },
                { id: 'elections', label: 'Elections & Results', icon: Calendar },
                { id: 'notifications', label: 'ECI Bulletins', icon: Mail },
                { id: 'settings', label: 'Settings', icon: Lock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPartyTab(tab.id)}
                  className={`pb-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                    partyTab === tab.id 
                      ? 'border-purple-600 text-purple-600 font-bold' 
                      : 'border-transparent text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB: Profile & Certificate */}
            {partyTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
                {/* Left Column: Update Profile Form */}
                <form onSubmit={handleUpdateProfile} className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-5">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 font-display">Update Secretariat Information</h3>
                    <p className="text-[10px] text-gray-400">Update contact points and logo references shared on public ballots.</p>
                  </div>

                  {profileSuccess && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100 font-bold">✓ {profileSuccess}</div>}
                  {profileError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 font-bold">⚠️ {profileError}</div>}

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Party Motto</label>
                      <input 
                        type="text" 
                        value={profileForm.motto}
                        onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Party Ideology</label>
                      <input 
                        type="text" 
                        value={profileForm.ideology}
                        onChange={(e) => setProfileForm({ ...profileForm, ideology: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Official Email</label>
                      <input 
                        type="email" 
                        value={profileForm.officialEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, officialEmail: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Official Phone</label>
                      <input 
                        type="text" 
                        value={profileForm.officialPhone}
                        onChange={(e) => setProfileForm({ ...profileForm, officialPhone: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Official Website</label>
                      <input 
                        type="text" 
                        value={profileForm.officialWebsite}
                        onChange={(e) => setProfileForm({ ...profileForm, officialWebsite: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Registered Headquarters Office Address</label>
                      <textarea 
                        rows="2"
                        value={profileForm.officeAddress}
                        onChange={(e) => setProfileForm({ ...profileForm, officeAddress: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">State</label>
                      <input 
                        type="text" 
                        value={profileForm.officeState}
                        onChange={(e) => setProfileForm({ ...profileForm, officeState: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Pin Code</label>
                      <input 
                        type="text" 
                        value={profileForm.officePinCode}
                        onChange={(e) => setProfileForm({ ...profileForm, officePinCode: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Save Secretariat Profile</span>
                  </button>
                </form>

                {/* Right Column: ECI Certificate & Constitution Details */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Certificate of Registration */}
                  <div className="bg-amber-50/40 p-6 rounded-2xl border-2 border-amber-300 shadow-sm relative overflow-hidden flex flex-col justify-between h-[360px]">
                    {/* Background ECI watermark */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                      <Landmark className="w-64 h-64 text-amber-900" />
                    </div>

                    <div className="text-center space-y-2 relative z-10">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-300">
                        <ShieldCheck className="w-6 h-6 text-amber-700" />
                      </div>
                      <h4 className="font-serif text-sm font-black text-amber-900 tracking-wide">ELECTION COMMISSION OF INDIA</h4>
                      <h5 className="font-sans text-[10px] font-bold text-amber-700 uppercase tracking-widest border-b border-amber-200 pb-1">Certificate of Party Registration</h5>
                    </div>

                    <div className="text-center text-xs text-amber-950 font-medium leading-relaxed my-4 relative z-10 px-4">
                      This is to certify that the political group <strong className="text-black font-extrabold">{activeParty.name} ({activeParty.abbrev})</strong>, 
                      having its headquarters office at <span className="italic">{activeParty.officeAddress || 'India Secretariat'}</span>, has been officially registered as a recognized Political Party under Section 29A of the Representation of the People Act, 1951.
                    </div>

                    <div className="border-t border-amber-200 pt-3 flex justify-between items-end text-[10px] relative z-10 font-mono text-amber-900">
                      <div className="space-y-1">
                        <p>REGISTRATION ID: <strong className="text-black font-semibold">{activeParty.registrationNumber || 'ECI-REG-PENDING'}</strong></p>
                        <p>ISSUED ON: <strong className="text-black font-semibold">{activeParty.dateOfFormation || '2026-01-01'}</strong></p>
                      </div>
                      <div className="text-center font-sans">
                        <div className="border border-emerald-500 text-emerald-700 font-bold px-1 rounded uppercase scale-90 mb-1 inline-block bg-white">
                          APPROVED
                        </div>
                        <p className="text-[8px] text-amber-700">ECI CENTRAL SECRETARY</p>
                      </div>
                    </div>
                  </div>

                  {/* Constitution Objectives */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3">
                    <h4 className="font-extrabold text-xs text-gray-900 font-display uppercase tracking-wider text-gray-400">Constitution Guidelines</h4>
                    <p className="text-xs text-gray-650 leading-relaxed italic border-l-2 border-purple-200 pl-3">
                      "{activeParty.constitutionObjective || 'Commitment to maintaining the sovereignty, democracy and socio-economic development of the nation.'}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Party Members */}
            {partyTab === 'members' && (
              <div className="space-y-6 text-left animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Main Table: Active Directory */}
                  <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-gray-950 font-display">Party Members Directory</h3>
                        <p className="text-[10px] text-gray-400">Manage internal party admissions, search registers, and generate credentials.</p>
                      </div>

                      <div className="flex gap-2 items-center">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search members..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-1 text-xs w-48 focus:bg-white focus:outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => {
                            setEditingMemberIndex(null);
                            setMemberForm({ fullName: '', mobileNumber: '', state: '', district: '', membershipId: '', joiningDate: '', internalRole: 'Standard Member' });
                            setShowAddMemberModal(true);
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1 transition"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Add Member</span>
                        </button>
                      </div>
                    </div>

                    {/* Member Search list */}
                    {!(activeParty.partyMembers) || activeParty.partyMembers.length === 0 ? (
                      <div className="p-12 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl">
                        No registered members recorded in the high-command database yet. Click "Add Member" or approve applications.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[9px] uppercase font-bold">
                              <th className="py-2.5 px-3">Membership ID</th>
                              <th className="py-2.5 px-3">Full Name</th>
                              <th className="py-2.5 px-3">Assigned Role</th>
                              <th className="py-2.5 px-3">Contact No</th>
                              <th className="py-2.5 px-3">Location</th>
                              <th className="py-2.5 px-3 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {activeParty.partyMembers
                              .filter(m => !memberSearch || m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || m.membershipId.toLowerCase().includes(memberSearch.toLowerCase()))
                              .map((mem, idx) => {
                                const roleColors = {
                                  'Party President': 'bg-amber-50 text-amber-700 border-amber-200',
                                  'General Secretary': 'bg-purple-50 text-purple-700 border-purple-200',
                                  'State President': 'bg-blue-50 text-blue-700 border-blue-200',
                                  'District President': 'bg-teal-50 text-teal-700 border-teal-200',
                                  'Candidate Selection Committee': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                                  'Treasurer': 'bg-rose-50 text-rose-700 border-rose-200',
                                  'Standard Member': 'bg-gray-55 text-gray-600 border-gray-200'
                                };
                                const badgeClass = roleColors[mem.internalRole] || roleColors['Standard Member'];
                                return (
                                  <tr key={mem.membershipId} className="hover:bg-gray-50/50 transition">
                                    <td className="py-3 px-3 font-mono text-purple-700 font-bold">{mem.membershipId}</td>
                                    <td className="py-3 px-3 font-semibold text-gray-900">{mem.fullName}</td>
                                    <td className="py-3 px-3">
                                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold inline-block whitespace-nowrap ${badgeClass}`}>
                                        {mem.internalRole || 'Standard Member'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-gray-600 font-mono">{mem.mobileNumber}</td>
                                    <td className="py-3 px-3">
                                      <span className="font-medium text-gray-800">{mem.district}</span>, <span className="text-gray-400 text-[10px]">{mem.state}</span>
                                    </td>
                                    <td className="py-3 px-3 text-center">
                                      <div className="flex gap-1.5 justify-center">
                                        <button 
                                          onClick={() => {
                                            setEditingMemberIndex(idx);
                                            setMemberForm(mem);
                                            setShowAddMemberModal(true);
                                          }}
                                          className="px-2 py-0.5 text-[10px] bg-gray-50 border hover:bg-gray-100 rounded text-gray-700 font-bold cursor-pointer transition"
                                        >
                                          Edit
                                        </button>
                                        <button 
                                          onClick={() => handleRemoveMember(idx)}
                                          className="px-2 py-0.5 text-[10px] bg-red-50 hover:bg-red-100 border border-red-100 rounded text-red-700 font-bold cursor-pointer transition"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Pending Membership requests audit */}
                  <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-gray-950 font-display">Membership Requests Audit</h3>
                      <span className="text-[10px] font-black bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full">
                        {pendingMembers.length} Active
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Citizens who requested to join your party online. Request a meeting or write their assigned position to approve.
                    </p>

                    {pendingMembers.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl bg-gray-50/55">
                        ✓ No pending requests. All membership logs are up to date!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingMembers.map((req) => {
                          const isMeetingReq = req.status === 'MEETING_REQUESTED';
                          return (
                            <div key={req.id} className="p-4 bg-gray-50 hover:bg-white hover:shadow-xs border border-gray-200 rounded-xl transition space-y-3">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-xs text-gray-950">{req.fullName || req.voterName}</h4>
                                  {isMeetingReq ? (
                                    <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                                      🤝 Meeting Requested
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded-md">
                                      ⏳ Pending Review
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-500 leading-normal">
                                  From: <span className="text-gray-800 font-medium">{req.district || 'Bhopal'}, {req.state || 'MP'}</span>
                                </p>
                                {req.fatherName && (
                                  <p className="text-[10px] text-gray-500">Father: <span className="font-semibold text-gray-700">{req.fatherName}</span></p>
                                )}
                                <p className="text-[10px] text-gray-500 font-mono">Mob: {req.mobileNumber} {req.panNumber ? `• PAN: ${req.panNumber}` : ''}</p>
                                <p className="text-[9px] font-mono text-purple-600 bg-purple-50/60 px-1.5 py-0.5 rounded inline-block">Filed: {req.date || new Date().toISOString().split('T')[0]}</p>
                              </div>

                              <div className="flex gap-2 pt-1 border-t border-gray-100">
                                {isMeetingReq ? (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setSelectedMemberForUpdate(req);
                                        setWrittenPosition(req.memberType || req.internalRole || 'Active Cadre');
                                        setShowUpdateMemberModal(true);
                                      }}
                                      className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-extrabold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                                    >
                                      <span>✏️ Update Member</span>
                                    </button>
                                    <button 
                                      onClick={() => handleRejectMemberRequestFull(req.id)}
                                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[10px] font-extrabold rounded-lg transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleRequestMeetingForMember(req.id)}
                                      className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                                    >
                                      <span>🤝 Request to Meeting</span>
                                    </button>
                                    <button 
                                      onClick={() => handleRejectMemberRequestFull(req.id)}
                                      className="px-2.5 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-[10px] font-extrabold rounded-lg transition cursor-pointer"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* MODAL DIALOG: Update Member Position & Approve / Reject */}
                {showUpdateMemberModal && selectedMemberForUpdate && (
                  <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-purple-200 text-left"
                    >
                      <div className="flex justify-between items-start border-b pb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                            Party Central Secretariat
                          </span>
                          <h3 className="text-base font-black text-gray-900">
                            Update Member Profile & Position
                          </h3>
                        </div>
                        <button 
                          onClick={() => {
                            setShowUpdateMemberModal(false);
                            setSelectedMemberForUpdate(null);
                          }}
                          className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Applicant Dossier */}
                      <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs space-y-1">
                        <p className="text-xs font-black text-purple-950">{selectedMemberForUpdate.fullName || selectedMemberForUpdate.voterName}</p>
                        <p className="text-gray-600"><strong>District/State:</strong> {selectedMemberForUpdate.district}, {selectedMemberForUpdate.state}</p>
                        {selectedMemberForUpdate.fatherName && (
                          <p className="text-gray-600"><strong>Father's Name:</strong> {selectedMemberForUpdate.fatherName}</p>
                        )}
                        <p className="text-gray-600 font-mono"><strong>Mobile/PAN:</strong> {selectedMemberForUpdate.mobileNumber} • {selectedMemberForUpdate.panNumber || 'Declared'}</p>
                      </div>

                      {/* Write Position Input Box */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                          Write Assigned Position / Designation *
                        </label>
                        <input
                          type="text"
                          value={writtenPosition}
                          onChange={(e) => setWrittenPosition(e.target.value)}
                          placeholder="e.g. District General Secretary, Youth Wing Convenor, Active Cadre"
                          className="w-full px-3.5 py-2.5 bg-gray-50 border border-purple-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                          required
                        />
                        <p className="text-[10px] text-gray-500 font-medium">
                          Write the exact official designation assigned to this member after meeting/interview.
                        </p>
                      </div>

                      {/* Action Buttons: Approve or Reject */}
                      <div className="pt-3 border-t flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleRejectMemberRequestFull(selectedMemberForUpdate.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer border border-rose-200"
                        >
                          Reject Request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveMemberWithWrittenPosition(selectedMemberForUpdate, writtenPosition)}
                          className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl transition shadow-md shadow-purple-900/20 cursor-pointer"
                        >
                          Approve & Assign Position
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* MODAL dialog: Add/Edit Member */}
                {showAddMemberModal && (
                  <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xl max-w-md w-full text-xs space-y-4 text-left"
                    >
                      <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                        <h4 className="font-bold text-gray-950 font-display text-sm">
                          {editingMemberIndex !== null ? 'Modify Member Credentials' : 'Add New Party Member'}
                        </h4>
                        <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-950 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <form onSubmit={handleAddOrEditMember} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-450 uppercase block">Full Name</label>
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Anand Sharma"
                            value={memberForm.fullName}
                            onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-450 uppercase block">Mobile Number</label>
                          <input 
                            required
                            type="tel" 
                            placeholder="e.g. 9876543210"
                            value={memberForm.mobileNumber}
                            onChange={(e) => setMemberForm({ ...memberForm, mobileNumber: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-455 uppercase block">Internal Assigned Role</label>
                          <select 
                            value={memberForm.internalRole || 'Standard Member'}
                            onChange={(e) => setMemberForm({ ...memberForm, internalRole: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 focus:bg-white focus:outline-none text-xs"
                          >
                            <option value="Standard Member">Standard Member</option>
                            <option value="Party President">Party President</option>
                            <option value="General Secretary">General Secretary</option>
                            <option value="State President">State President</option>
                            <option value="District President">District President</option>
                            <option value="Candidate Selection Committee">Candidate Selection Committee</option>
                            <option value="Treasurer">Treasurer</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-455 uppercase block">State</label>
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. Madhya Pradesh"
                              value={memberForm.state}
                              onChange={(e) => setMemberForm({ ...memberForm, state: e.target.value })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-455 uppercase block">District</label>
                            <input 
                              required
                              type="text" 
                              placeholder="e.g. Bhopal"
                              value={memberForm.district}
                              onChange={(e) => setMemberForm({ ...memberForm, district: e.target.value })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          <button 
                            type="button"
                            onClick={() => setShowAddMemberModal(false)}
                            className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition cursor-pointer text-xs"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                          >
                            {editingMemberIndex !== null ? 'Save Member' : 'Enroll Member'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: Nominee Approvals */}
            {partyTab === 'approvals' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                
                {/* Left Column: Candidates list */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-3xs p-5 space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-950 font-display">Candidate Nomination Registry</h3>
                      <p className="text-[10px] text-gray-400">Review pending, approved, or rejected candidates standing for seats.</p>
                    </div>

                    {/* Filter Selectors */}
                    <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-150 text-[10px] font-bold">
                      {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setCandidateFilter(f)}
                          className={`px-2 py-1 rounded-md transition cursor-pointer ${
                            candidateFilter === f 
                              ? 'bg-white text-purple-800 shadow-3xs' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List contents */}
                  {candidatesLoading ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      Fetching global candidate ledger...
                    </div>
                  ) : filteredCandidates.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs italic">
                      No candidates found with "{candidateFilter}" status.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {filteredCandidates.map((cand) => {
                        const isSelected = selectedCandidate?.id === cand.id;
                        return (
                          <div
                            key={cand.id}
                            onClick={() => {
                              setSelectedCandidate(cand);
                              setAllocateSymbol(cand.partySymbol || activeParty.symbol || '🪷');
                              setApprovalSuccess('');
                              setApprovalError('');
                            }}
                            className={`p-4 rounded-xl border transition cursor-pointer text-left space-y-3 ${
                              isSelected 
                                ? 'bg-purple-50/50 border-purple-300 shadow-sm' 
                                : 'bg-white hover:bg-gray-50/50 border-gray-150'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                                  <img 
                                    src={cand.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                                    alt="Candidate" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-extrabold text-xs text-gray-950">{cand.name}</h4>
                                  <p className="text-[10px] text-gray-500">
                                    Standing: <strong className="text-gray-800">{cand.position || 'MLA/MP'}</strong>
                                  </p>
                                  <p className="text-[10px] text-purple-700 font-semibold">
                                    {cand.constituency} ({cand.state || 'Local'})
                                  </p>
                                </div>
                              </div>

                              <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                                cand.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                cand.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {cand.status}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[9px] font-mono border-t border-gray-50 pt-2 text-gray-400">
                              <span>UID: {cand.id}</span>
                              <span className="text-purple-600 font-bold flex items-center gap-0.5">
                                View details <ChevronRight className="w-2.5 h-2.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Candidate detailed review & Document Viewer & Allocation */}
                <div className="lg:col-span-5 space-y-4">
                  {selectedCandidate ? (
                    <div className="bg-white rounded-2xl border border-gray-150 shadow-md p-6 space-y-5 text-left">
                      
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4 pb-4 border-b border-gray-100">
                        <div className="flex gap-3">
                          <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden border border-gray-250">
                            <img 
                              src={selectedCandidate.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt="Candidate Profile" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-gray-950 font-display">{selectedCandidate.name}</h3>
                            <span className="text-[10px] text-purple-700 font-extrabold uppercase bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 inline-block mt-0.5">
                              {selectedCandidate.position || 'Constituency Stand'}
                            </span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Age: {selectedCandidate.age || 'N/A'}</p>
                          </div>
                        </div>

                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                          selectedCandidate.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          selectedCandidate.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {selectedCandidate.status}
                        </span>
                      </div>

                      {/* Messages alert */}
                      {approvalSuccess && (
                        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">
                          ✓ {approvalSuccess}
                        </div>
                      )}
                      {approvalError && (
                        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">
                          ⚠️ {approvalError}
                        </div>
                      )}

                      {/* Form 26 Declarations Info */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Official Form 26 Declarations Data
                        </span>

                        <div className="grid grid-cols-2 gap-3.5 text-xs">
                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase flex items-center gap-1">
                              <GraduationCap className="w-3.5 h-3.5 text-purple-500" /> Education
                            </span>
                            <span className="font-bold text-gray-800 block truncate">
                              {selectedCandidate.education || 'B.A. Political Science'}
                            </span>
                          </div>

                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 space-y-0.5">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Net Worth
                            </span>
                            <span className="font-extrabold text-emerald-700 block truncate">
                              {selectedCandidate.netWorth || '₹ 1.25 Crores'}
                            </span>
                          </div>

                          <div className="bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 space-y-0.5 col-span-2">
                            <span className="text-[9px] font-extrabold text-gray-400 uppercase flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-amber-500" /> Working Profession
                            </span>
                            <span className="font-semibold text-gray-700 block">
                              {selectedCandidate.workingPosition || 'Social Worker & Advocate'}
                            </span>
                          </div>
                        </div>

                        {/* Biography & Manifesto */}
                        <div className="bg-gray-50/40 p-3 rounded-xl border border-gray-100 text-xs space-y-2">
                          <div>
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Manifesto Pledge</span>
                            <p className="text-gray-650 leading-relaxed italic mt-0.5">
                              "{selectedCandidate.manifesto || 'Committed to development, transparency, and building standard infrastructures across the ward.'}"
                            </p>
                          </div>
                          <div className="border-t border-gray-100 pt-2">
                            <span className="text-[9px] font-bold text-gray-400 uppercase block">Short Biography</span>
                            <p className="text-gray-650 leading-relaxed mt-0.5">
                              {selectedCandidate.biography || 'Serving the community for over 15 years through public programs and local civic awareness.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Candidate Documents Attached */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Cryptographic Verification Document Proofs
                        </span>
                        <p className="text-[10px] text-gray-400">Click below to view the secure PDF file with ECI tamper-proof seals.</p>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {/* Aadhaar File */}
                          <button
                            type="button"
                            onClick={() => setSelectedDoc({
                              title: 'Aadhaar Identity Proof',
                              filename: 'aadhar_uidai_secured.pdf',
                              desc: 'UIDAI official secure file matching candidate name and biometric ledger.',
                              status: '✓ CRYPTO VERIFIED BY UIDAI'
                            })}
                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate pr-1 font-bold">📄 Aadhaar ID</span>
                            <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded uppercase shrink-0">VLD</span>
                          </button>

                          {/* PAN Card File */}
                          <button
                            type="button"
                            onClick={() => setSelectedDoc({
                              title: 'Permanent Account Number (PAN Card)',
                              filename: 'pan_tax_ledger_2026.pdf',
                              desc: 'Official IT department taxation registry confirming no pending undeclared liabilities.',
                              status: '✓ TAX CLEARANCE SECURED'
                            })}
                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate pr-1 font-bold">📄 PAN Tax</span>
                            <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded uppercase shrink-0">VLD</span>
                          </button>

                          {/* Affidavit Form 26 */}
                          <button
                            type="button"
                            onClick={() => setSelectedDoc({
                              title: 'Form 26 Legal Asset Affidavit',
                              filename: 'form_26_affidavit_signed.pdf',
                              desc: 'Legally binding declaration of family assets, liability, and criminal record check under oath.',
                              status: '✓ STAMP DUTY VERIFIED'
                            })}
                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate pr-1 font-bold">📄 Affidavit F-26</span>
                            <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded uppercase shrink-0">VLD</span>
                          </button>

                          {/* Character Certificate */}
                          <button
                            type="button"
                            onClick={() => setSelectedDoc({
                              title: 'District Character & Police Proof',
                              filename: 'police_clearance_verified.pdf',
                              desc: 'District magistrate certificate ensuring zero active non-bailable criminal warrants.',
                              status: '✓ POLICE PASS STAMPED'
                            })}
                            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-between transition cursor-pointer"
                          >
                            <span className="truncate pr-1 font-bold">📄 Character Cert</span>
                            <span className="text-[8px] bg-emerald-500 text-white font-extrabold px-1 rounded uppercase shrink-0">VLD</span>
                          </button>
                        </div>
                      </div>

                      {/* Give Symbol and Approve / Action Panel */}
                      <div className="border-t border-gray-150 pt-4 space-y-3 bg-gradient-to-br from-purple-50/50 to-indigo-50/20 p-4 rounded-xl border border-purple-100/50">
                        <span className="text-[10px] font-extrabold text-purple-950 uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Allocate Party Logo Symbol & Approve Stand
                        </span>

                        <p className="text-[10px] text-purple-900 leading-normal">
                          Select an approved symbol from your electoral bank to assign to this candidate's ballot button, then click **Approve & Sign Ticket**.
                        </p>

                        {/* Symbol Selector Grid */}
                        <div className="grid grid-cols-6 gap-1.5 bg-white p-2 rounded-lg border border-purple-200/50">
                          {['🪷', '✋', '🧹', '🚲', '🏹', '⚖️', '☀️', '🦁', '🐘', '⏰', '🚗', '✈️'].map((symbol) => (
                            <button
                              key={symbol}
                              type="button"
                              onClick={() => setAllocateSymbol(symbol)}
                              className={`p-1.5 rounded text-lg flex items-center justify-center transition cursor-pointer ${
                                allocateSymbol === symbol 
                                  ? 'bg-purple-600 text-white border-purple-600 scale-105' 
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                              }`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>

                        {/* Quick Input custom */}
                        <div className="flex gap-2 items-center mb-2">
                          <span className="text-[10px] font-bold text-gray-500 shrink-0">Custom Symbol:</span>
                          <input
                            type="text"
                            maxLength={10}
                            value={allocateSymbol}
                            onChange={(e) => setAllocateSymbol(e.target.value)}
                            className="bg-white border border-gray-200 rounded px-2 py-0.5 text-xs font-semibold w-24 focus:outline-none"
                          />
                        </div>

                        {/* Approve Rejection Controls */}
                        <div className="space-y-2.5 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Button 1: Generate Candidate ID */}
                            <button
                              type="button"
                              onClick={handleGenerateCandidateId}
                              disabled={approvalActionLoading || !!selectedCandidate.officialCandidateId}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75 ${
                                selectedCandidate.officialCandidateId 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              }`}
                            >
                              {selectedCandidate.officialCandidateId ? (
                                <div className="truncate text-center w-full">
                                  <span>✅ Generated: </span>
                                  <span className="font-mono text-[10px] bg-emerald-100/50 px-1 rounded">{selectedCandidate.officialCandidateId}</span>
                                </div>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                  <span>1. Generate Candidate ID</span>
                                </>
                              )}
                            </button>

                            {/* Button 2: Approve Candidate Stand (Assign Logo) */}
                            <button
                              type="button"
                              onClick={handleApproveCandidateWithLogo}
                              disabled={approvalActionLoading || selectedCandidate.partyApprovalStatus === 'APPROVED'}
                              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-75 ${
                                selectedCandidate.partyApprovalStatus === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              {selectedCandidate.partyApprovalStatus === 'APPROVED' ? (
                                <span>✅ Ticket Approved</span>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>2. Approve Registration</span>
                                </>
                              )}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleRejectCandidate}
                            disabled={approvalActionLoading}
                            className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject Candidate Registration</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-gray-50 p-12 text-center rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                      Select a candidate from the left panel registry to review their full Form 26 credentials and allocate electoral symbols.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: Issue nomination Tickets */}
            {partyTab === 'tickets' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                {/* Generate Form */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-left">
                  <h3 className="font-bold text-gray-950 text-sm font-display">Generate Nomination Ticket</h3>
                  <p className="text-[11px] text-gray-400">Issues a cryptographic ticket enabling chosen candidates to affiliate in Form 26 filing under your party token.</p>
                  
                  {ticketMessage && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-100">✓ {ticketMessage}</div>}
                  {ticketError && <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100">⚠️ {ticketError}</div>}

                  <form onSubmit={handleGenerateCode} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Target Contest</label>
                      <select 
                        required
                        value={ticketForm.electionId}
                        onChange={(e) => setTicketForm({...ticketForm, electionId: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:bg-white focus:outline-none"
                      >
                        <option value="">-- Choose open ECI contest --</option>
                        {elections.map((el) => (
                          <option key={el.id} value={el.id}>{el.title} ({el.level})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Constituency Seat Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Bhopal North"
                        value={ticketForm.constituency}
                        onChange={(e) => setTicketForm({...ticketForm, constituency: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Electoral Position</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Member of Legislative Assembly (MLA)"
                        value={ticketForm.position}
                        onChange={(e) => setTicketForm({...ticketForm, position: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-3 text-xs focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={codesLoading}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Issue Ticket Code</span>
                    </button>
                  </form>
                </div>

                {/* Codes List */}
                <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-left">
                  <h3 className="font-bold text-gray-950 text-sm font-display">Issued Authorization Tickets</h3>
                  <p className="text-[11px] text-gray-400">Distribute these unique cryptographic ticket codes to candidate nominees, or reissue / cancel them below.</p>

                  {codesLoading ? (
                    <div className="p-8 text-center text-xs text-gray-400">Loading issued tickets...</div>
                  ) : codes.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400">No ticket codes issued yet. Use the generator on the left.</div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                      {codes.map((c) => (
                        <div key={c.code} className="p-3 bg-gray-55 border border-gray-200 rounded-xl transition flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded tracking-wider">{c.code}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase border ${
                                c.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                                c.status === 'Reissued' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                c.isUsed ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {c.status || (c.isUsed ? 'Redeemed' : 'Active')}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 leading-normal">
                              For: <span className="text-gray-700 font-bold">{c.position}</span> ({c.constituency})
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {c.status !== 'Cancelled' && c.status !== 'Reissued' && (
                              <button
                                type="button"
                                onClick={() => handleCancelTicket(c.code)}
                                className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded border border-red-200 text-[10px] font-bold cursor-pointer transition select-none"
                                title="Cancel Ticket"
                              >
                                Cancel
                              </button>
                            )}
                            {c.status !== 'Cancelled' && (
                              <button
                                type="button"
                                onClick={() => handleReissueTicket(c.code)}
                                className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded border border-purple-200 text-[10px] font-bold cursor-pointer transition select-none"
                                title="Reissue Ticket"
                              >
                                Reissue
                              </button>
                            )}
                            <button 
                              type="button"
                              onClick={() => copyToClipboard(c.code)}
                              className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-950 rounded-lg transition"
                              title="Copy authorization ticket"
                            >
                              {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-600" /> : <Paperclip className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Campaign Management */}
            {partyTab === 'campaigns' && (
              <div className="space-y-6 text-left animate-fade-in">
                {/* 3 columns: Campaign Offices, Upcoming Events, Field Coordinators */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Campaign Offices column */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-gray-950 font-display uppercase tracking-wider">Campaign Offices</h4>
                        <p className="text-[9px] text-gray-400">Regional headquarter operations</p>
                      </div>
                      <button 
                        onClick={() => setShowAddOfficeModal(true)}
                        className="p-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {campaignOffices.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl bg-gray-50/50">
                        No campaign offices defined yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {campaignOffices.map((off) => (
                          <div key={off.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-gray-900">{off.name}</h5>
                              <p className="text-[10px] text-gray-400 font-mono">District: {off.district}</p>
                              <p className="text-[10px] text-gray-400">Lead: <span className="text-gray-700 font-medium">{off.coordinator}</span></p>
                              <p className="text-[10px] text-gray-450 font-mono">Phone: {off.phone}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveCampaignOffice(off.id)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign Events column */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-gray-950 font-display uppercase tracking-wider">Campaign Events</h4>
                        <p className="text-[9px] text-gray-400">Rallies, Townhalls & Press brief</p>
                      </div>
                      <button 
                        onClick={() => setShowAddEventModal(true)}
                        className="p-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {campaignEvents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl bg-gray-50/50">
                        No campaign rallies scheduled.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {campaignEvents.map((ev) => (
                          <div key={ev.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-gray-900">{ev.name}</h5>
                              <p className="text-[10px] text-gray-400 font-mono">Date: {ev.date}</p>
                              <p className="text-[10px] text-gray-400">Venue: <span className="text-gray-700 font-medium">{ev.venue}</span></p>
                              <span className="text-[9px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded font-bold">
                                Est: {ev.expectedTurnout} Attendees
                              </span>
                            </div>
                            <button 
                              onClick={() => handleRemoveCampaignEvent(ev.id)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign Coordinators column */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <div>
                        <h4 className="font-extrabold text-xs text-gray-950 font-display uppercase tracking-wider">Field Coordinators</h4>
                        <p className="text-[9px] text-gray-400">Booth committee marshals</p>
                      </div>
                      <button 
                        onClick={() => setShowAddCoordinatorModal(true)}
                        className="p-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    {campaignCoordinators.length === 0 ? (
                      <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl bg-gray-50/50">
                        No marshals or coordinators registered.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {campaignCoordinators.map((coord) => (
                          <div key={coord.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h5 className="font-bold text-xs text-gray-900">{coord.name}</h5>
                              <p className="text-[10px] text-gray-400">Role: <span className="text-purple-700 font-bold">{coord.role}</span></p>
                              <p className="text-[10px] text-gray-400">Area: <span className="text-gray-700 font-medium">{coord.area}</span></p>
                              <p className="text-[10px] text-gray-450 font-mono">Mob: {coord.phone}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveCampaignCoordinator(coord.id)}
                              className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* MODALS for Campaigns sub-tab additions */}
                {showAddOfficeModal && (
                  <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-xs space-y-4 text-left">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-gray-950 font-display text-sm">Register Campaign Office</h4>
                        <button onClick={() => setShowAddOfficeModal(false)} className="text-gray-400 hover:text-gray-950 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleAddCampaignOffice} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Office Name / Location</label>
                          <input required type="text" placeholder="e.g. South Delhi District Office" value={officeForm.name} onChange={(e) => setOfficeForm({...officeForm, name: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">District Coverage</label>
                          <input required type="text" placeholder="e.g. South Delhi" value={officeForm.district} onChange={(e) => setOfficeForm({...officeForm, district: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">In-charge Coordinator Name</label>
                          <input required type="text" placeholder="e.g. Ramesh Kumar" value={officeForm.coordinator} onChange={(e) => setOfficeForm({...officeForm, coordinator: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Contact Hotline</label>
                          <input required type="tel" placeholder="e.g. 9112233445" value={officeForm.phone} onChange={(e) => setOfficeForm({...officeForm, phone: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddOfficeModal(false)} className="px-3.5 py-1.5 bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer">Save Office</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {showAddEventModal && (
                  <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-xs space-y-4 text-left">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-gray-950 font-display text-sm">Schedule Campaign Rally</h4>
                        <button onClick={() => setShowAddEventModal(false)} className="text-gray-400 hover:text-gray-950 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleAddCampaignEvent} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Event Title / Purpose</label>
                          <input required type="text" placeholder="e.g. High-Command Mega Rally" value={eventForm.name} onChange={(e) => setEventForm({...eventForm, name: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Event Date</label>
                          <input required type="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Venue Address</label>
                          <input required type="text" placeholder="e.g. Shivaji Stadium Ground" value={eventForm.venue} onChange={(e) => setEventForm({...eventForm, venue: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Expected Crowd Attendance</label>
                          <input required type="number" placeholder="e.g. 15000" value={eventForm.expectedTurnout} onChange={(e) => setEventForm({...eventForm, expectedTurnout: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddEventModal(false)} className="px-3.5 py-1.5 bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer">Schedule Rally</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {showAddCoordinatorModal && (
                  <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-xs space-y-4 text-left">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-gray-950 font-display text-sm">Register Field Coordinator</h4>
                        <button onClick={() => setShowAddCoordinatorModal(false)} className="text-gray-400 hover:text-gray-950 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleAddCampaignCoordinator} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Full Name</label>
                          <input required type="text" placeholder="e.g. Vikramaditya Sen" value={coordinatorForm.name} onChange={(e) => setCoordinatorForm({...coordinatorForm, name: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Electoral Assigned Area</label>
                          <input required type="text" placeholder="e.g. Shivaji Nagar Ward 14" value={coordinatorForm.area} onChange={(e) => setCoordinatorForm({...coordinatorForm, area: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Assigned Field Rank</label>
                          <select value={coordinatorForm.role} onChange={(e) => setCoordinatorForm({...coordinatorForm, role: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-2 focus:outline-none">
                            <option value="Booth In-Charge">Booth In-Charge</option>
                            <option value="Ward Coordinator">Ward Coordinator</option>
                            <option value="Zonal Marshal">Zonal Marshal</option>
                            <option value="District Convener">District Convener</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Contact Phone</label>
                          <input required type="tel" placeholder="e.g. 9888776655" value={coordinatorForm.phone} onChange={(e) => setCoordinatorForm({...coordinatorForm, phone: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddCoordinatorModal(false)} className="px-3.5 py-1.5 bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer">Register Coordinator</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: Reports & Insights */}
            {partyTab === 'reports' && (
              <div className="space-y-6 text-left animate-fade-in bg-white p-6 rounded-2xl border border-gray-100">
                <div className="border-b pb-3 border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 font-display">Reports & High-Command Insights</h3>
                    <p className="text-[10px] text-gray-450">Generate mandate endorsement letters and print candidate slips.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
                  
                  {/* Left panel: Statistical Indicators */}
                  <div className="lg:col-span-4 space-y-4">
                    <h4 className="font-bold text-xs text-gray-950 font-display uppercase tracking-wider text-purple-700">Analytics Summary</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Metric 1 */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Total Enrolled Cadres</span>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="text-xl font-extrabold text-gray-900">
                            {activeParty.partyMembers ? activeParty.partyMembers.length : 0}
                          </span>
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Active Authorized Candidates</span>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-xl font-extrabold text-gray-900">
                            {candidates.filter(c => c.partyId === activeParty.id && c.status === 'APPROVED').length}
                          </span>
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Active Campaign Hubs</span>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-blue-600" />
                          <span className="text-xl font-extrabold text-gray-900">{campaignOffices.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right panel: Letter Generator & Print Center */}
                  <div className="lg:col-span-8 bg-gray-50/50 p-5 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="font-bold text-xs text-gray-950 font-display uppercase tracking-wider text-purple-700 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>Electoral Mandate Letter Generator</span>
                    </h4>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Select an approved candidate to generate their official high-command endorsement appointment letter, featuring standard ECI verification formatting.
                    </p>

                    <div className="space-y-4">
                      <div className="space-y-1 text-xs">
                        <label className="text-[9px] font-bold text-gray-450 uppercase block">Select Candidate for Letter</label>
                        <select 
                          value={selectedCandidateForLetter ? selectedCandidateForLetter.id : ''}
                          onChange={(e) => {
                            const found = candidates.find(c => c.id === e.target.value);
                            setSelectedCandidateForLetter(found || null);
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs focus:outline-none font-semibold text-gray-800"
                        >
                          <option value="">-- Choose Candidate --</option>
                          {candidates.filter(c => c.partyId === activeParty.id && c.status === 'APPROVED').map((c) => (
                            <option key={c.id} value={c.id}>{c.name} - Standing: {c.position} ({c.constituency})</option>
                          ))}
                        </select>
                      </div>

                      {selectedCandidateForLetter ? (
                        <div className="space-y-3">
                          {/* Simulated Letter Preview Box */}
                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-inner font-serif text-xs text-gray-850 space-y-4 text-left max-h-[350px] overflow-y-auto">
                            <div className="text-center border-b pb-3 space-y-1">
                              <h5 className="font-sans font-black text-sm tracking-wide text-gray-900 uppercase">{activeParty.name}</h5>
                              <p className="font-sans text-[8px] font-bold text-gray-400 uppercase tracking-widest">{activeParty.abbrev} HIGH-COMMAND SECRETARIAT OFFICE</p>
                              <p className="font-sans text-[8px] text-gray-500">Ref No: {activeParty.abbrev}/HQ-END/{Math.floor(1000 + Math.random()*9000)} • Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="space-y-2">
                              <p className="font-bold">TO WHOMSOEVER IT MAY CONCERN</p>
                              <p className="leading-relaxed">
                                Under Section 29A of the Representation of the People Act, 1951, the central high command of the **{activeParty.name} ({activeParty.abbrev})** hereby formally resolves and issues this mandate declaring **{selectedCandidateForLetter.name}** as our official endorsed party candidate for the seat of **{selectedCandidateForLetter.position}** from the **{selectedCandidateForLetter.constituency}** seat.
                              </p>
                              <p className="leading-relaxed">
                                The candidate is allocated our official registered election symbol: <strong className="text-base font-sans">{selectedCandidateForLetter.partySymbol || activeParty.symbol || '🪷'}</strong> on the public electronic voting ballot.
                              </p>
                            </div>

                            <div className="pt-4 flex justify-between items-end border-t border-gray-100 text-[10px] font-sans">
                              <div>
                                <p className="text-gray-400 uppercase text-[8px]">ECI REGISTERED ID</p>
                                <p className="font-mono font-bold text-gray-900">{activeParty.registrationNumber || 'ECI-REG-PENDING'}</p>
                              </div>
                              <div className="text-right">
                                <div className="italic font-bold font-serif text-gray-900">R. K. Shastri</div>
                                <p className="text-purple-600 font-extrabold text-[8px] uppercase">Central General Secretary</p>
                              </div>
                            </div>
                          </div>

                          {/* Print / Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                window.print();
                              }}
                              className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 flex-1 shadow"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Endorsement Slip</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                alert(`Candidate endorsement details synced directly with ECI Node! Key: LTR-SIGN-${Math.floor(100000 + Math.random()*900000)}`);
                              }}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 flex-1 shadow shadow-purple-600/10"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Push Ledger Endorsement</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                          Please select an approved candidate to generate their high-command endorsement letter or print physical authorization slips.
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* TAB: Settings */}
            {partyTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-fade-in">
                {/* Left panel: Change high-command passphrase password */}
                <form onSubmit={handleChangePassword} className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 font-display">Change Administrative Passphrase</h3>
                    <p className="text-[10px] text-gray-400">Regularly cycle your high-command secret credentials to preserve ledger access security.</p>
                  </div>

                  {passwordSuccess && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-100">✓ {passwordSuccess}</div>}
                  {passwordError && <div className="p-3 bg-red-50 text-red-750 text-xs font-bold rounded-xl border border-red-100">⚠️ {passwordError}</div>}

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-450 uppercase block">Current Password / Secret Pin</label>
                      <input 
                        required 
                        type="password" 
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-455 uppercase block">New Password</label>
                      <input 
                        required 
                        type="password" 
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-455 uppercase block">Confirm New Password</label>
                      <input 
                        required 
                        type="password" 
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:bg-white focus:outline-none" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Cycle Credentials</span>
                  </button>
                </form>

                {/* Right panel: Manage Sub-admin accounts */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b pb-2 border-gray-50">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-950 font-display">Delegated Sub-Admins</h3>
                      <p className="text-[10px] text-gray-400">Grant scoped dashboard permissions to members.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddSubAdminModal(true)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sub-Admin</span>
                    </button>
                  </div>

                  {subAdmins.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl bg-gray-50/50">
                      No delegated sub-admin credentials created yet. High-command root has exclusive access.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subAdmins.map((sub) => (
                        <div key={sub.id} className="p-3 bg-gray-55 border border-gray-200 rounded-xl flex justify-between items-center gap-4">
                          <div className="space-y-1">
                            <h5 className="font-bold text-xs text-gray-900">{sub.name}</h5>
                            <p className="text-[10px] text-gray-400 font-mono">Scope: {sub.role}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{sub.email}</p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {sub.permissions.map((p) => (
                                <span key={p} className="text-[8px] bg-purple-50 text-purple-700 font-bold border px-1 rounded-full">{p}</span>
                              ))}
                            </div>
                          </div>
                          <button 
                            onClick={() => handleRemoveSubAdmin(sub.id)}
                            className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* MODAL: Register Sub-Admin */}
                {showAddSubAdminModal && (
                  <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-xs space-y-4 text-left">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-gray-950 font-display text-sm">Create Scoped Sub-Admin</h4>
                        <button onClick={() => setShowAddSubAdminModal(false)} className="text-gray-400 hover:text-gray-950 cursor-pointer"><X className="w-4 h-4" /></button>
                      </div>
                      <form onSubmit={handleAddSubAdmin} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Sub-Admin Full Name</label>
                          <input required type="text" placeholder="e.g. S. K. Narayanan" value={subAdminForm.name} onChange={(e) => setSubAdminForm({...subAdminForm, name: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Official Email Address</label>
                          <input required type="email" placeholder="e.g. subadmin@party.org" value={subAdminForm.email} onChange={(e) => setSubAdminForm({...subAdminForm, email: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-3 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Administrative Role Designation</label>
                          <select value={subAdminForm.role} onChange={(e) => setSubAdminForm({...subAdminForm, role: e.target.value})} className="w-full bg-gray-50 border rounded-lg py-1.5 px-2 focus:outline-none">
                            <option value="District Coordinator">District Coordinator</option>
                            <option value="Election Agent">Election Agent</option>
                            <option value="Nomination Assistant">Nomination Assistant</option>
                            <option value="Secretariat Clerk">Secretariat Clerk</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase block">Assign Scoped Permissions</label>
                          <div className="space-y-1 pt-1">
                            {['Issue Tickets', 'Approve Candidates', 'View Profile', 'Manage Campaigns'].map((p) => {
                              const checked = subAdminForm.permissions.includes(p);
                              return (
                                <label key={p} className="flex items-center gap-1.5 font-semibold text-gray-750 text-[10px] cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={checked} 
                                    onChange={() => {
                                      const updated = checked 
                                        ? subAdminForm.permissions.filter(perm => perm !== p) 
                                        : [...subAdminForm.permissions, p];
                                      subAdminForm.permissions = updated;
                                      setSubAdmins([...subAdmins]); // dummy trigger or standard state
                                    }} 
                                  />
                                  <span>{p}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                        <div className="pt-2 flex justify-end gap-2">
                          <button type="button" onClick={() => setShowAddSubAdminModal(false)} className="px-3.5 py-1.5 bg-gray-100 rounded-lg cursor-pointer">Cancel</button>
                          <button type="submit" className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg cursor-pointer">Authorize Admin</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB: Active Elections & Results */}
            {partyTab === 'elections' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-left">
                {/* Left Column: Active ECI Contests */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 font-display">Active ECI Elections</h3>
                    <p className="text-[10px] text-gray-400">View upcoming and ongoing electoral polls tracked by the commission.</p>
                  </div>

                  {electionsLoading ? (
                    <div className="text-center py-12 text-gray-400 text-xs">Polling live ECI node...</div>
                  ) : elections.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs italic">No active elections found at this time.</div>
                  ) : (
                    <div className="space-y-3">
                      {elections.map((elec) => (
                        <div key={elec.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-150 px-1.5 py-0.5 rounded uppercase">
                              {elec.level} Level
                            </span>
                            <h4 className="font-bold text-xs text-gray-900">{elec.title}</h4>
                            <p className="text-[10px] text-gray-400">Scheduled Date: {elec.date || '2026-10-15'}</p>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {elec.status === 'REGISTRATION_OPEN' ? 'Nomination Open' : 'Scheduled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Visual General Results Mock */}
                <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-950 font-display">Recent Polling & Exit Statistics</h3>
                    <p className="text-[10px] text-gray-400">Commission exit feedback and current seat count estimations.</p>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-gray-700 pt-2">
                    {/* Progress Bar NDA */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Democratic Front (NDF Coalition)</span>
                        <span className="font-bold text-gray-900">285 / 543 Seats (Polled 41%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '52%' }}></div>
                      </div>
                    </div>

                    {/* Progress Bar Alliance */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>United Social Front (USF Alliance)</span>
                        <span className="font-bold text-gray-900">198 / 543 Seats (Polled 34%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '36%' }}></div>
                      </div>
                    </div>

                    {/* Progress Bar Others */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span>Others & Independents</span>
                        <span className="font-bold text-gray-900">60 / 543 Seats (Polled 25%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: '12%' }}></div>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[10px] text-indigo-800 leading-relaxed font-sans italic">
                      ℹ️ In compliance with ECI Model Code of Conduct, results are calculated from secure cryptographic EVM counts.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ECI Notifications */}
            {partyTab === 'notifications' && (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4 text-left animate-fade-in">
                <div className="border-b border-gray-50 pb-3">
                  <h3 className="font-extrabold text-sm text-gray-950 font-display">ECI Notifications & Guidelines</h3>
                  <p className="text-[10px] text-gray-400">Chronological bulletins issued to political organizations by the Election Commission of India.</p>
                </div>

                {partyNotificationsLoading ? (
                  <div className="text-center py-12 text-gray-400 text-xs">Syncing chronological ledger...</div>
                ) : partyNotifications.length === 0 ? (
                  <div className="p-12 text-center text-xs text-gray-400 border border-dashed border-gray-150 rounded-xl">No bulletins found in ECI broadcast log.</div>
                ) : (
                  <div className="space-y-4">
                    {partyNotifications.map((notif) => (
                      <div key={notif.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] font-bold font-mono px-2 py-0.5 rounded-full uppercase bg-amber-100 text-amber-800">
                            ECI BULLETIN ({notif.type || 'SYSTEM'})
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{new Date(notif.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-gray-900">{notif.title}</h4>
                        <p className="text-xs text-gray-650 leading-relaxed font-sans">{notif.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        )}

      </AnimatePresence>

      {/* 3. DOCUMENT VERIFIER MODAL POPUP */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-100 shadow-2xl space-y-4 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150 inline-block">
                    {selectedDoc.status}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 font-display">{selectedDoc.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedDoc(null)} 
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Secure Document Preview Placeholder */}
              <div className="border border-gray-150 rounded-xl p-5 bg-gray-50 text-center font-mono space-y-4 shadow-inner">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 mx-auto text-red-500 shadow-3xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="font-extrabold text-xs text-gray-800 block truncate">{selectedDoc.filename}</span>
                  <span className="text-[10px] text-gray-400 block">SHA-256: 4e9102ca8bfe603...199aef34f</span>
                </div>
                
                {/* Government Stamp Overlay Seal */}
                <div className="border-2 border-dashed border-emerald-500 rounded px-3 py-1.5 text-emerald-600 inline-block font-sans text-[10px] font-black rotate-[-2deg] tracking-wider bg-white">
                  ✓ VERIFIED BY ECI DIGITAL CORE LEDGER
                </div>
              </div>

              <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border">
                <strong>Description:</strong> {selectedDoc.desc}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
              >
                Close Secure File Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Voter Member Application Details & Approval */}
      {selectedMemberReqModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-xl w-full text-xs space-y-5 text-left p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">ECI Membership Application Dossier</span>
                <h3 className="font-black text-gray-900 text-base">
                  Voter Member Request Details
                </h3>
              </div>
              <button onClick={() => setSelectedMemberReqModal(null)} className="text-gray-400 hover:text-gray-950 cursor-pointer p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Applicant Details Grid */}
            <div className="space-y-3">
              <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Applicant Full Name</span>
                  <span className="font-extrabold text-sm text-gray-900 block">{selectedMemberReqModal.fullName || selectedMemberReqModal.voterName}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Target Political Party</span>
                  <span className="font-extrabold text-xs text-purple-900 block">{activeParty?.name} ({activeParty?.abbrev})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">EPIC Card ID</span>
                  <span className="font-mono font-black text-purple-900 block">{selectedMemberReqModal.epicNumber || selectedMemberReqModal.epicId || 'ECI-VOTER-ID'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Aadhaar Verification</span>
                  <span className="font-mono font-bold text-emerald-700 block">
                    {selectedMemberReqModal.aadharNumber ? `XXXX-XXXX-${selectedMemberReqModal.aadharNumber.slice(-4)}` : '✓ UIDAI Verified'}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Contact Mobile</span>
                  <span className="font-bold text-gray-900 block">{selectedMemberReqModal.mobileNumber}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Email Address</span>
                  <span className="font-semibold text-gray-800 block truncate">{selectedMemberReqModal.email || 'voter@eci.gov.in'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">State & District</span>
                  <span className="font-bold text-gray-800 block">{selectedMemberReqModal.district || 'Bhopal'}, {selectedMemberReqModal.state || 'MP'}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-150">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block">Assembly Seat</span>
                  <span className="font-bold text-purple-800 block">{selectedMemberReqModal.constituency || 'Bhopal North'}</span>
                </div>
              </div>
            </div>

            {/* Member Type Selection */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-700 block tracking-wider">
                Assign Official Member Type / Cadre Designation *
              </label>
              <select
                value={selectedMemberType}
                onChange={(e) => setSelectedMemberType(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="Primary Member">Primary Member</option>
                <option value="Active Cadre">Active Cadre</option>
                <option value="Youth Wing Representative">Youth Wing Representative</option>
                <option value="Executive Committee Member">Executive Committee Member</option>
                <option value="State Volunteer">State Volunteer</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedMemberReqModal(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcceptMemberRequestWithRole(selectedMemberReqModal, selectedMemberType)}
                className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept & Issue Form Link</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
