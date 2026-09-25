package com.skillportal.user;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final JdbcTemplate jdbcTemplate;

    public UserService(UserRepository userRepository, StudentProfileRepository studentProfileRepository, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public StudentProfileDto.ProfileView getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        StudentProfileDto.ProfileView view = new StudentProfileDto.ProfileView();
        view.setUserId(user.getId());
        view.setEmail(user.getEmail());
        view.setFullName(user.getFullName());

        StudentProfileRepository.StudentRecord record = studentProfileRepository.findByUserId(userId)
                .orElse(new StudentProfileRepository.StudentRecord());

        view.setStudentIdNumber(record.getStudentIdNumber());
        view.setPhone(record.getPhone());
        view.setAvatarUrl(record.getAvatarUrl());
        view.setGithubUrl(record.getGithubUrl());
        view.setLinkedinUrl(record.getLinkedinUrl());
        view.setPortfolioUrl(record.getPortfolioUrl());
        view.setSkills(record.getSkills());
        view.setBio(record.getBio());
        view.setTotalPoints(record.getTotalPoints());

        if (record.getBatchId() != null) {
            String batchSql = "SELECT name FROM batches WHERE id = ?";
            try {
                view.setBatchName(jdbcTemplate.queryForObject(batchSql, String.class, record.getBatchId()));
            } catch (Exception ignored) {}
        }

        // Fetch enrolled courses
        String coursesSql = "SELECT c.title FROM courses c " +
                            "JOIN enrollments e ON c.id = e.course_id " +
                            "WHERE e.student_id = ? AND c.is_deleted = FALSE";
        List<String> courses = jdbcTemplate.query(coursesSql, (rs, rowNum) -> rs.getString("title"), record.getId());
        view.setEnrolledCourses(courses);

        return view;
    }

    @Transactional
    public void updateProfile(Long userId, StudentProfileDto.UpdateProfileRequest request) {
        studentProfileRepository.updateProfile(
                userId,
                request.getPhone(),
                request.getGithubUrl(),
                request.getLinkedinUrl(),
                request.getPortfolioUrl(),
                request.getSkills(),
                request.getBio(),
                request.getAvatarUrl()
        );
    }
}
