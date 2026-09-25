package com.skillportal.test;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class TestDto {

    public static class TestSummary {
        private Long id;
        private String title;
        private String description;
        private int durationMinutes;
        private int totalMarks;
        private int passingPercentage;
        private int totalQuestions;
        private String attemptStatus; // NOT_ATTEMPTED, IN_PROGRESS, COMPLETED
        private Integer lastScore;
        private Double lastPercentage;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public int getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

        public int getTotalMarks() { return totalMarks; }
        public void setTotalMarks(int totalMarks) { this.totalMarks = totalMarks; }

        public int getPassingPercentage() { return passingPercentage; }
        public void setPassingPercentage(int passingPercentage) { this.passingPercentage = passingPercentage; }

        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

        public String getAttemptStatus() { return attemptStatus; }
        public void setAttemptStatus(String attemptStatus) { this.attemptStatus = attemptStatus; }

        public Integer getLastScore() { return lastScore; }
        public void setLastScore(Integer lastScore) { this.lastScore = lastScore; }

        public Double getLastPercentage() { return lastPercentage; }
        public void setLastPercentage(Double lastPercentage) { this.lastPercentage = lastPercentage; }
    }

    public static class StartTestResponse {
        private Long attemptId;
        private Long testId;
        private String testTitle;
        private String startedAt;
        private String deadline;
        private long remainingSeconds;
        private List<TestSectionDetail> sections;

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

        public Long getTestId() { return testId; }
        public void setTestId(Long testId) { this.testId = testId; }

        public String getTestTitle() { return testTitle; }
        public void setTestTitle(String testTitle) { this.testTitle = testTitle; }

        public String getStartedAt() { return startedAt; }
        public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

        public String getDeadline() { return deadline; }
        public void setDeadline(String deadline) { this.deadline = deadline; }

        public long getRemainingSeconds() { return remainingSeconds; }
        public void setRemainingSeconds(long remainingSeconds) { this.remainingSeconds = remainingSeconds; }

        public List<TestSectionDetail> getSections() { return sections; }
        public void setSections(List<TestSectionDetail> sections) { this.sections = sections; }
    }

    public static class TestSectionDetail {
        private Long id;
        private String title;
        private List<TestQuestionItem> questions;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public List<TestQuestionItem> getQuestions() { return questions; }
        public void setQuestions(List<TestQuestionItem> questions) { this.questions = questions; }
    }

    public static class TestQuestionItem {
        private Long questionId;
        private String title;
        private String description;
        private String questionType;
        private int marks;
        private List<TestOptionItem> options;
        private String savedAnswer;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public List<TestOptionItem> getOptions() { return options; }
        public void setOptions(List<TestOptionItem> options) { this.options = options; }

        public String getSavedAnswer() { return savedAnswer; }
        public void setSavedAnswer(String savedAnswer) { this.savedAnswer = savedAnswer; }
    }

    public static class TestOptionItem {
        private String label;
        private String text;

        public TestOptionItem() {}
        public TestOptionItem(String label, String text) {
            this.label = label;
            this.text = text;
        }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
    }

    public static class SaveAnswerRequest {
        @NotNull(message = "Attempt ID is required")
        private Long attemptId;

        @NotNull(message = "Question ID is required")
        private Long questionId;

        private String selectedOption;
        private String codeAnswer;

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }

        public String getCodeAnswer() { return codeAnswer; }
        public void setCodeAnswer(String codeAnswer) { this.codeAnswer = codeAnswer; }
    }

    public static class SubmitTestRequest {
        @NotNull(message = "Attempt ID is required")
        private Long attemptId;

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }
    }

    public static class TestResultSummary {
        private Long attemptId;
        private Long testId;
        private String testTitle;
        private int totalScore;
        private int maxScore;
        private double percentage;
        private boolean passed;
        private String status; // SUBMITTED, AUTO_SUBMITTED, EVALUATED
        private String completedAt;
        private List<AnswerReviewItem> reviewItems;

        public Long getAttemptId() { return attemptId; }
        public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

        public Long getTestId() { return testId; }
        public void setTestId(Long testId) { this.testId = testId; }

        public String getTestTitle() { return testTitle; }
        public void setTestTitle(String testTitle) { this.testTitle = testTitle; }

        public int getTotalScore() { return totalScore; }
        public void setTotalScore(int totalScore) { this.totalScore = totalScore; }

        public int getMaxScore() { return maxScore; }
        public void setMaxScore(int maxScore) { this.maxScore = maxScore; }

        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

        public List<AnswerReviewItem> getReviewItems() { return reviewItems; }
        public void setReviewItems(List<AnswerReviewItem> reviewItems) { this.reviewItems = reviewItems; }
    }

    public static class AnswerReviewItem {
        private Long questionId;
        private String questionTitle;
        private String selectedAnswer;
        private String correctAnswer;
        private boolean isCorrect;
        private int marksAwarded;
        private int maxMarks;
        private String explanation;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getQuestionTitle() { return questionTitle; }
        public void setQuestionTitle(String questionTitle) { this.questionTitle = questionTitle; }

        public String getSelectedAnswer() { return selectedAnswer; }
        public void setSelectedAnswer(String selectedAnswer) { this.selectedAnswer = selectedAnswer; }

        public String getCorrectAnswer() { return correctAnswer; }
        public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }

        public int getMarksAwarded() { return marksAwarded; }
        public void setMarksAwarded(int marksAwarded) { this.marksAwarded = marksAwarded; }

        public int getMaxMarks() { return maxMarks; }
        public void setMaxMarks(int maxMarks) { this.maxMarks = maxMarks; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
