package com.skillportal.coding;

import java.util.List;

public interface CodeExecutionEngine {

    class ExecutionRequest {
        private String code;
        private String language; // java, python, javascript
        private List<TestCaseItem> testCases;
        private int timeLimitMs;
        private int memoryLimitMb;

        public ExecutionRequest(String code, String language, List<TestCaseItem> testCases, int timeLimitMs, int memoryLimitMb) {
            this.code = code;
            this.language = language;
            this.testCases = testCases;
            this.timeLimitMs = timeLimitMs;
            this.memoryLimitMb = memoryLimitMb;
        }

        public String getCode() { return code; }
        public String getLanguage() { return language; }
        public List<TestCaseItem> getTestCases() { return testCases; }
        public int getTimeLimitMs() { return timeLimitMs; }
        public int getMemoryLimitMb() { return memoryLimitMb; }
    }

    class TestCaseItem {
        private Long id;
        private String input;
        private String expectedOutput;
        private boolean isHidden;

        public TestCaseItem(Long id, String input, String expectedOutput, boolean isHidden) {
            this.id = id;
            this.input = input;
            this.expectedOutput = expectedOutput;
            this.isHidden = isHidden;
        }

        public Long getId() { return id; }
        public String getInput() { return input; }
        public String getExpectedOutput() { return expectedOutput; }
        public boolean isHidden() { return isHidden; }
    }

    class ExecutionResult {
        private String status; // ACCEPTED, WRONG_ANSWER, COMPILATION_ERROR, RUNTIME_ERROR, TIME_LIMIT_EXCEEDED
        private int passedCount;
        private int totalCount;
        private int runtimeMs;
        private int memoryKb;
        private String compileOutput;
        private List<TestCaseResult> testCaseResults;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public int getPassedCount() { return passedCount; }
        public void setPassedCount(int passedCount) { this.passedCount = passedCount; }

        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }

        public int getMemoryKb() { return memoryKb; }
        public void setMemoryKb(int memoryKb) { this.memoryKb = memoryKb; }

        public String getCompileOutput() { return compileOutput; }
        public void setCompileOutput(String compileOutput) { this.compileOutput = compileOutput; }

        public List<TestCaseResult> getTestCaseResults() { return testCaseResults; }
        public void setTestCaseResults(List<TestCaseResult> testCaseResults) { this.testCaseResults = testCaseResults; }
    }

    class TestCaseResult {
        private Long testCaseId;
        private boolean passed;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean isHidden;
        private int runtimeMs;

        public Long getTestCaseId() { return testCaseId; }
        public void setTestCaseId(Long testCaseId) { this.testCaseId = testCaseId; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

        public String getActualOutput() { return actualOutput; }
        public void setActualOutput(String actualOutput) { this.actualOutput = actualOutput; }

        public boolean isHidden() { return isHidden; }
        public void setHidden(boolean hidden) { isHidden = hidden; }

        public int getRuntimeMs() { return runtimeMs; }
        public void setRuntimeMs(int runtimeMs) { this.runtimeMs = runtimeMs; }
    }

    ExecutionResult execute(ExecutionRequest request);
}
