package com.skillportal.user;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class StudentProfileRepository {

    private final JdbcTemplate jdbcTemplate;

    public StudentProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public static class StudentRecord {
        private Long id;
        private Long userId;
        private String studentIdNumber;
        private String phone;
        private Long batchId;
        private String avatarUrl;
        private String githubUrl;
        private String linkedinUrl;
        private String portfolioUrl;
        private String skills;
        private String bio;
        private int totalPoints;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getStudentIdNumber() { return studentIdNumber; }
        public void setStudentIdNumber(String studentIdNumber) { this.studentIdNumber = studentIdNumber; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public Long getBatchId() { return batchId; }
        public void setBatchId(Long batchId) { this.batchId = batchId; }

        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

        public String getLinkedinUrl() { return linkedinUrl; }
        public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

        public String getPortfolioUrl() { return portfolioUrl; }
        public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

        public String getSkills() { return skills; }
        public void setSkills(String skills) { this.skills = skills; }

        public String getBio() { return bio; }
        public void setBio(String bio) { this.bio = bio; }

        public int getTotalPoints() { return totalPoints; }
        public void setTotalPoints(int totalPoints) { this.totalPoints = totalPoints; }
    }

    public Optional<StudentRecord> findByUserId(Long userId) {
        String sql = "SELECT * FROM students WHERE user_id = ?";
        try {
            StudentRecord record = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                StudentRecord s = new StudentRecord();
                s.setId(rs.getLong("id"));
                s.setUserId(rs.getLong("user_id"));
                s.setStudentIdNumber(rs.getString("student_id_number"));
                s.setPhone(rs.getString("phone"));
                s.setBatchId((Long) rs.getObject("batch_id"));
                s.setAvatarUrl(rs.getString("avatar_url"));
                s.setGithubUrl(rs.getString("github_url"));
                s.setLinkedinUrl(rs.getString("linkedin_url"));
                s.setPortfolioUrl(rs.getString("portfolio_url"));
                s.setSkills(rs.getString("skills"));
                s.setBio(rs.getString("bio"));
                s.setTotalPoints(rs.getInt("total_points"));
                return s;
            }, userId);
            return Optional.ofNullable(record);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void updateProfile(Long userId, String phone, String githubUrl, String linkedinUrl, String portfolioUrl, String skills, String bio, String avatarUrl) {
        String sql = "UPDATE students SET phone = ?, github_url = ?, linkedin_url = ?, portfolio_url = ?, skills = ?, bio = ?, avatar_url = ? WHERE user_id = ?";
        jdbcTemplate.update(sql, phone, githubUrl, linkedinUrl, portfolioUrl, skills, bio, avatarUrl, userId);
    }

    public void addPoints(Long userId, int points) {
        String sql = "UPDATE students SET total_points = total_points + ? WHERE user_id = ?";
        jdbcTemplate.update(sql, points, userId);
    }
}
