package com.skillportal.course;

import com.skillportal.common.ApiResponse;
import com.skillportal.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Courses & Hierarchy", description = "Endpoints for browsing Courses, Subjects, Modules, and Topics")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping("/courses")
    @Operation(summary = "Get all published courses with student progress")
    public ResponseEntity<ApiResponse<List<CourseDto.CourseSummary>>> getAllCourses(
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        List<CourseDto.CourseSummary> courses = courseService.getAllCourses(userId);
        return ResponseEntity.ok(ApiResponse.success(courses));
    }

    @GetMapping("/courses/{id}")
    @Operation(summary = "Get course details with full subject and module hierarchy")
    public ResponseEntity<ApiResponse<CourseDto.CourseDetail>> getCourseById(@PathVariable Long id) {
        CourseDto.CourseDetail course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.success(course));
    }

    @GetMapping("/courses/{id}/subjects")
    @Operation(summary = "Get subjects for a specific course")
    public ResponseEntity<ApiResponse<List<CourseDto.SubjectDetail>>> getSubjectsByCourse(@PathVariable Long id) {
        List<CourseDto.SubjectDetail> subjects = courseService.getSubjectsByCourse(id);
        return ResponseEntity.ok(ApiResponse.success(subjects));
    }

    @GetMapping("/subjects/{id}/modules")
    @Operation(summary = "Get modules for a specific subject")
    public ResponseEntity<ApiResponse<List<CourseDto.ModuleDetail>>> getModulesBySubject(@PathVariable Long id) {
        List<CourseDto.ModuleDetail> modules = courseService.getModulesBySubject(id);
        return ResponseEntity.ok(ApiResponse.success(modules));
    }

    @GetMapping("/topics/{id}")
    @Operation(summary = "Get topic details with learning lessons, videos, and materials")
    public ResponseEntity<ApiResponse<CourseDto.TopicDetail>> getTopicById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        Long userId = principal != null ? principal.getId() : null;
        CourseDto.TopicDetail topic = courseService.getTopicById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(topic));
    }
}
