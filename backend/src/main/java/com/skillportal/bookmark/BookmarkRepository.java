package com.skillportal.bookmark;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BookmarkRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookmarkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<BookmarkDto.BookmarkItem> findByUserId(Long userId, String typeFilter) {
        String baseSql = "SELECT bm.id, bm.target_type, bm.target_id, bm.notes, bm.created_at, " +
                         "CASE " +
                         "  WHEN bm.target_type = 'QUESTION' THEN (SELECT title FROM questions WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'TOPIC' THEN (SELECT title FROM topics WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'MATERIAL' THEN (SELECT title FROM study_materials WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'COURSE' THEN (SELECT title FROM courses WHERE id = bm.target_id) " +
                         "  ELSE 'Resource' " +
                         "END AS title, " +
                         "CASE " +
                         "  WHEN bm.target_type = 'QUESTION' THEN (SELECT description FROM questions WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'TOPIC' THEN (SELECT description FROM topics WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'MATERIAL' THEN (SELECT description FROM study_materials WHERE id = bm.target_id) " +
                         "  WHEN bm.target_type = 'COURSE' THEN (SELECT description FROM courses WHERE id = bm.target_id) " +
                         "  ELSE '' " +
                         "END AS description " +
                         "FROM bookmarks bm WHERE bm.user_id = ? ";

        if (typeFilter != null && !typeFilter.isBlank() && !"ALL".equalsIgnoreCase(typeFilter)) {
            String sql = baseSql + "AND bm.target_type = ? ORDER BY bm.created_at DESC";
            return jdbcTemplate.query(sql, (rs, rowNum) -> mapItem(rs), userId, typeFilter.toUpperCase());
        } else {
            String sql = baseSql + "ORDER BY bm.created_at DESC";
            return jdbcTemplate.query(sql, (rs, rowNum) -> mapItem(rs), userId);
        }
    }

    private BookmarkDto.BookmarkItem mapItem(java.sql.ResultSet rs) throws java.sql.SQLException {
        BookmarkDto.BookmarkItem item = new BookmarkDto.BookmarkItem();
        item.setId(rs.getLong("id"));
        item.setTargetType(rs.getString("target_type"));
        item.setTargetId(rs.getLong("target_id"));
        item.setTitle(rs.getString("title"));
        item.setDescription(rs.getString("description"));
        item.setNotes(rs.getString("notes"));
        item.setCreatedAt(rs.getTimestamp("created_at").toInstant().toString());

        if ("QUESTION".equals(item.getTargetType())) {
            item.setLinkUrl("/assignments/1/m/1/q/" + item.getTargetId());
        } else if ("TOPIC".equals(item.getTargetType())) {
            item.setLinkUrl("/courses/1/topics/" + item.getTargetId());
        } else if ("MATERIAL".equals(item.getTargetType())) {
            item.setLinkUrl("/materials/" + item.getTargetId());
        } else {
            item.setLinkUrl("/courses/" + item.getTargetId());
        }
        return item;
    }

    public void addBookmark(Long userId, String targetType, Long targetId, String notes) {
        String sql = "INSERT INTO bookmarks (user_id, target_type, target_id, notes) VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE notes = VALUES(notes)";
        jdbcTemplate.update(sql, userId, targetType.toUpperCase(), targetId, notes);
    }

    public void removeBookmark(Long id, Long userId) {
        String sql = "DELETE FROM bookmarks WHERE id = ? AND user_id = ?";
        jdbcTemplate.update(sql, id, userId);
    }

    public void removeBookmarkByTarget(Long userId, String targetType, Long targetId) {
        String sql = "DELETE FROM bookmarks WHERE user_id = ? AND target_type = ? AND target_id = ?";
        jdbcTemplate.update(sql, userId, targetType.toUpperCase(), targetId);
    }
}
