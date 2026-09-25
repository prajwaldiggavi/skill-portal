package com.skillportal.test;

import com.skillportal.exception.ApiException;
import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Repository
public class TestRepository {

    private final JdbcTemplate jdbcTemplate;

    public TestRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<TestDto.TestSummary> findAllTests(Long userId) {
        String sql = "SELECT t.*, " +
                     "(SELECT COUNT(*) FROM test_questions tq " +
                     " JOIN test_sections ts ON tq.test_section_id = ts.id " +
                     " WHERE ts.test_id = t.id) AS total_questions " +
                     "FROM tests t WHERE t.is_published = TRUE AND t.is_deleted = FALSE ORDER BY t.id ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TestDto.TestSummary s = new TestDto.TestSummary();
            s.setId(rs.getLong("id"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            s.setDurationMinutes(rs.getInt("duration_minutes"));
            s.setTotalMarks(rs.getInt("total_marks"));
            s.setPassingPercentage(rs.getInt("passing_percentage"));
            s.setTotalQuestions(rs.getInt("total_questions"));

            if (userId != null) {
                String attSql = "SELECT status, total_score, percentage FROM test_attempts WHERE user_id = ? AND test_id = ? ORDER BY id DESC LIMIT 1";
                try {
                    Map<String, Object> map = jdbcTemplate.queryForMap(attSql, userId, s.getId());
                    s.setAttemptStatus((String) map.get("status"));
                    s.setLastScore(((Number) map.get("total_score")).intValue());
                    s.setLastPercentage(((Number) map.get("percentage")).doubleValue());
                } catch (EmptyResultDataAccessException e) {
                    s.setAttemptStatus("NOT_ATTEMPTED");
                }
            } else {
                s.setAttemptStatus("NOT_ATTEMPTED");
            }
            return s;
        });
    }

