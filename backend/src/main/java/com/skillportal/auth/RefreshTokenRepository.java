package com.skillportal.auth;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

@Repository
public class RefreshTokenRepository {

    private final JdbcTemplate jdbcTemplate;

    public RefreshTokenRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public static class RefreshTokenRecord {
        private Long id;
        private Long userId;
        private String token;
        private Instant expiresAt;
        private boolean revoked;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public Instant getExpiresAt() { return expiresAt; }
        public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

        public boolean isRevoked() { return revoked; }
        public void setRevoked(boolean revoked) { this.revoked = revoked; }
    }

    public void save(Long userId, String token, Instant expiresAt) {
        String sql = "INSERT INTO refresh_tokens (user_id, token, expires_at, revoked) VALUES (?, ?, ?, FALSE)";
        jdbcTemplate.update(sql, userId, token, Timestamp.from(expiresAt));
    }

    public Optional<RefreshTokenRecord> findByToken(String token) {
        String sql = "SELECT * FROM refresh_tokens WHERE token = ? AND revoked = FALSE";
        try {
            RefreshTokenRecord record = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                RefreshTokenRecord r = new RefreshTokenRecord();
                r.setId(rs.getLong("id"));
                r.setUserId(rs.getLong("user_id"));
                r.setToken(rs.getString("token"));
                r.setExpiresAt(rs.getTimestamp("expires_at").toInstant());
                r.setRevoked(rs.getBoolean("revoked"));
                return r;
            }, token);
            return Optional.ofNullable(record);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void revokeToken(String token) {
        String sql = "UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?";
        jdbcTemplate.update(sql, token);
    }

    public void revokeAllUserTokens(Long userId) {
        String sql = "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?";
        jdbcTemplate.update(sql, userId);
    }
}
