package com.skillportal.material;

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
public class MaterialRepository {

    private final JdbcTemplate jdbcTemplate;

    public MaterialRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<MaterialDto.MaterialItem> findAllMaterials(Long userId) {
        String sql = "SELECT m.*, s.title AS subject_title, t.title AS topic_title, " +
                     "(SELECT COUNT(*) FROM bookmarks bm WHERE bm.user_id = ? AND bm.target_type = 'MATERIAL' AND bm.target_id = m.id) AS is_bm " +
                     "FROM study_materials m " +
                     "LEFT JOIN subjects s ON m.subject_id = s.id " +
                     "LEFT JOIN topics t ON m.topic_id = t.id " +
                     "WHERE m.is_published = TRUE ORDER BY m.id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            MaterialDto.MaterialItem item = new MaterialDto.MaterialItem();
            item.setId(rs.getLong("id"));
            item.setTopicId((Long) rs.getObject("topic_id"));
            item.setSubjectId((Long) rs.getObject("subject_id"));
            item.setTitle(rs.getString("title"));
            item.setDescription(rs.getString("description"));
            item.setMaterialType(rs.getString("material_type"));
            item.setFileUrl(rs.getString("file_url"));
            item.setFileSizeBytes(rs.getLong("file_size_bytes"));
            item.setSubjectTitle(rs.getString("subject_title"));
            item.setTopicTitle(rs.getString("topic_title"));
            item.setBookmarked(rs.getInt("is_bm") > 0);
            return item;
        }, userId);
    }

    public Optional<MaterialDto.MaterialItem> findMaterialById(Long id, Long userId) {
        String sql = "SELECT m.*, s.title AS subject_title, t.title AS topic_title, " +
                     "(SELECT COUNT(*) FROM bookmarks bm WHERE bm.user_id = ? AND bm.target_type = 'MATERIAL' AND bm.target_id = m.id) AS is_bm " +
                     "FROM study_materials m " +
                     "LEFT JOIN subjects s ON m.subject_id = s.id " +
                     "LEFT JOIN topics t ON m.topic_id = t.id " +
                     "WHERE m.id = ? AND m.is_published = TRUE";

        try {
            MaterialDto.MaterialItem item = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                MaterialDto.MaterialItem m = new MaterialDto.MaterialItem();
                m.setId(rs.getLong("id"));
                m.setTopicId((Long) rs.getObject("topic_id"));
                m.setSubjectId((Long) rs.getObject("subject_id"));
                m.setTitle(rs.getString("title"));
                m.setDescription(rs.getString("description"));
                m.setMaterialType(rs.getString("material_type"));
                m.setFileUrl(rs.getString("file_url"));
                m.setFileSizeBytes(rs.getLong("file_size_bytes"));
                m.setSubjectTitle(rs.getString("subject_title"));
                m.setTopicTitle(rs.getString("topic_title"));
                m.setBookmarked(rs.getInt("is_bm") > 0);
                return m;
            }, userId, id);
            return Optional.ofNullable(item);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Long createMaterial(MaterialDto.CreateMaterialRequest req) {
        String sql = "INSERT INTO study_materials (topic_id, subject_id, title, description, material_type, file_url, file_size_bytes, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            if (req.getTopicId() != null) ps.setLong(1, req.getTopicId()); else ps.setNull(1, java.sql.Types.BIGINT);
            if (req.getSubjectId() != null) ps.setLong(2, req.getSubjectId()); else ps.setNull(2, java.sql.Types.BIGINT);
            ps.setString(3, req.getTitle());
            ps.setString(4, req.getDescription());
            ps.setString(5, req.getMaterialType());
            ps.setString(6, req.getFileUrl());
            ps.setLong(7, req.getFileSizeBytes());
            return ps;
        }, keyHolder);

        return keyHolder.getKey() != null ? keyHolder.getKey().longValue() : null;
    }
}
