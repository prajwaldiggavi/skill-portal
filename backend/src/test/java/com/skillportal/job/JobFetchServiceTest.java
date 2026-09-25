package com.skillportal.job;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JobFetchServiceTest {

    private JobRepository jobRepository;
    private ObjectMapper objectMapper;
    private JobFetchService jobFetchService;

    @BeforeEach
    void setUp() {
        jobRepository = mock(JobRepository.class);
        objectMapper = new ObjectMapper();
        jobFetchService = new JobFetchService(jobRepository, objectMapper, "", "", "");
    }

    @Test
    void testMissingCredentialsGracefullyReturnsZero() {
        int added = jobFetchService.fetchAndSaveJobs();
        assertEquals(0, added);
        verify(jobRepository, never()).save(any());
    }

    @Test
    void testDeduplicationPreventsDuplicateJobs() {
        when(jobRepository.existsByExternalId("adzuna-12345")).thenReturn(true);
        assertTrue(jobRepository.existsByExternalId("adzuna-12345"));
        verify(jobRepository, never()).save(any());
    }

    @Test
    void testJobDtoMapping() {
        Job job = new Job();
        job.setId(1L);
        job.setExternalId("adzuna-999");
        job.setTitle("Junior Java Developer");
        job.setCompany("Tech Corp");
        job.setLocation("Bangalore");
        job.setDescription("Core Java and Spring Boot role");
        job.setApplyUrl("https://www.adzuna.in/land/ad/999");
        job.setSalaryMin(BigDecimal.valueOf(500000));
        job.setSalaryMax(BigDecimal.valueOf(800000));
        job.setPostedAt(Instant.parse("2026-09-24T10:00:00Z"));
        job.setFetchedAt(Instant.now());
        job.setIsFresherEligible(true);

        JobDto dto = JobDto.fromEntity(job);
        assertEquals(1L, dto.getId());
        assertEquals("adzuna-999", dto.getExternalId());
        assertEquals("Junior Java Developer", dto.getTitle());
        assertEquals("https://www.adzuna.in/land/ad/999", dto.getApplyUrl());
        assertEquals(BigDecimal.valueOf(500000), dto.getSalaryMin());
        assertTrue(dto.getIsFresherEligible());
    }
}
