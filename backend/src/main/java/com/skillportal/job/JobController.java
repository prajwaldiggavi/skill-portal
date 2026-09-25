package com.skillportal.job;

import com.skillportal.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final JobAggregationService jobAggregationService;
    private final JobApplicationService jobApplicationService;

    public JobController(
            JobRepository jobRepository,
            JobAggregationService jobAggregationService,
            JobApplicationService jobApplicationService
    ) {
        this.jobRepository = jobRepository;
        this.jobAggregationService = jobAggregationService;
        this.jobApplicationService = jobApplicationService;
    }

    @GetMapping
    public ApiResponse<List<JobDto>> getJobs(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Boolean onlyFresher,
            @RequestParam(required = false) Boolean only2026,
            @RequestParam(required = false, defaultValue = "RELEVANCE") String sort
    ) {
        String cityParam = (city == null || "ALL".equalsIgnoreCase(city)) ? null : city.trim();
        String keywordParam = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        String sourceParam = (source == null || "ALL".equalsIgnoreCase(source)) ? null : source.trim();

        List<Job> jobs = jobRepository.findWithAdvancedFilters(cityParam, keywordParam, sourceParam, onlyFresher, only2026);

        // In-memory sorting based on parameter
        if ("NEWEST".equalsIgnoreCase(sort)) {
            jobs = jobs.stream()
                    .sorted(Comparator.comparing(Job::getPostedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();
        } else if ("COMPANY".equalsIgnoreCase(sort)) {
            jobs = jobs.stream()
                    .sorted(Comparator.comparing(Job::getCompany, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                    .toList();
        } else {
            // Default: Most Relevant + Newest
            jobs = jobs.stream()
                    .sorted(Comparator.comparing(Job::getRelevanceScore, Comparator.nullsLast(Comparator.reverseOrder()))
                            .thenComparing(Job::getPostedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();
        }

        List<JobDto> dtos = jobs.stream().map(JobDto::fromEntity).toList();
        return ApiResponse.success("Jobs retrieved successfully", dtos);
    }

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getJobStats() {
        return ApiResponse.success("Job dashboard stats retrieved", jobApplicationService.getDashboardStats());
    }

    @GetMapping("/recommendations")
    public ApiResponse<List<JobDto>> getTopRecommendations() {
        List<Job> jobs = jobRepository.findTopRecommendations();
        List<JobDto> dtos = jobs.stream().limit(10).map(JobDto::fromEntity).toList();
        return ApiResponse.success("Top 2026 fresher recommendations retrieved", dtos);
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshJobs() {
        int newJobsAdded = jobAggregationService.aggregateAllSources();
        long totalJobs = jobRepository.count();
        return ApiResponse.success("Multi-source job sync completed", Map.of(
                "newJobsAdded", newJobsAdded,
                "totalJobs", totalJobs,
                "lastAggregationTime", jobAggregationService.getLastAggregationTime(),
                "sourceStats", jobAggregationService.getLastSourceStats()
        ));
    }

    @GetMapping("/applications")
    public ApiResponse<List<Map<String, Object>>> getApplications() {
        return ApiResponse.success("Student job applications retrieved", jobApplicationService.getUserApplications());
    }

    @PostMapping("/{jobId}/apply")
    public ApiResponse<Map<String, Object>> recordApply(@PathVariable Long jobId) {
        JobApplication app = jobApplicationService.recordApplicationClick(jobId);
        return ApiResponse.success("Application recorded successfully", Map.of(
                "jobId", app.getJobId(),
                "status", app.getStatus(),
                "appliedAt", app.getAppliedAt()
        ));
    }

    @PostMapping("/{jobId}/status")
    public ApiResponse<Map<String, Object>> updateStatus(
            @PathVariable Long jobId,
            @RequestBody Map<String, String> payload
    ) {
        String status = payload.getOrDefault("status", "APPLIED");
        String notes = payload.get("notes");
        JobApplication app = jobApplicationService.updateStatus(jobId, status, notes);
        return ApiResponse.success("Job status updated", Map.of(
                "jobId", app.getJobId(),
                "status", app.getStatus()
        ));
    }

    @GetMapping("/preferences")
    public ApiResponse<StudentJobPreference> getPreferences() {
        return ApiResponse.success("Job preferences retrieved", jobApplicationService.getStudentPreference());
    }

    @PutMapping("/preferences")
    public ApiResponse<StudentJobPreference> updatePreferences(@RequestBody StudentJobPreference preferences) {
        return ApiResponse.success("Job preferences updated", jobApplicationService.updateStudentPreference(preferences));
    }
}
