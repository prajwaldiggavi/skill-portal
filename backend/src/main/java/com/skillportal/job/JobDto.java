package com.skillportal.job;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class JobDto {
    private Long id;
    private String externalId;
    private String title;
    private String company;
    private String location;
    private String description;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String applyUrl;
    private String source;
    private String sources;
    private Instant postedAt;
    private Instant fetchedAt;
    private Instant firstSeenAt;
    private Instant lastSeenAt;
    private Boolean isFresherEligible;
    private Boolean is2026Eligible;
    private List<String> skills;
    private String experienceLevel;
    private String employmentType;
    private Integer relevanceScore;
    private String relevanceTier;
    private List<String> matchReasons;
    private String companyCareerUrl;
    private String status;

    public JobDto() {}

    public static JobDto fromEntity(Job job) {
        JobDto dto = new JobDto();
        dto.setId(job.getId());
        dto.setExternalId(job.getExternalId());
        dto.setTitle(job.getTitle());
        dto.setCompany(job.getCompany());
        dto.setLocation(job.getLocation());
        dto.setDescription(job.getDescription());
        dto.setSalaryMin(job.getSalaryMin());
        dto.setSalaryMax(job.getSalaryMax());
        dto.setApplyUrl(job.getApplyUrl());
        dto.setSource(job.getSource());
        dto.setSources(job.getSources());
        dto.setPostedAt(job.getPostedAt());
        dto.setFetchedAt(job.getFetchedAt());
        dto.setFirstSeenAt(job.getFirstSeenAt());
        dto.setLastSeenAt(job.getLastSeenAt());
        dto.setIsFresherEligible(job.getIsFresherEligible());
        dto.setIs2026Eligible(job.getIs2026Eligible());
        dto.setExperienceLevel(job.getExperienceLevel());
        dto.setEmploymentType(job.getEmploymentType());
        dto.setRelevanceScore(job.getRelevanceScore());
        dto.setRelevanceTier(job.getRelevanceTier());
        dto.setCompanyCareerUrl(job.getCompanyCareerUrl());
        dto.setStatus(job.getStatus());

        if (job.getSkills() != null && !job.getSkills().isBlank()) {
            dto.setSkills(Arrays.stream(job.getSkills().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
        } else {
            dto.setSkills(Collections.emptyList());
        }

        if (job.getMatchReasons() != null && !job.getMatchReasons().isBlank()) {
            dto.setMatchReasons(Arrays.stream(job.getMatchReasons().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
        } else {
            dto.setMatchReasons(Collections.emptyList());
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public void setSalaryMin(BigDecimal salaryMin) {
        this.salaryMin = salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public void setSalaryMax(BigDecimal salaryMax) {
        this.salaryMax = salaryMax;
    }

    public String getApplyUrl() {
        return applyUrl;
    }

    public void setApplyUrl(String applyUrl) {
        this.applyUrl = applyUrl;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getSources() {
        return sources != null ? sources : source;
    }

    public void setSources(String sources) {
        this.sources = sources;
    }

    public Instant getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(Instant postedAt) {
        this.postedAt = postedAt;
    }

    public Instant getFetchedAt() {
        return fetchedAt;
    }

    public void setFetchedAt(Instant fetchedAt) {
        this.fetchedAt = fetchedAt;
    }

    public Instant getFirstSeenAt() {
        return firstSeenAt;
    }

    public void setFirstSeenAt(Instant firstSeenAt) {
        this.firstSeenAt = firstSeenAt;
    }

    public Instant getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(Instant lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    public Boolean getIsFresherEligible() {
        return isFresherEligible;
    }

    public void setIsFresherEligible(Boolean fresherEligible) {
        isFresherEligible = fresherEligible;
    }

    public Boolean getIs2026Eligible() {
        return is2026Eligible;
    }

    public void setIs2026Eligible(Boolean eligible2026) {
        is2026Eligible = eligible2026;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Integer getRelevanceScore() {
        return relevanceScore;
    }

    public void setRelevanceScore(Integer relevanceScore) {
        this.relevanceScore = relevanceScore;
    }

    public String getRelevanceTier() {
        return relevanceTier;
    }

    public void setRelevanceTier(String relevanceTier) {
        this.relevanceTier = relevanceTier;
    }

    public List<String> getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(List<String> matchReasons) {
        this.matchReasons = matchReasons;
    }

    public String getCompanyCareerUrl() {
        return companyCareerUrl;
    }

    public void setCompanyCareerUrl(String companyCareerUrl) {
        this.companyCareerUrl = companyCareerUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
