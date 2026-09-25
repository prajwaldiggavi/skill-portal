package com.skillportal.job.careerhub;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "career_sources")
public class CareerSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, unique = true, length = 255)
    private String companyName;

    @Column(name = "career_url", nullable = false, length = 1000)
    private String careerUrl;

    @Column(name = "status", length = 50)
    private String status = "ACTIVE"; // ACTIVE, CHECKING, OFFLINE

    @Column(name = "last_checked_at")
    private Instant lastCheckedAt;

    @Column(name = "matching_jobs_count")
    private Integer matchingJobsCount = 0;

    @Column(name = "new_jobs_found")
    private Integer newJobsFound = 0;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public CareerSource() {}

    public CareerSource(String companyName, String careerUrl) {
        this.companyName = companyName;
        this.careerUrl = careerUrl;
        this.status = "ACTIVE";
        this.lastCheckedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCareerUrl() {
        return careerUrl;
    }

    public void setCareerUrl(String careerUrl) {
        this.careerUrl = careerUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public Instant getLastCheckedAt() {
        return lastCheckedAt;
    }

    public void setLastCheckedAt(Instant lastCheckedAt) {
        this.lastCheckedAt = lastCheckedAt;
        this.updatedAt = Instant.now();
    }

    public Integer getMatchingJobsCount() {
        return matchingJobsCount;
    }

    public void setMatchingJobsCount(Integer matchingJobsCount) {
        this.matchingJobsCount = matchingJobsCount;
    }

    public Integer getNewJobsFound() {
        return newJobsFound;
    }

    public void setNewJobsFound(Integer newJobsFound) {
        this.newJobsFound = newJobsFound;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
