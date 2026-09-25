package com.skillportal.assignment;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
            a.setStatus("NOT_STARTED");
            return a;
        });

        if (list.isEmpty()) {
            return list;
        }

        // 1. Batch load all sections for all published assignments
        String secSql = "SELECT s.id, s.assignment_id, s.section_number, s.title, s.description " +
                        "FROM assignment_sections s " +
                        "JOIN assignments a ON s.assignment_id = a.id " +
                        "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                        "ORDER BY s.assignment_id ASC, s.section_number ASC";

        List<AssignmentDto.SectionSummary> allSections = jdbcTemplate.query(secSql, (rs, rowNum) -> {
            AssignmentDto.SectionSummary s = new AssignmentDto.SectionSummary();
            s.setId(rs.getLong("id"));
            s.setAssignmentId(rs.getLong("assignment_id"));
            s.setSectionNumber(rs.getInt("section_number"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            return s;
        });

        // 2. Batch load all questions & attempt statuses across all sections
        String qSql;
        Object[] qParams;
        if (userId != null) {
            qSql = "SELECT aq.section_id, s.assignment_id, q.id AS question_id, q.marks, " +
                   "qa.status AS attempt_status, qa.marks_obtained " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "JOIN assignments a ON s.assignment_id = a.id " +
                   "LEFT JOIN (" +
                   "    SELECT qa1.question_id, qa1.status, qa1.marks_obtained " +
                   "    FROM question_attempts qa1 " +
                   "    INNER JOIN (" +
                   "        SELECT question_id, MAX(id) AS max_id " +
                   "        FROM question_attempts " +
                   "        WHERE user_id = ? " +
                   "        GROUP BY question_id " +
                   "    ) qa2 ON qa1.id = qa2.max_id " +
                   ") qa ON q.id = qa.question_id " +
                   "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                   "ORDER BY s.assignment_id ASC, s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{userId};
        } else {
            qSql = "SELECT aq.section_id, s.assignment_id, q.id AS question_id, q.marks, " +
                   "'NOT_ATTEMPTED' AS attempt_status, 0 AS marks_obtained " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "JOIN assignments a ON s.assignment_id = a.id " +
                   "WHERE a.is_published = TRUE AND a.is_deleted = FALSE " +
                   "ORDER BY s.assignment_id ASC, s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{};
        }

        // Section stats aggregation container
        class SectionStat {
            int qCount = 0;
            int solvedCount = 0;
            int marksObtained = 0;
        }

        Map<Long, SectionStat> statsBySectionId = new HashMap<>();
        jdbcTemplate.query(qSql, rs -> {
            Long secId = rs.getLong("section_id");
            SectionStat stat = statsBySectionId.computeIfAbsent(secId, k -> new SectionStat());
            stat.qCount++;
            String status = rs.getString("attempt_status");
            if ("SOLVED".equalsIgnoreCase(status)) {
                stat.solvedCount++;
                stat.marksObtained += rs.getInt("marks_obtained");
            }
        }, qParams);

        // Group sections by assignment_id
        Map<Long, List<AssignmentDto.SectionSummary>> sectionsByAssignmentId = new HashMap<>();
        for (AssignmentDto.SectionSummary s : allSections) {
            SectionStat stat = statsBySectionId.getOrDefault(s.getId(), new SectionStat());
            s.setQuestionCount(stat.qCount);
            s.setSolvedCount(stat.solvedCount);
            s.setMarksObtained(stat.marksObtained);
            sectionsByAssignmentId.computeIfAbsent(s.getAssignmentId(), k -> new ArrayList<>()).add(s);
        }

        // Aggregate statistics per assignment
        for (AssignmentDto.AssignmentSummary a : list) {
            List<AssignmentDto.SectionSummary> sections = sectionsByAssignmentId.getOrDefault(a.getId(), Collections.emptyList());
            a.setTotalSections(sections.size());

            int completedSec = 0;
            int totalQ = 0;
            int solvedQ = 0;
            int marksObtained = 0;
            boolean previousSectionCompleted = true;

            for (AssignmentDto.SectionSummary s : sections) {
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

                if ("COMPLETED".equals(s.getStatus())) {
                    completedSec++;
                }
                totalQ += s.getQuestionCount();
                solvedQ += s.getSolvedCount();
                marksObtained += s.getMarksObtained();

                previousSectionCompleted = "COMPLETED".equals(s.getStatus());
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
            s.setQuestions(new ArrayList<>());
            return s;
        }, assignmentId);

        if (sections.isEmpty()) {
            return sections;
        }

        // Batch load all questions across all sections of this assignment in a single query
        String qSql;
        Object[] qParams;
        if (userId != null) {
            qSql = "SELECT aq.section_id, q.id, q.title, q.question_type, q.difficulty, q.marks, " +
                   "qa.status AS attempt_status, qa.marks_obtained, " +
                   "(CASE WHEN bm.id IS NOT NULL THEN 1 ELSE 0 END) AS is_bm " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "LEFT JOIN (" +
                   "    SELECT qa1.question_id, qa1.status, qa1.marks_obtained " +
                   "    FROM question_attempts qa1 " +
                   "    INNER JOIN (" +
                   "        SELECT question_id, MAX(id) AS max_id " +
                   "        FROM question_attempts " +
                   "        WHERE user_id = ? " +
                   "        GROUP BY question_id " +
                   "    ) qa2 ON qa1.id = qa2.max_id " +
                   ") qa ON q.id = qa.question_id " +
                   "LEFT JOIN bookmarks bm ON bm.user_id = ? AND bm.target_type = 'QUESTION' AND bm.target_id = q.id " +
                   "WHERE s.assignment_id = ? " +
                   "ORDER BY s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{userId, userId, assignmentId};
        } else {
            qSql = "SELECT aq.section_id, q.id, q.title, q.question_type, q.difficulty, q.marks, " +
                   "'NOT_ATTEMPTED' AS attempt_status, 0 AS marks_obtained, 0 AS is_bm " +
                   "FROM assignment_questions aq " +
                   "JOIN questions q ON aq.question_id = q.id " +
                   "JOIN assignment_sections s ON aq.section_id = s.id " +
                   "WHERE s.assignment_id = ? " +
                   "ORDER BY s.section_number ASC, aq.order_index ASC";
            qParams = new Object[]{assignmentId};
        }

        Map<Long, List<AssignmentDto.QuestionSummary>> questionsBySectionId = new HashMap<>();
        jdbcTemplate.query(qSql, rs -> {
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

            Long secId = rs.getLong("section_id");
            questionsBySectionId.computeIfAbsent(secId, k -> new ArrayList<>()).add(q);
        }, qParams);

        boolean previousSectionCompleted = true; // Section 1 is always unlocked

        for (AssignmentDto.SectionSummary s : sections) {
            List<AssignmentDto.QuestionSummary> questions = questionsBySectionId.getOrDefault(s.getId(), Collections.emptyList());
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
}
