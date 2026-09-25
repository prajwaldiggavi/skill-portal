-- SKILL PORTAL Database Schema Migration V3
-- Schema Extension for Complete Student, Batch, Course, Assignment, Question Bank & Test Management

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Extend students table
ALTER TABLE students 
    ADD COLUMN college VARCHAR(150) NULL AFTER phone,
    ADD COLUMN semester_or_year VARCHAR(50) NULL AFTER college;

-- 2. Extend batches table
ALTER TABLE batches 
    ADD COLUMN course_id BIGINT NULL AFTER description;

-- Add batch-course foreign key constraint
ALTER TABLE batches 
    ADD CONSTRAINT fk_batch_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- 3. Extend assignments table
ALTER TABLE assignments 
    ADD COLUMN course_id BIGINT NULL AFTER description,
    ADD COLUMN subject_id BIGINT NULL AFTER course_id,
    ADD COLUMN topic_id BIGINT NULL AFTER subject_id,
    ADD COLUMN batch_id BIGINT NULL AFTER topic_id,
    ADD COLUMN start_date TIMESTAMP NULL AFTER time_limit_minutes,
    ADD COLUMN due_date TIMESTAMP NULL AFTER start_date,
    ADD COLUMN passing_marks INT DEFAULT 0 AFTER due_date,
    ADD COLUMN max_attempts INT DEFAULT 1 AFTER passing_marks;

-- Add assignment foreign key constraints
ALTER TABLE assignments 
    ADD CONSTRAINT fk_assignment_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_assignment_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_assignment_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_assignment_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;

-- 4. Extend questions and test_questions
ALTER TABLE questions 
    ADD COLUMN negative_marks INT DEFAULT 0 AFTER marks;

ALTER TABLE test_questions 
    ADD COLUMN negative_marks INT DEFAULT 0 AFTER marks;

-- 5. Extend tests table
ALTER TABLE tests 
    ADD COLUMN course_id BIGINT NULL AFTER description,
    ADD COLUMN batch_id BIGINT NULL AFTER course_id,
    ADD COLUMN start_time TIMESTAMP NULL AFTER passing_percentage,
    ADD COLUMN end_time TIMESTAMP NULL AFTER start_time,
    ADD COLUMN attempt_limit INT DEFAULT 1 AFTER end_time,
    ADD COLUMN negative_marks INT DEFAULT 0 AFTER attempt_limit;

ALTER TABLE tests 
    ADD CONSTRAINT fk_test_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_test_batch FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL;

-- 6. Extend study_materials table
ALTER TABLE study_materials 
    ADD COLUMN course_id BIGINT NULL AFTER id,
    ADD COLUMN module_id BIGINT NULL AFTER subject_id;

ALTER TABLE study_materials 
    ADD CONSTRAINT fk_material_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_material_module FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL;

-- 7. Update existing demo batches with course association
UPDATE batches SET course_id = 1 WHERE id = 1;
UPDATE batches SET course_id = 2 WHERE id = 2;

-- 8. Update existing demo assignments with relationships and deadlines
UPDATE assignments SET 
    course_id = 1, 
    subject_id = 1, 
    topic_id = 1, 
    batch_id = 1, 
    start_date = '2026-02-01 00:00:00',
    due_date = '2026-05-30 23:59:59',
    passing_marks = 20,
    max_attempts = 3
WHERE id = 1;

UPDATE assignments SET 
    course_id = 1, 
    subject_id = 1, 
    topic_id = 3, 
    batch_id = 1, 
    start_date = '2026-02-15 00:00:00',
    due_date = '2026-06-15 23:59:59',
    passing_marks = 15,
    max_attempts = 3
WHERE id = 2;

-- 9. Update existing demo tests with course and batch
UPDATE tests SET 
    course_id = 1, 
    batch_id = 1, 
    start_time = '2026-03-01 09:00:00',
    end_time = '2026-06-30 18:00:00',
    attempt_limit = 2,
    negative_marks = 2
WHERE id = 1;

UPDATE tests SET 
    course_id = 2, 
    batch_id = 2, 
    start_time = '2026-03-15 09:00:00',
    end_time = '2026-07-15 18:00:00',
    attempt_limit = 1,
    negative_marks = 1
WHERE id = 2;

-- 10. Update study materials with course_id
UPDATE study_materials SET course_id = 1 WHERE id IN (1, 2, 3);

-- 11. Populate student college and semester data
UPDATE students SET college = 'Bangalore Institute of Technology', semester_or_year = '8th Semester / Final Year' WHERE id = 1;
UPDATE students SET college = 'RV College of Engineering', semester_or_year = '6th Semester / 3rd Year' WHERE id = 2;
UPDATE students SET college = 'PES University', semester_or_year = '8th Semester / Final Year' WHERE id = 3;
UPDATE students SET college = 'BMS College of Engineering', semester_or_year = '4th Semester / 2nd Year' WHERE id = 4;

SET FOREIGN_KEY_CHECKS = 1;
