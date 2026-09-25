-- SKILL PORTAL Database Schema Migration V5
-- Multi-Source Job Aggregator: Java Fresher 2026 Discovery & Application Tracking

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE jobs
    ADD COLUMN skills TEXT NULL,
    ADD COLUMN experience_level VARCHAR(100) DEFAULT 'Fresher (0-1 yrs)',
    ADD COLUMN employment_type VARCHAR(50) DEFAULT 'Full Time',
    ADD COLUMN sources VARCHAR(255) DEFAULT 'Adzuna',
    ADD COLUMN relevance_score INT DEFAULT 85,
    ADD COLUMN relevance_tier VARCHAR(50) DEFAULT 'RELEVANT',
    ADD COLUMN is_2026_eligible BOOLEAN DEFAULT TRUE,
    ADD COLUMN match_reasons TEXT NULL,
    ADD COLUMN company_career_url VARCHAR(1000) NULL,
    ADD COLUMN first_seen_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';

CREATE INDEX idx_jobs_relevance ON jobs (relevance_score);
CREATE INDEX idx_jobs_2026 ON jobs (is_2026_eligible);
CREATE INDEX idx_jobs_status ON jobs (status);

CREATE TABLE IF NOT EXISTS job_applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    job_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
    applied_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notes TEXT NULL,
    INDEX idx_job_apps_user (user_id),
    INDEX idx_job_apps_job (job_id),
    UNIQUE KEY uk_user_job (user_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_job_preferences (
    user_id BIGINT PRIMARY KEY,
    passout_year INT DEFAULT 2026,
    experience_level VARCHAR(50) DEFAULT 'Fresher',
    primary_role VARCHAR(100) DEFAULT 'Java Full Stack Developer',
    preferred_locations VARCHAR(500) DEFAULT 'Bengaluru,Hyderabad,Pune,Chennai,Noida,Remote',
    target_companies TEXT NULL,
    auto_refresh_minutes INT DEFAULT 10,
    alerts_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
