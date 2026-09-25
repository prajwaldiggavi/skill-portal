package com.skillportal.job;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class JobMatchingEngine {

    private static final Pattern EXP_PATTERN = Pattern.compile("(\\d+)\\s*(?:-|to|\\+)?\\s*(\\d+)?\\s*(?:years|year|yrs|yr)", Pattern.CASE_INSENSITIVE);

    public record MatchResult(
            int relevanceScore,
            String relevanceTier,
            boolean isFresherEligible,
            boolean is2026Eligible,
            boolean graduationEligible,
            int experienceMin,
            int experienceMax,
            String experienceText,
            String eligibilityStatus,
            String eligibilityReason,
            List<String> matchReasons
    ) {}

    public MatchResult evaluateJob(String title, String description, String location) {
        String content = (title + " " + (description != null ? description : "")).toLowerCase();
        List<String> reasons = new ArrayList<>();
        int score = 0;

        // 1. Strict Experience Parsing & Validation
        int expMin = 0;
        int expMax = 1;
        String expText = "0–1 years / Fresher";
        boolean experienceRejected = false;
        String rejectionReason = null;

        Matcher matcher = EXP_PATTERN.matcher(content);
        if (matcher.find()) {
            try {
                int firstNum = Integer.parseInt(matcher.group(1));
                int secondNum = matcher.group(2) != null ? Integer.parseInt(matcher.group(2)) : firstNum;
                expMin = Math.min(firstNum, secondNum);
                expMax = Math.max(firstNum, secondNum);
                expText = expMin + "–" + expMax + " years";

                // If explicit minimum experience is 2 or more years, REJECT for 2026 fresher
                if (expMin >= 2) {
                    experienceRejected = true;
                    rejectionReason = "Requires " + expText + " experience. Incompatible with 2026 fresher profile.";
                }
            } catch (Exception ignored) {}
        }

        // Strict Senior / Lead exclusions
        boolean hasSeniorTitle = content.contains("senior") || content.contains("sr.") || content.contains("lead developer") ||
                content.contains("architect") || content.contains("principal") || content.contains("tech lead") ||
                content.contains("manager");

        if (hasSeniorTitle && !content.contains("fresher")) {
            experienceRejected = true;
            rejectionReason = "Senior / Lead level role requiring prior industry experience.";
        }

        // Check explicit fresher / graduate keywords
        boolean hasFresherKeyword = content.contains("fresher") || content.contains("entry level") ||
                content.contains("trainee") || content.contains("graduate") || content.contains("2026") ||
                content.contains("2025") || content.contains("0-1") || content.contains("0 to 1") ||
                content.contains("get") || content.contains("intern");

        boolean isFresherEligible = !experienceRejected || hasFresherKeyword;
        boolean is2026Eligible = !experienceRejected && (hasFresherKeyword || expMin <= 1);
        boolean graduationEligible = is2026Eligible;

        String eligibilityStatus = is2026Eligible ? "ELIGIBLE" : "INELIGIBLE";
        String eligibilityReason = is2026Eligible
                ? "Verified 2026 Pass-Out & Fresher (0–1 years) compatible"
                : (rejectionReason != null ? rejectionReason : "Requires prior experienced tenure");

        // 2. Java Full Stack Relevance Scoring
        boolean hasJava = content.contains("java");
        boolean hasSpringBoot = content.contains("spring") || content.contains("spring boot");
        boolean hasHibernate = content.contains("hibernate") || content.contains("jpa") || content.contains("jdbc");
        boolean hasDatabase = content.contains("mysql") || content.contains("sql") || content.contains("oracle");
        boolean hasFullStack = content.contains("full stack") || content.contains("fullstack") || content.contains("react") || content.contains("javascript");
        boolean hasRestApi = content.contains("rest") || content.contains("api") || content.contains("microservice");

        if (hasJava) {
            score += 35;
            reasons.add("✓ Core Java & Backend");
        }
        if (hasSpringBoot) {
            score += 20;
            reasons.add("✓ Spring Boot & Microservices");
        }
        if (hasHibernate) {
            score += 10;
            reasons.add("✓ Hibernate & JPA / JDBC");
        }
        if (hasDatabase) {
            score += 15;
            reasons.add("✓ MySQL & Database");
        }
        if (hasFullStack) {
            score += 10;
            reasons.add("✓ Full Stack Web");
        }
        if (hasRestApi) {
            score += 10;
            reasons.add("✓ REST APIs");
        }

        // Eligibility bonus or penalty
        if (is2026Eligible) {
            score += 15;
            reasons.add("✓ 2026 Batch Eligible");
            reasons.add("✓ 0–1 Yrs Experience");
        } else {
            score = Math.max(10, score - 40);
        }

        int finalScore = Math.min(99, Math.max(25, score));

        String tier;
        if (finalScore >= 85 && is2026Eligible) {
            tier = "HIGHLY_RELEVANT";
        } else if (finalScore >= 70 && is2026Eligible) {
            tier = "RELEVANT";
        } else if (finalScore >= 50) {
            tier = "POSSIBLE_MATCH";
        } else {
            tier = "NOT_RELEVANT";
        }

        return new MatchResult(
                finalScore,
                tier,
                isFresherEligible,
                is2026Eligible,
                graduationEligible,
                expMin,
                expMax,
                expText,
                eligibilityStatus,
                eligibilityReason,
                reasons
        );
    }
}
