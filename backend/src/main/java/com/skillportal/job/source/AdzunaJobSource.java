package com.skillportal.job.source;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Component
public class AdzunaJobSource implements JobSource {

    private static final Logger log = LoggerFactory.getLogger(AdzunaJobSource.class);

    private static final List<String> SEARCH_QUERIES = List.of(
            "Java Fresher",
            "Core Java Developer",
            "Java Full Stack Developer",
            "Spring Boot Developer Fresher",
            "Hibernate Java Developer",
            "MySQL Java Developer"
    );

    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    private final String appId;
    private final String appKey;
    private final String baseUrl;

    public AdzunaJobSource(
            ObjectMapper objectMapper,
            @Value("${adzuna.app-id:}") String appId,
            @Value("${adzuna.app-key:}") String appKey,
            @Value("${adzuna.base-url:https://api.adzuna.com/v1/api/jobs/in/search}") String baseUrl
    ) {
        this.objectMapper = objectMapper;
        this.appId = appId != null ? appId.trim() : "";
        this.appKey = appKey != null ? appKey.trim() : "";
        this.baseUrl = baseUrl != null ? baseUrl.trim() : "https://api.adzuna.com/v1/api/jobs/in/search";
        this.restClient = RestClient.builder().build();
    }

    @Override
    public String getSourceName() {
        return "Adzuna";
    }

    @Override
    public List<DiscoveredJob> discoverJobs() {
        List<DiscoveredJob> discovered = new ArrayList<>();
        if (appId.isEmpty() || appKey.isEmpty()) {
            log.warn("Adzuna credentials not configured. Skipping Adzuna job discovery.");
            return discovered;
        }

        for (String query : SEARCH_QUERIES) {
            try {
                List<DiscoveredJob> queryJobs = fetchJobsForQuery(query);
                discovered.addAll(queryJobs);
                log.info("Adzuna query '{}' discovered {} jobs.", query, queryJobs.size());
            } catch (Exception e) {
                log.error("Failed to discover Adzuna jobs for query '{}': {}", query, e.getMessage());
            }
        }
        return discovered;
    }

    private List<DiscoveredJob> fetchJobsForQuery(String query) {
        List<DiscoveredJob> list = new ArrayList<>();
        URI uri = UriComponentsBuilder.fromHttpUrl(baseUrl + "/1")
                .queryParam("app_id", appId)
                .queryParam("app_key", appKey)
                .queryParam("what", query)
                .queryParam("results_per_page", 20)
                .queryParam("content-type", "application/json")
                .build()
                .encode()
                .toUri();

        log.debug("Calling Adzuna API at URI: {}", uri);

        String responseBody = restClient.get()
                .uri(uri)
                .retrieve()
                .body(String.class);

        if (responseBody == null || responseBody.isBlank()) {
            return list;
        }

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode results = root.path("results");
            if (!results.isArray()) {
                return list;
            }

            for (JsonNode item : results) {
                String externalId = item.path("id").asText();
                if (externalId == null || externalId.isBlank()) {
                    continue;
                }

                String redirectUrl = item.path("redirect_url").asText();
                if (redirectUrl == null || redirectUrl.isBlank()) {
                    continue;
                }

                DiscoveredJob job = new DiscoveredJob();
                job.setExternalId("adzuna_" + externalId);
                job.setTitle(item.path("title").asText("Java Developer"));
                job.setCompany(item.path("company").path("display_name").asText("Direct Hiring Partner"));
                job.setLocation(item.path("location").path("display_name").asText("India"));
                job.setDescription(item.path("description").asText(""));
                job.setApplyUrl(redirectUrl);
                job.setSourceName("Adzuna");

                if (item.hasNonNull("salary_min")) {
                    job.setSalaryMin(BigDecimal.valueOf(item.path("salary_min").asDouble()));
                }
                if (item.hasNonNull("salary_max")) {
                    job.setSalaryMax(BigDecimal.valueOf(item.path("salary_max").asDouble()));
                }

                String createdStr = item.path("created").asText(null);
                if (createdStr != null && !createdStr.isBlank()) {
                    try {
                        job.setPostedAt(Instant.parse(createdStr));
                    } catch (Exception e) {
                        job.setPostedAt(Instant.now());
                    }
                }

                job.setFresherEligible(true);
                job.setEligible2026(true);
                list.add(job);
            }
        } catch (Exception e) {
            log.error("Error parsing Adzuna results for query '{}': {}", query, e.getMessage());
        }

        return list;
    }
}
