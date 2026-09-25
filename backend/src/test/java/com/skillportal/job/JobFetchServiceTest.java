package com.skillportal.job;

import com.skillportal.job.source.CompanyCareerJobSource;
import com.skillportal.job.source.DiscoveredJob;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobFetchServiceTest {

    private JobRepository jobRepository;
    private JobNormalizationService normalizationService;
    private JobMatchingEngine matchingEngine;
    private JobDeduplicationService deduplicationService;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        normalizationService = new JobNormalizationService();
        matchingEngine = new JobMatchingEngine();
        deduplicationService = new JobDeduplicationService(jobRepository, normalizationService, matchingEngine);
    }

    @Test
    void testMatchingEngineEvaluatesJavaFresher2026() {
        JobMatchingEngine.MatchResult result = matchingEngine.evaluateJob(
                "Java Full Stack Developer (2026 Batch Fresher)",
                "Hands on with Core Java, Spring Boot, MySQL, REST APIs, and React.",
                "Bengaluru"
        );

        assertTrue(result.relevanceScore() >= 85, "Should have high relevance score");
        assertTrue(result.isFresherEligible(), "Should be fresher eligible");
        assertTrue(result.is2026Eligible(), "Should be 2026 eligible");
        assertEquals("HIGHLY_RELEVANT", result.relevanceTier());
        assertTrue(result.matchReasons().contains("✓ Core Java & Backend"));
        assertTrue(result.matchReasons().contains("✓ Spring Boot & Microservices"));
        assertTrue(result.matchReasons().contains("✓ MySQL & Database"));
    }

    @Test
    void testMatchingEnginePenalizesSeniorPositions() {
        JobMatchingEngine.MatchResult result = matchingEngine.evaluateJob(
                "Senior Principal Java Architect",
                "Minimum 8+ years experience in enterprise systems architecture.",
                "Bangalore"
        );

        assertFalse(result.isFresherEligible(), "Senior architect should not be fresher eligible");
        assertTrue(result.relevanceScore() < 60, "Senior architect should have lower score for freshers");
    }

    @Test
    void testCompanyCareerJobSourceDiscoversAuthenticDrives() {
        CompanyCareerJobSource companySource = new CompanyCareerJobSource();
        List<DiscoveredJob> jobs = companySource.discoverJobs();

        assertNotNull(jobs);
        assertFalse(jobs.isEmpty(), "Should discover company career openings");
        assertTrue(jobs.stream().anyMatch(j -> j.getCompany().toLowerCase().contains("tata") || j.getTitle().contains("TCS")),
                "Should contain TCS NQT");
        assertTrue(jobs.stream().anyMatch(j -> j.getCompany().toLowerCase().contains("infosys")), "Should contain Infosys");
        assertTrue(jobs.stream().allMatch(j -> j.getApplyUrl() != null && !j.getApplyUrl().isBlank()),
                "All company career jobs must have valid application URLs");
    }

    @Test
    void testDeduplicationAndMergeSources() {
        Job existingJob = new Job();
        existingJob.setId(10L);
        existingJob.setExternalId("adzuna_100");
        existingJob.setCompany("Tata Consultancy Services");
        existingJob.setTitle("Java Graduate Trainee (TCS NQT 2026)");
        existingJob.setSource("Adzuna");
        existingJob.setSources("Adzuna");
        existingJob.setApplyUrl("https://adzuna.in/details/100");

        when(jobRepository.findByExternalId("adzuna_100")).thenReturn(java.util.Optional.of(existingJob));

        DiscoveredJob incoming = new DiscoveredJob();
        incoming.setExternalId("adzuna_100");
        incoming.setCompany("Tata Consultancy Services");
        incoming.setTitle("Java Graduate Trainee (TCS NQT 2026)");
        incoming.setSourceName("Company Careers");
        incoming.setApplyUrl("https://www.tcs.com/careers/india/entry-level");

        boolean isNew = deduplicationService.processDiscoveredJob(incoming);
        assertFalse(isNew, "Duplicate job should not be inserted as new");
        assertTrue(existingJob.getSources().contains("Company Careers"), "Sources should be merged");
        verify(jobRepository, times(1)).save(existingJob);
    }

    @Test
    void testJobDtoMapping() {
        Job job = new Job();
        job.setId(1L);
        job.setExternalId("adzuna-999");
        job.setTitle("Junior Java Developer");
        job.setCompany("Tech Corp");
        job.setLocation("Bengaluru, Karnataka");
        job.setDescription("Core Java and Spring Boot role");
        job.setApplyUrl("https://www.adzuna.in/land/ad/999");
        job.setSalaryMin(BigDecimal.valueOf(500000));
        job.setSalaryMax(BigDecimal.valueOf(800000));
        job.setPostedAt(Instant.parse("2026-09-24T10:00:00Z"));
        job.setFetchedAt(Instant.now());
        job.setIsFresherEligible(true);
        job.setIs2026Eligible(true);
        job.setRelevanceScore(95);
        job.setRelevanceTier("HIGHLY_RELEVANT");
        job.setSkills("Java,Spring Boot,MySQL");
        job.setMatchReasons("✓ Core Java,✓ Fresher,✓ 2026 Batch");

        JobDto dto = JobDto.fromEntity(job);
        assertEquals(1L, dto.getId());
        assertEquals("adzuna-999", dto.getExternalId());
        assertEquals("Junior Java Developer", dto.getTitle());
        assertEquals("https://www.adzuna.in/land/ad/999", dto.getApplyUrl());
        assertEquals(BigDecimal.valueOf(500000), dto.getSalaryMin());
        assertTrue(dto.getIsFresherEligible());
        assertTrue(dto.getIs2026Eligible());
        assertEquals(95, dto.getRelevanceScore());
        assertEquals(3, dto.getSkills().size());
        assertEquals(3, dto.getMatchReasons().size());
    }
}
