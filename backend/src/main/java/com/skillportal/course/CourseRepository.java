package com.skillportal.course;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class CourseRepository {

    private final JdbcTemplate jdbcTemplate;

    public CourseRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CourseDto.CourseSummary> findAllPublished(Long userId) {
        String sql = "SELECT c.id, c.title, c.slug, c.description, c.thumbnail_url, c.order_index, c.is_published, " +
                     "(SELECT COUNT(*) FROM subjects s WHERE s.course_id = c.id AND s.is_deleted = FALSE) AS subject_count, " +
                     "(SELECT COUNT(*) FROM topics t " +
                     " JOIN modules m ON t.module_id = m.id " +
                     " JOIN subjects s ON m.subject_id = s.id " +
                     " WHERE s.course_id = c.id AND t.is_deleted = FALSE) AS topic_count " +
                     "FROM courses c WHERE c.is_published = TRUE AND c.is_deleted = FALSE " +
                     "ORDER BY c.order_index ASC, c.id ASC";

        List<CourseDto.CourseSummary> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.CourseSummary dto = new CourseDto.CourseSummary();
            dto.setId(rs.getLong("id"));
            dto.setTitle(rs.getString("title"));
            dto.setSlug(rs.getString("slug"));
            dto.setDescription(rs.getString("description"));
            dto.setThumbnailUrl(rs.getString("thumbnail_url"));
            dto.setOrderIndex(rs.getInt("order_index"));
            dto.setPublished(rs.getBoolean("is_published"));
            dto.setSubjectCount(rs.getInt("subject_count"));
            dto.setTopicCount(rs.getInt("topic_count"));
            dto.setStudentProgressPercentage(0.0);
            return dto;
        });

        if (userId != null && !list.isEmpty()) {
            String progressSql = "SELECT s.course_id, COUNT(DISTINCT pe.reference_id) AS completed_count " +
                                 "FROM progress_events pe " +
                                 "JOIN topics t ON pe.reference_id = t.id " +
                                 "JOIN modules m ON t.module_id = m.id " +
                                 "JOIN subjects s ON m.subject_id = s.id " +
                                 "WHERE pe.user_id = ? AND pe.event_type = 'TOPIC_COMPLETED' " +
                                 "GROUP BY s.course_id";

            java.util.Map<Long, Integer> completedMap = new java.util.HashMap<>();
            jdbcTemplate.query(progressSql, (rs) -> {
                completedMap.put(rs.getLong("course_id"), rs.getInt("completed_count"));
            }, userId);

            for (CourseDto.CourseSummary dto : list) {
                int completedCount = completedMap.getOrDefault(dto.getId(), 0);
                double pct = dto.getTopicCount() > 0 ? ((double) completedCount / dto.getTopicCount()) * 100.0 : 0.0;
                dto.setStudentProgressPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
            }
        }

        return list;
    }

    public Optional<CourseDto.CourseDetail> findCourseById(Long courseId) {
        String sql = "SELECT * FROM courses WHERE id = ? AND is_deleted = FALSE";
        try {
            CourseDto.CourseDetail course = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CourseDto.CourseDetail c = new CourseDto.CourseDetail();
                c.setId(rs.getLong("id"));
                c.setTitle(rs.getString("title"));
                c.setSlug(rs.getString("slug"));
                c.setDescription(rs.getString("description"));
                c.setThumbnailUrl(rs.getString("thumbnail_url"));
                return c;
            }, courseId);

            if (course != null) {
                course.setSubjects(findSubjectsByCourseId(courseId));
            }
            return Optional.ofNullable(course);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<CourseDto.SubjectDetail> findSubjectsByCourseId(Long courseId) {
        String sql = "SELECT * FROM subjects WHERE course_id = ? AND is_deleted = FALSE ORDER BY order_index ASC";
        List<CourseDto.SubjectDetail> subjects = jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.SubjectDetail s = new CourseDto.SubjectDetail();
            s.setId(rs.getLong("id"));
            s.setCourseId(rs.getLong("course_id"));
            s.setTitle(rs.getString("title"));
            s.setDescription(rs.getString("description"));
            s.setOrderIndex(rs.getInt("order_index"));
            s.setModules(new java.util.ArrayList<>());
            return s;
        }, courseId);

        if (subjects.isEmpty()) {
            return subjects;
        }

        // Batch load all modules for this course in a single query
        String modSql = "SELECT m.* FROM modules m JOIN subjects s ON m.subject_id = s.id " +
                        "WHERE s.course_id = ? AND m.is_deleted = FALSE AND s.is_deleted = FALSE " +
                        "ORDER BY m.order_index ASC";
        List<CourseDto.ModuleDetail> allModules = jdbcTemplate.query(modSql, (rs, rowNum) -> {
            CourseDto.ModuleDetail m = new CourseDto.ModuleDetail();
            m.setId(rs.getLong("id"));
            m.setSubjectId(rs.getLong("subject_id"));
            m.setTitle(rs.getString("title"));
            m.setDescription(rs.getString("description"));
            m.setOrderIndex(rs.getInt("order_index"));
            m.setTopics(new java.util.ArrayList<>());
            return m;
        }, courseId);

        // Batch load all topics for this course in a single query
        String topicSql = "SELECT t.*, " +
                          "(SELECT COUNT(*) FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE) AS video_count, " +
                          "(SELECT COUNT(*) FROM study_materials sm WHERE sm.topic_id = t.id AND sm.is_published = TRUE) AS material_count, " +
                          "(SELECT rc.video_url FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_video_url, " +
                          "(SELECT rc.duration_seconds FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_duration_sec " +
                          "FROM topics t " +
                          "JOIN modules m ON t.module_id = m.id " +
                          "JOIN subjects s ON m.subject_id = s.id " +
                          "WHERE s.course_id = ? AND t.is_deleted = FALSE AND m.is_deleted = FALSE AND s.is_deleted = FALSE " +
                          "ORDER BY t.order_index ASC";

        List<CourseDto.TopicSummary> allTopics = jdbcTemplate.query(topicSql, (rs, rowNum) -> {
            CourseDto.TopicSummary t = new CourseDto.TopicSummary();
            t.setId(rs.getLong("id"));
            t.setModuleId(rs.getLong("module_id"));
            t.setTitle(rs.getString("title"));
            t.setDescription(rs.getString("description"));
            t.setOrderIndex(rs.getInt("order_index"));
            t.setHasVideo(rs.getInt("video_count") > 0);
            t.setHasMaterial(rs.getInt("material_count") > 0);
            t.setVideoUrl(rs.getString("first_video_url"));
            int sec = rs.getInt("first_duration_sec");
            t.setDurationMinutes(sec > 0 ? Math.max(1, sec / 60) : 30);
            return t;
        }, courseId);

        // Map topics to modules
        java.util.Map<Long, java.util.List<CourseDto.TopicSummary>> topicsByModuleId = new java.util.HashMap<>();
        for (CourseDto.TopicSummary t : allTopics) {
            topicsByModuleId.computeIfAbsent(t.getModuleId(), k -> new java.util.ArrayList<>()).add(t);
        }
        for (CourseDto.ModuleDetail m : allModules) {
            m.setTopics(topicsByModuleId.getOrDefault(m.getId(), java.util.Collections.emptyList()));
        }

        // Map modules to subjects
        java.util.Map<Long, java.util.List<CourseDto.ModuleDetail>> modulesBySubjectId = new java.util.HashMap<>();
        for (CourseDto.ModuleDetail m : allModules) {
            modulesBySubjectId.computeIfAbsent(m.getSubjectId(), k -> new java.util.ArrayList<>()).add(m);
        }
        for (CourseDto.SubjectDetail s : subjects) {
            s.setModules(modulesBySubjectId.getOrDefault(s.getId(), java.util.Collections.emptyList()));
        }

        return subjects;
    }

    public List<CourseDto.ModuleDetail> findModulesBySubjectId(Long subjectId) {
        String sql = "SELECT * FROM modules WHERE subject_id = ? AND is_deleted = FALSE ORDER BY order_index ASC";
        List<CourseDto.ModuleDetail> modules = jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.ModuleDetail m = new CourseDto.ModuleDetail();
            m.setId(rs.getLong("id"));
            m.setSubjectId(rs.getLong("subject_id"));
            m.setTitle(rs.getString("title"));
            m.setDescription(rs.getString("description"));
            m.setOrderIndex(rs.getInt("order_index"));
            m.setTopics(new java.util.ArrayList<>());
            return m;
        }, subjectId);

        if (modules.isEmpty()) {
            return modules;
        }

        String topicSql = "SELECT t.*, " +
                          "(SELECT COUNT(*) FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE) AS video_count, " +
                          "(SELECT COUNT(*) FROM study_materials sm WHERE sm.topic_id = t.id AND sm.is_published = TRUE) AS material_count, " +
                          "(SELECT rc.video_url FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_video_url, " +
                          "(SELECT rc.duration_seconds FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_duration_sec " +
                          "FROM topics t " +
                          "JOIN modules m ON t.module_id = m.id " +
                          "WHERE m.subject_id = ? AND t.is_deleted = FALSE AND m.is_deleted = FALSE " +
                          "ORDER BY t.order_index ASC";

        List<CourseDto.TopicSummary> topics = jdbcTemplate.query(topicSql, (rs, rowNum) -> {
            CourseDto.TopicSummary t = new CourseDto.TopicSummary();
            t.setId(rs.getLong("id"));
            t.setModuleId(rs.getLong("module_id"));
            t.setTitle(rs.getString("title"));
            t.setDescription(rs.getString("description"));
            t.setOrderIndex(rs.getInt("order_index"));
            t.setHasVideo(rs.getInt("video_count") > 0);
            t.setHasMaterial(rs.getInt("material_count") > 0);
            t.setVideoUrl(rs.getString("first_video_url"));
            int sec = rs.getInt("first_duration_sec");
            t.setDurationMinutes(sec > 0 ? Math.max(1, sec / 60) : 30);
            return t;
        }, subjectId);

        java.util.Map<Long, java.util.List<CourseDto.TopicSummary>> topicsByModuleId = new java.util.HashMap<>();
        for (CourseDto.TopicSummary t : topics) {
            topicsByModuleId.computeIfAbsent(t.getModuleId(), k -> new java.util.ArrayList<>()).add(t);
        }
        for (CourseDto.ModuleDetail m : modules) {
            m.setTopics(topicsByModuleId.getOrDefault(m.getId(), java.util.Collections.emptyList()));
        }
        return modules;
    }

    public List<CourseDto.TopicSummary> findTopicsByModuleId(Long moduleId, Long userId) {
        String sql = "SELECT t.*, " +
                     "(SELECT COUNT(*) FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE) AS video_count, " +
                     "(SELECT COUNT(*) FROM study_materials sm WHERE sm.topic_id = t.id AND sm.is_published = TRUE) AS material_count, " +
                     "(SELECT rc.video_url FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_video_url, " +
                     "(SELECT rc.duration_seconds FROM recorded_classes rc WHERE rc.topic_id = t.id AND rc.is_published = TRUE ORDER BY rc.order_index ASC LIMIT 1) AS first_duration_sec " +
                     "FROM topics t WHERE t.module_id = ? AND t.is_deleted = FALSE ORDER BY t.order_index ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.TopicSummary t = new CourseDto.TopicSummary();
            t.setId(rs.getLong("id"));
            t.setModuleId(rs.getLong("module_id"));
            t.setTitle(rs.getString("title"));
            t.setDescription(rs.getString("description"));
            t.setOrderIndex(rs.getInt("order_index"));
            t.setHasVideo(rs.getInt("video_count") > 0);
            t.setHasMaterial(rs.getInt("material_count") > 0);
            t.setVideoUrl(rs.getString("first_video_url"));
            int sec = rs.getInt("first_duration_sec");
            t.setDurationMinutes(sec > 0 ? Math.max(1, sec / 60) : 30);

            if (userId != null) {
                String checkSql = "SELECT COUNT(*) FROM progress_events WHERE user_id = ? AND event_type = 'TOPIC_COMPLETED' AND reference_id = ?";
                Integer c = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, t.getId());
                t.setCompleted(c != null && c > 0);
            }
            return t;
        }, moduleId);
    }

    public Optional<CourseDto.TopicDetail> findTopicById(Long topicId, Long userId) {
        String sql = "SELECT * FROM topics WHERE id = ? AND is_deleted = FALSE";
        try {
            CourseDto.TopicDetail topic = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                CourseDto.TopicDetail t = new CourseDto.TopicDetail();
                t.setId(rs.getLong("id"));
                t.setModuleId(rs.getLong("module_id"));
                t.setTitle(rs.getString("title"));
                t.setDescription(rs.getString("description"));
                return t;
            }, topicId);

            if (topic != null) {
                topic.setItems(findLearningItemsByTopicId(topicId));
                topic.setVideos(findVideosByTopicId(topicId, userId));
                topic.setMaterials(findMaterialsByTopicId(topicId));

                if (userId != null) {
                    String checkSql = "SELECT COUNT(*) FROM progress_events WHERE user_id = ? AND event_type = 'TOPIC_COMPLETED' AND reference_id = ?";
                    Integer c = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, topicId);
                    topic.setCompleted(c != null && c > 0);
                }
            }
            return Optional.ofNullable(topic);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<CourseDto.LearningItemDetail> findLearningItemsByTopicId(Long topicId) {
        String sql = "SELECT * FROM learning_items WHERE topic_id = ? AND is_published = TRUE ORDER BY order_index ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.LearningItemDetail item = new CourseDto.LearningItemDetail();
            item.setId(rs.getLong("id"));
            item.setTopicId(rs.getLong("topic_id"));
            item.setTitle(rs.getString("title"));
            item.setItemType(rs.getString("item_type"));
            item.setContent(rs.getString("content"));
            item.setOrderIndex(rs.getInt("order_index"));
            return item;
        }, topicId);
    }

    public List<CourseDto.VideoSummary> findVideosByTopicId(Long topicId, Long userId) {
        String sql = "SELECT v.*, vp.last_position_seconds, vp.watched_percentage, vp.is_completed " +
                     "FROM recorded_classes v " +
                     "LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ? " +
                     "WHERE v.topic_id = ? AND v.is_published = TRUE ORDER BY v.order_index ASC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.VideoSummary v = new CourseDto.VideoSummary();
            v.setId(rs.getLong("id"));
            v.setTitle(rs.getString("title"));
            v.setDescription(rs.getString("description"));
            v.setVideoUrl(rs.getString("video_url"));
            v.setThumbnailUrl(rs.getString("thumbnail_url"));
            v.setDurationSeconds(rs.getInt("duration_seconds"));
            v.setLastPositionSeconds(rs.getInt("last_position_seconds"));
            v.setWatchedPercentage(rs.getDouble("watched_percentage"));
            v.setCompleted(rs.getBoolean("is_completed"));
            return v;
        }, userId, topicId);
    }

    public List<CourseDto.MaterialSummary> findMaterialsByTopicId(Long topicId) {
        String sql = "SELECT * FROM study_materials WHERE topic_id = ? AND is_published = TRUE";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            CourseDto.MaterialSummary m = new CourseDto.MaterialSummary();
            m.setId(rs.getLong("id"));
            m.setTitle(rs.getString("title"));
            m.setDescription(rs.getString("description"));
            m.setMaterialType(rs.getString("material_type"));
            m.setFileUrl(rs.getString("file_url"));
            m.setFileSizeBytes(rs.getLong("file_size_bytes"));
            return m;
        }, topicId);
    }

    public Long createCourse(CourseDto.CreateCourseRequest req) {
        String sql = "INSERT INTO courses (title, slug, description, thumbnail_url, order_index, is_published) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, req.getTitle());
            ps.setString(2, req.getSlug());
            ps.setString(3, req.getDescription());
            ps.setString(4, req.getThumbnailUrl());
            ps.setInt(5, req.getOrderIndex());
            ps.setBoolean(6, req.isPublished());
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long createSubject(Long courseId, String title, String description, int orderIndex) {
        String sql = "INSERT INTO subjects (course_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, TRUE)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, courseId);
            ps.setString(2, title);
            ps.setString(3, description);
            ps.setInt(4, orderIndex);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long createModule(Long subjectId, String title, String description, int orderIndex) {
        String sql = "INSERT INTO modules (subject_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, TRUE)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, subjectId);
            ps.setString(2, title);
            ps.setString(3, description);
            ps.setInt(4, orderIndex);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }

    public Long createTopic(Long moduleId, String title, String description, int orderIndex) {
        String sql = "INSERT INTO topics (module_id, title, description, order_index, is_published) VALUES (?, ?, ?, ?, TRUE)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, moduleId);
            ps.setString(2, title);
            ps.setString(3, description);
            ps.setInt(4, orderIndex);
            return ps;
        }, keyHolder);
        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }
}
