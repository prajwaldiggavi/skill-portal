package com.skillportal.attendance;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@Repository
public class AttendanceRepository {

    private final JdbcTemplate jdbcTemplate;

    public AttendanceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public AttendanceDto.StudentAttendanceSummary getStudentAttendanceSummary(Long userId) {
        AttendanceDto.StudentAttendanceSummary summary = new AttendanceDto.StudentAttendanceSummary();

        // 1. Get student record
        String stSql = "SELECT id, batch_id FROM students WHERE user_id = ?";
        Long studentId;
        Long batchId;
        try {
            Map<String, Object> map = jdbcTemplate.queryForMap(stSql, userId);
            studentId = ((Number) map.get("id")).longValue();
            batchId = map.get("batch_id") != null ? ((Number) map.get("batch_id")).longValue() : null;
        } catch (EmptyResultDataAccessException e) {
            summary.setOverallPercentage(0.0);
            summary.setHistory(List.of());
            summary.setSubjectWise(List.of());
            return summary;
        }

        if (batchId == null) {
            summary.setOverallPercentage(100.0);
            summary.setHistory(List.of());
            summary.setSubjectWise(List.of());
            return summary;
        }

        // Total sessions held for this batch
        String sessSql = "SELECT COUNT(*) FROM attendance_sessions WHERE batch_id = ?";
        Integer totalSessions = jdbcTemplate.queryForObject(sessSql, Integer.class, batchId);
        int total = totalSessions != null ? totalSessions : 0;
        summary.setTotalClasses(total);

        // Present sessions
        String presSql = "SELECT COUNT(*) FROM attendance_records WHERE student_id = ? AND status = 'PRESENT'";
        Integer presCount = jdbcTemplate.queryForObject(presSql, Integer.class, studentId);
        int present = presCount != null ? presCount : 0;
        summary.setPresentClasses(present);
        summary.setAbsentClasses(Math.max(0, total - present));

        double pct = total > 0 ? ((double) present / total) * 100.0 : 100.0;
        summary.setOverallPercentage(Math.round(pct * 10.0) / 10.0);

        // 2. Subject-wise stats
        String subSql = "SELECT s.id AS subject_id, s.title AS subject_title, " +
                        "(SELECT COUNT(*) FROM attendance_sessions as2 WHERE as2.subject_id = s.id AND as2.batch_id = ?) AS total_sub_sessions, " +
                        "(SELECT COUNT(*) FROM attendance_records ar " +
                        " JOIN attendance_sessions as3 ON ar.session_id = as3.id " +
                        " WHERE as3.subject_id = s.id AND ar.student_id = ? AND ar.status = 'PRESENT') AS pres_sub_sessions " +
                        "FROM subjects s WHERE s.is_deleted = FALSE";

        List<AttendanceDto.SubjectAttendanceStat> subStats = jdbcTemplate.query(subSql, (rs, rowNum) -> {
            AttendanceDto.SubjectAttendanceStat st = new AttendanceDto.SubjectAttendanceStat();
            st.setSubjectId(rs.getLong("subject_id"));
            st.setSubjectTitle(rs.getString("subject_title"));
            int subTotal = rs.getInt("total_sub_sessions");
            int subPres = rs.getInt("pres_sub_sessions");
            st.setTotalClasses(subTotal);
            st.setPresentClasses(subPres);
            double subPct = subTotal > 0 ? ((double) subPres / subTotal) * 100.0 : 100.0;
            st.setPercentage(Math.round(subPct * 10.0) / 10.0);
            return st;
        }, batchId, studentId);
        summary.setSubjectWise(subStats);

        // 3. Chronological History
        String histSql = "SELECT ar.session_id, asess.title AS session_title, s.title AS subject_title, " +
                         "asess.session_date, ar.status, ar.remarks " +
                         "FROM attendance_records ar " +
                         "JOIN attendance_sessions asess ON ar.session_id = asess.id " +
                         "LEFT JOIN subjects s ON asess.subject_id = s.id " +
                         "WHERE ar.student_id = ? ORDER BY asess.session_date DESC LIMIT 50";

        List<AttendanceDto.AttendanceHistoryItem> history = jdbcTemplate.query(histSql, (rs, rowNum) -> {
            AttendanceDto.AttendanceHistoryItem item = new AttendanceDto.AttendanceHistoryItem();
            item.setSessionId(rs.getLong("session_id"));
            item.setSessionTitle(rs.getString("session_title"));
            item.setSubjectTitle(rs.getString("subject_title") != null ? rs.getString("subject_title") : "General Lecture");
            item.setSessionDate(rs.getDate("session_date").toString());
            item.setStatus(rs.getString("status"));
            item.setRemarks(rs.getString("remarks"));
            return item;
        }, studentId);
        summary.setHistory(history);

        return summary;
    }

    public Long createSession(Long adminUserId, AttendanceDto.CreateSessionRequest req) {
        String sql = "INSERT INTO attendance_sessions (batch_id, subject_id, title, session_date, created_by) VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, req.getBatchId());
            if (req.getSubjectId() != null) ps.setLong(2, req.getSubjectId()); else ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, req.getTitle());
            ps.setDate(4, Date.valueOf(req.getSessionDate()));
            ps.setLong(5, adminUserId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public void markAttendance(Long sessionId, Long studentId, String status, String remarks) {
        String sql = "INSERT INTO attendance_records (session_id, student_id, status, remarks) VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)";
        jdbcTemplate.update(sql, sessionId, studentId, status, remarks);
    }
}
