-- SKILL PORTAL Database Schema Migration V7
-- Job Quality Verification & High-Performance Query Index Tuning

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend Jobs table with strict experience and URL verification fields
ALTER TABLE jobs
    ADD COLUMN experience_min INT DEFAULT 0,
    ADD COLUMN experience_max INT DEFAULT 1,
    ADD COLUMN experience_text VARCHAR(255) DEFAULT '0–1 years / Fresher',
    ADD COLUMN graduation_eligible BOOLEAN DEFAULT TRUE,
    ADD COLUMN eligibility_status VARCHAR(50) DEFAULT 'ELIGIBLE',
    ADD COLUMN eligibility_reason TEXT NULL,
    ADD COLUMN original_url VARCHAR(1000) NULL,
    ADD COLUMN final_url VARCHAR(1000) NULL,
    ADD COLUMN verified_application_url VARCHAR(1000) NULL,
    ADD COLUMN application_url_status VARCHAR(50) DEFAULT 'VERIFIED_ACTIVE',
    ADD COLUMN source_job_id VARCHAR(100) NULL;

-- 2. Populate verified_application_url with existing apply_url where NULL
UPDATE jobs SET verified_application_url = apply_url, final_url = apply_url WHERE verified_application_url IS NULL;

-- 3. High-Performance Query Indexes for Job Portal
CREATE INDEX idx_jobs_eligibility ON jobs (eligibility_status, is_2026_eligible, is_fresher_eligible);
CREATE INDEX idx_jobs_exp ON jobs (experience_min, experience_max);
CREATE INDEX idx_jobs_url_status ON jobs (application_url_status);

-- 4. High-Performance LMS Query Indexes to Eliminate N+1 and Full-Table Scans
CREATE INDEX idx_topics_module_del ON topics (module_id, is_deleted);
CREATE INDEX idx_modules_subject_del ON modules (subject_id, is_deleted);
CREATE INDEX idx_subjects_course_del ON subjects (course_id, is_deleted);
CREATE INDEX idx_pe_user_event_ref ON progress_events (user_id, event_type, reference_id);
CREATE INDEX idx_assign_sections_assign_id ON assignment_sections (assignment_id);
CREATE INDEX idx_qa_user_status_type ON question_attempts (user_id, status, attempt_type, question_id);

SET FOREIGN_KEY_CHECKS = 1;
