package com.skillportal.coding;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class MockExecutor implements CodeExecutionEngine {

    private final Random random = new Random();

    @Override
    public ExecutionResult execute(ExecutionRequest request) {
        ExecutionResult result = new ExecutionResult();
        String code = request.getCode() != null ? request.getCode().trim() : "";
        String lang = request.getLanguage() != null ? request.getLanguage().toLowerCase() : "java";

        // 1. Basic Compilation / Syntax validation simulation
        if (code.isBlank()) {
            result.setStatus("COMPILATION_ERROR");
            result.setCompileOutput("Compilation error: Empty source code submitted.");
            result.setPassedCount(0);
            result.setTotalCount(request.getTestCases().size());
            return result;
        }

        if ("java".equals(lang)) {
            if (!code.contains("class") || !code.contains("main")) {
                result.setStatus("COMPILATION_ERROR");
                result.setCompileOutput("Main.java: error: cannot find symbol\n  public static void main(String[] args)\n1 error");
                result.setPassedCount(0);
                result.setTotalCount(request.getTestCases().size());
                return result;
            }
            int openBraces = countOccurrences(code, '{');
            int closeBraces = countOccurrences(code, '}');
            if (openBraces != closeBraces) {
                result.setStatus("COMPILATION_ERROR");
                result.setCompileOutput("Main.java: error: reached end of file while parsing (unmatched braces)");
                result.setPassedCount(0);
                result.setTotalCount(request.getTestCases().size());
                return result;
            }
        }

        // 2. Test Case Execution Simulation
        List<TestCaseResult> caseResults = new ArrayList<>();
        int passed = 0;
        int totalRuntime = 0;

        for (TestCaseItem tc : request.getTestCases()) {
            TestCaseResult cr = new TestCaseResult();
            cr.setTestCaseId(tc.getId());
            cr.setHidden(tc.isHidden());

            // Check if code attempts a real algorithm or contains starter solution
            boolean simulatesCorrect = evaluateSimulation(code, lang, tc);

            int caseRuntime = 15 + random.nextInt(35);
            totalRuntime += caseRuntime;
            cr.setRuntimeMs(caseRuntime);

            if (simulatesCorrect) {
                cr.setPassed(true);
                cr.setInput(tc.isHidden() ? "[Hidden Test Case]" : tc.getInput());
                cr.setExpectedOutput(tc.isHidden() ? "[Hidden]" : tc.getExpectedOutput());
                cr.setActualOutput(tc.isHidden() ? "[Hidden - Passed]" : tc.getExpectedOutput());
                passed++;
            } else {
                cr.setPassed(false);
                cr.setInput(tc.isHidden() ? "[Hidden Test Case]" : tc.getInput());
                cr.setExpectedOutput(tc.isHidden() ? "[Hidden]" : tc.getExpectedOutput());
                cr.setActualOutput(tc.isHidden() ? "[Hidden - Failed]" : "Wrong Output (received mismatched values)");
            }
            caseResults.add(cr);
        }

        result.setTestCaseResults(caseResults);
        result.setPassedCount(passed);
        result.setTotalCount(request.getTestCases().size());
        result.setRuntimeMs(Math.max(totalRuntime, 25));
        result.setMemoryKb(32000 + random.nextInt(4500));

        if (passed == request.getTestCases().size()) {
            result.setStatus("ACCEPTED");
        } else {
            result.setStatus("WRONG_ANSWER");
        }

        return result;
    }

    private boolean evaluateSimulation(String code, String lang, TestCaseItem tc) {
        // If code has basic loop and print structure or matches problem keywords, it passes
        if (code.contains("isPrime") || code.contains("prime") || code.contains("validPalindrome") || code.contains("isPal") || code.contains("twoSum") || code.contains("Scanner") || code.contains("print") || code.contains("console.log")) {
            return true;
        }
        // If code is trivial dummy string, simulate failure on tests
        return code.length() > 60;
    }

    private int countOccurrences(String str, char ch) {
        int count = 0;
        for (int i = 0; i < str.length(); i++) {
            if (str.charAt(i) == ch) count++;
        }
        return count;
    }
}
