package com.skillportal.assignment;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AssignmentRepository {

    private final JdbcTemplate jdbcTemplate;

    public AssignmentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<AssignmentDto.AssignmentSummary> findAllAssignments(Long userId) {
        String sql = "SELECT * FROM assignments WHERE is_published = TRUE AND is_deleted = FALSE ORDER BY id ASC";
        List<AssignmentDto.AssignmentSummary> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AssignmentDto.AssignmentSummary a = new AssignmentDto.AssignmentSummary();
            a.setId(rs.getLong("id"));
            a.setTitle(rs.getString("title"));
            a.setDescription(rs.getString("description"));
            a.setDifficulty(rs.getString("difficulty"));
            a.setTotalMarks(rs.getInt("total_marks"));
            a.setTimeLimitMinutes(rs.getInt("time_limit_minutes"));
            return a;
        });

        for (AssignmentDto.AssignmentSummary a : list) {
            populateAssignmentStats(a, userId);
        }
        return list;
    }

    public Optional<AssignmentDto.AssignmentDetail> findAssignmentById(Long id, Long userId) {
        String sql = "SELECT * FROM assignments WHERE id = ? AND is_published = TRUE AND is_deleted = FALSE";
        try {
            AssignmentDto.AssignmentDetail detail = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AssignmentDto.AssignmentDetail a = new AssignmentDto.AssignmentDetail();
                a.setId(rs.getLong("id"));
                a.setTitle(rs.getString("title"));
                a.setDescription(rs.getString("description"));
                a.setDifficulty(rs.getString("difficulty"));
                a.setTotalMarks(rs.getInt("total_marks"));
                a.setTimeLimitMinutes(rs.getInt("time_limit_minutes"));
                return a;
            }, id);

            if (detail != null) {
                detail.setSections(findSectionsByAssignmentId(id, userId));

                int totalMarksObtained = 0;
                for (AssignmentDto.SectionSummary s : detail.getSections()) {
                    totalMarksObtained += s.getMarksObtained();
                }
                detail.setMarksObtained(totalMarksObtained);
                double pct = detail.getTotalMarks() > 0 ? ((double) totalMarksObtained / detail.getTotalMarks()) * 100.0 : 0.0;
                detail.setPercentage(Math.round(pct * 10.0) / 10.0);
            }
            return Optional.ofNullable(detail);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<AssignmentDto.SectionSummary> findSectionsByAssignmentId(Long assignmentId, Long userId) {
        String sql = "SELECT * FROM assignment_sections WHERE assignment_id = ? ORDER BY section_number ASC";
        List<AssignmentDto.SectionSummary> sections = jdbcTemplate.query(sql, (rs, rowNum) -> {
            AssignmentDto.SectionSummary s = new AssignmentDto.SectionSummary();
            s.setId(rs.getLong("id"));
            s.setAssignmentId(rs.getLong("assignment_id"));
            s.setSectionNumber(rs.getInt("section_number"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            return s;
        }, assignmentId);

        boolean previousSectionCompleted = true; // Section 1 is always unlocked

        for (AssignmentDto.SectionSummary s : sections) {
            populateSectionQuestionsAndStats(s, userId);

            // Sequential unlocking rule (Requirement 15):
            if (!previousSectionCompleted) {
                s.setLocked(true);
                s.setStatus("LOCKED");
            } else {
                s.setLocked(false);
                if (s.getSolvedCount() == s.getQuestionCount() && s.getQuestionCount() > 0) {
                    s.setStatus("COMPLETED");
                } else if (s.getSolvedCount() > 0) {
                    s.setStatus("IN_PROGRESS");
                } else {
                    s.setStatus("AVAILABLE");
                }
            }

            // A section is considered completed if all its questions are solved
            previousSectionCompleted = "COMPLETED".equals(s.getStatus());
        }

        return sections;
    }

    public Optional<AssignmentDto.SectionSummary> findSectionById(Long sectionId, Long userId) {
        String sql = "SELECT * FROM assignment_sections WHERE id = ?";
        try {
            AssignmentDto.SectionSummary s = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                AssignmentDto.SectionSummary sec = new AssignmentDto.SectionSummary();
                sec.setId(rs.getLong("id"));
                sec.setAssignmentId(rs.getLong("assignment_id"));
                sec.setSectionNumber(rs.getInt("section_number"));
                sec.setTitle(rs.getString("title"));
                sec.setDescription(rs.getString("description"));
                return sec;
            }, sectionId);

            if (s != null) {
                List<AssignmentDto.SectionSummary> allSections = findSectionsByAssignmentId(s.getAssignmentId(), userId);
                for (AssignmentDto.SectionSummary item : allSections) {
                    if (item.getId().equals(sectionId)) {
                        return Optional.of(item);
                    }
                }
            }
            return Optional.ofNullable(s);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    private void populateSectionQuestionsAndStats(AssignmentDto.SectionSummary s, Long userId) {
        String qSql = "SELECT q.id, q.title, q.question_type, q.difficulty, q.marks, " +
                      "(SELECT status FROM question_attempts qa WHERE qa.question_id = q.id AND qa.user_id = ? ORDER BY id DESC LIMIT 1) AS attempt_status, " +
                      "(SELECT marks_obtained FROM question_attempts qa WHERE qa.question_id = q.id AND qa.user_id = ? ORDER BY id DESC LIMIT 1) AS marks_obtained, " +
                      "(SELECT COUNT(*) FROM bookmarks bm WHERE bm.user_id = ? AND bm.target_type = 'QUESTION' AND bm.target_id = q.id) AS is_bm " +
                      "FROM questions q " +
                      "JOIN assignment_questions aq ON q.id = aq.question_id " +
                      "WHERE aq.section_id = ? ORDER BY aq.order_index ASC";

        List<AssignmentDto.QuestionSummary> questions = jdbcTemplate.query(qSql, (rs, rowNum) -> {
            AssignmentDto.QuestionSummary q = new AssignmentDto.QuestionSummary();
            q.setId(rs.getLong("id"));
            q.setTitle(rs.getString("title"));
            q.setQuestionType(rs.getString("question_type"));
            q.setDifficulty(rs.getString("difficulty"));
            q.setMarks(rs.getInt("marks"));

            String attStatus = rs.getString("attempt_status");
            q.setStatus(attStatus != null ? attStatus : "NOT_ATTEMPTED");
            q.setMarksObtained(rs.getInt("marks_obtained"));
            q.setBookmarked(rs.getInt("is_bm") > 0);
            return q;
        }, userId, userId, userId, s.getId());

        s.setQuestions(questions);
        s.setQuestionCount(questions.size());

        int solved = 0;
        int marksObtained = 0;
        int totalMarks = 0;
        for (AssignmentDto.QuestionSummary q : questions) {
            totalMarks += q.getMarks();
            if ("SOLVED".equals(q.getStatus())) {
                solved++;
                marksObtained += q.getMarksObtained();
            }
        }
        s.setSolvedCount(solved);
        s.setTotalMarks(totalMarks);
        s.setMarksObtained(marksObtained);
    }

    private void populateAssignmentStats(AssignmentDto.AssignmentSummary a, Long userId) {
        List<AssignmentDto.SectionSummary> sections = findSectionsByAssignmentId(a.getId(), userId);
        a.setTotalSections(sections.size());

        int completedSec = 0;
        int totalQ = 0;
        int solvedQ = 0;
        int marksObtained = 0;

        for (AssignmentDto.SectionSummary s : sections) {
            if ("COMPLETED".equals(s.getStatus())) {
                completedSec++;
            }
            totalQ += s.getQuestionCount();
            solvedQ += s.getSolvedCount();
            marksObtained += s.getMarksObtained();
        }

        a.setCompletedSections(completedSec);
        a.setTotalQuestions(totalQ);
        a.setSolvedQuestions(solvedQ);
        a.setMarksObtained(marksObtained);

        double pct = a.getTotalMarks() > 0 ? ((double) marksObtained / a.getTotalMarks()) * 100.0 : 0.0;
        a.setPercentage(Math.round(pct * 10.0) / 10.0);

        if (solvedQ == totalQ && totalQ > 0) {
            a.setStatus("COMPLETED");
        } else if (solvedQ > 0) {
            a.setStatus("IN_PROGRESS");
        } else {
            a.setStatus("NOT_STARTED");
        }
    }
}
