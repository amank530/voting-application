export type UserRole = 'ELECTION_COMMISSION' | 'PARTY_ADMIN' | 'CANDIDATE' | 'VOTER' | 'GUEST';

export type ElectionLevel =
  | 'Gram Panchayat'
  | 'Nagar Panchayat'
  | 'Municipal Council'
  | 'Municipal Corporation'
  | 'Zila Parishad'
  | 'State Legislative Assembly (MLA)'
  | 'State Legislative Council (MLC)'
  | 'Lok Sabha (MP)'
  | 'Rajya Sabha (MP)'
  | 'President'
  | 'Vice President';

export interface User {
  id: string;
  mobileNumber: string;
  name: string;
  role: UserRole;
  isVerified: boolean;
  age?: number;
  state?: string;
  district?: string;
  constituency?: string;
  cityGramNagar?: string;
  city?: string;
  isBlocked?: boolean;
  gender?: string;
  address?: string;
  aadharNumber?: string;
  password?: string;
  nominationStatus?: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  nominationDetails?: any;
  dob?: string;
  twoFactorEnabled?: boolean;
}

export interface Election {
  id: string;
  title: string;
  level: ElectionLevel;
  state?: string;
  district?: string;
  constituency?: string;
  cityGramNagar?: string;
  votingDate: string;
  countingDate: string;
  status: 'CREATED' | 'REGISTRATION_OPEN' | 'CANDIDATE_LIST_PUBLISHED' | 'VOTING_OPEN' | 'VOTING_ENDED' | 'RESULTS_PUBLISHED' | 'ARCHIVED';
  candidateCount: number;
  voteCount: number;
  winnerCandidateId?: string;
  winnerName?: string;
  winnerParty?: string;
  winnerVotes?: number;
  totalVotersInConstituency?: number;
}

export interface PoliticalParty {
  id: string;
  name: string;
  abbrev: string;
  symbol: string; // symbol name or emoji/icon class
  manifesto?: string;
  approved: boolean;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  adminId: string;
  registrationNumber?: string;
  password?: string;

  // Step 1: Basic Party Information
  motto?: string;
  ideology?: string;
  partyType?: string; // National / State / Regional / Local
  dateOfFormation?: string;
  officialEmail?: string;
  officialPhone?: string;
  officialWebsite?: string;
  logoUrl?: string;

  // Step 2: Registered Office Details
  officeAddress?: string;
  officeState?: string;
  officeDistrict?: string;
  officeCityVillage?: string;
  officePinCode?: string;
  officeAddressProofUrl?: string;

  // Step 3: Party President Details
  presidentName?: string;
  presidentDob?: string;
  presidentGender?: string;
  presidentMobile?: string;
  presidentEmail?: string;
  presidentAadhar?: string;
  presidentPan?: string;
  presidentAddress?: string;
  presidentPhotoUrl?: string;
  presidentIdProofUrl?: string;

  // Step 4: Office Bearers
  officeBearers?: Array<{
    fullName: string;
    position: string;
    mobileNumber: string;
    email: string;
    address: string;
    photoUrl?: string;
    idProofUrl?: string;
  }>;

  // Step 5: Party Constitution
  constitutionObjective?: string;
  constitutionPdfUrl?: string;
  membershipRules?: string;
  internalElectionProcess?: string;
  disciplinaryRules?: string;

  // Step 6: Party Members
  partyMembers?: Array<{
    fullName: string;
    mobileNumber: string;
    state: string;
    district: string;
    membershipId: string;
    joiningDate: string;
  }>;

  // Step 7: Bank & Financial Details
  bankName?: string;
  bankAccountHolderName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankPanNumber?: string;
  bankTreasurerName?: string;

  // Step 8: Election Details
  electionLevels?: string[];

  // Step 9: Documents Upload
  docPartyConstitution?: string;
  docPresidentIdProof?: string;
  docPresidentPhoto?: string;
  docOfficeAddressProof?: string;
  docPanCard?: string;
  docBankProof?: string;
  docPartyLogo?: string;

  // Step 10: Declaration
  declDeclaredTrue?: boolean;
  declDigitalSignature?: string;
  declSignatureUrl?: string;
  declDate?: string;
}

export interface Candidate {
  id: string;
  name: string;
  electionId: string;
  electionTitle: string;
  electionLevel: ElectionLevel;
  constituency: string;
  state?: string;
  district?: string;
  cityGramNagar?: string;
  partyId?: string;
  partyName?: string;
  partySymbol?: string;
  isIndependent: boolean;
  authorizationCode?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  photo?: string;
  manifesto?: string;
  biography?: string;
  age: number;
  education?: string;
  assets?: string;
  mobileNumber: string;
  position?: string;
  workingPosition?: string;
  netWorth?: string;
  documents?: {
    aadhar?: string;
    pan?: string;
    affidavit?: string;
    character?: string;
    ticket?: string;
  };
}

export interface CandidateCode {
  code: string;
  partyId: string;
  partyAbbrev: string;
  constituency: string;
  electionLevel: ElectionLevel;
  position: string;
  isUsed: boolean;
  candidateName: string;
  electionId: string;
  createdAt: string;
}

export interface Vote {
  id: string;
  electionId: string;
  voterId: string; // obfuscated/hashed in real system, linked securely here
  candidateId: string;
  partyId?: string;
  timestamp: string;
  receiptId: string;
  encryptionSignature: string; // AES-256 simulated signature
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface EciNotification {
  id: string;
  title: string;
  content: string;
  type: 'URGENT' | 'UPDATE' | 'ELECTION';
  timestamp: string;
  attachmentUrl?: string;
}

export interface LiveStats {
  totalRegisteredVoters: number;
  totalCandidates: number;
  totalPoliticalParties: number;
  totalElections: number;
  votesCast: number;
  turnoutPercent: number;
}

export interface PartyWinnerStats {
  partyAbbrev: string;
  partyName: string;
  partySymbol: string;
  seatsWon: number;
  totalVotes: number;
}
