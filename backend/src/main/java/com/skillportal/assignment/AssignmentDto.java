package com.skillportal.assignment;

import java.util.List;

public class AssignmentDto {

    public static class AssignmentSummary {
        private Long id;
        private String title;
        private String description;
        private String difficulty;
        private int totalMarks;
        private int timeLimitMinutes;
        private int totalSections;
        private int completedSections;
        private int totalQuestions;
        private int solvedQuestions;
        private int marksObtained;
        private double percentage;
        private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getTimeLimitMinutes() { return timeLimitMinutes; }
        public void setTimeLimitMinutes(int timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

        public int getTotalSections() { return totalSections; }
        public void setTotalSections(int totalSections) { this.totalSections = totalSections; }

        public int getCompletedSections() { return completedSections; }
        public void setCompletedSections(int completedSections) { this.completedSections = completedSections; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public int getSolvedQuestions() { return solvedQuestions; }
        public void setSolvedQuestions(int solvedQuestions) { this.solvedQuestions = solvedQuestions; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AssignmentDetail {
        private Long id;
        private String title;
        private String description;
        private String difficulty;
        private int totalMarks;
        private int timeLimitMinutes;
        private int marksObtained;
        private double percentage;
        private List<SectionSummary> sections;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getTimeLimitMinutes() { return timeLimitMinutes; }
        public void setTimeLimitMinutes(int timeLimitMinutes) { this.timeLimitMinutes = timeLimitMinutes; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public List<SectionSummary> getSections() { return sections; }
        public void setSections(List<SectionSummary> sections) { this.sections = sections; }
    }

    public static class SectionSummary {
        private Long id;
        private Long assignmentId;
        private int sectionNumber;
        private String title;
        private String description;
        private int questionCount;
        private int solvedCount;
        private int totalMarks;
        private int marksObtained;
        private boolean locked;
        private String status; // LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
        private List<QuestionSummary> questions;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

        public int getSectionNumber() { return sectionNumber; }
        public void setSectionNumber(int sectionNumber) { this.sectionNumber = sectionNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getQuestionCount() { return questionCount; }
        public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }

        public int getSolvedCount() { return solvedCount; }
        public void setSolvedCount(int solvedCount) { this.solvedCount = solvedCount; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public boolean isLocked() { return locked; }
        public void setLocked(boolean locked) { this.locked = locked; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public List<QuestionSummary> getQuestions() { return questions; }
        public void setQuestions(List<QuestionSummary> questions) { this.questions = questions; }
    }

    public static class QuestionSummary {
        private Long id;
        private String title;
        private String questionType;
        private String difficulty;
        private int marks;
        private int marksObtained;
        private String status; // NOT_ATTEMPTED, ATTEMPTED, SOLVED
        private boolean bookmarked;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public boolean isBookmarked() { return bookmarked; }
        public void setBookmarked(boolean bookmarked) { this.bookmarked = bookmarked; }
    }
}
