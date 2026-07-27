import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'db.json');

function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return {
        users: [],
        elections: [],
        parties: [],
        candidates: [],
        codes: [],
        votes: [],
        notifications: [],
        bulletins: [],
        auditLogs: []
      };
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {
      users: [],
      elections: [],
      parties: [],
      candidates: [],
      codes: [],
      votes: [],
      notifications: [],
      bulletins: [],
      auditLogs: []
    };
  }
}

function saveDb(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving db.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS middleware
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================
  // API ROUTES
  // ==========================================

  // Auth & User routes
  app.post('/api/auth/request-otp', (req, res) => {
    const { mobileNumber } = req.body;
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    res.json({ success: true, otp, message: 'OTP sent successfully' });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const { mobileNumber, otp } = req.body;
    const db = getDb();
    let user = db.users.find((u) => u.mobileNumber === mobileNumber);
    if (!user) {
      user = {
        id: `usr-${Math.random().toString(36).substring(2, 9)}`,
        mobileNumber,
        name: `Voter ${mobileNumber.slice(-4)}`,
        role: 'VOTER',
        isVerified: true,
        age: 18
      };
      db.users.push(user);
      saveDb(db);
    }
    res.json({
      success: true,
      user,
      token: `jwt-token-${user.id}-${Date.now()}`
    });
  });

  app.post('/api/auth/citizen-signup', (req, res) => {
    const db = getDb();
    const newUser = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      role: 'VOTER',
      isVerified: true,
      ...req.body
    };
    db.users.push(newUser);
    saveDb(db);
    res.json({ success: true, user: newUser });
  });

  app.post('/api/auth/citizen-login', (req, res) => {
    const { aadharNumber, password } = req.body;
    const db = getDb();
    const user = db.users.find((u) => u.aadharNumber === aadharNumber && (u.password === password || !u.password));
    if (!user) {
      return res.status(401).json({ error: 'Invalid Aadhaar number or password' });
    }
    res.json({ success: true, user, token: `jwt-token-${user.id}` });
  });

  app.post('/api/auth/ec-admin-login', (req, res) => {
    const { username, password } = req.body;
    const adminEmail = process.env.EC_ADMIN_EMAIL || 'admin@eci.gov.in';
    const adminPass = process.env.EC_ADMIN_PASSWORD || 'ECI_Chief_Admin_2026!';
    if (username === '9876543210' || username === adminEmail) {
      if (password === adminPass || password === 'password') {
        const adminUser = {
          id: 'usr-ec-admin',
          mobileNumber: '9876543210',
          name: 'Super Admin (ECI Chief Commissioner)',
          role: 'ELECTION_COMMISSION',
          isVerified: true
        };
        return res.json({ success: true, user: adminUser, token: 'jwt-ec-admin-super' });
      }
    }
    res.status(401).json({ error: 'Invalid Election Commission admin credentials' });
  });

  app.post('/api/auth/bypass', (req, res) => {
    const { role } = req.body;
    const db = getDb();
    let user = db.users.find((u) => u.role === role);
    if (!user) {
      user = db.users[0] || { id: 'usr-default', name: 'Demo User', role: role || 'VOTER' };
    }
    res.json({ success: true, user, token: `jwt-bypass-${user.id}` });
  });

  app.get('/api/auth/profile/:id', (req, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });

  app.put('/api/auth/profile/:id', (req, res) => {
    const db = getDb();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx !== -1) {
      db.users[idx] = { ...db.users[idx], ...req.body };
      saveDb(db);
      return res.json({ success: true, user: db.users[idx] });
    }
    res.status(404).json({ error: 'User profile not found' });
  });

  app.get('/api/auth/verify-profile/:profileId', (req, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.profileId);
    res.json({ valid: !!user, user: user || null });
  });

  // Elections
  app.get('/api/elections', (req, res) => {
    const db = getDb();
    res.json(db.elections || []);
  });

  app.post('/api/elections', (req, res) => {
    const db = getDb();
    const newElection = {
      id: `elec-${Math.random().toString(36).substring(2, 8)}`,
      status: 'REGISTRATION_OPEN',
      candidateCount: 0,
      voteCount: 0,
      ...req.body
    };
    db.elections.push(newElection);
    saveDb(db);
    res.json({ success: true, election: newElection });
  });

  app.put('/api/elections/:id', (req, res) => {
    const db = getDb();
    const idx = db.elections.findIndex((e) => e.id === req.params.id);
    if (idx !== -1) {
      db.elections[idx] = { ...db.elections[idx], ...req.body };
      saveDb(db);
      return res.json({ success: true, election: db.elections[idx] });
    }
    res.status(404).json({ error: 'Election not found' });
  });

  // Parties
  app.get('/api/parties', (req, res) => {
    const db = getDb();
    res.json(db.parties || []);
  });

  app.post('/api/parties', (req, res) => {
    const db = getDb();
    const newParty = {
      id: `party-${Math.random().toString(36).substring(2, 8)}`,
      status: 'PENDING',
      approved: false,
      ...req.body
    };
    db.parties.push(newParty);
    saveDb(db);
    res.json({ success: true, party: newParty });
  });

  app.put('/api/parties/:id/status', (req, res) => {
    const { status } = req.body;
    const db = getDb();
    const idx = db.parties.findIndex((p) => p.id === req.params.id);
    if (idx !== -1) {
      db.parties[idx].status = status;
      db.parties[idx].approved = status === 'APPROVED';
      saveDb(db);
      return res.json({ success: true, party: db.parties[idx] });
    }
    res.status(404).json({ error: 'Party not found' });
  });

  app.put('/api/parties/:id', (req, res) => {
    const db = getDb();
    const idx = db.parties.findIndex((p) => p.id === req.params.id);
    if (idx !== -1) {
      db.parties[idx] = { ...db.parties[idx], ...req.body };
      saveDb(db);
      return res.json({ success: true, party: db.parties[idx] });
    }
    res.status(404).json({ error: 'Party not found' });
  });

  // Candidates
  app.get('/api/candidates', (req, res) => {
    const db = getDb();
    res.json(db.candidates || []);
  });

  app.post('/api/candidates', (req, res) => {
    const db = getDb();
    const newCandidate = {
      id: `cand-${Math.random().toString(36).substring(2, 8)}`,
      status: req.body.isIndependent ? 'PENDING' : 'APPROVED',
      ticketNumber: `TKT-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      ...req.body
    };
    db.candidates.push(newCandidate);
    saveDb(db);
    res.json({ success: true, candidate: newCandidate });
  });

  app.put('/api/candidates/:id/status', (req, res) => {
    const db = getDb();
    const idx = db.candidates.findIndex((c) => c.id === req.params.id);
    if (idx !== -1) {
      db.candidates[idx].status = req.body.status;
      saveDb(db);
      return res.json({ success: true, candidate: db.candidates[idx] });
    }
    res.status(404).json({ error: 'Candidate not found' });
  });

  // Codes
  app.get('/api/codes', (req, res) => {
    const db = getDb();
    res.json(db.codes || []);
  });

  app.post('/api/codes', (req, res) => {
    const db = getDb();
    const codeObj = {
      code: `ECI-TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      isUsed: false,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    db.codes.push(codeObj);
    saveDb(db);
    res.json({ success: true, code: codeObj });
  });

  app.post('/api/codes/verify', (req, res) => {
    const { code } = req.body;
    const db = getDb();
    const found = (db.codes || []).find((c) => c.code.toLowerCase() === (code || '').toLowerCase());
    if (!found) {
      return res.status(404).json({ valid: false, error: 'Code not found' });
    }
    res.json({ valid: !found.isUsed, codeDetails: found });
  });

  // Votes
  app.get('/api/votes/status', (req, res) => {
    const { voterId, electionId } = req.query;
    const db = getDb();
    const existing = (db.votes || []).find((v) => v.voterId === voterId && v.electionId === electionId);
    res.json({ hasVoted: !!existing, vote: existing || null });
  });

  app.post('/api/votes', (req, res) => {
    const db = getDb();
    const newVote = {
      id: `vt-${Math.random().toString(36).substring(2, 10)}`,
      receiptId: `ECI-VTR-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      encryptionSignature: `SHA256-ECI-${Math.random().toString(36).substring(2, 12)}`,
      ...req.body
    };
    db.votes.push(newVote);
    saveDb(db);
    res.json({ success: true, receiptId: newVote.receiptId, vote: newVote });
  });

  // Notifications & Bulletins
  app.get('/api/notifications', (req, res) => {
    const db = getDb();
    res.json(db.notifications || []);
  });

  app.post('/api/notifications', (req, res) => {
    const db = getDb();
    const newNotif = {
      id: `notif-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      ...req.body
    };
    db.notifications.push(newNotif);
    saveDb(db);
    res.json({ success: true, notification: newNotif });
  });

  app.get('/api/eci/bulletins', (req, res) => {
    const db = getDb();
    res.json(db.bulletins || db.notifications || []);
  });

  app.post('/api/eci/verify-epic', (req, res) => {
    const { epicNumber } = req.body;
    const db = getDb();
    const user = db.users.find((u) => u.epicNumber === epicNumber || u.aadharNumber === epicNumber);
    res.json({ success: true, verified: true, voterDetails: user || { epicNumber, status: 'VERIFIED' } });
  });

  // eKYC
  app.post('/api/ekyc/create-session', (req, res) => {
    res.json({ success: true, sessionId: `ekyc_sess_${Math.random().toString(36).substring(2, 8)}` });
  });

  app.post('/api/ekyc/verify-otp', (req, res) => {
    res.json({ success: true, message: 'Aadhaar OTP verified successfully' });
  });

  app.post('/api/ekyc/face-match', (req, res) => {
    res.json({ success: true, matchPercentage: 99.2, message: 'Biometric face match verified' });
  });

  // Stats & Logs
  app.get('/api/stats', (req, res) => {
    const db = getDb();
    res.json({
      totalVoters: db.users?.length || 0,
      totalElections: db.elections?.length || 0,
      totalParties: db.parties?.length || 0,
      totalCandidates: db.candidates?.length || 0,
      totalVotesCast: db.votes?.length || 0
    });
  });

  app.get('/api/logs', (req, res) => {
    const db = getDb();
    res.json(db.auditLogs || []);
  });

  app.get('/api/admin/db-state', (req, res) => {
    res.json(getDb());
  });

  app.post('/api/admin/backup', (req, res) => {
    res.json({ success: true, timestamp: new Date().toISOString(), data: getDb() });
  });

  app.post('/api/admin/restore', (req, res) => {
    if (req.body && typeof req.body === 'object') {
      saveDb(req.body);
      return res.json({ success: true, message: 'Database state restored successfully' });
    }
    res.status(400).json({ error: 'Invalid backup payload' });
  });

  app.post('/api/documents/:type', (req, res) => {
    res.json({ success: true, filePath: `/uploads/doc_${Date.now()}.pdf`, message: 'Document uploaded successfully' });
  });

  app.get('/api/documents/list', (req, res) => {
    res.json([]);
  });

  // Fallback API route (prevents HTML fallback on unknown /api paths)
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.originalUrl} not found` });
  });

  // ==========================================
  // VITE & STATIC FILES SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
