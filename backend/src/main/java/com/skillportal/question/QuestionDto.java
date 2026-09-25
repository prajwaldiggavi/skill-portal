package com.skillportal.question;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class QuestionDto {

    public static class QuestionDetail {
        private Long id;
        private String title;
        private String description;
        private String explanation; // only shown after grading/attempt
        private String questionType;
        private String difficulty;
        private int marks;
        private String companyTag;
        private String tags;
        private int currentVersion;
        private boolean bookmarked;
        private List<OptionPublic> options;
        private CodingProblemSummary codingProblem;
        private StudentAttemptSummary lastAttempt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }

        public String getQuestionType() { return questionType; }
        public void setQuestionType(String questionType) { this.questionType = questionType; }

        public String getDifficulty() { return difficulty; }
        public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

        public int getMarks() { return marks; }
        public void setMarks(int marks) { this.marks = marks; }

        public String getCompanyTag() { return companyTag; }
        public void setCompanyTag(String companyTag) { this.companyTag = companyTag; }

        public String getTags() { return tags; }
        public void setTags(String tags) { this.tags = tags; }

        public int getCurrentVersion() { return currentVersion; }
        public void setCurrentVersion(int currentVersion) { this.currentVersion = currentVersion; }

        public boolean isBookmarked() { return bookmarked; }
        public void setBookmarked(boolean bookmarked) { this.bookmarked = bookmarked; }

        public List<OptionPublic> getOptions() { return options; }
        public void setOptions(List<OptionPublic> options) { this.options = options; }

        public CodingProblemSummary getCodingProblem() { return codingProblem; }
        public void setCodingProblem(CodingProblemSummary codingProblem) { this.codingProblem = codingProblem; }

        public StudentAttemptSummary getLastAttempt() { return lastAttempt; }
        public void setLastAttempt(StudentAttemptSummary lastAttempt) { this.lastAttempt = lastAttempt; }
    }

    public static class OptionPublic {
        private Long id;
        private String optionLabel;
        private String optionText;
        private int orderIndex;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getOptionLabel() { return optionLabel; }
        public void setOptionLabel(String optionLabel) { this.optionLabel = optionLabel; }

        public String getOptionText() { return optionText; }
        public void setOptionText(String optionText) { this.optionText = optionText; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class CodingProblemSummary {
        private Long id;
        private String problemStatement;
        private String inputFormat;
        private String outputFormat;
        private String constraints;
        private String starterCodeJava;
        private String starterCodePython;
        private String starterCodeJs;
        private int timeLimitMs;
        private int memoryLimitMb;
        private List<SampleTestCase> sampleCases;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getProblemStatement() { return problemStatement; }
        public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

        public String getInputFormat() { return inputFormat; }
        public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

        public String getOutputFormat() { return outputFormat; }
        public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

        public String getConstraints() { return constraints; }
        public void setConstraints(String constraints) { this.constraints = constraints; }

        public String getStarterCodeJava() { return starterCodeJava; }
        public void setStarterCodeJava(String starterCodeJava) { this.starterCodeJava = starterCodeJava; }

        public String getStarterCodePython() { return starterCodePython; }
        public void setStarterCodePython(String starterCodePython) { this.starterCodePython = starterCodePython; }

        public String getStarterCodeJs() { return starterCodeJs; }
        public void setStarterCodeJs(String starterCodeJs) { this.starterCodeJs = starterCodeJs; }

        public int getTimeLimitMs() { return timeLimitMs; }
        public void setTimeLimitMs(int timeLimitMs) { this.timeLimitMs = timeLimitMs; }

        public int getMemoryLimitMb() { return memoryLimitMb; }
        public void setMemoryLimitMb(int memoryLimitMb) { this.memoryLimitMb = memoryLimitMb; }

        public List<SampleTestCase> getSampleCases() { return sampleCases; }
        public void setSampleCases(List<SampleTestCase> sampleCases) { this.sampleCases = sampleCases; }
    }

    public static class SampleTestCase {
        private Long id;
        private String inputData;
        private String expectedOutput;
        private int orderIndex;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getInputData() { return inputData; }
        public void setInputData(String inputData) { this.inputData = inputData; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class StudentAttemptSummary {
        private String status; // ATTEMPTED, SOLVED, FAILED
        private int marksObtained;
        private int timeSpentSeconds;
        private String submittedAt;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getMarksObtained() { return marksObtained; }
        public void setMarksObtained(int marksObtained) { this.marksObtained = marksObtained; }

        public int getTimeSpentSeconds() { return timeSpentSeconds; }
        public void setTimeSpentSeconds(int timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }

        public String getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }
    }

    public static class SubmitMcqAttemptRequest {
        @NotEmpty(message = "Selected option labels cannot be empty")
        private List<String> selectedOptionLabels;

        private Long assignmentId;
        private int timeSpentSeconds = 0;

        public List<String> getSelectedOptionLabels() { return selectedOptionLabels; }
        public void setSelectedOptionLabels(List<String> selectedOptionLabels) { this.selectedOptionLabels = selectedOptionLabels; }

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }

        public int getTimeSpentSeconds() { return timeSpentSeconds; }
        public void setTimeSpentSeconds(int timeSpentSeconds) { this.timeSpentSeconds = timeSpentSeconds; }
    }

    public static class AttemptResult {
        private boolean isCorrect;
        private int marksAwarded;
        private int maxMarks;
        private String explanation;
        private List<String> correctOptions; // returned only AFTER grading

        public boolean isCorrect() { return isCorrect; }
        public void setCorrect(boolean correct) { isCorrect = correct; }

        public int getMarksAwarded() { return marksAwarded; }
        public void setMarksAwarded(int marksAwarded) { this.marksAwarded = marksAwarded; }

        public int getMaxMarks() { return maxMarks; }
        public void setMaxMarks(int maxMarks) { this.maxMarks = maxMarks; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }

        public List<String> getCorrectOptions() { return correctOptions; }
        public void setCorrectOptions(List<String> correctOptions) { this.correctOptions = correctOptions; }
    }
}
