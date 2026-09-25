package com.skillportal.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class JobFetchService {

    private static final Logger log = LoggerFactory.getLogger(JobFetchService.class);

    private static final List<String> SEARCH_QUERIES = List.of(
        "Java Fresher",
        "Core Java Developer",
        "Java Full Stack Developer",
        "Spring Boot Developer Fresher",
        "Hibernate Java Developer",
        "MySQL Java Developer"
    );

    private final JobRepository jobRepository;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    private final String appId;
    private final String appKey;
    private final String baseUrl;

    public JobFetchService(
            JobRepository jobRepository,
            ObjectMapper objectMapper,
            @Value("${adzuna.app-id:}") String appId,
            @Value("${adzuna.app-key:}") String appKey,
            @Value("${adzuna.base-url:https://api.adzuna.com/v1/api/jobs/in/search}") String baseUrl
    ) {
        this.jobRepository = jobRepository;
        this.objectMapper = objectMapper;
        this.appId = appId != null ? appId.trim() : "";
        this.appKey = appKey != null ? appKey.trim() : "";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://api.adzuna.com/v1/api/jobs/in/search";
        this.restClient = RestClient.builder().build();
    }

    /**
     * Initial startup check: If jobs table is empty, trigger an initial fetch so students have live data immediately
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        try {
            if (jobRepository.count() == 0) {
                log.info("Jobs table is currently empty. Running initial Adzuna job fetch...");
                int added = fetchAndSaveJobs();
                log.info("Initial Adzuna job fetch complete. {} jobs loaded.", added);
            }
        } catch (Exception e) {
            log.warn("Initial Adzuna job fetch on startup encountered an issue (will retry on hourly cron): {}", e.getMessage());
        }
    }

    /**
     * Hourly scheduled job fetch via Adzuna API
     */
    @Scheduled(cron = "0 0 * * * *")
    public void scheduledFetch() {
        log.info("Triggered scheduled hourly Adzuna job fetch...");
        int added = fetchAndSaveJobs();
        log.info("Hourly Adzuna job fetch completed. {} new listings saved.", added);
    }

    /**
     * Fetch jobs across all targeted fresher Java queries and persist non-duplicates.
     *
     * @return count of newly inserted jobs
     */
    @Transactional
    public int fetchAndSaveJobs() {
        if (appId.isEmpty() || appKey.isEmpty()) {
            log.warn("ADZUNA_APP_ID or ADZUNA_APP_KEY environment variables are not configured. Skipping Adzuna live fetch.");
            return 0;
        }

        int totalNewJobs = 0;

        for (String query : SEARCH_QUERIES) {
            try {
                int queryNewJobs = fetchQueryJobs(query);
                totalNewJobs += queryNewJobs;
                log.info("Adzuna query '{}' completed: {} new jobs stored.", query, queryNewJobs);
            } catch (Exception e) {
                // Per-query try-catch so one failing query doesn't fail the whole run
                log.error("Failed to fetch Adzuna jobs for query '{}': {}", query, e.getMessage(), e);
            }
        }

        return totalNewJobs;
    }

    private int fetchQueryJobs(String query) {
        java.net.URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/1")
                .queryParam("app_id", appId)
                .queryParam("app_key", appKey)
                .queryParam("what", query)
                .queryParam("results_per_page", 20)
                .queryParam("content-type", "application/json")
                .build()
                .encode()
                .toUri();

        log.info("Calling Adzuna API at URI: {}", uri);

        String responseBody = restClient.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        log.info("Adzuna response body for '{}': {}", query,
                responseBody != null ? responseBody.substring(0, Math.min(250, responseBody.length())) : "null");

        if (responseBody == null || responseBody.isBlank()) {
            return 0;
        }

        int count = 0;
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode results = root.path("results");

            if (!results.isArray()) {
                return 0;
            }

            for (JsonNode item : results) {
                String externalId = item.path("id").asText();
                if (externalId == null || externalId.isBlank()) {
                    continue;
                }

                // Dedupe: check if job external_id already exists in database
                if (jobRepository.existsByExternalId(externalId)) {
                    continue;
                }

                Job job = new Job();
                job.setExternalId(externalId);
                job.setTitle(item.path("title").asText("Java Developer"));
                job.setCompany(item.path("company").path("display_name").asText("Direct Hiring Partner"));
                job.setLocation(item.path("location").path("display_name").asText("India"));
                job.setDescription(item.path("description").asText(""));

                if (item.hasNonNull("salary_min")) {
                    job.setSalaryMin(BigDecimal.valueOf(item.path("salary_min").asDouble()));
                }
                if (item.hasNonNull("salary_max")) {
                    job.setSalaryMax(BigDecimal.valueOf(item.path("salary_max").asDouble()));
                }

                String redirectUrl = item.path("redirect_url").asText();
                if (redirectUrl == null || redirectUrl.isBlank()) {
                    continue; // Must have valid apply URL
                }
                job.setApplyUrl(redirectUrl);
                job.setSource("Adzuna");

                String createdStr = item.path("created").asText(null);
                if (createdStr != null && !createdStr.isBlank()) {
                    try {
                        job.setPostedAt(Instant.parse(createdStr));
                    } catch (Exception parseEx) {
                        job.setPostedAt(Instant.now());
                    }
                } else {
                    job.setPostedAt(Instant.now());
                }

                job.setFetchedAt(Instant.now());
                job.setIsFresherEligible(true);

                jobRepository.save(job);
                count++;
            }
        } catch (Exception e) {
            log.error("Error parsing Adzuna JSON response for query '{}': {}", query, e.getMessage());
            throw new RuntimeException("Adzuna response parse error: " + e.getMessage(), e);
        }

        return count;
    }
}
