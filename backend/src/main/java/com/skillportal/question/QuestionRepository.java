package com.skillportal.question;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class QuestionRepository {

    private final JdbcTemplate jdbcTemplate;

    public QuestionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<QuestionDto.QuestionDetail> findQuestionById(Long questionId, Long userId) {
        String sql = "SELECT * FROM questions WHERE id = ? AND is_active = TRUE";
        try {
            QuestionDto.QuestionDetail q = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                QuestionDto.QuestionDetail detail = new QuestionDto.QuestionDetail();
                detail.setId(rs.getLong("id"));
                detail.setTitle(rs.getString("title"));
                detail.setDescription(rs.getString("description"));
                detail.setQuestionType(rs.getString("question_type"));
                detail.setDifficulty(rs.getString("difficulty"));
                detail.setMarks(rs.getInt("marks"));
                detail.setCompanyTag(rs.getString("company_tag"));
                detail.setTags(rs.getString("tags"));
                detail.setCurrentVersion(rs.getInt("current_version"));
                return detail;
            }, questionId);

            if (q != null) {
                // If question is MCQ, load public options (NEVER include is_correct in this query - Requirement 17)
                if (q.getQuestionType().startsWith("MCQ")) {
                    String optSql = "SELECT id, option_label, option_text, order_index FROM question_options WHERE question_id = ? ORDER BY order_index ASC";
                    List<QuestionDto.OptionPublic> options = jdbcTemplate.query(optSql, (rs, rowNum) -> {
                        QuestionDto.OptionPublic opt = new QuestionDto.OptionPublic();
                        opt.setId(rs.getLong("id"));
                        opt.setOptionLabel(rs.getString("option_label"));
                        opt.setOptionText(rs.getString("option_text"));
                        opt.setOrderIndex(rs.getInt("order_index"));
                        return opt;
                    }, questionId);
                    q.setOptions(options);
                } else if ("CODING".equals(q.getQuestionType())) {
                    // Load coding problem summary with visible sample cases only
                    String codeSql = "SELECT * FROM coding_problems WHERE question_id = ?";
                    try {
                        QuestionDto.CodingProblemSummary cp = jdbcTemplate.queryForObject(codeSql, (rs, rowNum) -> {
                            QuestionDto.CodingProblemSummary p = new QuestionDto.CodingProblemSummary();
                            p.setId(rs.getLong("id"));
                            p.setProblemStatement(rs.getString("problem_statement"));
                            p.setInputFormat(rs.getString("input_format"));
                            p.setOutputFormat(rs.getString("output_format"));
                            p.setConstraints(rs.getString("constraints"));
                            p.setStarterCodeJava(rs.getString("starter_code_java"));
                            p.setStarterCodePython(rs.getString("starter_code_python"));
                            p.setStarterCodeJs(rs.getString("starter_code_js"));
                            p.setTimeLimitMs(rs.getInt("time_limit_ms"));
                            p.setMemoryLimitMb(rs.getInt("memory_limit_mb"));
                            return p;
                        }, questionId);

                        if (cp != null) {
                            String tcSql = "SELECT id, input_data, expected_output, order_index FROM test_cases WHERE coding_problem_id = ? AND is_hidden = FALSE ORDER BY order_index ASC";
                            List<QuestionDto.SampleTestCase> sampleCases = jdbcTemplate.query(tcSql, (rs, rowNum) -> {
                                QuestionDto.SampleTestCase tc = new QuestionDto.SampleTestCase();
                                tc.setId(rs.getLong("id"));
                                tc.setInputData(rs.getString("input_data"));
                                tc.setExpectedOutput(rs.getString("expected_output"));
                                tc.setOrderIndex(rs.getInt("order_index"));
                                return tc;
                            }, cp.getId());
                            cp.setSampleCases(sampleCases);
                            q.setCodingProblem(cp);
                        }
                    } catch (EmptyResultDataAccessException ignored) {}
                }

                if (userId != null) {
                    // Check bookmark status
                    String bmSql = "SELECT COUNT(*) FROM bookmarks WHERE user_id = ? AND target_type = 'QUESTION' AND target_id = ?";
                    Integer bmCount = jdbcTemplate.queryForObject(bmSql, Integer.class, userId, questionId);
                    q.setBookmarked(bmCount != null && bmCount > 0);

                    // Check last student attempt
                    String attSql = "SELECT status, marks_obtained, time_spent_seconds, submitted_at FROM question_attempts WHERE user_id = ? AND question_id = ? ORDER BY id DESC LIMIT 1";
                    try {
                        QuestionDto.StudentAttemptSummary att = jdbcTemplate.queryForObject(attSql, (rs, rowNum) -> {
                            QuestionDto.StudentAttemptSummary a = new QuestionDto.StudentAttemptSummary();
                            a.setStatus(rs.getString("status"));
                            a.setMarksObtained(rs.getInt("marks_obtained"));
                            a.setTimeSpentSeconds(rs.getInt("time_spent_seconds"));
                            a.setSubmittedAt(rs.getTimestamp("submitted_at").toInstant().toString());
                            return a;
                        }, userId, questionId);
                        q.setLastAttempt(att);
                        if (att != null && ("SOLVED".equals(att.getStatus()) || "ATTEMPTED".equals(att.getStatus()))) {
                            // Show explanation after attempt
                            String expSql = "SELECT explanation FROM questions WHERE id = ?";
                            q.setExplanation(jdbcTemplate.queryForObject(expSql, String.class, questionId));
                        }
                    } catch (EmptyResultDataAccessException ignored) {}
                }
            }
            return Optional.ofNullable(q);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public QuestionDto.AttemptResult gradeMcqAttempt(Long userId, Long questionId, QuestionDto.SubmitMcqAttemptRequest req) {
        String qSql = "SELECT marks, explanation, question_type FROM questions WHERE id = ?";
        Map<String, Object> qMap = jdbcTemplate.queryForMap(qSql, questionId);
        int maxMarks = ((Number) qMap.get("marks")).intValue();
        String explanation = (String) qMap.get("explanation");
        String qType = (String) qMap.get("question_type");

        // Fetch actual correct options from database
        String optSql = "SELECT option_label FROM question_options WHERE question_id = ? AND is_correct = TRUE";
        List<String> correctOptions = jdbcTemplate.query(optSql, (rs, rowNum) -> rs.getString("option_label"), questionId);

        Set<String> correctSet = new HashSet<>(correctOptions);
        Set<String> studentSet = new HashSet<>(req.getSelectedOptionLabels());

        boolean isCorrect = correctSet.equals(studentSet);
        int marksAwarded = isCorrect ? maxMarks : 0;
        String status = isCorrect ? "SOLVED" : "ATTEMPTED";

        // Record in question_attempts
        String insertAttemptSql = "INSERT INTO question_attempts (user_id, question_id, assignment_id, attempt_type, status, marks_obtained, time_spent_seconds) VALUES (?, ?, ?, ?, ?, ?, ?)";
        String attemptType = req.getAssignmentId() != null ? "ASSIGNMENT" : "PRACTICE";
        jdbcTemplate.update(insertAttemptSql, userId, questionId, req.getAssignmentId(), attemptType, status, marksAwarded, req.getTimeSpentSeconds());

        // If correct, award points and record progress event
        if (isCorrect) {
            String pointSql = "UPDATE students SET total_points = total_points + ? WHERE user_id = ?";
            jdbcTemplate.update(pointSql, marksAwarded, userId);

            String progressSql = "INSERT INTO progress_events (user_id, event_type, reference_id, details) VALUES (?, 'QUESTION_SOLVED', ?, ?)";
            jdbcTemplate.update(progressSql, userId, questionId, "Solved question " + questionId + " (" + marksAwarded + " pts)");
        }

        QuestionDto.AttemptResult result = new QuestionDto.AttemptResult();
        result.setCorrect(isCorrect);
        result.setMarksAwarded(marksAwarded);
        result.setMaxMarks(maxMarks);
        result.setExplanation(explanation);
        result.setCorrectOptions(correctOptions);
        return result;
    }
}
