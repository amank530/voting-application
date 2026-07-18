import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { UserRole, ElectionLevel } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Helper middleware for logging API requests
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

  // Simulated OTP Storage (Memory Only)
  const activeOTPs: Record<string, string> = {
    '9876543210': '123456', // EC Super Admin
    '8888888888': '123456', // BJP national admin
    '8888888889': '123456', // INC national admin
    '7777777777': '123456', // Candidate
    '9999999999': '123456', // Voter
  };

  // --- API Routes ---

  // 1. Auth API
  // Request OTP
  app.post('/api/auth/request-otp', (req: Request, res: Response) => {
    const { mobileNumber } = req.body;
    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    
    // Simulate generation
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    activeOTPs[mobileNumber] = generatedOtp;

    console.log(`[Firebase OTP Simulation] OTP for ${mobileNumber} is ${generatedOtp}`);

    return res.json({ 
      success: true, 
      message: 'OTP sent successfully (Simulated)',
      otp: generatedOtp // Return it so the UI can show a helper in a sandbox
    });
  });

  // Verify OTP & Login
  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { mobileNumber, otp } = req.body;
    
    if (!mobileNumber || !otp) {
      return res.status(400).json({ error: 'Mobile number and OTP are required.' });
    }

    const storedOtp = activeOTPs[mobileNumber];
    if (storedOtp !== otp) {
      return res.status(401).json({ error: 'Invalid verification code. Please try again.' });
    }

    // OTP verified, lookup user
    let user = db.getUserByMobile(mobileNumber);
    let isNewUser = false;

    if (!user) {
      // Create a default voter user
      isNewUser = true;
      user = db.createUser({
        mobileNumber,
        name: `Voter-${mobileNumber.substring(6)}`,
        role: 'VOTER',
        isVerified: true,
        age: 18 // Default voting age
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'This account has been locked or suspended due to security audit compliance.' });
    }

    // Clear OTP after use
    delete activeOTPs[mobileNumber];

    return res.json({
      success: true,
      user,
      token: `sim-jwt-${Buffer.from(JSON.stringify(user)).toString('base64').substring(0, 40)}`
    });
  });

  // Citizen Sign Up / Multi-step Wizard Register
  app.post('/api/auth/citizen-signup', (req: Request, res: Response) => {
    const { name, age, gender, address, aadharNumber, password, mobileNumber, state, district, constituency, city } = req.body;
    
    if (!aadharNumber || aadharNumber.replace(/\s/g, '').length !== 12) {
      return res.status(400).json({ error: 'Please enter a valid 12-digit Aadhaar number.' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 18) {
      return res.status(400).json({ error: 'Age compliance failed. You must be at least 18 years old to register.' });
    }

    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    // Check if Aadhaar is already registered
    const existing = db.getUserByAadhar(aadharNumber);
    if (existing) {
      return res.status(400).json({ error: 'A citizen profile with this Aadhaar number is already registered.' });
    }

    const newUser = db.createUser({
      mobileNumber: mobileNumber || `9${Math.floor(100000000 + Math.random() * 900000000)}`, // random mobile if not specified
      name,
      role: 'VOTER',
      isVerified: true,
      age: ageNum,
      gender,
      address,
      aadharNumber,
      password,
      state: state || '',
      district: district || '',
      constituency: constituency || '',
      city: city || '',
      nominationStatus: 'NONE'
    });

    return res.json({
      success: true,
      user: newUser,
      token: `sim-jwt-${Buffer.from(JSON.stringify(newUser)).toString('base64').substring(0, 40)}`
    });
  });

  // Citizen Login (Aadhaar and Password)
  app.post('/api/auth/citizen-login', (req: Request, res: Response) => {
    const { aadharNumber, password } = req.body;

    if (!aadharNumber || !password) {
      return res.status(400).json({ error: 'Aadhaar number and password are required.' });
    }

    // Find citizen
    const user = db.getUserByAadhar(aadharNumber);
    if (!user) {
      return res.status(401).json({ error: 'Invalid Aadhaar number or password.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid Aadhaar number or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'This account has been locked or suspended due to security audit compliance.' });
    }

    return res.json({
      success: true,
      user,
      token: `sim-jwt-${Buffer.from(JSON.stringify(user)).toString('base64').substring(0, 40)}`
    });
  });

  // Bypass / Quick Sandbox testing
  app.post('/api/auth/bypass', (req: Request, res: Response) => {
    const { role } = req.body;
    
    let defaultUser;
    if (role === 'ELECTION_COMMISSION') {
      defaultUser = db.getUserById('usr-ec-admin');
    } else if (role === 'PARTY_ADMIN') {
      defaultUser = db.getUserById('usr-party-bjp');
    } else {
      // Find or create default voter with Aadhaar
      let voter = db.getUserById('usr-voter-aman');
      if (voter) {
        if (!voter.aadharNumber) {
          voter = db.updateUser(voter.id, {
            aadharNumber: '111122223333',
            password: 'password',
            gender: 'Male',
            address: '78, Arera Colony, Bhopal, MP'
          }) || voter;
        }
      } else {
        voter = db.createUser({
          mobileNumber: '9999999999',
          name: 'Aman Patel',
          role: 'VOTER',
          isVerified: true,
          age: 26,
          state: 'Madhya Pradesh',
          district: 'Bhopal',
          constituency: 'Bhopal North',
          aadharNumber: '111122223333',
          password: 'password',
          gender: 'Male',
          address: '78, Arera Colony, Bhopal, MP',
          nominationStatus: 'NONE'
        });
      }
      defaultUser = voter;
    }

    if (!defaultUser) {
      return res.status(404).json({ error: 'Preconfigured user account not found.' });
    }

    return res.json({
      success: true,
      user: defaultUser,
      token: `sim-jwt-${Buffer.from(JSON.stringify(defaultUser)).toString('base64').substring(0, 40)}`
    });
  });

  // Sign Up / Register Profile
  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const { mobileNumber, name, age, state, district, constituency, role } = req.body;
    
    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
    }
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 18) {
      return res.status(400).json({ error: 'Age compliance failed. You must be at least 18 years old to register.' });
    }

    // Check if user already exists
    let user = db.getUserByMobile(mobileNumber);
    if (user) {
      return res.status(400).json({ error: 'An ECI profile with this mobile number is already registered. Please login instead.' });
    }

    user = db.createUser({
      mobileNumber,
      name,
      role: role || 'VOTER',
      isVerified: true,
      age: ageNum,
      state,
      district,
      constituency
    });

    return res.json({
      success: true,
      user,
      token: `sim-jwt-${Buffer.from(JSON.stringify(user)).toString('base64').substring(0, 40)}`
    });
  });

  // Self Profile Information
  app.get('/api/auth/profile/:id', (req: Request, res: Response) => {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  });

  // Update Profile (e.g. Setting state/district/constituency for a voter)
  app.put('/api/auth/profile/:id', (req: Request, res: Response) => {
    const { name, age, state, district, constituency, city, gender, address, dob, twoFactorEnabled } = req.body;
    const user = db.updateUser(req.params.id, { name, age, state, district, constituency, city, gender, address, dob, twoFactorEnabled });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, user });
  });

  // Block/unblock Voter (Admin only)
  app.put('/api/admin/users/:id/status', (req: Request, res: Response) => {
    const { isBlocked, adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Access denied. Election Commission privilege required.' });
    }

    const user = db.updateUser(req.params.id, { isBlocked });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.logAction(adminId, admin.name, 'ELECTION_COMMISSION', isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER', `Account status modified for: ${user.name}`);
    return res.json({ success: true, user });
  });

  // 2. Elections API
  app.get('/api/elections', (req: Request, res: Response) => {
    return res.json(db.getElections());
  });

  app.post('/api/elections', (req: Request, res: Response) => {
    const { title, level, state, district, constituency, votingDate, countingDate, adminId } = req.body;
    
    // Check privilege
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    const newElection = db.createElection({
      title,
      level,
      state,
      district,
      constituency,
      votingDate,
      countingDate,
      status: 'CREATED'
    });

    return res.json({ success: true, election: newElection });
  });

  app.put('/api/elections/:id', (req: Request, res: Response) => {
    const { status, votingDate, countingDate, adminId } = req.body;
    
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    if (status === 'RESULTS_PUBLISHED') {
      const updatedElection = db.publishResults(req.params.id);
      return res.json({ success: true, election: updatedElection });
    } else {
      const updatedElection = db.updateElection(req.params.id, { status, votingDate, countingDate });
      db.logAction(adminId, admin.name, 'ELECTION_COMMISSION', 'UPDATE_ELECTION_STATUS', `Election status changed to ${status} for ID ${req.params.id}`);
      return res.json({ success: true, election: updatedElection });
    }
  });

  app.delete('/api/elections/:id', (req: Request, res: Response) => {
    const { adminId } = req.query;
    const admin = db.getUserById(adminId as string);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    const success = db.deleteElection(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Election not found.' });
    }
    return res.json({ success: true });
  });

  // 3. Parties API
  app.get('/api/parties', (req: Request, res: Response) => {
    return res.json(db.getParties());
  });

  app.post('/api/parties', (req: Request, res: Response) => {
    const { name, abbrev, symbol, manifesto, adminId, ...otherFields } = req.body;
    const newParty = db.createParty({ name, abbrev, symbol, manifesto, adminId, ...otherFields });
    return res.json({ success: true, party: newParty });
  });

  app.put('/api/parties/:id/status', (req: Request, res: Response) => {
    const { status, adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    const party = db.updatePartyStatus(req.params.id, status);
    if (!party) {
      return res.status(404).json({ error: 'Party not found.' });
    }
    return res.json({ success: true, party });
  });

  app.put('/api/parties/:id', (req: Request, res: Response) => {
    const updates = req.body;
    const party = db.updateParty(req.params.id, updates);
    if (!party) {
      return res.status(404).json({ error: 'Party not found.' });
    }
    return res.json({ success: true, party });
  });

  // 4. Candidates API
  app.get('/api/candidates', (req: Request, res: Response) => {
    return res.json(db.getCanditates());
  });

  app.post('/api/candidates', (req: Request, res: Response) => {
    const { 
      name, electionId, electionTitle, electionLevel, constituency, 
      state, district, cityGramNagar, partyId, partyName, partySymbol, isIndependent, 
      authorizationCode, photo, manifesto, biography, age, education, assets, mobileNumber,
      position, workingPosition, netWorth, documents
    } = req.body;

    // Validation: Code validation if Party Candidate
    if (!isIndependent) {
      if (!authorizationCode) {
        return res.status(400).json({ error: 'Party candidates must provide a party-issued authorization code.' });
      }

      // Auto-provision simulated authorization codes starting with AUTH- or TKT- dynamically
      if (authorizationCode.startsWith('AUTH-') || authorizationCode.startsWith('TKT-')) {
        const existingCodes = db.getCodes();
        const codeFound = existingCodes.find(c => c.code.trim().toUpperCase() === authorizationCode.trim().toUpperCase());
        if (!codeFound) {
          existingCodes.push({
            code: authorizationCode,
            partyId: partyId || 'sim-party-id',
            partyAbbrev: (partyName || 'PTY').substring(0, 3).toUpperCase(),
            constituency: constituency || 'Bhopal North',
            electionLevel: electionLevel || 'Lok Sabha (MP)',
            position: position || 'MLA',
            isUsed: false,
            candidateName: name,
            electionId: electionId,
            createdAt: new Date().toISOString()
          });
          db.save();
        }
      }

      const check = db.validateAndUseCode(authorizationCode, name, constituency, electionId);
      if (!check.valid) {
        return res.status(400).json({ error: check.reason });
      }
    }

    const candidate = db.registerCandidate({
      name,
      electionId,
      electionTitle,
      electionLevel,
      constituency,
      state,
      district,
      cityGramNagar,
      partyId,
      partyName,
      partySymbol,
      isIndependent,
      authorizationCode,
      photo: photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', // placeholder
      manifesto,
      biography,
      age: Number(age),
      education,
      assets,
      mobileNumber,
      position,
      workingPosition,
      netWorth,
      documents
    } as any);

    // Automatically record nomination on user profile
    const existingUser = db.getUserByMobile(mobileNumber);
    if (existingUser) {
      db.updateUser(existingUser.id, { 
        nominationStatus: 'PENDING',
        nominationDetails: {
          electionId,
          electionTitle,
          electionLevel,
          constituency,
          position,
          workingPosition,
          netWorth,
          documents: documents || { aadhar: 'Uploaded (Simulated)', pan: 'Uploaded (Simulated)', affidavit: 'Uploaded (Simulated)' }
        }
      });
    }

    return res.json({ success: true, candidate });
  });

  app.put('/api/candidates/:id/status', (req: Request, res: Response) => {
    const { status, adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    const candidate = db.updateCandidateStatus(req.params.id, status);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // Update associated user record role and nomination status
    const associatedUser = db.getUserByMobile(candidate.mobileNumber);
    if (associatedUser) {
      if (status === 'APPROVED') {
        db.updateUser(associatedUser.id, {
          role: 'CANDIDATE',
          nominationStatus: 'APPROVED'
        });
      } else if (status === 'REJECTED') {
        db.updateUser(associatedUser.id, {
          nominationStatus: 'REJECTED'
        });
      }
    }

    return res.json({ success: true, candidate });
  });

  app.put('/api/candidates/:id/party-approve', (req: Request, res: Response) => {
    const { status, partyName, partySymbol, adminId } = req.body;
    
    const candidate = db.getCandidateById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found.' });
    }

    // Update candidate details in memory database
    candidate.status = status; // APPROVED or REJECTED or PENDING
    if (partyName) {
      candidate.partyName = partyName;
      candidate.isIndependent = false;
    }
    if (partySymbol) {
      candidate.partySymbol = partySymbol;
      candidate.isIndependent = false;
    }
    
    // Save database
    db.save();

    // Update associated user record role and nomination status
    const associatedUser = db.getUserByMobile(candidate.mobileNumber);
    if (associatedUser) {
      const currentNomDetails = associatedUser.nominationDetails || {};
      const updatedNomDetails = {
        ...currentNomDetails,
        partyName: partyName || candidate.partyName,
        partySymbol: partySymbol || candidate.partySymbol,
        position: candidate.position || currentNomDetails.position,
        workingPosition: candidate.workingPosition || currentNomDetails.workingPosition,
        netWorth: candidate.netWorth || currentNomDetails.netWorth,
        constituency: candidate.constituency || currentNomDetails.constituency,
      };

      if (status === 'APPROVED') {
        db.updateUser(associatedUser.id, {
          role: 'CANDIDATE',
          nominationStatus: 'APPROVED',
          nominationDetails: updatedNomDetails
        });
      } else if (status === 'REJECTED') {
        db.updateUser(associatedUser.id, {
          nominationStatus: 'REJECTED',
          nominationDetails: updatedNomDetails
        });
      } else {
        db.updateUser(associatedUser.id, {
          nominationStatus: status,
          nominationDetails: updatedNomDetails
        });
      }
    }

    // Log the action
    db.logAction(adminId || 'party-admin', 'Party High-Command', 'PARTY_ADMIN', `CANDIDATE_${status}`, `Approved candidate ${candidate.name} and assigned symbol ${partySymbol}`);

    return res.json({ success: true, candidate });
  });

  // 5. Candidate Authorization Code API
  app.get('/api/codes', (req: Request, res: Response) => {
    return res.json(db.getCodes());
  });

  app.post('/api/codes', (req: Request, res: Response) => {
    const { partyId, partyAbbrev, constituency, electionLevel, position, electionId, adminId } = req.body;
    
    // Check if requester is actual PARTY_ADMIN
    const requester = db.getUserById(adminId);
    if (!requester || requester.role !== 'PARTY_ADMIN') {
      return res.status(403).json({ error: 'Party Administrator privilege is required.' });
    }

    const newCode = db.generateCode(partyId, partyAbbrev, constituency, electionLevel, position, electionId);
    db.logAction(adminId, requester.name, 'PARTY_ADMIN', 'GENERATE_CANDIDATE_CODE', `Generated code ${newCode.code} for constituency ${constituency}`);

    return res.json({ success: true, code: newCode });
  });

  // 6. Voting API
  app.get('/api/votes/status', (req: Request, res: Response) => {
    const { voterId, electionId } = req.query;
    if (!voterId || !electionId) {
      return res.status(400).json({ error: 'voterId and electionId are required.' });
    }
    const voted = db.hasVoted(voterId as string, electionId as string);
    return res.json({ hasVoted: voted });
  });

  app.post('/api/votes', (req: Request, res: Response) => {
    const { electionId, voterId, candidateId, partyId } = req.body;
    
    if (!electionId || !voterId || !candidateId) {
      return res.status(400).json({ error: 'Missing voting parameters.' });
    }

    // Verify Voter Details
    const voter = db.getUserById(voterId);
    if (!voter) {
      return res.status(404).json({ error: 'Voter profile not registered.' });
    }

    if (voter.isBlocked) {
      return res.status(403).json({ error: 'Your voter account has been flagged for administrative review.' });
    }

    // Check age requirement
    if (!voter.age || voter.age < 18) {
      return res.status(403).json({ error: 'Age compliance failed. You must be 18 years or older to cast a vote.' });
    }

    try {
      const voteReceipt = db.castVote(electionId, voterId, candidateId, partyId);
      return res.json({ success: true, receipt: voteReceipt });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || 'Failed to register your vote. Security policy violation.' });
    }
  });

  // 7. Bulletins / Notifications API
  app.get('/api/notifications', (req: Request, res: Response) => {
    return res.json(db.getNotifications());
  });

  app.post('/api/notifications', (req: Request, res: Response) => {
    const { title, content, type, adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }

    const notif = db.createNotification({ title, content, type });
    return res.json({ success: true, notification: notif });
  });

  // 8. General Stats & Dashboards API
  app.get('/api/stats', (req: Request, res: Response) => {
    return res.json(db.getLiveStats());
  });

  app.get('/api/logs', (req: Request, res: Response) => {
    const { adminId } = req.query;
    const admin = db.getUserById(adminId as string);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin privilege required to view security audit logs.' });
    }
    return res.json(db.getAuditLogs());
  });

  // 9. Administrative Backup & Recovery
  app.post('/api/admin/backup', (req: Request, res: Response) => {
    const { adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }
    const response = db.backupDatabase();
    return res.json(response);
  });

  app.post('/api/admin/restore', (req: Request, res: Response) => {
    const { adminId } = req.body;
    const admin = db.getUserById(adminId);
    if (!admin || admin.role !== 'ELECTION_COMMISSION') {
      return res.status(403).json({ error: 'Super Admin permission required.' });
    }
    const response = db.restoreDatabase();
    return res.json(response);
  });


  // Vite middleware setup for Development or Static assets in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ECI Server] Portal running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Critical server startup failure:', err);
});
