package com.skillportal.job;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "student_job_preferences")
public class StudentJobPreference {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "passout_year")
    private Integer passoutYear = 2026;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel = "Fresher";

    @Column(name = "primary_role", length = 100)
    private String primaryRole = "Java Full Stack Developer";

    @Column(name = "preferred_locations", length = 500)
    private String preferredLocations = "Bengaluru,Hyderabad,Pune,Chennai,Noida,Remote";

    @Column(name = "target_companies", columnDefinition = "TEXT")
    private String targetCompanies = "TCS,Infosys,Wipro,Accenture,Cognizant,Capgemini,Zoho,Tech Mahindra,Bosch";

    @Column(name = "auto_refresh_minutes")
    private Integer autoRefreshMinutes = 10;

    @Column(name = "alerts_enabled")
    private Boolean alertsEnabled = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public StudentJobPreference() {}

    public StudentJobPreference(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getPassoutYear() {
        return passoutYear;
    }

    public void setPassoutYear(Integer passoutYear) {
        this.passoutYear = passoutYear;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getPrimaryRole() {
        return primaryRole;
    }

    public void setPrimaryRole(String primaryRole) {
        this.primaryRole = primaryRole;
    }

    public String getPreferredLocations() {
        return preferredLocations;
    }

    public void setPreferredLocations(String preferredLocations) {
        this.preferredLocations = preferredLocations;
    }

    public String getTargetCompanies() {
        return targetCompanies;
    }

    public void setTargetCompanies(String targetCompanies) {
        this.targetCompanies = targetCompanies;
    }

    public Integer getAutoRefreshMinutes() {
        return autoRefreshMinutes;
    }

    public void setAutoRefreshMinutes(Integer autoRefreshMinutes) {
        this.autoRefreshMinutes = autoRefreshMinutes;
    }

    public Boolean getAlertsEnabled() {
        return alertsEnabled;
    }

    public void setAlertsEnabled(Boolean alertsEnabled) {
        this.alertsEnabled = alertsEnabled;
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
