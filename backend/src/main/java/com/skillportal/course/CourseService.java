package com.skillportal.course;

import com.skillportal.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public List<CourseDto.CourseSummary> getAllCourses(Long userId) {
        return courseRepository.findAllPublished(userId);
    }

    public CourseDto.CourseDetail getCourseById(Long id) {
        return courseRepository.findCourseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
    }

    public List<CourseDto.SubjectDetail> getSubjectsByCourse(Long courseId) {
        return courseRepository.findSubjectsByCourseId(courseId);
    }

    public List<CourseDto.ModuleDetail> getModulesBySubject(Long subjectId) {
        return courseRepository.findModulesBySubjectId(subjectId);
    }

    public CourseDto.TopicDetail getTopicById(Long topicId, Long userId) {
        return courseRepository.findTopicById(topicId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + topicId));
    }

    @Transactional
    public Long createCourse(CourseDto.CreateCourseRequest request) {
        return courseRepository.createCourse(request);
    }

    @Transactional
    public Long createSubject(Long courseId, String title, String description, int orderIndex) {
        return courseRepository.createSubject(courseId, title, description, orderIndex);
    }

    @Transactional
    public Long createModule(Long subjectId, String title, String description, int orderIndex) {
        return courseRepository.createModule(subjectId, title, description, orderIndex);
    }

    @Transactional
    public Long createTopic(Long moduleId, String title, String description, int orderIndex) {
        return courseRepository.createTopic(moduleId, title, description, orderIndex);
    }
}