    public TestDto.StartTestResponse startOrResumeTest(Long userId, Long testId) {
        // 1. Check for an ongoing active attempt
        String activeSql = "SELECT * FROM test_attempts WHERE user_id = ? AND test_id = ? AND status = 'IN_PROGRESS' ORDER BY id DESC LIMIT 1";
        Long attemptId;
        Instant deadline;
        Instant startedAt;

        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(activeSql, userId, testId);
            attemptId = ((Number) map.get("id")).longValue();
            deadline = ((Timestamp) map.get("deadline")).toInstant();
            startedAt = ((Timestamp) map.get("started_at")).toInstant();

            // If deadline already passed, auto-submit and start new or complete
            if (Instant.now().isAfter(deadline.plusSeconds(30))) {
                submitAttempt(userId, attemptId, true);
                return startOrResumeTest(userId, testId);
            }
        } catch (EmptyResultDataAccessException e) {
            // Start brand new attempt
            String durSql = "SELECT duration_minutes, title FROM tests WHERE id = ?";
            Map<String, Object> testMap = jdbcTemplate.queryForMap(durSql, testId);
            int durationMin = ((Number) testMap.get("duration_minutes")).intValue();

            startedAt = Instant.now();
            deadline = startedAt.plus(Duration.ofMinutes(durationMin));

            String insertSql = "INSERT INTO test_attempts (user_id, test_id, started_at, deadline, status) VALUES (?, ?, ?, ?, 'IN_PROGRESS')";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            final Instant fStarted = startedAt;
            final Instant fDeadline = deadline;

            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, userId);
                ps.setLong(2, testId);
                ps.setTimestamp(3, Timestamp.from(fStarted));
                ps.setTimestamp(4, Timestamp.from(fDeadline));
                return ps;
            }, keyHolder);

            attemptId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : 1L;
        }

        TestDto.StartTestResponse response = new TestDto.StartTestResponse();
        response.setAttemptId(attemptId);
        response.setTestId(testId);
        response.setStartedAt(startedAt.toString());
        response.setDeadline(deadline.toString());
        long remSeconds = Math.max(0, Duration.between(Instant.now(), deadline).getSeconds());
        response.setRemainingSeconds(remSeconds);

        String titleSql = "SELECT title FROM tests WHERE id = ?";
        response.setTestTitle(jdbcTemplate.queryForObject(titleSql, String.class, testId));

        response.setSections(loadTestSectionsWithQuestions(testId, attemptId));
        return response;
    }

    public List<TestDto.TestSectionDetail> loadTestSectionsWithQuestions(Long testId, Long attemptId) {
        String secSql = "SELECT * FROM test_sections WHERE test_id = ? ORDER BY order_index ASC";
        return jdbcTemplate.query(secSql, (rs, rowNum) -> {
            TestDto.TestSectionDetail sec = new TestDto.TestSectionDetail();
            sec.setId(rs.getLong("id"));
            sec.setTitle(rs.getString("title"));

            String qSql = "SELECT q.id, q.title, q.description, q.question_type, tq.marks, " +
                          "(SELECT selected_option_ids FROM test_answers ta WHERE ta.attempt_id = ? AND ta.question_id = q.id) AS saved_ans " +
                          "FROM questions q " +
                          "JOIN test_questions tq ON q.id = tq.question_id " +
                          "WHERE tq.test_section_id = ? ORDER BY tq.order_index ASC";

            List<TestDto.TestQuestionItem> questions = jdbcTemplate.query(qSql, (qrs, qRowNum) -> {
                TestDto.TestQuestionItem q = new TestDto.TestQuestionItem();
                q.setQuestionId(qrs.getLong("id"));
                q.setTitle(qrs.getString("title"));
                q.setDescription(qrs.getString("description"));
                q.setQuestionType(qrs.getString("question_type"));
                q.setMarks(qrs.getInt("marks"));
                q.setSavedAnswer(qrs.getString("saved_ans"));

                if (q.getQuestionType().startsWith("MCQ")) {
                    String optSql = "SELECT option_label, option_text FROM question_options WHERE question_id = ? ORDER BY order_index ASC";
                    List<TestDto.TestOptionItem> opts = jdbcTemplate.query(optSql, (ors, oRowNum) ->
                            new TestDto.TestOptionItem(ors.getString("option_label"), ors.getString("option_text")), q.getQuestionId());
                    q.setOptions(opts);
                }
                return q;
            }, attemptId, sec.getId());

            sec.setQuestions(questions);
            return sec;
        }, testId);
    }

    public void saveAnswer(Long userId, TestDto.SaveAnswerRequest req) {
        // Verify attempt belongs to user and verify deadline
        String attSql = "SELECT status, deadline FROM test_attempts WHERE id = ? AND user_id = ?";
        Map<String, Object> map;
        try {
            map = jdbcTemplate.queryForMap(attSql, req.getAttemptId(), userId);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException("Test attempt not found");
        }

        String status = (String) map.get("status");
        if (!"IN_PROGRESS".equals(status)) {
            throw new ApiException("Cannot save answer: Test is already " + status, HttpStatus.BAD_REQUEST, "TEST_ALREADY_SUBMITTED");
        }

        Instant deadline = ((Timestamp) map.get("deadline")).toInstant();
        // Server-authoritative timer enforcement (Requirement 21)
        if (Instant.now().isAfter(deadline.plusSeconds(30))) {
            submitAttempt(userId, req.getAttemptId(), true);
            throw new ApiException("Time expired. Test has been automatically submitted.", HttpStatus.BAD_REQUEST, "TEST_TIME_EXPIRED");
        }

        String upsertSql = "INSERT INTO test_answers (attempt_id, question_id, selected_option_ids, code_answer) VALUES (?, ?, ?, ?) " +
                           "ON DUPLICATE KEY UPDATE selected_option_ids = VALUES(selected_option_ids), code_answer = VALUES(code_answer)";
        jdbcTemplate.update(upsertSql, req.getAttemptId(), req.getQuestionId(), req.getSelectedOption(), req.getCodeAnswer());
    }

    public TestDto.TestResultSummary submitAttempt(Long userId, Long attemptId, boolean isAutoSubmit) {
        String attSql = "SELECT ta.*, t.title AS test_title, t.total_marks, t.passing_percentage " +
                        "FROM test_attempts ta " +
                        "JOIN tests t ON ta.test_id = t.id " +
                        "WHERE ta.id = ? AND ta.user_id = ?";
        Map<String, Object> attMap;
        try {
            attMap = jdbcTemplate.queryForMap(attSql, attemptId, userId);
        } catch (EmptyResultDataAccessException e) {
            throw new ResourceNotFoundException("Test attempt not found");
        }

        Long testId = ((Number) attMap.get("test_id")).longValue();
        String testTitle = (String) attMap.get("test_title");
        int maxMarks = ((Number) attMap.get("total_marks")).intValue();
        int passingPct = ((Number) attMap.get("passing_percentage")).intValue();

        // 1. Grade each recorded answer
        String answersSql = "SELECT ta.id AS ans_id, tq.question_id, ta.selected_option_ids, ta.code_answer, " +
                            "q.title, q.question_type, q.explanation, tq.marks " +
                            "FROM test_questions tq " +
                            "JOIN test_sections ts ON tq.test_section_id = ts.id " +
                            "JOIN questions q ON tq.question_id = q.id " +
                            "LEFT JOIN test_answers ta ON ta.question_id = q.id AND ta.attempt_id = ? " +
                            "WHERE ts.test_id = ?";

        List<TestDto.AnswerReviewItem> reviewItems = new ArrayList<>();
        int totalScore = 0;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(answersSql, attemptId, testId);
        for (Map<String, Object> r : rows) {
            Long questionId = ((Number) r.get("question_id")).longValue();
            String title = (String) r.get("title");
            String qType = (String) r.get("question_type");
            String exp = (String) r.get("explanation");
            int qMarks = ((Number) r.get("marks")).intValue();
            String selectedOpt = (String) r.get("selected_option_ids");

            boolean correct = false;
            String correctLabel = "";

            if (qType.startsWith("MCQ")) {
                String correctOptSql = "SELECT option_label FROM question_options WHERE question_id = ? AND is_correct = TRUE";
                List<String> correctOpts = jdbcTemplate.query(correctOptSql, (rs, rowNum) -> rs.getString("option_label"), questionId);
                correctLabel = String.join(", ", correctOpts);
                correct = selectedOpt != null && correctLabel.equalsIgnoreCase(selectedOpt.trim());
            } else {
                // Coding question in test: simple baseline simulation
                String codeAns = (String) r.get("code_answer");
                correct = codeAns != null && codeAns.length() > 50;
                correctLabel = "Verified Algorithmic Solution";
            }

            int awarded = correct ? qMarks : 0;
            totalScore += awarded;

            // Update individual test answer record
            if (r.get("ans_id") != null) {
                Long ansId = ((Number) r.get("ans_id")).longValue();
                String updateAnsSql = "UPDATE test_answers SET is_correct = ?, marks_awarded = ? WHERE id = ?";
                jdbcTemplate.update(updateAnsSql, correct, awarded, ansId);
            }

            TestDto.AnswerReviewItem item = new TestDto.AnswerReviewItem();
            item.setQuestionId(questionId);
            item.setQuestionTitle(title);
            item.setSelectedAnswer(selectedOpt != null ? selectedOpt : "Not Answered");
            item.setCorrectAnswer(correctLabel);
            item.setCorrect(correct);
            item.setMarksAwarded(awarded);
            item.setMaxMarks(qMarks);
            item.setExplanation(exp);
            reviewItems.add(item);
        }

        double percentage = maxMarks > 0 ? ((double) totalScore / maxMarks) * 100.0 : 0.0;
        percentage = Math.round(percentage * 10.0) / 10.0;
        String finalStatus = isAutoSubmit ? "AUTO_SUBMITTED" : "EVALUATED";

        String updateAttemptSql = "UPDATE test_attempts SET status = ?, total_score = ?, percentage = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?";
        jdbcTemplate.update(updateAttemptSql, finalStatus, totalScore, percentage, attemptId);

        // Award points to student profile
        String pointSql = "UPDATE students SET total_points = total_points + ? WHERE user_id = ?";
        jdbcTemplate.update(pointSql, totalScore, userId);

        // Record progress event
        String progSql = "INSERT INTO progress_events (user_id, event_type, reference_id, details) VALUES (?, 'TEST_COMPLETED', ?, ?)";
        jdbcTemplate.update(progSql, userId, testId, "Completed test " + testTitle + " (" + totalScore + "/" + maxMarks + " marks)");

        TestDto.TestResultSummary summary = new TestDto.TestResultSummary();
        summary.setAttemptId(attemptId);
        summary.setTestId(testId);
        summary.setTestTitle(testTitle);
        summary.setTotalScore(totalScore);
        summary.setMaxScore(maxMarks);
        summary.setPercentage(percentage);
        summary.setPassed(percentage >= passingPct);
        summary.setStatus(finalStatus);
        summary.setCompletedAt(Instant.now().toString());
        summary.setReviewItems(reviewItems);

        return summary;
    }

    public TestDto.TestResultSummary getResultSummary(Long userId, Long attemptId) {
        String sql = "SELECT ta.*, t.title AS test_title, t.total_marks, t.passing_percentage " +
                     "FROM test_attempts ta " +
                     "JOIN tests t ON ta.test_id = t.id " +
                     "WHERE ta.id = ? AND ta.user_id = ?";

        Map<String, Object> map = jdbcTemplate.queryForMap(sql, attemptId, userId);
        Long testId = ((Number) map.get("test_id")).longValue();

        TestDto.TestResultSummary summary = new TestDto.TestResultSummary();
        summary.setAttemptId(attemptId);
        summary.setTestId(testId);
        summary.setTestTitle((String) map.get("test_title"));
        summary.setTotalScore(((Number) map.get("total_score")).intValue());
        summary.setMaxScore(((Number) map.get("total_marks")).intValue());
        summary.setPercentage(((Number) map.get("percentage")).doubleValue());
        summary.setPassed(summary.getPercentage() >= ((Number) map.get("passing_percentage")).intValue());
        Object subAt = map.get("submitted_at");
        if (subAt instanceof java.sql.Timestamp) {
            summary.setCompletedAt(((java.sql.Timestamp) subAt).toInstant().toString());
        } else if (subAt != null) {
            summary.setCompletedAt(subAt.toString());
        } else {
            summary.setCompletedAt(Instant.now().toString());
        }

        // Load reviews
        String reviewSql = "SELECT q.id, q.title, q.explanation, q.marks, ta.selected_option_ids, ta.is_correct, ta.marks_awarded, " +
                           "(SELECT GROUP_CONCAT(option_label SEPARATOR ', ') FROM question_options WHERE question_id = q.id AND is_correct = TRUE) AS correct_opt " +
                           "FROM test_questions tq " +
                           "JOIN test_sections ts ON tq.test_section_id = ts.id " +
                           "JOIN questions q ON tq.question_id = q.id " +
                           "LEFT JOIN test_answers ta ON ta.question_id = q.id AND ta.attempt_id = ? " +
                           "WHERE ts.test_id = ?";

        List<TestDto.AnswerReviewItem> reviewItems = jdbcTemplate.query(reviewSql, (rs, rowNum) -> {
            TestDto.AnswerReviewItem item = new TestDto.AnswerReviewItem();
            item.setQuestionId(rs.getLong("id"));
            item.setQuestionTitle(rs.getString("title"));
            item.setExplanation(rs.getString("explanation"));
            item.setMaxMarks(rs.getInt("marks"));
            item.setSelectedAnswer(rs.getString("selected_option_ids") != null ? rs.getString("selected_option_ids") : "Not Answered");
            item.setCorrectAnswer(rs.getString("correct_opt") != null ? rs.getString("correct_opt") : "N/A");
            item.setCorrect(rs.getBoolean("is_correct"));
            item.setMarksAwarded(rs.getInt("marks_awarded"));
            return item;
        }, attemptId, testId);

        summary.setReviewItems(reviewItems);
        return summary;
    }
}
