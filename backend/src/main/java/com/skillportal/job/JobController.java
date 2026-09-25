package com.skillportal.job;

import com.skillportal.common.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    private final JobRepository jobRepository;
    private final JobFetchService jobFetchService;

    public JobController(JobRepository jobRepository, JobFetchService jobFetchService) {
        this.jobRepository = jobRepository;
        this.jobFetchService = jobFetchService;
    }

    @GetMapping
    public ApiResponse<List<JobDto>> getJobs(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword
    ) {
        List<Job> jobs;
        if ((city != null && !city.isBlank() && !"ALL".equalsIgnoreCase(city)) ||
            (keyword != null && !keyword.isBlank())) {
            String cityParam = (city == null || "ALL".equalsIgnoreCase(city)) ? null : city.trim();
            String keywordParam = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
            jobs = jobRepository.findWithFilters(cityParam, keywordParam);
        } else {
            jobs = jobRepository.findAllByOrderByPostedAtDesc();
        }

        List<JobDto> dtos = jobs.stream().map(JobDto::fromEntity).toList();
        return ApiResponse.success("Jobs retrieved successfully", dtos);
    }

    @PostMapping("/refresh")
    public ApiResponse<Map<String, Object>> refreshJobs() {
        int newJobsAdded = jobFetchService.fetchAndSaveJobs();
        long totalJobs = jobRepository.count();
        return ApiResponse.success("Job refresh completed", Map.of(
                "newJobsAdded", newJobsAdded,
                "totalJobs", totalJobs
        ));
    }
}
