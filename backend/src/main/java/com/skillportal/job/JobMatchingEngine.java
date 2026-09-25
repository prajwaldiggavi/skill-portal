package com.skillportal.job;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class JobMatchingEngine {

    public record MatchResult(
            int relevanceScore,
            String relevanceTier,
            boolean isFresherEligible,
            boolean is2026Eligible,
            List<String> matchReasons
    ) {}

    public MatchResult evaluateJob(String title, String description, String location) {
        String content = (title + " " + (description != null ? description : "")).toLowerCase();
        List<String> reasons = new ArrayList<>();
        int score = 0;

        // 1. Check Java relevance
        boolean hasJava = content.contains("java");
        boolean hasSpringBoot = content.contains("spring") || content.contains("spring boot");
        boolean hasHibernate = content.contains("hibernate") || content.contains("jpa");
        boolean hasDatabase = content.contains("mysql") || content.contains("sql");
        boolean hasFullStack = content.contains("full stack") || content.contains("fullstack") || content.contains("react");

        if (hasJava) {
            score += 35;
            reasons.add("✓ Core Java & Backend");
        }
        if (hasSpringBoot) {
            score += 15;
            reasons.add("✓ Spring Boot & Microservices");
        }
        if (hasHibernate) {
            score += 10;
            reasons.add("✓ Hibernate & JPA");
        }
        if (hasDatabase) {
            score += 10;
            reasons.add("✓ MySQL & Database");
        }
        if (hasFullStack) {
            score += 10;
            reasons.add("✓ Java Full Stack");
        }

        // 2. Check Fresher eligibility & Experience penalties
        boolean hasSenior = content.contains("senior") || content.contains("sr.") || content.contains("lead") ||
                content.contains("architect") || content.contains("principal") || content.contains("5+ years") ||
                content.contains("4+ years") || content.contains("6+ years") || content.contains("7+ years");

        boolean hasFresher = content.contains("fresher") || content.contains("entry level") ||
                content.contains("trainee") || content.contains("graduate") || content.contains("0-1") ||
                content.contains("0 to 1") || content.contains("intern") || content.contains("junior") ||
                content.contains("associate");

        boolean isFresher = !hasSenior || hasFresher;
        if (isFresher) {
            score += 15;
            reasons.add("✓ Fresher (0-1 yrs) Eligible");
        } else {
            score = Math.max(0, score - 25);
        }

        // 3. Check 2026 Batch compatibility
        boolean mentions2026 = content.contains("2026") || content.contains("2025") || content.contains("campus") ||
                content.contains("nqt") || content.contains("off-campus") || content.contains("new grad");
        boolean is2026Eligible = isFresher;

        if (mentions2026 || isFresher) {
            score += 15;
            reasons.add("✓ 2026 Batch Compatible");
        }

        // 4. Tech Hub location bonus
        if (location != null) {
            String loc = location.toLowerCase();
            if (loc.contains("bangalore") || loc.contains("bengaluru") ||
                loc.contains("hyderabad") || loc.contains("pune") ||
                loc.contains("chennai") || loc.contains("noida") ||
                loc.contains("gurgaon") || loc.contains("remote")) {
                score += 5;
                reasons.add("✓ Top Tech Hiring Hub");
            }
        }

        // Clamp score between 20 and 99
        int finalScore = Math.min(99, Math.max(25, score));

        // Determine tier
        String tier;
        if (finalScore >= 85) {
            tier = "HIGHLY_RELEVANT";
        } else if (finalScore >= 70) {
            tier = "RELEVANT";
        } else if (finalScore >= 50) {
            tier = "POSSIBLE_MATCH";
        } else {
            tier = "NOT_RELEVANT";
        }

        return new MatchResult(finalScore, tier, isFresher, is2026Eligible, reasons);
    }
}
