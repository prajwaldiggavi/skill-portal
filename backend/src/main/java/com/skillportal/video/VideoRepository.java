package com.skillportal.video;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;

@Repository
public class VideoRepository {

    private final JdbcTemplate jdbcTemplate;

    public VideoRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<VideoDto.VideoDetail> findVideoById(Long videoId, Long userId) {
        String sql = "SELECT v.*, vp.last_position_seconds, vp.watched_percentage, vp.is_completed " +
                     "FROM recorded_classes v " +
                     "LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ? " +
                     "WHERE v.id = ? AND v.is_published = TRUE";

        try {
            VideoDto.VideoDetail detail = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                VideoDto.VideoDetail v = new VideoDto.VideoDetail();
                v.setId(rs.getLong("id"));
                v.setTopicId((Long) rs.getObject("topic_id"));
                v.setTitle(rs.getString("title"));
                v.setDescription(rs.getString("description"));
                v.setVideoUrl(rs.getString("video_url"));
                v.setThumbnailUrl(rs.getString("thumbnail_url"));
                v.setDurationSeconds(rs.getInt("duration_seconds"));
                v.setLastPositionSeconds(rs.getInt("last_position_seconds"));
                v.setWatchedPercentage(rs.getDouble("watched_percentage"));
                v.setCompleted(rs.getBoolean("is_completed"));
                return v;
            }, userId, videoId);

            if (detail != null && detail.getTopicId() != null) {
                // Find next video in the same topic
                String nextSql = "SELECT id FROM recorded_classes WHERE topic_id = ? AND order_index > " +
                                 "(SELECT order_index FROM recorded_classes WHERE id = ?) AND is_published = TRUE ORDER BY order_index ASC LIMIT 1";
                try {
                    Long nextId = jdbcTemplate.queryForObject(nextSql, Long.class, detail.getTopicId(), videoId);
                    detail.setNextVideoId(nextId);
                } catch (EmptyResultDataAccessException ignored) {}

                // Find previous video in the same topic
                String prevSql = "SELECT id FROM recorded_classes WHERE topic_id = ? AND order_index < " +
                                 "(SELECT order_index FROM recorded_classes WHERE id = ?) AND is_published = TRUE ORDER BY order_index DESC LIMIT 1";
                try {
                    Long prevId = jdbcTemplate.queryForObject(prevSql, Long.class, detail.getTopicId(), videoId);
                    detail.setPrevVideoId(prevId);
                } catch (EmptyResultDataAccessException ignored) {}
            }

            return Optional.ofNullable(detail);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void saveOrUpdateProgress(Long userId, Long videoId, int lastPosition, double percentage, boolean isCompleted) {
        String upsertSql = "INSERT INTO video_progress (user_id, video_id, last_position_seconds, watched_percentage, is_completed, completed_at, updated_at) " +
                           "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) " +
                           "ON DUPLICATE KEY UPDATE " +
                           "last_position_seconds = VALUES(last_position_seconds), " +
                           "watched_percentage = GREATEST(watched_percentage, VALUES(watched_percentage)), " +
                           "is_completed = (is_completed OR VALUES(is_completed)), " +
                           "completed_at = CASE WHEN is_completed = FALSE AND VALUES(is_completed) = TRUE THEN CURRENT_TIMESTAMP ELSE completed_at END, " +
                           "updated_at = CURRENT_TIMESTAMP";

        Timestamp completedAt = isCompleted ? Timestamp.from(Instant.now()) : null;
        jdbcTemplate.update(upsertSql, userId, videoId, lastPosition, percentage, isCompleted, completedAt);

        // Track atomic progress events (Requirement 23)
        if (percentage > 0 && percentage < 10) {
            recordProgressEventIfNotExists(userId, "VIDEO_STARTED", videoId, "Started watching video " + videoId);
        }
        if (isCompleted || percentage >= 90.0) {
            recordProgressEventIfNotExists(userId, "VIDEO_COMPLETED", videoId, "Completed video " + videoId);
        }
    }

    public void recordProgressEventIfNotExists(Long userId, String eventType, Long referenceId, String details) {
        String checkSql = "SELECT COUNT(*) FROM progress_events WHERE user_id = ? AND event_type = ? AND reference_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, eventType, referenceId);
        if (count == null || count == 0) {
            String insertSql = "INSERT INTO progress_events (user_id, event_type, reference_id, details) VALUES (?, ?, ?, ?)";
            jdbcTemplate.update(insertSql, userId, eventType, referenceId, details);
        }
    }
}
