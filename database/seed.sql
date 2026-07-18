-- SQL Seed file to bootstrap Election Commission of India Portal Sandbox

-- 1. Insert Initial Users
INSERT INTO users (id, mobile_number, name, role, is_verified, age, state, district, constituency, is_blocked) VALUES
('usr-ec-admin', '9876543210', 'Shri Rajiv Kumar', 'ELECTION_COMMISSION', TRUE, 62, 'Delhi', 'New Delhi', 'New Delhi Seat', FALSE),
('usr-party-bjp', '8888888888', 'Amit Shah (BJP Admin)', 'PARTY_ADMIN', TRUE, 59, 'Delhi', 'New Delhi', 'New Delhi Seat', FALSE),
('usr-party-inc', '8888888889', 'Rahul Gandhi (INC Admin)', 'PARTY_ADMIN', TRUE, 53, 'Delhi', 'New Delhi', 'New Delhi Seat', FALSE),
('usr-cand-rahul', '7777777777', 'Rahul Sharma', 'CANDIDATE', TRUE, 45, 'Madhya Pradesh', 'Bhopal', 'Bhopal North', FALSE),
('usr-voter-aman', '9999999999', 'Aman Patel', 'VOTER', TRUE, 26, 'Madhya Pradesh', 'Bhopal', 'Bhopal North', FALSE);

-- 2. Insert Core Elections
INSERT INTO elections (id, title, level, state, district, constituency, voting_date, counting_date, status, winner_candidate_id, winner_name, winner_party, winner_votes, total_voters) VALUES
('elec-ls-2026', '18th Lok Sabha General Elections 2026', 'Lok Sabha (MP)', NULL, NULL, NULL, '2026-10-15', '2026-10-20', 'REGISTRATION_OPEN', NULL, NULL, NULL, 0, 950000000),
('elec-mp-mla-2026', 'Madhya Pradesh Assembly Elections - Bhopal North', 'State Legislative Assembly (MLA)', 'Madhya Pradesh', 'Bhopal', 'Bhopal North', '2026-08-10', '2026-08-15', 'VOTING_OPEN', NULL, NULL, NULL, 0, 180000),
('elec-mh-mla-2026', 'Maharashtra Assembly Elections - Ward 45', 'State Legislative Assembly (MLA)', 'Maharashtra', 'Mumbai', 'Ward 45', '2026-09-01', '2026-09-05', 'CREATED', NULL, NULL, NULL, 0, 140000),
('elec-dl-munc-2026', 'Delhi Municipal Corporation - Preet Vihar Seat', 'Municipal Corporation', 'Delhi', 'East Delhi', 'Preet Vihar', '2026-05-12', '2026-05-14', 'RESULTS_PUBLISHED', 'cand-priya-preet', 'Priya Sen', 'INC', 42100, 75000);

-- 3. Insert Political Parties
INSERT INTO parties (id, name, abbrev, symbol, manifesto, approved, status, admin_id) VALUES
('party-bjp', 'Bharatiya Janata Party', 'BJP', 'Lotus 🪷', 'To build a self-reliant digital economy (Atmanirbhar Bharat), strengthen rural infra, and expand clean water initiatives.', TRUE, 'APPROVED', 'usr-party-bjp'),
('party-inc', 'Indian National Congress', 'INC', 'Hand ✋', 'Focused on youth employment guarantee schemes, localized agricultural MSP pricing index, and high-speed digital village panchayat nodes.', TRUE, 'APPROVED', 'usr-party-inc'),
('party-aap', 'Aam Aadmi Party', 'AAP', 'Broom 🧹', 'Focus on top-tier public schooling reforms, free tier healthcare dispensaries (Mohalla Clinics), and digital citizen councils.', FALSE, 'PENDING', NULL);

