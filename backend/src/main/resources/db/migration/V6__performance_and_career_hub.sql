-- SKILL PORTAL Database Schema Migration V6
-- Career Hub System & LMS Performance Optimization Indexes

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create Career Hub Sources Table
CREATE TABLE IF NOT EXISTS career_sources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    career_url VARCHAR(1000) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    last_checked_at TIMESTAMP NULL,
    matching_jobs_count INT DEFAULT 0,
    new_jobs_found INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_career_sources_status (status),
    INDEX idx_career_sources_company (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Seed Verified High-Volume 2026 Graduate Tech Recruiters into Career Hub
INSERT INTO career_sources (company_name, career_url, status, last_checked_at, matching_jobs_count, new_jobs_found)
VALUES 
('Tata Consultancy Services', 'https://www.tcs.com/careers/india/entry-level', 'ACTIVE', CURRENT_TIMESTAMP, 4, 2),
('Infosys', 'https://career.infosys.com/joblist', 'ACTIVE', CURRENT_TIMESTAMP, 3, 1),
('Wipro', 'https://careers.wipro.com/careers-home/jobs', 'ACTIVE', CURRENT_TIMESTAMP, 3, 1),
('Accenture', 'https://www.accenture.com/in-en/careers/jobsearch?jk=Associate%20Software%20Engineer', 'ACTIVE', CURRENT_TIMESTAMP, 5, 3),
('Cognizant', 'https://careers.cognizant.com/global/en/c/campus-graduates-jobs', 'ACTIVE', CURRENT_TIMESTAMP, 4, 2),
('Capgemini', 'https://www.capgemini.com/in-en/careers/job-search/', 'ACTIVE', CURRENT_TIMESTAMP, 3, 1),
('Zoho Corporation', 'https://www.zoho.com/careers/jobdetails/?job_id=4000000000001', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('Bosch Global Software Technologies', 'https://www.bosch.in/careers/', 'ACTIVE', CURRENT_TIMESTAMP, 3, 2),
('Tech Mahindra', 'https://careers.techmahindra.com/', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('IBM India', 'https://www.ibm.com/in-en/careers', 'ACTIVE', CURRENT_TIMESTAMP, 3, 1),
('LTIMindtree', 'https://careers.ltimindtree.com/', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('HCLTech', 'https://www.hcltech.com/careers/first-careers', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('PhonePe', 'https://www.phonepe.com/careers/job-openings/', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('Razorpay', 'https://razorpay.com/jobs/', 'ACTIVE', CURRENT_TIMESTAMP, 2, 1),
('Postman', 'https://www.postman.com/company/careers/', 'ACTIVE', CURRENT_TIMESTAMP, 1, 1)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 3. Composite Performance Indexes for High-Velocity 2026 Fresher Queries
CREATE INDEX idx_jobs_2026_fresher_score ON jobs (is_2026_eligible, is_fresher_eligible, relevance_score);
CREATE INDEX idx_jobs_company ON jobs (company);

SET FOREIGN_KEY_CHECKS = 1;
