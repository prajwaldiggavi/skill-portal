package com.skillportal.job;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false, unique = true, length = 100)
    private String externalId;

    @Column(name = "source_job_id", length = 100)
    private String sourceJobId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "company", length = 255)
    private String company;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "salary_min", precision = 12, scale = 2)
    private BigDecimal salaryMin;

    @Column(name = "salary_max", precision = 12, scale = 2)
    private BigDecimal salaryMax;

    @Column(name = "apply_url", nullable = false, length = 1000)
    private String applyUrl;

    @Column(name = "original_url", length = 1000)
    private String originalUrl;

    @Column(name = "final_url", length = 1000)
    private String finalUrl;

    @Column(name = "verified_application_url", length = 1000)
    private String verifiedApplicationUrl;

    @Column(name = "application_url_status", length = 50)
    private String applicationUrlStatus = "VERIFIED_ACTIVE";

    @Column(name = "source", length = 100)
    private String source = "Adzuna";

    @Column(name = "sources", length = 255)
    private String sources = "Adzuna";

    @Column(name = "posted_at")
    private Instant postedAt;

    @Column(name = "fetched_at")
    private Instant fetchedAt = Instant.now();

    @Column(name = "first_seen_at")
    private Instant firstSeenAt = Instant.now();

    @Column(name = "last_seen_at")
    private Instant lastSeenAt = Instant.now();

    @Column(name = "is_fresher_eligible")
    private Boolean isFresherEligible = true;

    @Column(name = "is_2026_eligible")
    private Boolean is2026Eligible = true;

    @Column(name = "graduation_eligible")
    private Boolean graduationEligible = true;

    @Column(name = "experience_min")
    private Integer experienceMin = 0;

    @Column(name = "experience_max")
    private Integer experienceMax = 1;

    @Column(name = "experience_text", length = 255)
    private String experienceText = "0–1 years / Fresher";

    @Column(name = "eligibility_status", length = 50)
    private String eligibilityStatus = "ELIGIBLE";

    @Column(name = "eligibility_reason", columnDefinition = "TEXT")
    private String eligibilityReason;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "experience_level", length = 100)
    private String experienceLevel = "Fresher (0-1 yrs)";

    @Column(name = "employment_type", length = 50)
    private String employmentType = "Full Time";

    @Column(name = "relevance_score")
    private Integer relevanceScore = 88;

    @Column(name = "relevance_tier", length = 50)
    private String relevanceTier = "RELEVANT";

    @Column(name = "match_reasons", columnDefinition = "TEXT")
    private String matchReasons;

    @Column(name = "company_career_url", length = 1000)
    private String companyCareerUrl;

    @Column(name = "status", length = 50)
    private String status = "ACTIVE";

    public Job() {}

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

    public String getSourceJobId() {
        return sourceJobId;
    }

    public void setSourceJobId(String sourceJobId) {
        this.sourceJobId = sourceJobId;
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

    public String getOriginalUrl() {
        return originalUrl != null ? originalUrl : applyUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getFinalUrl() {
        return finalUrl != null ? finalUrl : applyUrl;
    }

    public void setFinalUrl(String finalUrl) {
        this.finalUrl = finalUrl;
    }

    public String getVerifiedApplicationUrl() {
        return verifiedApplicationUrl != null ? verifiedApplicationUrl : (companyCareerUrl != null ? companyCareerUrl : applyUrl);
    }

    public void setVerifiedApplicationUrl(String verifiedApplicationUrl) {
        this.verifiedApplicationUrl = verifiedApplicationUrl;
    }

    public String getApplicationUrlStatus() {
        return applicationUrlStatus;
    }

    public void setApplicationUrlStatus(String applicationUrlStatus) {
        this.applicationUrlStatus = applicationUrlStatus;
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

    public Boolean getGraduationEligible() {
        return graduationEligible;
    }

    public void setGraduationEligible(Boolean graduationEligible) {
        this.graduationEligible = graduationEligible;
    }

    public Integer getExperienceMin() {
        return experienceMin;
    }

    public void setExperienceMin(Integer experienceMin) {
        this.experienceMin = experienceMin;
    }

    public Integer getExperienceMax() {
        return experienceMax;
    }

    public void setExperienceMax(Integer experienceMax) {
        this.experienceMax = experienceMax;
    }

    public String getExperienceText() {
        return experienceText;
    }

    public void setExperienceText(String experienceText) {
        this.experienceText = experienceText;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public String getEligibilityReason() {
        return eligibilityReason;
    }

    public void setEligibilityReason(String eligibilityReason) {
        this.eligibilityReason = eligibilityReason;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
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

    public String getMatchReasons() {
        return matchReasons;
    }

    public void setMatchReasons(String matchReasons) {
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