-- 4. Insert Candidates
INSERT INTO candidates (id, name, election_id, election_title, election_level, constituency, state, district, party_id, party_name, party_symbol, is_independent, authorization_code, status, photo, manifesto, biography, age, education, assets, mobile_number) VALUES
('cand-rahul-bhopal', 'Rahul Sharma', 'elec-mp-mla-2026', 'Madhya Pradesh Assembly Elections - Bhopal North', 'State Legislative Assembly (MLA)', 'Bhopal North', 'Madhya Pradesh', 'Bhopal', 'party-bjp', 'Bharatiya Janata Party', 'Lotus 🪷', FALSE, 'BJP-MLA-BHOPAL-2026-0001', 'APPROVED', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'I pledge to expand direct pipe-water grids in Bhopal North, upgrade primary schools with computer labs, and complete smart sanitation grids.', 'Social activist and rural developmental officer with 15+ years of grassroots service.', 45, 'Post Graduate (M.A.)', '₹1.5 Crores', '7777777777'),
('cand-anil-bhopal', 'Anil Deshmukh', 'elec-mp-mla-2026', 'Madhya Pradesh Assembly Elections - Bhopal North', 'State Legislative Assembly (MLA)', 'Bhopal North', 'Madhya Pradesh', 'Bhopal', 'party-inc', 'Indian National Congress', 'Hand ✋', FALSE, 'INC-MLA-BHOPAL-2026-0002', 'APPROVED', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Job opportunities for regional youth, financial assistance for women entrepreneurs, and modernization of Mandi procurement platforms.', 'Grassroots municipal counselor with deep links in public logistics management.', 39, 'Graduate (B.Sc)', '₹95 Lakhs', '9812345678'),
('cand-priya-preet', 'Priya Sen', 'elec-dl-munc-2026', 'Delhi Municipal Corporation - Preet Vihar Seat', 'Municipal Corporation', 'Preet Vihar', 'Delhi', 'East Delhi', 'party-inc', 'Indian National Congress', 'Hand ✋', FALSE, 'INC-MUNC-DELHI-2026-0005', 'APPROVED', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Clean neighborhood parks, solar solar-paneled streetlights, and dedicated wet-waste biogas processing centers.', 'Civil environmental engineer dedicated to zero-landfill smart towns.', 31, 'LL.B. / Law Graduate', '₹1.2 Crores', '9888811111');

-- 5. Insert Sample Candidate Codes
INSERT INTO candidate_codes (code, party_id, party_abbrev, constituency, election_level, position, is_used, candidate_name, election_id, created_at) VALUES
('BJP-MLA-BHOPAL-2026-0001', 'party-bjp', 'BJP', 'Bhopal North', 'State Legislative Assembly (MLA)', 'Member of Legislative Assembly (MLA)', TRUE, 'Rahul Sharma', 'elec-mp-mla-2026', CURRENT_TIMESTAMP),
('INC-MLA-BHOPAL-2026-0002', 'party-inc', 'INC', 'Bhopal North', 'State Legislative Assembly (MLA)', 'Member of Legislative Assembly (MLA)', TRUE, 'Anil Deshmukh', 'elec-mp-mla-2026', CURRENT_TIMESTAMP),
('BJP-LS-NEWDELHI-2026-0003', 'party-bjp', 'BJP', 'New Delhi Seat', 'Lok Sabha (MP)', 'Member of Parliament (MP)', FALSE, NULL, 'elec-ls-2026', CURRENT_TIMESTAMP),
('INC-LS-NEWDELHI-2026-0004', 'party-inc', 'INC', 'New Delhi Seat', 'Lok Sabha (MP)', 'Member of Parliament (MP)', FALSE, NULL, 'elec-ls-2026', CURRENT_TIMESTAMP);

-- 6. Insert Historical/Simulated Votes
INSERT INTO votes (id, election_id, voter_id, candidate_id, party_id, timestamp, receipt_id, encryption_signature) VALUES
('vote-sim-1001', 'elec-dl-munc-2026', 'voter-hashed-01', 'cand-priya-preet', 'party-inc', CURRENT_TIMESTAMP - INTERVAL '2 month', 'REC-LS-2026-78410294-81', '0x7e29a3e218cbf812736b4791028308d29cae001831828f419b48f98d9e2183b9');

-- 7. Insert Audit Logs
INSERT INTO audit_logs (id, user_id, user_name, role, action, details, timestamp) VALUES
('log-1', 'usr-ec-admin', 'Shri Rajiv Kumar', 'ELECTION_COMMISSION', 'CREATE_ELECTION', 'Created new State Legislative election for Madhya Pradesh (Bhopal North)', CURRENT_TIMESTAMP - INTERVAL '10 day'),
('log-2', 'usr-ec-admin', 'Shri Rajiv Kumar', 'ELECTION_COMMISSION', 'APPROVE_PARTY', 'Approved Bharatiya Janata Party official registry and token allocation', CURRENT_TIMESTAMP - INTERVAL '9 day');

-- 8. Insert ECI Notifications Bulletins
INSERT INTO eci_notifications (id, title, content, type, timestamp, attachment_url) VALUES
('notif-1', 'Mandatory Form 26 Affidavit Upload Guidelines', 'All candidates filing nominations for 2026 general assembly contests must submit certified income, criminal, and education records. Scanned copies must be cryptographically signed by local Returning Officer.', 'URGENT', CURRENT_TIMESTAMP - INTERVAL '2 day', 'https://eci.gov.in/files/category/407-affidavits/'),
('notif-2', 'Voter Registry Cleanup & Aadhar Seeding Circular', 'To prevent phantom votes and state-wise address duplication, citizens are encouraged to update and link local polling booth numbers (Form 6B) inside the simulated node.', 'UPDATE', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL);
