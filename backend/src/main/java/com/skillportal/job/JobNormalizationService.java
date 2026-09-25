package com.skillportal.job;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class JobNormalizationService {

    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");

    public String cleanText(String text) {
        if (text == null) return "";
        String cleaned = HTML_TAG_PATTERN.matcher(text).replaceAll(" ");
        return cleaned.replaceAll("\\s+", " ").trim();
    }

    public String normalizeCompany(String company) {
        if (company == null || company.isBlank()) return "Direct Hiring Partner";
        String normalized = company.trim()
                .replaceAll("(?i)\\b(Pvt\\.?\\s*Ltd\\.?|Private\\s*Limited|Technologies\\s*Ltd|Corp\\.?|Inc\\.?)\\b", "")
                .trim();
        return normalized.isEmpty() ? company.trim() : normalized;
    }

    public String normalizeLocation(String location) {
        if (location == null || location.isBlank()) return "Pan India";
        String loc = location.toLowerCase();
        if (loc.contains("bangalore") || loc.contains("bengaluru")) return "Bengaluru, Karnataka";
        if (loc.contains("hyderabad") || loc.contains("secunderabad")) return "Hyderabad, Telangana";
        if (loc.contains("pune")) return "Pune, Maharashtra";
        if (loc.contains("chennai")) return "Chennai, Tamil Nadu";
        if (loc.contains("noida") || loc.contains("gurgaon") || loc.contains("gurugram") || loc.contains("delhi") || loc.contains("ncr")) {
            return "Noida / Gurugram (Delhi NCR)";
        }
        if (loc.contains("mumbai") || loc.contains("navi mumbai")) return "Mumbai, Maharashtra";
        if (loc.contains("remote") || loc.contains("work from home")) return "Remote / Pan India";
        return location.trim();
    }

    public List<String> extractSkills(String title, String description) {
        String combined = (title + " " + description).toLowerCase();
        List<String> skills = new ArrayList<>();

        if (combined.contains("core java") || combined.contains("java")) skills.add("Java");
        if (combined.contains("spring boot") || combined.contains("spring")) skills.add("Spring Boot");
        if (combined.contains("hibernate") || combined.contains("jpa")) skills.add("Hibernate");
        if (combined.contains("mysql") || combined.contains("sql") || combined.contains("database")) skills.add("MySQL");
        if (combined.contains("microservice") || combined.contains("rest api") || combined.contains("restful")) skills.add("Microservices");
        if (combined.contains("react") || combined.contains("javascript") || combined.contains("frontend") || combined.contains("full stack")) skills.add("Full Stack");
        if (combined.contains("docker") || combined.contains("aws") || combined.contains("cloud")) skills.add("Cloud / DevOps");
        if (combined.contains("fresher") || combined.contains("trainee") || combined.contains("entry level") || combined.contains("2026")) skills.add("Fresher Eligible");

        if (skills.isEmpty()) {
            skills.add("Java");
            skills.add("Software Engineering");
        }
        return skills;
    }
}
