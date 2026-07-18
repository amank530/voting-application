-- SQL Schema for Election Commission of India (ECI) Portal
-- Relational model designed for PostgreSQL or MySQL

-- 1. Users Table (Citizens, Candidates, Party Admins, and EC Super Admins)
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ELECTION_COMMISSION', 'PARTY_ADMIN', 'CANDIDATE', 'VOTER', 'GUEST')),
    is_verified BOOLEAN DEFAULT TRUE,
    age INT,
    state VARCHAR(100),
    district VARCHAR(100),
    constituency VARCHAR(100),
    is_blocked BOOLEAN DEFAULT FALSE
);

-- 2. Elections Table
CREATE TABLE elections (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    level VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    constituency VARCHAR(100),
    voting_date DATE NOT NULL,
    counting_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'REGISTRATION_OPEN', 'CANDIDATE_LIST_PUBLISHED', 'VOTING_OPEN', 'VOTING_ENDED', 'RESULTS_PUBLISHED', 'ARCHIVED')),
    winner_candidate_id VARCHAR(50),
    winner_name VARCHAR(100),
    winner_party VARCHAR(100),
    winner_votes INT DEFAULT 0,
    total_voters INT DEFAULT 0
);

-- 3. Political Parties Table
CREATE TABLE parties (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    abbrev VARCHAR(10) UNIQUE NOT NULL,
    symbol VARCHAR(50) NOT NULL,
    manifesto TEXT,
    approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'SUSPENDED')),
    admin_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Candidates Table (Filing Form 26 nomination affidavit)
CREATE TABLE candidates (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    election_title VARCHAR(200) NOT NULL,
    election_level VARCHAR(100) NOT NULL,
    constituency VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    district VARCHAR(100),
    party_id VARCHAR(50) REFERENCES parties(id) ON DELETE SET NULL,
    party_name VARCHAR(150),
    party_symbol VARCHAR(50),
    is_independent BOOLEAN DEFAULT TRUE,
    authorization_code VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    photo TEXT,
    manifesto TEXT,
    biography TEXT,
    age INT NOT NULL,
    education VARCHAR(100),
    assets VARCHAR(100),
    mobile_number VARCHAR(15) NOT NULL
);

-- 5. Candidate Authorization Codes Table (One-time secure party-issued tickets)
CREATE TABLE candidate_codes (
    code VARCHAR(100) PRIMARY KEY,
    party_id VARCHAR(50) NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    party_abbrev VARCHAR(10) NOT NULL,
    constituency VARCHAR(100) NOT NULL,
    election_level VARCHAR(100) NOT NULL,
    position VARCHAR(150) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    candidate_name VARCHAR(100),
    election_id VARCHAR(50) REFERENCES elections(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Votes Table (Cryptographically signed, audit-verified individual ballots)
CREATE TABLE votes (
    id VARCHAR(50) PRIMARY KEY,
    election_id VARCHAR(50) NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
    voter_id VARCHAR(100) NOT NULL, -- Hashed voter ID in production to guarantee ballot secrecy
    candidate_id VARCHAR(50) NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    party_id VARCHAR(50) REFERENCES parties(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_id VARCHAR(100) UNIQUE NOT NULL,
    encryption_signature TEXT NOT NULL
);

-- 7. Security Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ECI Notifications Bulletins Table
CREATE TABLE eci_notifications (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('URGENT', 'UPDATE', 'ELECTION')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachment_url TEXT
);
