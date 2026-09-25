package com.skillportal.user;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> userRowMapper = (rs, rowNum) -> {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setRole(rs.getString("role"));
        user.setStatus(rs.getString("status"));
        user.setFailedLoginAttempts(rs.getInt("failed_login_attempts"));

        Timestamp lockedUntilTs = rs.getTimestamp("locked_until");
        user.setLockedUntil(lockedUntilTs != null ? lockedUntilTs.toInstant() : null);

        Timestamp createdTs = rs.getTimestamp("created_at");
        user.setCreatedAt(createdTs != null ? createdTs.toInstant() : null);

        Timestamp updatedTs = rs.getTimestamp("updated_at");
        user.setUpdatedAt(updatedTs != null ? updatedTs.toInstant() : null);

        user.setDeleted(rs.getBoolean("is_deleted"));
        return user;
    };

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ? AND is_deleted = FALSE";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = ? AND is_deleted = FALSE";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByStudentId(String studentIdNumber) {
        String sql = "SELECT u.* FROM users u " +
                     "JOIN students s ON u.id = s.user_id " +
                     "WHERE s.student_id_number = ? AND u.is_deleted = FALSE";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, studentIdNumber);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void updateFailedAttempts(Long userId, int attempts) {
        String sql = "UPDATE users SET failed_login_attempts = ? WHERE id = ?";
        jdbcTemplate.update(sql, attempts, userId);
    }

    public void lockUser(Long userId, Instant lockedUntil) {
        String sql = "UPDATE users SET locked_until = ?, failed_login_attempts = 0 WHERE id = ?";
        jdbcTemplate.update(sql, Timestamp.from(lockedUntil), userId);
    }

    public void resetFailedAttempts(Long userId) {
        String sql = "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?";
        jdbcTemplate.update(sql, userId);
    }

    public void updatePassword(Long userId, String passwordHash) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        jdbcTemplate.update(sql, passwordHash, userId);
    }

    public List<User> findAll(int offset, int limit, String search) {
        if (search != null && !search.isBlank()) {
            String sql = "SELECT * FROM users WHERE is_deleted = FALSE AND (full_name LIKE ? OR email LIKE ?) ORDER BY id DESC LIMIT ? OFFSET ?";
            String pattern = "%" + search + "%";
            return jdbcTemplate.query(sql, userRowMapper, pattern, pattern, limit, offset);
        } else {
            String sql = "SELECT * FROM users WHERE is_deleted = FALSE ORDER BY id DESC LIMIT ? OFFSET ?";
            return jdbcTemplate.query(sql, userRowMapper, limit, offset);
        }
    }

    public long countAll(String search) {
        if (search != null && !search.isBlank()) {
            String sql = "SELECT COUNT(*) FROM users WHERE is_deleted = FALSE AND (full_name LIKE ? OR email LIKE ?)";
            String pattern = "%" + search + "%";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, pattern, pattern);
            return count != null ? count : 0L;
        } else {
            String sql = "SELECT COUNT(*) FROM users WHERE is_deleted = FALSE";
            Long count = jdbcTemplate.queryForObject(sql, Long.class);
            return count != null ? count : 0L;
        }
    }
}
