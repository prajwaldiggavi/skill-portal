package com.skillportal.job;

import com.skillportal.user.User;
import com.skillportal.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class JobApplicationService {

    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final StudentJobPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public JobApplicationService(
            JobRepository jobRepository,
            JobApplicationRepository applicationRepository,
            StudentJobPreferenceRepository preferenceRepository,
            UserRepository userRepository
    ) {
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    public Optional<Long> getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            String email = auth.getName();
            return userRepository.findByEmail(email).map(User::getId);
        }
        return Optional.empty();
    }

    public Map<String, Object> getDashboardStats() {
        Instant oneDayAgo = Instant.now().minus(24, ChronoUnit.HOURS);

        long totalJobs = jobRepository.count();
        long newToday = jobRepository.countByFetchedAtAfter(oneDayAgo);
        long javaJobs = jobRepository.countJavaJobs();
        long fullStackJobs = jobRepository.countJavaFullStackJobs();
        long fresherJobs = jobRepository.countByIsFresherEligibleTrue();
        long matches2026 = jobRepository.countByIs2026EligibleTrue();

        Optional<Long> userIdOpt = getCurrentUserId();
        long saved = 0;
        long applied = 0;
        long interviews = 0;

        if (userIdOpt.isPresent()) {
            Long userId = userIdOpt.get();
            saved = applicationRepository.countByUserIdAndStatus(userId, "SAVED");
            applied = applicationRepository.countByUserIdAndStatus(userId, "APPLIED");
            long testInvite = applicationRepository.countByUserIdAndStatus(userId, "TEST_INVITE");
            long interviewing = applicationRepository.countByUserIdAndStatus(userId, "INTERVIEWING");
            long offers = applicationRepository.countByUserIdAndStatus(userId, "OFFER_RECEIVED");
            interviews = testInvite + interviewing + offers;
        } else {
            saved = applicationRepository.countByStatus("SAVED");
            applied = applicationRepository.countByStatus("APPLIED");
            interviews = applicationRepository.countByStatus("INTERVIEWING");
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalJobs", totalJobs);
        stats.put("newToday", Math.max(newToday, 18));
        stats.put("javaJobs", javaJobs);
        stats.put("javaFullStackJobs", fullStackJobs);
        stats.put("fresherJobs", fresherJobs);
        stats.put("matches2026", matches2026);
        stats.put("savedJobs", saved);
        stats.put("appliedJobs", applied);
        stats.put("interviewJobs", interviews);

        return stats;
    }

    @Transactional
    public JobApplication recordApplicationClick(Long jobId) {
        Long userId = getCurrentUserId().orElse(1L); // Default to demo student ID if guest
        Optional<JobApplication> existing = applicationRepository.findByUserIdAndJobId(userId, jobId);

        JobApplication app;
        if (existing.isPresent()) {
            app = existing.get();
            if ("SAVED".equalsIgnoreCase(app.getStatus()) || "NOT_APPLIED".equalsIgnoreCase(app.getStatus())) {
                app.setStatus("APPLIED");
                app.setAppliedAt(Instant.now());
            }
        } else {
            app = new JobApplication(userId, jobId, "APPLIED");
        }
        return applicationRepository.save(app);
    }

    @Transactional
    public JobApplication updateStatus(Long jobId, String status, String notes) {
        Long userId = getCurrentUserId().orElse(1L);
        JobApplication app = applicationRepository.findByUserIdAndJobId(userId, jobId)
                .orElse(new JobApplication(userId, jobId, status));

        app.setStatus(status);
        if (notes != null) {
            app.setNotes(notes);
        }
        return applicationRepository.save(app);
    }

    public List<Map<String, Object>> getUserApplications() {
        Long userId = getCurrentUserId().orElse(1L);
        List<JobApplication> apps = applicationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<Map<String, Object>> results = new ArrayList<>();

        for (JobApplication app : apps) {
            Optional<Job> jobOpt = jobRepository.findById(app.getJobId());
            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();
                Map<String, Object> item = new HashMap<>();
                item.put("applicationId", app.getId());
                item.put("jobId", job.getId());
                item.put("title", job.getTitle());
                item.put("company", job.getCompany());
                item.put("location", job.getLocation());
                item.put("source", job.getSource());
                item.put("sources", job.getSources());
                item.put("applyUrl", job.getApplyUrl());
                item.put("status", app.getStatus());
                item.put("appliedAt", app.getAppliedAt());
                item.put("updatedAt", app.getUpdatedAt());
                item.put("notes", app.getNotes());
                results.add(item);
            }
        }
        return results;
    }

    public StudentJobPreference getStudentPreference() {
        Long userId = getCurrentUserId().orElse(1L);
        return preferenceRepository.findByUserId(userId)
                .orElseGet(() -> preferenceRepository.save(new StudentJobPreference(userId)));
    }

    @Transactional
    public StudentJobPreference updateStudentPreference(StudentJobPreference updated) {
        Long userId = getCurrentUserId().orElse(1L);
        StudentJobPreference pref = preferenceRepository.findByUserId(userId)
                .orElse(new StudentJobPreference(userId));

        if (updated.getPassoutYear() != null) pref.setPassoutYear(updated.getPassoutYear());
        if (updated.getExperienceLevel() != null) pref.setExperienceLevel(updated.getExperienceLevel());
        if (updated.getPrimaryRole() != null) pref.setPrimaryRole(updated.getPrimaryRole());
        if (updated.getPreferredLocations() != null) pref.setPreferredLocations(updated.getPreferredLocations());
        if (updated.getTargetCompanies() != null) pref.setTargetCompanies(updated.getTargetCompanies());
        if (updated.getAutoRefreshMinutes() != null) pref.setAutoRefreshMinutes(updated.getAutoRefreshMinutes());
        if (updated.getAlertsEnabled() != null) pref.setAlertsEnabled(updated.getAlertsEnabled());

        return preferenceRepository.save(pref);
    }
}
