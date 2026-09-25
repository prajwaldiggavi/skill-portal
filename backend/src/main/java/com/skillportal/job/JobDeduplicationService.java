package com.skillportal.job;

import com.skillportal.job.source.CompanyCareerJobSource;
import com.skillportal.job.source.DiscoveredJob;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class JobDeduplicationService {

    private static final Logger log = LoggerFactory.getLogger(JobDeduplicationService.class);

    private final JobRepository jobRepository;
    private final JobNormalizationService normalizationService;
    private final JobMatchingEngine matchingEngine;

    public JobDeduplicationService(
            JobRepository jobRepository,
            JobNormalizationService normalizationService,
            JobMatchingEngine matchingEngine
    ) {
        this.jobRepository = jobRepository;
        this.normalizationService = normalizationService;
        this.matchingEngine = matchingEngine;
    }

    @Transactional
    public boolean processDiscoveredJob(DiscoveredJob dj) {
        if (dj == null || dj.getApplyUrl() == null || dj.getApplyUrl().isBlank()) {
            return false;
        }

        String cleanedTitle = normalizationService.cleanText(dj.getTitle());
        String cleanedCompany = normalizationService.normalizeCompany(dj.getCompany());
        String normalizedLoc = normalizationService.normalizeLocation(dj.getLocation());
        String cleanedDesc = normalizationService.cleanText(dj.getDescription());

        // 1. Check if external_id already exists
        Optional<Job> existingOpt = jobRepository.findByExternalId(dj.getExternalId());

        // 2. If not found by externalId, check by normalized company + title
        if (existingOpt.isEmpty()) {
            existingOpt = jobRepository.findFirstByCompanyIgnoreCaseAndTitleIgnoreCase(cleanedCompany, cleanedTitle);
        }

        if (existingOpt.isPresent()) {
            // DUPLICATE DETECTED: Merge sources & upgrade URL if official career link is discovered
            Job existing = existingOpt.get();
            String incomingSource = dj.getSourceName() != null ? dj.getSourceName() : "Other";

            // Merge sources display
            String currentSources = existing.getSources() != null ? existing.getSources() : existing.getSource();
            if (currentSources != null && !currentSources.toLowerCase().contains(incomingSource.toLowerCase())) {
                existing.setSources(currentSources + " • " + incomingSource);
            }

            // Check if incoming has direct company career URL
            Optional<String> companyCareerUrlOpt = CompanyCareerJobSource.findCompanyCareerUrl(cleanedCompany);
            if (companyCareerUrlOpt.isPresent() && (existing.getCompanyCareerUrl() == null || existing.getCompanyCareerUrl().isBlank())) {
                existing.setCompanyCareerUrl(companyCareerUrlOpt.get());
            }

            // Prioritize direct company career page as applyUrl
            if ("Company Careers".equalsIgnoreCase(incomingSource) && dj.getApplyUrl() != null) {
                existing.setApplyUrl(dj.getApplyUrl());
            }

            existing.setLastSeenAt(Instant.now());
            jobRepository.save(existing);
            return false; // Not a new listing, deduplicated & merged
        }

        // 3. NEW UNIQUE JOB: Run matching engine, normalize, and save
        JobMatchingEngine.MatchResult match = matchingEngine.evaluateJob(cleanedTitle, cleanedDesc, normalizedLoc);

        Job job = new Job();
        job.setExternalId(dj.getExternalId());
        job.setTitle(cleanedTitle.isEmpty() ? "Java Developer" : cleanedTitle);
        job.setCompany(cleanedCompany);
        job.setLocation(normalizedLoc);
        job.setDescription(cleanedDesc);
        job.setSalaryMin(dj.getSalaryMin());
        job.setSalaryMax(dj.getSalaryMax());
        job.setApplyUrl(dj.getApplyUrl());
        job.setSource(dj.getSourceName() != null ? dj.getSourceName() : "Adzuna");
        job.setSources(dj.getSourceName() != null ? dj.getSourceName() : "Adzuna");
        job.setPostedAt(dj.getPostedAt() != null ? dj.getPostedAt() : Instant.now());
        job.setFetchedAt(Instant.now());
        job.setFirstSeenAt(Instant.now());
        job.setLastSeenAt(Instant.now());
        job.setIsFresherEligible(match.isFresherEligible());
        job.setIs2026Eligible(match.is2026Eligible());
        job.setRelevanceScore(match.relevanceScore());
        job.setRelevanceTier(match.relevanceTier());
        job.setMatchReasons(String.join(",", match.matchReasons()));
        job.setExperienceLevel(dj.getExperienceLevel());
        job.setEmploymentType(dj.getEmploymentType());
        job.setStatus("ACTIVE");

        // Resolve official company career URL if recognized
        Optional<String> careerUrl = CompanyCareerJobSource.findCompanyCareerUrl(cleanedCompany);
        if (careerUrl.isPresent()) {
            job.setCompanyCareerUrl(careerUrl.get());
        } else if (dj.getCompanyCareerUrl() != null && !dj.getCompanyCareerUrl().isBlank()) {
            job.setCompanyCareerUrl(dj.getCompanyCareerUrl());
        }

        // Extract skills
        var extractedSkills = normalizationService.extractSkills(cleanedTitle, cleanedDesc);
        job.setSkills(String.join(",", extractedSkills));

        jobRepository.save(job);
        return true;
    }
}
