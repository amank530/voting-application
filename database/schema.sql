-- ============================================================================
-- ECI ELECTORAL SYSTEM - MYSQL DATABASE SCHEMA
-- Target Database Engine: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `eci_voting_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `eci_voting_db`;

-- ----------------------------------------------------------------------------
-- 1. VOTER SECTION
-- ----------------------------------------------------------------------------

-- Voter Authentication Credentials
CREATE TABLE IF NOT EXISTS `voter_login` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `aadhar_number` VARCHAR(12) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT(1) DEFAULT 1,
  `is_blocked` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_aadhar` (`aadhar_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Voter Profile & Details (including document references)
CREATE TABLE IF NOT EXISTS `voter_profile` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `voter_id` VARCHAR(50) NOT NULL UNIQUE,
  `eci_id` VARCHAR(20) NOT NULL UNIQUE, -- EPIC Number
  `full_name` VARCHAR(255) NOT NULL,
  `age` INT NOT NULL,
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `date_of_birth` DATE NULL,
  `father_name` VARCHAR(255) NULL,
  `mother_name` VARCHAR(255) NULL,
  `spouse_name` VARCHAR(255) NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `email_address` VARCHAR(255) NULL,
  `permanent_address` TEXT NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `district` VARCHAR(100) NOT NULL,
  `constituency` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(10) NULL,
  `photo_url` LONGTEXT NULL,
  `voter_card_pdf_url` VARCHAR(512) NULL, -- PDF Document
  `aadhar_card_pdf_url` VARCHAR(512) NULL, -- PDF Document
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`voter_id`) REFERENCES `voter_login`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 2. CANDIDATE SECTION
-- ----------------------------------------------------------------------------

-- Candidate Status & Application Details
-- Candidate status: 'APPROVED' / 'NOT_APPLIED' / 'PENDING' / 'REJECTED'
CREATE TABLE IF NOT EXISTS `candidate_details` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `voter_id` VARCHAR(50) NOT NULL,
  `eci_id` VARCHAR(20) NOT NULL,
  `candidate_status` ENUM('NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'NOT_APPLIED',
  
  -- Candidate Details (Populated when status != 'NOT_APPLIED')
  `full_name` VARCHAR(255) NULL,
  `election_id` VARCHAR(50) NULL,
  `election_level` VARCHAR(100) NULL,
  `state` VARCHAR(100) NULL,
  `district` VARCHAR(100) NULL,
  `constituency` VARCHAR(100) NULL,
  `city_gram_nagar` VARCHAR(255) NULL,
  `is_independent` TINYINT(1) DEFAULT 1,
  `party_id` VARCHAR(50) NULL,
  `party_name` VARCHAR(255) NULL,
  `party_symbol` VARCHAR(50) NULL,
  `authorization_code` VARCHAR(100) NULL, -- Party ticket code
  `educational_qualification` VARCHAR(255) NULL,
  `occupation` VARCHAR(255) NULL,
  `total_assets_inr` DECIMAL(15,2) DEFAULT 0.00,
  `total_liabilities_inr` DECIMAL(15,2) DEFAULT 0.00,
  `criminal_cases_status` TEXT NULL,
  
  -- Documents (PDFs)
  `form26_affidavit_pdf_url` LONGTEXT NULL, -- Form 26 Affidavit PDF
  `conduct_rules_declaration_pdf_url` LONGTEXT NULL, -- Conduct Rules PDF
  `nomination_slip_pdf_url` LONGTEXT NULL,
  
  `applied_at` TIMESTAMP NULL,
  `reviewed_at` TIMESTAMP NULL,
  `returning_officer_remarks` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`voter_id`) REFERENCES `voter_login`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 3. PARTY SECTION (PARTY, LOGIN, EXECUTIVE, MEMBERS & DYNAMIC ECI REGISTRY)
-- ----------------------------------------------------------------------------

-- Political Party Core Profile
CREATE TABLE IF NOT EXISTS `parties` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `party_name` VARCHAR(255) NOT NULL UNIQUE,
  `abbreviation` VARCHAR(50) NOT NULL UNIQUE,
  `registration_number` VARCHAR(100) NOT NULL UNIQUE,
  `category` ENUM('National Party', 'State Party', 'Unrecognized Registered Party') DEFAULT 'Unrecognized Registered Party',
  `symbol_name` VARCHAR(100) NULL,
  `symbol_icon` VARCHAR(50) NULL,
  `headquarters_address` TEXT NULL,
  `official_email` VARCHAR(255) NULL,
  `official_phone` VARCHAR(20) NULL,
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `agenda_manifesto` TEXT NULL,
  
  -- Documents (PDFs)
  `registration_certificate_pdf_url` LONGTEXT NULL,
  `manifesto_pdf_url` LONGTEXT NULL,
  `symbol_allocation_pdf_url` LONGTEXT NULL,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Party Secretariat Login Credentials
CREATE TABLE IF NOT EXISTS `party_login` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `party_id` VARCHAR(50) NOT NULL,
  `aadhar_number` VARCHAR(12) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Party President Details & Documents
CREATE TABLE IF NOT EXISTS `party_president` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `party_id` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `aadhar_number` VARCHAR(12) NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `email_address` VARCHAR(255) NULL,
  `eci_id` VARCHAR(20) NULL,
  `appointment_date` DATE NULL,
  -- Documents (PDFs)
  `id_proof_pdf_url` LONGTEXT NULL,
  `appointment_letter_pdf_url` LONGTEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Party Vice President Details & Documents
CREATE TABLE IF NOT EXISTS `party_vice_president` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `party_id` VARCHAR(50) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `aadhar_number` VARCHAR(12) NOT NULL,
  `mobile_number` VARCHAR(15) NOT NULL,
  `email_address` VARCHAR(255) NULL,
  `eci_id` VARCHAR(20) NULL,
  `appointment_date` DATE NULL,
  -- Documents (PDFs)
  `id_proof_pdf_url` LONGTEXT NULL,
  `appointment_letter_pdf_url` LONGTEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Party Member Status & Membership Applications
-- Party Member status: 'APPROVED' / 'NOT_APPLIED' / 'PENDING' / 'REJECTED'
CREATE TABLE IF NOT EXISTS `party_members` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `voter_id` VARCHAR(50) NOT NULL,
  `party_id` VARCHAR(50) NOT NULL,
  `eci_id` VARCHAR(20) NOT NULL, -- Stored dynamically
  `member_status` ENUM('NOT_APPLIED', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'NOT_APPLIED',
  
  -- Member Details (Populated when status != 'NOT_APPLIED')
  `full_name` VARCHAR(255) NULL,
  `mobile_number` VARCHAR(15) NULL,
  `role_designation` VARCHAR(100) DEFAULT 'Member',
  `state` VARCHAR(100) NULL,
  `district` VARCHAR(100) NULL,
  `constituency` VARCHAR(100) NULL,
  
  -- Documents (PDFs)
  `membership_form_pdf_url` LONGTEXT NULL,
  `voter_id_proof_pdf_url` LONGTEXT NULL,
  
  `applied_at` TIMESTAMP NULL,
  `approved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`voter_id`) REFERENCES `voter_login`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dynamic Store for Member ECI IDs under Party
