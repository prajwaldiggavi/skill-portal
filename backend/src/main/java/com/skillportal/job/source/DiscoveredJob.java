package com.skillportal.job.source;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class DiscoveredJob {
    private String externalId;
    private String title;
    private String company;
    private String location;
    private String description;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String applyUrl;
    private String companyCareerUrl;
    private String sourceName; // Adzuna, LinkedIn, Naukri, Company Careers, Indeed
    private Instant postedAt = Instant.now();
    private String experienceLevel = "Fresher (0-1 yrs)";
    private String employmentType = "Full Time";
    private List<String> skills = new ArrayList<>();
    private boolean fresherEligible = true;
    private boolean eligible2026 = true;

    public DiscoveredJob() {}

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

    public String getCompanyCareerUrl() {
        return companyCareerUrl;
    }

    public void setCompanyCareerUrl(String companyCareerUrl) {
        this.companyCareerUrl = companyCareerUrl;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public Instant getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(Instant postedAt) {
        this.postedAt = postedAt;
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public boolean isFresherEligible() {
        return fresherEligible;
    }

    public void setFresherEligible(boolean fresherEligible) {
        this.fresherEligible = fresherEligible;
    }

    public boolean isEligible2026() {
        return eligible2026;
    }

    public void setEligible2026(boolean eligible2026) {
        this.eligible2026 = eligible2026;
    }
}
