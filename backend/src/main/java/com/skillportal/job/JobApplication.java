package com.skillportal.job;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "job_applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "job_id"})
})
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "APPLIED"; // SAVED, APPLIED, TEST_INVITE, INTERVIEWING, OFFER_RECEIVED, REJECTED

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public JobApplication() {}

    public JobApplication(Long userId, Long jobId, String status) {
        this.userId = userId;
        this.jobId = jobId;
        this.status = status;
        if ("APPLIED".equalsIgnoreCase(status)) {
            this.appliedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = Instant.now();
        if ("APPLIED".equalsIgnoreCase(status) && this.appliedAt == null) {
            this.appliedAt = Instant.now();
        }
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