CREATE TABLE IF NOT EXISTS `party_member_eci_registry` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `party_id` VARCHAR(50) NOT NULL,
  `member_id` VARCHAR(50) NULL,
  `eci_id` VARCHAR(20) NOT NULL, -- Stored dynamically
  `full_name` VARCHAR(255) NULL,
  `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`party_id`) REFERENCES `parties`(`id`) ON DELETE CASCADE,
  INDEX `idx_party_eci` (`party_id`, `eci_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------------
-- 4. CENTRAL DOCUMENTS TABLE
-- ----------------------------------------------------------------------------

-- Centralized Document Repository for PDF storage & upload management
CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `owner_type` ENUM('VOTER', 'CANDIDATE', 'PARTY', 'PARTY_MEMBER', 'PRESIDENT', 'VICE_PRESIDENT') NOT NULL,
  `owner_id` VARCHAR(50) NOT NULL,
  `document_type` ENUM(
    'AADHAR_PDF',
    'VOTER_ID_PDF',
    'FORM26_AFFIDAVIT_PDF',
    'CONDUCT_RULES_PDF',
    'PARTY_REGISTRATION_PDF',
    'PARTY_MANIFESTO_PDF',
    'SYMBOL_DECLARATION_PDF',
    'MEMBERSHIP_FORM_PDF',
    'EXECUTIVE_ID_PDF',
    'OTHER_PDF'
  ) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(512) NOT NULL,
  `mime_type` VARCHAR(100) DEFAULT 'application/pdf',
  `file_size_bytes` BIGINT DEFAULT 0,
  `base64_data` LONGTEXT NULL, -- PDF binary base64 or storage link
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_owner` (`owner_type`, `owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
