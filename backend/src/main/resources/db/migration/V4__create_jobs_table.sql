-- SKILL PORTAL Database Schema Migration V4
-- Real Job Aggregator: Adzuna Job Search Schema

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    external_id VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    location VARCHAR(255),
    description TEXT,
    salary_min DECIMAL(12,2) NULL,
    salary_max DECIMAL(12,2) NULL,
    apply_url VARCHAR(1000) NOT NULL,
    source VARCHAR(100) DEFAULT 'Adzuna',
    posted_at TIMESTAMP NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_fresher_eligible BOOLEAN DEFAULT TRUE,
    INDEX idx_jobs_posted_at (posted_at),
    INDEX idx_jobs_external_id (external_id),
    INDEX idx_jobs_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
