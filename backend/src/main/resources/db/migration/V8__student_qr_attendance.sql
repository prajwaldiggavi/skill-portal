-- SKILL PORTAL Database Schema Migration V8
-- Student-Specific QR Attendance System & Audit Log

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend students table with unique QR code identity tokens
ALTER TABLE students
    ADD COLUMN qr_token VARCHAR(64) NULL,
    ADD COLUMN qr_status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN qr_generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Backfill existing students with cryptographically unique QR identity tokens
-- Format: QR-<28-char hexadecimal unique token>
UPDATE students
SET qr_token = CONCAT('QR-', UPPER(SUBSTRING(MD5(CONCAT(id, student_id_number, UUID(), RAND())), 1, 24)), LPAD(id, 4, '0')),
    qr_status = 'ACTIVE',
    qr_generated_at = CURRENT_TIMESTAMP
WHERE qr_token IS NULL;

-- 3. Enforce Unique and Indexed constraints on qr_token
CREATE UNIQUE INDEX uk_students_qr_token ON students (qr_token);
CREATE INDEX idx_students_qr_status ON students (qr_status);

-- 4. Extend attendance_records table with marked_by, source, attendance_date, and device_info
ALTER TABLE attendance_records
    ADD COLUMN marked_by BIGINT NULL,
    ADD COLUMN source VARCHAR(30) DEFAULT 'MANUAL',
    ADD COLUMN attendance_date DATE NULL,
    ADD COLUMN device_info VARCHAR(255) NULL;

-- Backfill attendance_date for existing records from their session dates
UPDATE attendance_records ar
JOIN attendance_sessions s ON ar.session_id = s.id
SET ar.attendance_date = s.session_date
WHERE ar.attendance_date IS NULL;

-- Index attendance_records for student calendar queries and source auditing
CREATE INDEX idx_ar_student_date ON attendance_records (student_id, attendance_date);
CREATE INDEX idx_ar_source ON attendance_records (source);
CREATE INDEX idx_ar_marked_by ON attendance_records (marked_by);

-- 5. Create Attendance Audit Log table to track every QR scan attempt
CREATE TABLE IF NOT EXISTS attendance_audit_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NULL,
    admin_id BIGINT NOT NULL,
    session_id BIGINT NULL,
    qr_token_used VARCHAR(64) NOT NULL,
    scan_status VARCHAR(30) NOT NULL, -- SUCCESS, DUPLICATE, INVALID_QR, INACTIVE_STUDENT, REJECTED
    attendance_date DATE NOT NULL,
    scan_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    remarks VARCHAR(255) NULL,
    INDEX idx_audit_student (student_id),
    INDEX idx_audit_admin (admin_id),
    INDEX idx_audit_date (attendance_date),
    INDEX idx_audit_timestamp (scan_timestamp),
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
